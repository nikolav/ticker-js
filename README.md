[ticker.js](), ` .setTimeout()` wrapper
---------------------------------------

API
---

### init

*Ticker ticker([float delay = 1000, int repeatcount = Infinity])*

`       var t = ticker(1000 / 10, 5);       `

### cache a function

*Ticker .tick(function func)*

`       function func (e) {         // stuff();         console.log(this, arguments);       }              t.tick(func);       `

### call

*Ticker .start([(any) setup])*

`       t.start();       `

### pause

*Ticker .stop(void)*

`       t.stop();       `

### cancel

*Ticker .reset(void)*

`       t.reset();         `

### query state

*Object .state(void)*

`       console.log(t.state());       `

### cleanup

*void .destroy(void)*

`       t.destroy();       `
