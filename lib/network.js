'use strict';

const assert = require('assert');
const async = require('async');
const debug_ = require('debug');
const request = require('request');
const _ = require('lodash');
const default_config_validator = require('./default-validator');
const proxy_validator = require('./proxy-validator');
const debug = debug_('agent:config');
const ioLib = require('./io');

const kut = require('./kernel-utilities.js')

var g_Logger = null;

const Loader = function(io) {
    this.io = io || ioLib();
    g_Logger = new LoggerClass('microgateway-config io');
};

/*
const yaml = require('js-yaml');
const crypto = require('crypto');
const util = require('util');
*/

module.exports = function() {
    return new Loader();
};

var gProxyPattern = false;
var proxies = null;

/**
 * load the config from the network and merge with default config
 * @param options {target:save location and filename,keys: {key:,secret:},source:default loading target
 *  localproxy: {name:, path:, target_url:} }
 * @param callback function(err){}
 */
Loader.prototype.get = function(options, callback) {

    this.config = this.io.loadSync({
        source: options.source
    });
    this.config.environment = options.env;

    //EDGEMICRO_LOCAL - allows microgateway to function without any connection to Apigee Edge
    if (process.env.EDGEMICRO_LOCAL === "1") {
        debug("running microgateway in local mode");
        //
        //create default proxy if params were supplied.
        var config = {}
        proxies = {
            'proxies' : kut.getDefaultProxy(proxies, config, options)
        };

        //setup fake analytics
        config.analytics = {
            source: "microgateway",
            proxy: "dummy",
            proxy_revision: "1",
            compress: false,
            key: options.keys.key,
            secret: options.keys.secret,
            uri: "http://localhost"
        };
        
        default_config_validator.validate(config);

        const cache = _.merge({}, config, proxies);
        callback(null, cache);
        
    } else {
        assert(options, 'options cannot be null');
        assert(options.keys, 'options.keys cannot be null');
        //
        const keys = options.keys;
        const source = options.source;
        const configurl = options.configurl;
        //
        var self = this
        if ( ( typeof configurl !== 'undefined' ) && configurl ) {
            request.get(configurl, self, function(error, response, body) {
                if (!error && response.statusCode === 200) {
                    g_Logger.log('downloading configuration from: ' + configurl);
                    debug(body);
                    kut.writeConfig(source, body);
                    //writeConfig(sourceBackup, body)  // sourceBackup not defined
                } else {
                    //g_Logger.error('DETECTED PRODUCT MISCONFIGURATION ERROR',err);  // err is not defined
                    g_Logger.warn('using old cached configuration');
                }
                //set default proxies
                self.config.proxies = kut.getDefaultProxy(proxies,self.config, options);
                //
                loadConfiguration(self.config, keys, callback);
            });

        } else {
            //
            //set default proxies
            this.config.proxies = kut.getDefaultProxy(proxies,this.config, options);
            //
            loadConfiguration(this.config, keys, callback);
        }
    }
}


function networkLoadCallback(err, proxies, products, keys, config, callback) {
    if (err) {
        return callback(err);
    }
    if ( proxies && products ) {
        //
        if ( config.edgemicro.proxies ) {
            var filteredProxies = config.edgemicro.proxies;
            proxies = proxies.filter((proxy) => {
                var name = proxy.apiProxyName;
                return filteredProxies.indexOf(name) > -1;
            });
            /*
            the decorator mode allows microgateway to run in the same container
            as the pcf application. the pcf application could have any basepath 
            including slash. 

            in apigee, no two proxies can have the same basepath. however, in pcf
            two or more applications can have the same basepath. 

            during the bind-services stage, apigee will create a proxy with a unique
            basepath eg: edgemicro_cf-appname with basepath /sampleapi or something

            when microgateway starts in decorator mode (which is enabled by a flag),
            it ignores or overrides the basepath set in the proxy to slash. another
            important node, it is expected that decorator will have only one proxy. 
            */
            if (process.env.EDGEMICRO_DECORATOR && proxies.length === 1) {
                debug("running as microgateway decorator");
                proxies[0].proxyEndpoint.basePath = '/';
                debug(proxies);
            }
            if ( !config.oauth.productOnly ) {
                products = products.filter((product) => {
                    return _.intersectionWith(product.proxies, proxies, (productProxyName, filteredProxy) => {
                        return productProxyName === filteredProxy.apiProxyName;
                    }).length > 0;
                });
            }
        }

        const mergedConfig = kut.merge(config, kut.mapEdgeProxies(proxies), kut.mapEdgeProducts(products,config.environment));
        proxy_validator.validate(mergedConfig);
        kut.mergeKeys(mergedConfig, keys); // merge keys before sending to edge micro
        callback(null, mergedConfig);

    } else {

        // THIS BRANCH OF CODE HAS LIKELY NEVER BEEN RUN

        // check if we have a retry_interval specified
        // any value less than 5 seconds is assumed invalid and ignored
        // start with the cached copy while we retry updates in the background
        var io = ioLib();  // this seems to be what was intended... not absolutely sure.
        var source = '';  // this has not been defined
        const mergedConfig = io.loadSync({ 'source' : source });

        //var target = ''; // this has not been defined
        
        if ( mergedConfig ) {
            g_Logger.info('loaded cached config from', 'target');
            kut.mergeKeys(mergedConfig, keys); // merge keys before sending to edge micro
            callback(null, mergedConfig);
        } else {
            g_Logger.error('fatal:', 'cached config not available, unable to continue');
            callback(new Error('cached config not available, unable to continue'))
        }
    }
}



function loadConfiguration(thisconfig, keys, callback) {
    //----------------------------------
    default_config_validator.validate(thisconfig);
    const err = kut.validateUrls(thisconfig);
    if (err) {
        return callback(err);
    }
    default_config_validator.validate(thisconfig);
    //
    const config = kut.mergeDefaults(thisconfig);
    //----------------------------------

    // initiate an immediate load, and setup retries if it fails
    _load(config, keys, (err, proxies, products) => { networkLoadCallback(err, proxies, products, keys, config, callback) } );
}



// PARALLEL CONFIGURATION METHODS
//
function bootstrapConfig(options,config,keys,cb) {
    const opts = _.clone(options);
    opts['url'] = config.edge_config.bootstrap;
    opts['auth'] = {
        user: keys.key,
        pass: keys.secret,
        sendImmediately: true
    };
    //if defined, proxy params are passed in the start cmd.
    if (process.env.EDGEMICRO_LOCAL_PROXY === "1") {
        const proxyInfo = "{\"apiProxies\": [{\"apiProxyName\":\"" + config.proxies[0].name + "\"," +
            "\"revision\":\"" + config.proxies[0].revision + "\"," +
            "\"proxyEndpoint\": {" +
            "\"name\": \"default\"," +
            "\"basePath\":\"" + config.proxies[0].base_path + "\"" +
            "}," +
            "\"targetEndpoint\": {" +
            "\"name\": \"default\"," +
            "\"url\":\"" + config.proxies[0].url + "\"" +
            "}}]}";
        const response = {
            statusCode: 200
        };
        kut.loadStatus('config', config.edge_config.bootstrap, null, response, proxyInfo, cb);
    } else { //retrieve info from edge
        request.get(opts, function(err, response, body) {
            kut.loadStatus('config', config.edge_config.bootstrap, err, response, body, cb);
        });
    }
}

function configAuthAndTLSProducts(options,config,keys,cb) {
    var opts = _.clone(options);
    opts['url'] = config.edge_config.products;
    //protect /products
    opts['auth'] = {
        user: keys.key,
        pass: keys.secret,
        sendImmediately: true
    };            
    opts = kut.enableTLS(config, opts);
    request.get(opts, function(err, response, body) {
        kut.loadStatus('products', config.edge_config.products, err, response, body, cb);
    });
}

function configAuthJWTSinglePublicKey(options,config,cb) {
    var opts = _.clone(options);
    opts['url'] = config.edge_config.jwt_public_key;            
    opts = kut.enableTLS(config, opts);
    request.get(opts, function(err, response, body) {
        kut.loadStatus('jwt_public_key', config.edge_config.jwt_public_key,
            err, response, body, cb);
    });    
}

function configAuthJWTSeveralPublicKeys(options,config,cb) {
    var opts = _.clone(options);
    opts['url'] = config.edge_config.jwk_public_keys || null;
    opts = kut.enableTLS(config, opts);
    request.get(opts, function(err, response, body) {
        if (response && response.statusCode === 200) {
            kut.loadStatus('jwk_public_keys', opts['url'],
                err, response, body, cb);
        } else {
            response = {};
            response.statusCode = 200;
            body = null;
            err = null;
            kut.loadStatus('jwk_public_keys', opts['url'],
                null, response, body, cb);
        }
    });
}



//
function loaderAddJWTSupport(config,results) {
    if ( (config !== undefined) && (results !== undefined) ) {
        if (results.length > 3 && results[3]) {
            var hasOauth = ( config.oauth !== undefined && typeof config.oauth === 'object' );
            var hasApikeys = ( config.apikeys !== undefined && typeof config.apikeys === 'object' );
            var hasOauthv2 = ( config.oauthv2 !== undefined && typeof config.oauthv2 === 'object' );
            if ( hasOauth && hasApikeys && hasOauthv2 ) {
                config.oauth.jwk_keys = results[3]; // save key in oauth section
                config.apikeys.jwk_keys = results[3];
                config.oauthv2.jwk_keys = results[3];
                return;
            }
        }
    }
    g_Logger.warn('jwk keys are not enabled');
}


// 
function loaderAddPublicKeySupport(config,results) {
    if ( (config !== undefined) && (results !== undefined) ) {
        if ( results.length > 2 && results[2] ) {
            var hasOauth = ( config.oauth !== undefined && typeof config.oauth === 'object' );
            var hasApikeys = ( config.apikeys !== undefined && typeof config.apikeys === 'object' );
            var hasOauthv2 = ( config.oauthv2 !== undefined && typeof config.oauthv2 === 'object' );
            if ( hasOauth && hasApikeys && hasOauthv2 ) {
                config.oauth.public_key = results[2]; // save key in oauth section
                config.apikeys.public_key = results[2];
                config.oauthv2.public_key = results[2];
                return;
            }
        }
        g_Logger.warn('failed to download jwt_public_key');
    }
    g_Logger.warn('jwk public keys are not enabled');
}


function loaderUnloadProductInfo(results) {
    var products = []
    if ( results.length > 1 && results[1] ) {
        //
        try {
            var productInfo = JSON.parse(results[1]);
            if ( productInfo && productInfo.apiProduct ) {
                products = productInfo.apiProduct
                if ( (typeof products === 'object') && (products.length !== undefined) && (products.length > 0) ) {
                    return(products)
                }
            }
        } catch ( err ) {
            if ( err instanceof SyntaxError ) g_Logger.error('CRITICAL ERROR:', 'error parsing downloaded product list', err);
            throw err
        }
    }
    //
    g_Logger.warn( 'no edge micro products found in response');
    //
    return(products)
}


function loaderUnloadProxyInfo(results) {
    //
    var proxies = []
    //
    if ( results.length > 0 && results[0] ) {
        try {
            var proxyInfo = JSON.parse(results[0])
            if ( proxyInfo.apiProxies && (typeof proxyInfo.apiProxies === 'object') && (proxyInfo.apiProxies.length) ) {
                //
                var apiProxies = [].concat(proxyInfo.apiProxies)
                //  
                if ( gProxyPattern ) {
                    debug("proxyPattern: " + gProxyPattern + " enabled");
                    apiProxies = apiProxies.filter( aproxy =>  {
                        var status = kut.matchWildcard(aproxy.apiProxyName, gProxyPattern)
                        if ( !status ) debug("ignoring " + aproxy.apiProxyName + " proxy");
                        return(status)
                    })
                }
                apiProxies = apiProxies.filter( aproxy =>  {
                    var status = !( aproxy && (aproxy.targetEndpoint.url === "null") )
                    if ( !status ) debug("ignoring " + aproxy.apiProxyName + " proxy since it has a null target");
                    return(status)
                })
                //clean up null
                proxies = apiProxies.filter(n => n);
                if ( proxies.length > 0 ) {
                    return(proxies)
                }
            }
        } catch ( err ) {
            g_Logger.error('CRITICAL ERROR:', 'error parsing downloaded proxy list', err);
            throw err
        }
    }
    //
    g_Logger.warn( 'no edge micro proxies found in org');
    return proxies;
}


function loadJoinResults(err,results,config,keys,callback) {
    //
    debug('error %s, proxies %s, products %s, jwt_public_key %s', err, results[0], results[1], results[2]);
    debug('jwk_public_keys %s', results[3] ? results[3] : 'none');
    //
    if ( err ) {
        g_Logger.warn( 'error downloading config, please check bootstrap configuration', err);
        return callback(err)
    }

    var proxies = null;
    try {
        proxies = loaderUnloadProxyInfo(results)
    } catch (err) {
        return callback(err);
    }

    var products = null;
    try {
        products = loaderUnloadProductInfo(results)
    } catch ( err ) {
        return callback(new Error('CRITICAL ERROR: error parsing downloaded product list'));
    }

    if ( !config.oauth ) { config.oauth = {}; }
    if ( !config.apikeys ) { config.apikeys = {}; }
    if ( !config.oauthv2 ) { config.oauthv2 = {}; }

    loaderAddPublicKeySupport(config,results)
    loaderAddJWTSupport(config,results)
    //
    callback(null, proxies, products);
}

// Parallel config loader
//
const _load = function(config, keys, callback) {
    const options = {};
    if (config.edge_config.proxy) {
        options['proxy'] = config.edge_config.proxy;
    }
    if (typeof config.edge_config.proxy_tunnel !== 'undefined') {
        options['tunnel'] = config.edge_config.proxy_tunnel;
    }
    if (typeof config.edge_config.proxyPattern !== 'undefined') {
        gProxyPattern = config.edge_config.proxyPattern;
    }
    async.parallel([
        function(cb) {
            bootstrapConfig(options,config,keys,cb)
        },
        function(cb) {
            configAuthAndTLSProducts(options,config,keys,cb)
        },
        function(cb) {
            configAuthJWTSinglePublicKey(options,config,cb)
        },
        function(cb) {
            configAuthJWTSeveralPublicKeys(options,config,cb)
        }
    ], (err,results) => {
        loadJoinResults(err,results,config,keys,callback)
    });
};


