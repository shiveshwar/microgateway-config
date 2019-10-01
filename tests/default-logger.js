

// Within the test directory.

// This version of the default logger allows callbacks to be set so that 
// a test may include checks for strings that should be printed when certain 
// conditions occur.

class DefaultLogger {

    constructor(tag) {
      this.writeConsoleLog = () => {}
      this.tag = tag;
      this.test_cb = () => {}
    }
  
    setConsoleLogger(clogger) {
      this.writeConsoleLog = clogger;
    }
  
    error(a) {
        console.log(this.tag + a)
        this.callTestCB('error')
    }
  
    warn(a) {
        console.log(this.tag + a)
        this.callTestCB('warn')
    }
  
    debug(a) {
        console.log(this.tag + a)
        this.callTestCB('debug')
    }
  
    info(a) {
        console.log(this.tag + a)  
        this.callTestCB('info')
    }
  
    log(a) {
        console.log(this.tag + a)
        this.callTestCB('log')
    }
  
    setTag(tag) {
      this.tag = tag;
    }

    setTestCB(cb) {
      this.test_cb = cb
    }
    
    callTestCB(src) {
      if ( typeof this.test_cb === 'function') {
        this.test_cb(src)
      }
    }
  
}

module.exports = DefaultLogger
