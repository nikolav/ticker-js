// ticker.js
// author      : vukovic nikola
// description : `.setTimeout()` wrapper
// email       : vukovicnikola2014@gmail.com
// gh          : https://github.com/nikolav/ticker-js
// license     : public

module.exports = (function (globals) {
  var clearTimeout = globals.clearTimeout;
  var Date = globals.Date;
  var Object = globals.Object;
  var pArray = globals.Array.prototype;
  var parseFloat = globals.parseFloat;
  var pFunction = globals.Function.prototype;
  var pObject = globals.Object.prototype;
  var setTimeout = globals.setTimeout;

  var call_ = pFunction.call;
  var bind_ =
    "bind" in pFunction
      ? call_.bind(pFunction.bind)
      : function (func, context) {
          if (context && isfunc(func)) {
            return function () {
              return func.apply(context, arguments);
            };
          } else {
            err();
          }
        };

  var OFF = false;
  var ON = true;

  var cls = bind_(call_, pObject.toString);
  var hasown = bind_(call_, pObject.hasOwnProperty);
  var mathAbs = globals.Math.abs;
  var slice = bind_(call_, pArray.slice);

  var defaults = {
    fq: 1000 / 1, // (f)re(q)uency (delay, 1/s)
    rc: 1 / 0,
  }; // (r)epeat(c)ount (Infinity)

  var datenow =
    Date.now ||
    function () {
      return +new Date();
    };
  var pnow = (function (tmstart, datenow, globals) {
    return "now" in Object(globals.performance)
      ? bind_(globals.performance.now, globals.performance)
      : ((tmstart = datenow()),
        function () {
          return datenow() - tmstart;
        });
  })(none, datenow, globals);

  // used by `.state()` to copy tickers' state
  var stateinfo = {
    currentcount: "cc",
    delay: "fq",
    repeatcount: "rc",
    running: "on",
  };

  var class2str = {
    object: cls(stateinfo),
  };

  var pTicker = Ticker.prototype;

  paste(pTicker, {
    _: none,
    destroy: destroy_,
    reset: reset_,
    start: start_,
    state: state_,
    stop: stop_,
    tick: tick_,
  });

  return paste(
    function (delay, repeatcount) {
      return new Ticker(delay, repeatcount);
    },
    {
      defaults: defaults,
      fn: pTicker,
      Ticker: Ticker,
    }
  );

  // ctor
  // @param float, delay, optional, default 1000ms
  // @param int,   repeat-count, optional, default Infinity
  function Ticker() {
    this._ = newstate(this, arguments);
  }

  function absfloat(number) {
    return parseFloat(mathAbs(number));
  }

  function async(func) {
    return function () {
      var arguments_ = arguments;
      var self = this;

      return (
        setTimeout(function () {
          func.apply(self, arguments_);
        }),
        self
      );
    };
  }

  // gets repeatedly called by `Ticker{}`
  // running cached callback, updating state, etc.
  function cbtick() {
    // this: Ticker{}

    var _ = this._;

    if (((_.cc += 1), _.cb.call(_.cx, tdata(this)), _.cc < _.rc)) {
      _.ti = setTimeout(_.tt, _.fq);
    } else {
      _.z0();
    }
  }

  function destroy_() {
    reset_.call(this)._ = none;
  }

  function err() {
    throw Error;
  }

  // helper for `.isarraylike()` helper
  function fn1() {
    return 1;
  }

  function isarraylike(node) {
    try {
      return 0 <= node.length && fn1.apply(this, node) && !isfunc(node);
    } catch (e) {}
    return 0;
  }

  function isfunc(node) {
    return "function" === typeof node;
  }

  function isplainobj(node) {
    return class2str.object === cls(node);
  }

  function newstate(self, arguments_) {
    return {
      cb: none, // original (c)all(b)ack
      cc: 0, // (c)urrent (c)ount
      cx: self, // callbacks' (c)onte(x)t
      fq: absfloat(arguments_[0]) || defaults.fq, // (f)re(q)uency
      ls: [], // callback parameter (l)i(s)t
      on: OFF, // flag, is-running, is-(on)
      rc: absfloat(arguments_[1]) || defaults.rc, // (r)epeat (c)ount
      ti: none, // (t)imer (i)nterval
      ts: none, // (t)ickers' .(s)tart() time
      tt: bind_(cbtick, self), // (t)ickers' (t)imeout callback
      z0: bind_(zer0cc, self),
    }; // async state reset
  }

  function owneach(object, callback, context) {
    for (var field in object) {
      hasown(object, field) &&
        callback.call(context, object[field], field, object);
    }

    return object;
  }

  function paste(target, items) {
    for (var field in items) {
      hasown(items, field) && (target[field] = items[field]);
    }

    return target;
  }

  function reset_() {
    return clearTimeout(this._.ti), this._.z0(), this;
  }

  function start_(setup) {
    // setup: {(Object) context, (:any) args}

    var _ = this._;
    var a = arguments;

    if (!_.on && isfunc(_.cb)) {
      _.on = ON;

      setup = a.length
        ? isplainobj(setup)
          ? setup
          : { args: slice(a, 0) }
        : {};

      setup.context && (_.cx = setup.context);
      hasown(setup, "args") &&
        (_.ls = isarraylike(setup.args) ? setup.args : [setup.args]);

      if (
        ((_.cc += 1),
        (_.ts = pnow()),
        async(_.cb).call(_.cx, tdata(this)),
        _.cc < _.rc)
      ) {
        _.ti = setTimeout(_.tt, _.fq);
      } else {
        async(_.z0)();
      }
    }

    return this;
  }

  function state_() {
    var st = {};
    return owneach(stateinfo, statecp, { st: st, node: this }), st;
  }

  function statecp(alias, field) {
    this.st[field] = this.node._[alias];
  }

  function stop_() {
    var _ = this._;

    if (_.on) {
      clearTimeout(_.ti);
      _.ti = none;
      _.on = OFF;
    }

    return this;
  }

  function tdata(self) {
    return {
      data: self._.ls,
      start: self._.ts,
      time: pnow(),
    };
  }

  function tick_(func) {
    return (this._.cb = func), this;
  }

  // 0-fy tickers' state
  function zer0cc() {
    //this: Ticker{}

    var _ = this._;

    _.cc = 0;
    _.ti = none;
    _.on = OFF;
  }
})(this);

//eof
