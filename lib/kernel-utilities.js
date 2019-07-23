'use strict'

const assert = require('assert');
const url = require('url')
const fs = require('fs')
//const debug_ = require('debug');
const debug = require('debug')('agent:config');
const _ = require('lodash');
const path = require('path');


// matchWildcard
// returns a regular expression which is derived from a glob string to some extent.
// -------------------------------------------
module.exports.matchWildcard = (str, rule) => {
    return new RegExp("^" + rule.split("*").join(".*") + "$").test(str);
}


/**
 * read response status
 * @param message
 * @param url
 * @param err
 * @param response
 * @param body
 * @param cb
 * @private
 */
// -------------------------------------------
module.exports.loadStatus = (message, url, err, response, body, cb) => {
    const failed = err || (response && response.statusCode !== 200);
    if (url) {
        // should the program keep running if it can't load products.?
        if ( failed ) {
            console.warn(message, 'download from', url,'returned', 
                            (response ? (response.statusCode + ' ' + response.statusMessage) : '', err ? err : ''));
        } else {
            console.info(message, 'download from', url, 'returned',
                            (response ? (response.statusCode + ' ' + response.statusMessage) : '',''));
        }
    }
    if (err) {
        cb(err, body);
    } else if (response && response.statusCode !== 200) {
        cb(new Error(response.statusMessage), body);
    } else {
        cb(err, body);
    }
}


// -------------------------------------------
module.exports.validateUrls = (config) => {
    const bootstrapUrl = url.parse(config.edge_config.bootstrap);
    const publicKeyUrl = url.parse(config.edge_config.jwt_public_key);
    if (bootstrapUrl.hostname === 'apigee.net' ||
        bootstrapUrl.pathname.indexOf('...') > 0 ||
        publicKeyUrl.hostname === 'apigee.net' ||
        publicKeyUrl.pathname.indexOf('...') > 0) {
        console.error('it looks like edge micro has not been configured, please see the admin guide');
        return new Error('it looks like edge micro has not been configured, please see the admin guide');
    }
    return null
};

// -------------------------------------------
module.exports.writeConfig = (dest, body) => {
    try {
        //fs.unlinkSync(source);  // the file gets overwritten otherwise this throw if no file and does not write. 
        fs.writeFileSync(dest, body, {  encoding: 'utf8' });
    } catch (err) {
        console.error('Error: ' + err);
    }
}

// -------------------------------------------

const validateTarget = (target)  =>  {
    if (target.base_path && target.base_path.length > 0 &&
        target.url && target.url.length > 0) {
        return true;
    } else {
        debug('dropping invalid target %o', target);
        return false;
    }
}

module.exports.validateTarget = validateTarget;




// -------------------------------------------
module.exports.getDefaultProxy = (proxies, config, options) => {
    //create default proxy if params were supplied.
    if (proxies === null && options.localproxy) {
        proxies = [{
            max_connections: config.edgemicro.max_connections,
            name: options.localproxy.apiProxyName,
            proxy_name: "default",
            revision: options.localproxy.revision,
            base_path: options.localproxy.basePath,
            target_name: "default",
            url: options.localproxy.targetEndpoint
        }];
    } 
    return proxies;
}




/**
 * merge downloaded config with keys
 * @param mergedConfig
 * @param keys
 * @private
 */
module.exports.mergeKeys = (mergedConfig, keys) =>   {
    assert(keys.key, 'key is missing');
    assert(keys.secret, 'secret is missing');
    // copy keys to analytics section
    if (!mergedConfig.analytics) {
        mergedConfig.analytics = {};
    }
    mergedConfig.analytics.key = keys.key;
    mergedConfig.analytics.secret = keys.secret;
    // copy keys to quota section
    if (mergedConfig.quota) {
        Object.keys(mergedConfig.quota).forEach(function(name) {
            const quota = mergedConfig.quota[name];
            quota.key = keys.key;
            quota.secret = keys.secret;
        });
    }
}





module.exports.mergeDefaults = (config) => {
    //
    const defaults = {
        edge_config: {},
        oauth: {},
        analytics: {
            source: 'microgateway', // marker
            proxy: 'dummy', // placeholder
            proxy_revision: 1, // placeholder
            compress: false, // turn off analytics payload compression
            // the default value of 5s allows a max of 100 records/s with a batch size of 500
            // an interval of 250 ms allows 4 batches of 500, for a max throughput of 2k/s
            //
            // NOTE: This remains 250 for backwards compatibility. In practice, this should
            // likely be defined to be a longer interval in the user config file.
            flushInterval: 250
        }
    };
    //
    // merge config, overriding defaults with user-defined config values
    var merged = _.merge({}, defaults, config);

    // propagate proxy configuration to the edgemicro section for use by edgemicro
    if (merged.edge_config && merged.edge_config.proxy) {
        merged.edgemicro.proxy = merged.edge_config.proxy;
        merged.edgemicro.proxy_tunnel = merged.edge_config.proxy_tunnel;
    }

    return merged;
}


//
//
module.exports.enableTLS = (config, opts) => {
    if (config && config.edge_config && config.edge_config.tlsOptions) {
        if (config.edge_config.tlsOptions.agentOptions && config.edge_config.tlsOptions.agentOptions.requestCert) {
            opts['requestCert'] = true;
            if (config.edge_config.tlsOptions.agentOptions.cert && config.edge_config.tlsOptions.agentOptions.key) {
                opts['cert'] = fs.readFileSync(path.resolve(config.edge_config.tlsOptions.agentOptions.cert), 'utf8');
                opts['key'] = fs.readFileSync(path.resolve(config.edge_config.tlsOptions.agentOptions.key), 'utf8');
                if (config.edge_config.tlsOptions.agentOptions.ca) {
                    opts['ca'] = fs.readFileSync(path.resolve(config.edge_config.tlsOptions.agentOptions.ca), 'utf8');
                }
            } else if (config.edge_config.tlsOptions.agentOptions.pfx) {
                opts['pfx'] = fs.readFileSync(path.resolve(config.edge_config.tlsOptions.agentOptions.pfx));
            }
            if (config.edge_config.tlsOptions.agentOptions.rejectUnauthorized) {
                opts['rejectUnauthorized'] = true;
            }
            if (config.edge_config.tlsOptions.agentOptions.secureProtocol) {
                opts['secureProtocol'] = true;
            }
            if (config.edge_config.tlsOptions.agentOptions.passphrase) {
                opts['passphrase'] = config.edge_config.tlsOptions.agentOptions.passphrase;
            }
            if (config.edge_config.tlsOptions.agentOptions.ciphers) {
                opts['ciphers'] = config.edge_config.tlsOptions.agentOptions.ciphers;
            }
        }
    }
    return opts;
}





 
function product_path_to_proxy(updates,products) {
    updates.oauth.path_to_proxy = products.path_to_proxy;
    updates.oauthv2.path_to_proxy = products.path_to_proxy;
    updates.apikeys.path_to_proxy = products.path_to_proxy;
}

function product_product_to_proxy(updates,products) {
    updates.oauth.product_to_proxy = products.product_to_proxy;
    updates.oauthv2.product_to_proxy = products.product_to_proxy;
    updates.apikeys.product_to_proxy = products.product_to_proxy;
}

function product_product_to_api_resource(updates,products) {
    updates.oauth.product_to_api_resource = products.product_to_api_resource;
    updates.oauthv2.product_to_api_resource = products.product_to_api_resource;
    updates.apikeys.product_to_api_resource = products.product_to_api_resource;
}


function makeMergedConfig(proxies,updates,products) {
    //
    var mergedConfig = {};
    Object.keys(updates).forEach(function(key) {
        if (key !== 'agent' && key !== 'edge_config') {
            mergedConfig[key] = updates[key];
        }
    });
    //
    mergedConfig['proxies'] = proxies;
    mergedConfig['path_to_proxy'] = products.path_to_proxy;
    mergedConfig['product_to_proxy'] = products.product_to_proxy;
    mergedConfig['product_to_api_resource'] = products.product_to_api_resource;
    mergedConfig['quota'] = products.product_to_quota;
    //
    if ( mergedConfig['quota'] ) {
        var tmplUrl = updates.edge_config.bootstrap;
        const uri = tmplUrl.replace('bootstrap', 'quotas');
        Object.keys(mergedConfig['quota']).forEach(function(name) {
            mergedConfig['quota'][name].uri = uri;
        });
    }
    //
    return mergedConfig;
}

/**
 *
 * @param config
 * @param proxies
 * @param products
 * @returns {{}}
 * @private
 */
module.exports.merge = (config, proxies, products) => {
    const updates = _.clone(config);
    // copy properties to edge micro section
    if ( !updates.edgemicro ) {
        updates.edgemicro = {};
        if ( config.edgemicro === undefined ) {
            config.edgemicro = {
                'port' : 8000  // default port .... where is this defined?
            }
        }
    }
    //
    updates.edgemicro.port = config.edgemicro.port;
    // copy properties to oauth section
    if ( !updates.oauth ) {
        updates.oauth = {};
    }
    //
    if ( !updates.oauthv2 ) {
        updates.oauthv2 = {};
    }
    //
    if ( !updates.apikeys ) {
        updates.apikeys = {};
    }
    //
    product_path_to_proxy(updates,products)
    product_product_to_proxy(updates,products)
    product_product_to_api_resource(updates,products)
    //
    return makeMergedConfig(proxies,updates,products)
}




module.exports.mapEdgeProxies = (proxies) => {
    const mappedProxies = [];
    assert(Array.isArray(proxies), 'proxies should be an array');
    proxies.forEach(function(target) {
        const tgt = {};
        tgt['max_connections'] = target['maxConnections'] || 1000;
        Object.keys(target).forEach(function(key) {
            switch (key) {
                case 'apiProxyName':
                    tgt['name'] = target[key];
                    break;
                case 'proxyEndpoint':
                    const proxyEndpoint = target[key];
                    if (proxyEndpoint) {
                        tgt['proxy_name'] = proxyEndpoint['name'];
                        tgt['base_path'] = proxyEndpoint['basePath'];
                    }
                    break;
                case 'targetEndpoint':
                    const targetEndpoint = target[key];
                    if (targetEndpoint) {
                        tgt['target_name'] = targetEndpoint['name'];
                        tgt['url'] = targetEndpoint['url'];
                    }
                    break;
                default:
                    // copy over unknown properties
                    tgt[key] = target[key];
            }
        });
        if ( validateTarget(tgt) ) {
            mappedProxies.push(tgt);
        }
    });
    return mappedProxies;
}


const filteredProducts = (products,apigeeEnv) => {
    if ( (apigeeEnv !== undefined) && apigeeEnv ) {
        var eFiltered = products.filter(prod => { 
            return(prod.environments.includes(apigeeEnv))
        })
        return(eFiltered)
    } else {
        return(products)
    }
}

module.exports.filteredProducts = filteredProducts



// note: path_to_proxy as written below is broken, one product path can have multiple proxies
module.exports.mapEdgeProducts = (products,apigeeEnv) => {
    //const path_to_proxy = {};
    const product_to_quota = {};
    const product_to_proxy = {};
    const product_to_api_resource = {};
    assert(Array.isArray(products), 'products should be an array');
    //
    var envProds = filteredProducts(products,apigeeEnv)
    //
    envProds.forEach(function(product) {
        assert(Array.isArray(product.proxies), 'proxies for product ' + product + ' should be an array');
        //
        product_to_api_resource[product.name] = product.apiResources;
        //
        product.proxies.forEach(function(proxy) {
            if (product_to_proxy[product.name]) {
                product_to_proxy[product.name].push(proxy);
            } else {
                product_to_proxy[product.name] = [proxy];
            }
            if (product.quota) {
                product_to_quota[product.name] = {
                    allow: product.quota,
                    interval: product.quotaInterval,
                    timeUnit: product.quotaTimeUnit,
                    bufferSize: 10000
                };
            }
        });
        //
    });
    return {
        //path_to_proxy: path_to_proxy,
        product_to_proxy: product_to_proxy,
        product_to_quota: product_to_quota,
        product_to_api_resource: product_to_api_resource
    };
}

