'use strict';
// 
global.LoggerClass = require('./lib/default-logger.js');

var io = require('./lib/io');
var network = require('./lib/network');
var path = require('path');
var os = require('os')


class Configuration {

  constructor() {
    this.ioInstance = io()
    this.networkInstance = network();
  }

  /**
   * load the config from the network and merge with default config
   * @param options {target:save location and filename,keys: {key:,secret:},source:default loading target}
   * @param callback function(err){}
   */
  get(options,cb) {
    return this.networkInstance.get(options,cb)
  }

  /**
   * initializes the config based on a source config, this must be called first
   * @param options {source,targetDir,targetFile}
   * @param cb function(err,configpath)
   */
  init(options, cb){
    return this.ioInstance.initConfig(options,cb)
  }

  /**
   * loads config from source config, defaults to your home directory if you don't specify a source
   * @param options {source,hash=1,0}
   * @returns {err,config}
   */
  load(options){
    options = options || {}
    options.source = options.source || path.join(os.homedir(), '.edgemicro', 'config.yaml');
    return this.ioInstance.loadSync(options);
  }

  /**
   * saves the config
   * @param config to save
   * @param target destination
   */
  save(config,target){
    return this.ioInstance.saveSync(config,target)
  }

  /**
   * sets the consoleLogger to ioInstance and networkInstance
   * @param consoleLogger to use for console logging
   */
  setConsoleLogger(consoleLogger) {
    global.G_configLogger = consoleLogger
  }

}

module.exports = new Configuration();
