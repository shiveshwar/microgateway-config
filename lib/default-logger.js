
global.G_configLogger = undefined


class DefaultLogger {

    constructor(tag) {
      this.tag = tag;
    }
  
    error(msg) {
        if ( typeof global.G_configLogger === 'undefined' ) {
          console.log(this.tag + ' error: ' + msg)
        } else {
          G_configLogger('error',{'component': this.tag},msg);
        }
    }
  
    warn(msg) {
        if ( typeof global.G_configLogger === 'undefined' ) {
          console.log(this.tag + ' warn: ' + msg)
        } else {
          G_configLogger('warn',{'component': this.tag},msg);
        }
    }
  
    debug(msg) {
        if ( typeof global.G_configLogger === 'undefined' ) {
          console.log(this.tag + ' debug: ' + msg)
        } else {
          G_configLogger('debug',{'component': this.tag},msg);
        }
    }
  
    info(msg) {
        if ( typeof global.G_configLogger === 'undefined' ) {
          console.log(this.tag + ' info: ' + msg)
        } else {
          G_configLogger('info',{'component': this.tag},msg);
        }
    }
  
    log(msg) {
        if ( typeof global.G_configLogger === 'undefined' ) {
          console.log(this.tag + ' log: ' + msg)
        } else {
          G_configLogger('log',{'component': this.tag},msg);
        }
    }
  
    setTag(tag) {
      this.tag = tag;
    }

    /// 
    test() {
      this.setTag('test')
      this.error('test')
      this.warn('test')
      this.debug('test')
      this.info('test')
      this.log('test')
    }
  
}

//
if ( global.LoggerClass !== undefined ) {
  module.exports = global.LoggerClass
} else {
  module.exports = DefaultLogger
}

