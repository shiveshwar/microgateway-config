
global.LoggerClass = require('./default-logger.js');     // replace global logger class for tests

const path = require('path');
const fs = require('fs');
const assert = require('assert');
const jsyaml = require('js-yaml');

const fixtureDirectory = path.join(__dirname, 'fixtures');
const fixtureDefaultConfig = path.join(__dirname, 'fixtures', 'default.yaml');
const fixtureDefaultCustomConfigTester = path.join(__dirname, 'fixtures', 'default-custom-tester.yaml');
const fixtureDefaultConfigMaxConnections = 9001;

const rewire = require('rewire')
//
const network = rewire('../lib/network.js');
const io = require('../lib/io.js');
const kut = require('../lib/kernel-utilities.js');

describe('config - network', () => {

    var netw = null
    
    after(done => {
        //if (fs.existsSync(fixtureDefaultCustomConfig)) fs.unlinkSync(fixtureDefaultCustomConfig);
        done();
    });

    it('convers a default logger needed only for config continuity', done => {
        var stoweClass = global.LoggerClass
        global.LoggerClass = undefined 
        var LClassTeat = require('../lib/default-logger.js');
        var myLogger = new LClassTeat('test')  // run this once just or lines... doing this on first use only ... not dedicating a module
        myLogger.test()
        global.LoggerClass = stoweClass
        done()
    })

    it('uses io',done => {

        var test_io = io();

        var options = {
            "source" : fixtureDefaultConfig,
            "targetDir" : `${__dirname}/nodir`,
            "targetFile" : "asdf.yaml",
            "overwrite" : true
        }

        try {
            //
            fs.unlinkSync(`${__dirname}/nodir/asdf.yaml`)
            fs.rmdir(`${__dirname}/nodir`)
        } catch(e) {
        }
      
        try {
            test_io.initConfig(options, (err, configPath) => {
                assert(err === null)
                assert(configPath === `${__dirname}/nodir/asdf.yaml`)
                assert(true)
                try {
                    test_io.initConfig(options, (err, configPath) => {
                        assert(err === null)
                        assert(configPath === `${__dirname}/nodir/asdf.yaml`)
                        assert(true)
                        done()
                    })
                } catch(e) {
                    assert(false)
                    done();
                }
            })
        } catch(e) {
            assert(false)
            done();
        }
       
    })


    it('io returns error for bad copy',done => {

        var test_io = io();

        var options = {
            "source" : "beezlebub.txt",
            "targetDir" : `${__dirname}/nodir`,
            "targetFile" : "asdf.yaml",
            "overwrite" : true
        }
      
        try {
            test_io.initConfig(options, (err, configPath) => {
                assert(err !== null)
                assert(configPath === undefined)
                assert(true)
                //
                try {
                    //
                    fs.unlinkSync(`${__dirname}/nodir/asdf.yaml`)
                    fs.rmdir(`${__dirname}/nodir`)
                } catch(e) {
                }
                //
                done();
            })
        } catch(e) {
            assert(false)
            done();
        }
       
    })

    it('io loads a file', done => {
        try {
            var test_io = io();
            //
            var opts = {
                "source" : fixtureDefaultConfig
            }
            //
            test_io.loadSync(opts);
            assert(true)
            done();
        } catch(e) {
            assert(false)
            done();
        }
    });

    it('io saves a file async', done => {
        try {
            var test_io = io();
            //
            var opts = {
                "target" : `${__dirname}/testthing.txt`
            }
            //
            config = {
                "a" : "b",
                "c" : "d",
                "e" : "f",
                "_a" : "really not",
                "_b" : "really true"
            }
            //
            test_io.save(config,opts, (err) => {
                if ( err ) {
                    console.log(err)
                }
                assert(true)
                done();    
            });
        } catch(e) {
            assert(false)
            done();
        }
    });

    it('io saves a file sync', done => {
        try {
            var test_io = io();
            //
            config = {
                "a" : "b",
                "c" : "d",
                "e" : "f",
                "_a" : "really not",
                "_b" : "really true"
            }
            //
            test_io.saveSync(config,`${__dirname}/testthing2.txt`);
            assert(true)
            done();
        } catch(e) {
            assert(false)
            done();
        }
    });


    it('io throws errors when bad params', done => {
        try {
            var test_io = io();
            //
            var opts = {
                "source" : "jigglebumble.who"
            }
            //
            test_io.loadSync(opts);
            assert(false)
            done();
            return;
        } catch(e) {
            assert(true)
        }

        try {
            var test_io = io();
            //
            var opts = {
                "source" : `${__dirname}/fixtures`
            }
            //
            test_io.loadSync(opts);
            assert(false)
            done();
            return;
        } catch(e) {
            assert(true)
        }

        try {
            var test_io = io();
            //
            var opts = {
                "source" : `${__dirname}/fixtures/nothing.txt`
            }
            //
            test_io.loadSync(opts);
            assert(false)
            done();
            return;
        } catch(e) {
            assert(true)
        }

        try {
            var test_io = io();
            //
            var opts = {
                "source" : `${__dirname}/fixtures/something.txt`
            }
            //
            test_io.loadSync(opts);
            assert(false)
            done();
            return;
        } catch(e) {
            assert(true)
        }

        done();
    });
    
    it('performs globbing to regular expression function', done => {
        var b = kut.matchWildcard("have a nice day", "have a * day")
        assert(b)
        done()
    })

    it('provides load status', done => {
        var message = 'this is a test'
        var url = 'anything.com'
        var response = {
            "statusCode" : 200,
            "statusMessage" : "have a great day"
        }
        //
        var body = "this is HTML"
        var err = 0
        kut.loadStatus(message, url, err, response, body, () => {
            assert(true)
        })
        err = 1
        kut.loadStatus(message, url, err, response, body, () => {
            assert(true)
        })
        response.statusCode = 400
        err = 0
        kut.loadStatus(message, url, err, response, body, () => {
            assert(true)
        })
        err = 1
        kut.loadStatus(message, url, err, response, body, () => {
            assert(true)
        })
        err = 0
        kut.loadStatus(message, url, err, null, body, () => {
            assert(true)
        })
        err = 1
        kut.loadStatus(message, url, err, null, body, () => {
            assert(true)
        })
        kut.loadStatus(message, false, err, null, body, () => {
            assert(true)
        })
        //
        done();
    })

    it('validates urls', done => {
        var config = {
            edge_config : {
                bootstrap : "http://www.apigee.net/...",
                jwt_public_key : "http://www.apigee.net/..."
            }
        }
        //
        var ee = kut.validateUrls(config);
        //
        assert(ee !== null)
        //
        config = {
            edge_config : {
                bootstrap : "http://www.cooltunes.net/ourhouse",
                jwt_public_key : "http://www.cooltunes.net/ourhouse"
            }
        }
        //
        var ee = kut.validateUrls(config);
        assert(ee === null)
        //
        done();
        //
    })

    it('writes configuration',done => {
        kut.writeConfig('tests/checkup.txt',"this is a test")
        assert(true);
        done()
    })

    it('throws when configuration is sent to a bad place',done => {
        kut.writeConfig('/never/was/there/this/directory/checkup.txt',"this is a test")
        assert(true);
        done()
    })


    it('validates target',done => {
        var target = {
            base_path : "test1/2",
            url : "http://www.joes.com/goodthings"
        }
        var b = kut.validateTarget(target)
        assert(b);
        target = {
            base_path : "",
            url : ""
        }
        var b = kut.validateTarget(target)
        assert(!b);
        target = {
        }
        var b = kut.validateTarget(target)
        assert(!b);
        done()
    })


    it('gets default proxies',done => {
        var proxies = null
        var config = {
            edgemicro : {
                max_connections : 10,
            }
        }
        var options = {
            localproxy : {
                apiProxyName : "my proxy",
                revision : "2",
                basePath : "sfs",
                targetEndpoint : "get there"
            }
        }

        proxies = kut.getDefaultProxy(proxies, config, options);
        assert(proxies !== null)
        done()

    })
    

    it('merges keys',done => {
        var mergedConfig = {
            analytics : false,
            quota : {
                "joe" : {},
                "jane" : {},
                "jim" : {},
                "julie" : {}
            }
        }
        var keys = {
            key : "a9d7asdha9dh",
            secret : "uhz98cisuebr9zc8y"
        }
        kut.mergeKeys(mergedConfig, keys);
        assert(true)
        assert(mergedConfig.quota.joe.key === keys.key)

        delete mergedConfig.quota
        kut.mergeKeys(mergedConfig, keys);
        assert(true)

        done()

    })


    it('merges defaults',done => {
        //
        var test_io = io();
        var opts = {
            "source" : fixtureDefaultCustomConfigTester
        }
        //
        var config = test_io.loadSync(opts);

        config.edge_config.proxy = "more stuff"
        config.edge_config.proxy_tunnel = "some stuff"

        var merged = kut.mergeDefaults(config)
        assert(merged !== null)
        //console.dir(merged,{ depth : 2 })
        //
        done();
    });



    it('enables TLS options',done => {
        //
        var config = {
            edge_config : {
                tlsOptions : {
                    agentOptions : {
                        requestCert : true,
                        cert :`${__dirname}/fixtures/something.txt`,
                        key : `${__dirname}/fixtures/something.txt`,
                        ca : `${__dirname}/fixtures/something.txt`,
                        rejectUnauthorized : true,
                        secureProtocol : true,
                        passphrase : "hello",
                        ciphers : "one two tree"
                    }
                }
            }
        }

        var opts = {
            'requestCert' : false,
            'cert' : "",
            'key' : "",
            'ca' : "",
            'rejectUnauthorized' : false,
            'secureProtocol' :  false,
            'passphrase' : false,
            'ciphers' : false
        }

        opts = kut.enableTLS(config,opts)

        var config1 = {
            edge_config : {
                tlsOptions : {
                    agentOptions : {
                        requestCert : true,
                        pfx : `${__dirname}/fixtures/something.txt`,
                        rejectUnauthorized : true,
                        secureProtocol : true,
                        passphrase : "hello",
                        ciphers : "one two tree"
                    }
                }
            }
        }

        var opts1 = {
            'requestCert' : false,
            'cert' : "",
            'key' : "",
            'ca' : "",
            'pfx' : "",
            'rejectUnauthorized' : false,
            'secureProtocol' :  false,
            'passphrase' : false,
            'ciphers' : false
        }

        opts = kut.enableTLS(config1,opts1)
        //
        assert(true)
        done();
    });

    it('merges config product proxy', done => {
        var config = {
            "a" : "b",
            "c" : "d",
            "edgemicro" : {
                "port" : 200
            },
            "edge_config" : {
                "bootstrap" : "get bootstrap here",
            },
            "quota" : {
                "qa" : "b",
                "qc" : "d",
                "qe" : "f",    
            }
        }
        var proxies = {}
        var products= {
            'path_to_proxy' : "this is a product proxy path",
            'product_to_proxy' : "this other way",
            'product_to_api_resource' : "to the api",
            'product_to_quota' : {
                "qa" : { "uri" : "b1" },
                "qc" : { "uri" : "d2" },
                "qe" : { "uri" : "f3" }
            }
        }

        var reslt = kut.merge(config,proxies,products)
        assert(reslt !== null)


        config = {
            "a" : "b",
            "c" : "d",
            "edge_config" : {
                "bootstrap" : "get bootstrap here",
            },
            "quota" : {
                "qa" : "b",
                "qc" : "d",
                "qe" : "f",    
            }
        }

        reslt = kut.merge(config,proxies,products)
        assert(reslt !== null)

        done();

    })

    it('maps edge proxies', done => {
        //
        var proxies = []
        proxies.push({
            'maxConnections' : 200,
            'apiProxyName' : 'apx name',
            'proxyEndpoint' : {
                'name' : 'proxy 1',
                'basePath' : "test1/2"
            },
            'targetEndpoint' : {
                'name' : 'target 1',
                'url' : 'http://www.you.are/here'
            },
            'a' : 'b',
            'c' : 'd'
        })
        //
        var mappedProxies = kut.mapEdgeProxies(proxies)
        assert(mappedProxies !== null)
        assert(true)
        done();
    });

    ///
    it('maps producs', done => {
        //
        var proxies = []
        proxies.push({
            'maxConnections' : 200,
            'apiProxyName' : 'apx name',
            'proxyEndpoint' : {
                'name' : 'proxy 1',
                'basePath' : "test1/2"
            },
            'targetEndpoint' : {
                'name' : 'target 1',
                'url' : 'http://www.you.are/here'
            },
            'a' : 'b',
            'c' : 'd'
        })
        //
        var mappedProxies = kut.mapEdgeProxies(proxies)
        assert(mappedProxies !== null)
        assert(true)
        done();
    });

    ///
    it('maps producs', done => {
        //
        var products = []
        products.push({
            'proxies' : [ 'abc', 'doreme'],
            'environments' : ['test','clubs','subs'],
            'name' : 'p1',
            'apiResources' : 'test this',
            'quota' : 100,
            'quotaInterval' : 10,
            'quotaTimeUnit' : 'hour',
        })
        //
        var mappedProxies = kut.mapEdgeProducts(products,'test')
        assert(mappedProxies !== null)
        assert(true)
        done();
    });
    
    ///
    it('filters products', done => {
        //
        var prods = [
            { 'environments' : ['test','abc'] },
            { 'environments' : ['test','doreme'] }
        ]
        var pout = kut.filteredProducts(prods,undefined)
        assert(pout.length === 2)
        pout = kut.filteredProducts(prods,'test')
        assert(pout.length === 2)
        pout = kut.filteredProducts(prods,'doreme')
        assert(pout.length === 1)
        //
        done()
    });

    ///
    it('maps producs', done => {
        //
        var products = []
        products.push({
            'proxies' : [ 'abc', 'doreme'],
            'environments' : ['test','clubs','subs'],
            'name' : 'p1',
            'apiResources' : 'test this',
            'quota' : 100,
            'quotaInterval' : 10,
            'quotaTimeUnit' : 'hour',
        })
        //
        var mappedProxies = kut.mapEdgeProducts(products,'test')
        assert(mappedProxies !== null)
        assert(true)
        done();
    });
    
    ///
    it('network module is a real entity', done => {
        try {
            netw = network()
            assert(true)
        } catch(e) {
            assert(false)
        }
        done();
    });

    ///
    it(`loaderAddJWTSupport(config,results) throws and logs warning`, done => {
        var loaderAddJWTSupport = network.__get__('loaderAddJWTSupport')
        var config = {}
        var results = [0,1,2,3]
        var myLogger = new LoggerClass('loaderAddJWTSupport did get thrown and logs warning called :: ')
        network.__set__('g_Logger',myLogger)
        myLogger.setTestCB(src => {
            assert(src === 'warn')
        })
        loaderAddJWTSupport(config,results)

        results = [0,1,2]
        var config = { 'oauth' : {}, 'apikeys' : {}, 'oauthv2' : {} }

        loaderAddJWTSupport(config,results)

        myLogger.setTestCB(src => {
            assert(src === 'warn')
            done()
        })
        loaderAddJWTSupport()
    })

    ///
    it(`loaderAddJWTSupport(config,results) good call`, done => {
        var loaderAddJWTSupport = network.__get__('loaderAddJWTSupport')
        var results = [0,1,2,3]
        var config = { 'oauth' : {}, 'apikeys' : {}, 'oauthv2' : {} }
        var myLogger = new LoggerClass('loaderAddJWTSupport got bad parameter :: ')  // should not see this
        network.__set__('g_Logger',myLogger)
        myLogger.setTestCB(src => {
            assert(false)
            done()
        })
        loaderAddJWTSupport(config,results)
        done()
    })

    ///
    it(`loaderAddPublicKeySupport(config,results) throws and logs warning`, done => {
        var loaderAddJWTSupport = network.__get__('loaderAddPublicKeySupport')
        var config = {}
        var results = [0,1,2]
        var myLogger = new LoggerClass('loaderAddPublicKeySupport did get thrown and logs warning called :: ')
        network.__set__('g_Logger',myLogger)
        myLogger.setTestCB(src => {
            assert(src === 'warn')
        })
        loaderAddJWTSupport(config,results)

        results = [0,1]
        var config = { 'oauth' : {}, 'apikeys' : {}, 'oauthv2' : {} }

        loaderAddJWTSupport(config,results)

        myLogger.setTestCB(src => {
            assert(src === 'warn')
            done()
        })
        loaderAddJWTSupport()
    })


    ///
    it(`loaderAddPublicKeySupport(config,results) good call`, done => {
        var loaderAddJWTSupport = network.__get__('loaderAddPublicKeySupport')
        var results = [0,1,2]
        var config = { 'oauth' : {}, 'apikeys' : {}, 'oauthv2' : {} }
        //
        myLogger = new LoggerClass('loaderAddPublicKeySupport got bad parameter :: ')
        //
        network.__set__('g_Logger',myLogger)
        myLogger.setTestCB(src => {
            assert(false)
            done()
        })
        loaderAddJWTSupport(config,results)
        done()
    })

    ///
    it(`configAuthAndTLSProducts(options,config,keys,cb) lines`, done => {
        var configAuthAndTLSProducts = network.__get__('configAuthAndTLSProducts')
        var kut = network.__get__('kut')
        var request = network.__get__('request')
        //

        class TestRequest {
            constructor() {
            }
            get(opts,cb) {
                var err = 'this error'
                var response = {}
                var body = {}
                cb(err, response, body)
            }
        }

        class TestKut {
            constructor() {
            }
            loadStatus(str,url,err,response,body,cb) {
                // 'products', config.edge_config.products, err, response, body, cb
                assert(str === "products")
                assert(cb === '() => {}')
           }
            enableTLS(config, opts) {
                assert(config.edge_config !== undefined )
            }
        }

        //
        var testRequest = new TestRequest()
        var testKut = new TestKut()
        //
        network.__set__('request',testRequest)
        network.__set__('kut',testKut)
        //
        var options = {}
        var config = { 'edge_config' : {'products' : [] }  }
        var keys = { 'key' : '9375984375', 'secret' : 'as9f7a9d79a7f' }

        configAuthAndTLSProducts(options,config,keys,'() => {}')
        //
        assert(true)
        //
        network.__set__('request',request)
        network.__set__('kut',kut)

        done()
    })

    ///
    it(`_load(config, keys, callback) `, done => {
        var async = network.__get__('async')
        //
        var bootstrapConfig = network.__get__('bootstrapConfig')
        var configAuthAndTLSProducts = network.__get__('configAuthAndTLSProducts')
        var configAuthJWTSinglePublicKey = network.__get__('configAuthJWTSinglePublicKey')
        var configAuthJWTSeveralPublicKeys = network.__get__('configAuthJWTSeveralPublicKeys')
        var loadJoinResults = network.__get__('loadJoinResults')

        var myAsync = {
            'parallel' : (list,endcb) => {
                list.forEach( cb => { cb() } )
                endcb()
            }
        }
        network.__set__('async',myAsync)
        network.__set__('bootstrapConfig',() => {})
        network.__set__('configAuthAndTLSProducts',() => {})
        network.__set__('configAuthJWTSinglePublicKey',() => {})
        network.__set__('configAuthJWTSeveralPublicKeys',() => {})
        network.__set__('loadJoinResults',() => {})
        //
        var _load = network.__get__('_load')
        var config = {
            'edge_config' : {
                'proxy' : 'skhskjfh',
                'proxy_tunnel' : 'oerutosiutr',
                'proxyPattern' : 'osiufosfsd'
            }
        }
        //
        _load(config, 'keys', 'callback')
        //
        network.__set__('bootstrapConfig',bootstrapConfig)
        network.__set__('configAuthAndTLSProducts',configAuthAndTLSProducts)
        network.__set__('configAuthJWTSinglePublicKey',configAuthJWTSinglePublicKey)
        network.__set__('configAuthJWTSeveralPublicKeys',configAuthJWTSeveralPublicKeys)
        network.__set__('loadJoinResults',loadJoinResults)
        network.__set__('async',async)
        done()
    })



    ///
    it(`loadJoinResults  gets error`, done => {
        //
        var loadJoinResults = network.__get__('loadJoinResults')
        var myLogger = new LoggerClass('loadJoinResults got bad parameter :: ')  // should not see this
        network.__set__('g_Logger',myLogger)
        myLogger.setTestCB(src => {
            assert(src === 'warn')
        })
        var callback = (err) => {
            assert('junk' === err)
            done()
        }
        var results = [0,1,2,3,4,5]
        loadJoinResults('junk',results,null,null,callback)
    })

    ///
    it(`loaderUnloadProxyInfo  line coverage`, done => {
        //
        var loaderUnloadProxyInfo = network.__get__('loaderUnloadProxyInfo')
        var myLogger = new LoggerClass('loaderUnloadProxyInfo got bad parameter :: ')  // should not see this
        network.__set__('g_Logger',myLogger)
        network.__set__('gProxyPattern','this is a test')
        //
        var kut = network.__get__('kut')
        //
        class TestKut {
            constructor() {
            }
            
            matchWildcard(pname, pattern) {
                return(true)
            }

        }

        var testKut = new TestKut()
        //
        network.__set__('kut',testKut)

        // 
        var proxyInfo = {
            "apiProxies" : [
                {
                    'targetEndpoint' : {
                        'url' : 'this is a test'
                    },
                    'apiProxyName' : "P1"
                },
                {
                    'targetEndpoint' : {
                        'url' : 'this is a test'
                    },
                    'apiProxyName' : "P2"
                }
            ]
        }
        //
        myLogger.setTestCB(src => {
            assert(src === 'warn')
        })
       
        var results = [JSON.stringify(proxyInfo)]
        //
        loaderUnloadProxyInfo(results)
        //
        network.__set__('kut',kut)


        loaderUnloadProxyInfo([])
        //
        done()
        //
    })

    ///
    it(`loaderUnloadProductInfo  line coverage`, done => {
        //
        var loaderUnloadProductInfo = network.__get__('loaderUnloadProductInfo')
        var myLogger = new LoggerClass('loaderUnloadProductInfo got bad parameter :: ')  // should not see this
        network.__set__('g_Logger',myLogger)
        //
        myLogger.setTestCB(src => {
            assert(src === 'warn')
        })
        loaderUnloadProductInfo([])
        // // // // // // // // // // 
        var productInfo = {
            "apiProduct" : [ 1,2,3]
        }
        //
        var results = [0,JSON.stringify(productInfo)]
        loaderUnloadProductInfo(results)

        myLogger.setTestCB(src => {
            assert(src === 'error')
        })
        try {
            results = [0,"{OIKPSDJF{.djfi[]2"]
            loaderUnloadProductInfo(results)
            assert(false)
        } catch (e) {
            assert(true)
        }
        done()
    })


    ///
    it(`bootstrapConfig(options,config,keys,cb) lines`, done => {
        var bootstrapConfig = network.__get__('bootstrapConfig')
        var kut = network.__get__('kut')
        var request = network.__get__('request')
        //

        class TestRequest {
            constructor() {
            }
            get(opts,cb) {
                var err = 'this error'
                var response = {}
                var body = {}
                cb(err, response, body)
            }
        }

        class TestKut {
            constructor() {
            }
            loadStatus(str,url,err,response,body,cb) {
                // 'products', config.edge_config.products, err, response, body, cb
                assert(str === "config")
                assert(cb === '() => {}')
           }
            enableTLS(config, opts) {
                assert(config.edge_config !== undefined )
            }
        }

        //
        var testRequest = new TestRequest()
        var testKut = new TestKut()
        //
        network.__set__('request',testRequest)
        network.__set__('kut',testKut)
        //
        var options = {}
        var config = {
            'edge_config' : {
                'bootstrap' : 'ueiroerueoir-url'
            },
            'proxies' : [{
                'revision' : "343",
                'revision' : 'sdhf;',
                'url' : 'slfjsdof'
            }]
        }
        var keys = { 'key' : '9375984375', 'secret' : 'as9f7a9d79a7f' }
        //
        process.env.EDGEMICRO_LOCAL_PROXY = "1"
        bootstrapConfig(options,config,keys,'() => {}')
        //
        process.env.EDGEMICRO_LOCAL_PROXY = "0"
        bootstrapConfig(options,config,keys,'() => {}')
        //
        assert(true)
        //
        network.__set__('request',request)
        network.__set__('kut',kut)

        done()
    })

    ///
    it(`networkLoadCallback(err, proxies, products, keys, config, callback) lines`, done => {
        var networkLoadCallback = network.__get__('networkLoadCallback')
        var kut = network.__get__('kut')
        var request = network.__get__('request')
        var ioLib_back = network.__get__('ioLib')
        var proxy_validator = network.__get__('proxy_validator')
        //
        var myLogger = new LoggerClass('networkLoadCallback lines :: ')  // should not see this
        network.__set__('g_Logger',myLogger)
        //

        class TestRequest {
            constructor() {
            }
            get(opts,cb) {
                var err = 'this error'
                var response = {}
                var body = {}
                cb(err, response, body)
            }
        }

        class TestKut {
            constructor() {
            }
            loadStatus(str,url,err,response,body,cb) {
                // 'products', config.edge_config.products, err, response, body, cb
                assert(str === "config")
                assert(cb === '() => {}')
           }
            enableTLS(config, opts) {
                assert(config.edge_config !== undefined )
            }

            mergeKeys(mergedConfig, keys) {
                //
            }

            mapEdgeProxies(a) {
                return(1)
            }

            mapEdgeProducts(a,b) {
                return(2)
            }


            merge(a,b,c) {

            }
        }


        var iolib = () => {
            return(new TestIoLib())
        }

        class TestIoLib {
            constructor() {}
            loadSync(object) {
                return("this is a test too")
            }
        }

        class TestIoLib2 {
            constructor() {}
            loadSync(object) {
                return(null)
            }
        }
        //
        var testRequest = new TestRequest()
        var testKut = new TestKut()
        //
        network.__set__('request',testRequest)
        network.__set__('kut',testKut)
        network.__set__('ioLib',iolib)

        var etest = "this is a test"
        var callback = (err) => {
            assert(err === etest)
        }

        //(err, proxies, products, keys, config, callback)
        networkLoadCallback(etest, null, null, null, null, callback)

        callback = (err,data) => {
            assert(err === null)
            assert(data === "this is a test too")
        }
        networkLoadCallback(null, null, null, null, null, callback)
        //

        iolib = () => {
            return(new TestIoLib2())
        }
        network.__set__('ioLib',iolib)

        callback = (err,data) => {
            assert(err !== null)
        }
        networkLoadCallback(null, null, null, null, null, callback)



        class proxyValidator {
            constructor() {}
            validate(something) {
                //
            }
        }


        var config = {
            'edgemicro' : {
                "proxies" : ['t1','t2']
            },
            'oauth' : {
                'productOnly' : false
            }
        }

        var proxies = [{
            'apiProxyName' : 't1',
            'revision' : "343",
            'revision' : 'sdhf;',
            'url' : 'slfjsdof'
        },
        {
            'apiProxyName' : 't2',
            'revision' : "343",
            'revision' : 'sdhf;',
            'url' : 'slfjsdof'
        }]
        var products = [{"proxies" : ['t1','t2']},{"proxies" : ['t1','t2']}]
            
        var keys = []

        network.__set__('proxy_validator',new proxyValidator())

        callback = () => {}

        networkLoadCallback(null,  proxies, products, keys, config, callback)
        // networkLoadCallback


        // environment variable check
        process.env.EDGEMICRO_DECORATOR  = true
        proxies = [{
            'apiProxyName' : 't1',
            'revision' : "343",
            'revision' : 'sdhf;',
            'url' : 'slfjsdof',
            'proxyEndpoint' : {}
        }]

        networkLoadCallback(null,  proxies, products, keys, config, callback)
        //
        
        network.__set__('request',request)
        network.__set__('kut',kut)
        network.__set__('ioLib',ioLib_back)
        network.__set__('proxy_validator',proxy_validator)


        done()

    })


    it('it runs load config', done => {
        var loadConfiguration = network.__get__('loadConfiguration')
        var kut = network.__get__('kut')
        var default_config_validator = network.__get__('default_config_validator')
        var loader = network.__get__('_load')
        var proxy_validator = network.__get__('proxy_validator')

        //
        var myLogger = new LoggerClass('loadConfiguration lines :: ')  // should not see this
        network.__set__('g_Logger',myLogger)
        //

        var vReturnError = false;

        var config = {
            'edgemicro' : {
                "proxies" : ['t1','t2']
            },
            'oauth' : {
                'productOnly' : false
            }
        }


        class TestKut {
            constructor() {
            }
            loadStatus(str,url,err,response,body,cb) {
                // 'products', config.edge_config.products, err, response, body, cb
                assert(str === "config")
                assert(cb === '() => {}')
           }
            enableTLS(config, opts) {
                assert(config.edge_config !== undefined )
            }

            mergeKeys(mergedConfig, keys) {
                //
            }

            mapEdgeProxies(a) {
                return(1)
            }

            mapEdgeProducts(a,b) {
                return(2)
            }


            merge(a,b,c) {

            }

            validateUrls() {
                if ( vReturnError ) {
                    return("got an error")
                }
                return(false)
            }

            mergeDefaults() {
                return(config)
            }
        }

        //
        var testKut = new TestKut()
        //
        network.__set__('kut',testKut)


        class TestDefaultValidator {
            constructor() {

            }

            validate() {
                return(true)
            }
        }



        class proxyValidator {
            constructor() {}
            validate(something) {
                //
            }
        }


        network.__set__('proxy_validator',new proxyValidator())
        network.__set__('default_config_validator',new TestDefaultValidator())
        
        var proxies = [{
            'apiProxyName' : 't1',
            'revision' : "343",
            'revision' : 'sdhf;',
            'url' : 'slfjsdof'
        },
        {
            'apiProxyName' : 't2',
            'revision' : "343",
            'revision' : 'sdhf;',
            'url' : 'slfjsdof'
        }]
        var products = [{"proxies" : ['t1','t2']},{"proxies" : ['t1','t2']}]
            
        var keys = []



        network.__set__('_load',(config,keys,cb) => {
            cb(null, proxies, products)
        })


        callback = (err) => {
            console.log(err)
            assert(err === null)
        }
        //
        loadConfiguration(config, keys, callback)

        //
        vReturnError = true;


        network.__set__('_load',(config,keys,cb) => {
            cb("got an error", proxies, products)
        })

        callback = (err) => {
            console.log(err)
            assert(err === "got an error")
        }
        //
        loadConfiguration(config, keys, callback)
        
        network.__set__('kut',kut)
        network.__set__('default_config_validator',default_config_validator)
        network.__set__('_load',loader)
        network.__set__('proxy_validator',proxy_validator)
        //
        done()
    })


    ///
    it(`configAuthJWTSeveralPublicKeys(options,config,cb) lines`, done => {
        var configAuthJWTSeveralPublicKeys = network.__get__('configAuthJWTSeveralPublicKeys')
        var kut = network.__get__('kut')
        var request = network.__get__('request')
        //

        class TestRequest {
            constructor() {
            }
            get(opts,cb) {
                var err = null
                var response = { 'statusCode' : 200 }
                var body = {}
                cb(err, response, body)
            }
        }

        class TestKut {
            constructor() {
            }
            loadStatus(str,url,err,response,body,cb) {
                assert('jwk_public_keys' === str)
            }
            enableTLS(config, opts) {
                assert(config.edge_config !== undefined )
                return(opts)
            }
        }

        //
        var testRequest = new TestRequest()
        var testKut = new TestKut()
        //
        network.__set__('request',testRequest)
        network.__set__('kut',testKut)
        //
        var options = { 
            'url' : "test"
        }
        var config = { 'edge_config' : {'products' : [] }  }
        var keys = { 'key' : '9375984375', 'secret' : 'as9f7a9d79a7f' }

        configAuthJWTSeveralPublicKeys(options,config,callback)
        //
        assert(true)
        //
        network.__set__('request',request)
        network.__set__('kut',kut)
        network.__set__('configAuthJWTSeveralPublicKeys',configAuthJWTSeveralPublicKeys)

        done()
    })

    ///
    it(`configAuthJWTSinglePublicKey(options,config,cb) lines`, done => {
        var configAuthJWTSinglePublicKey = network.__get__('configAuthJWTSinglePublicKey')
        var kut = network.__get__('kut')
        var request = network.__get__('request')
        //

        class TestRequest {
            constructor() {
            }
            get(opts,cb) {
                var err = null
                var response = { 'statusCode' : 200 }
                var body = {}
                cb(err, response, body)
            }
        }

        class TestKut {
            constructor() {
            }
            loadStatus(str,url,err,response,body,cb) {
                assert('jwt_public_key' === str)
            }
            enableTLS(config, opts) {
                assert(config.edge_config !== undefined )
                return(opts)
            }
        }

        //
        var testRequest = new TestRequest()
        var testKut = new TestKut()
        //
        network.__set__('request',testRequest)
        network.__set__('kut',testKut)
        //
        var options = { 
            'url' : "test"
        }
        var config = { 'edge_config' : {'products' : [] }  }
        var keys = { 'key' : '9375984375', 'secret' : 'as9f7a9d79a7f' }

        configAuthJWTSinglePublicKey(options,config,callback)
        //
        assert(true)
        //
        network.__set__('request',request)
        network.__set__('kut',kut)
        network.__set__('configAuthJWTSinglePublicKey',configAuthJWTSinglePublicKey)

        done()
    })

    ///
    it('calls get off of newtwork object', done => {
        try {
            //
            var networkLoadCallback = network.__get__('networkLoadCallback')
            var kut = network.__get__('kut')
            var request = network.__get__('request')
            var ioLib_back = network.__get__('ioLib')
            var proxy_validator = network.__get__('proxy_validator')
            var default_config_validator = network.__get__('default_config_validator')

            var loadConfiguration = network.__get__('loadConfiguration')

            //loadConfiguration(this.config, keys, callback);

            //
            var myLogger = new LoggerClass('networkLoadCallback lines :: ')  // should not see this
            network.__set__('g_Logger',myLogger)
            //
            var config = {
                'edgemicro' : {
                    "proxies" : ['t1','t2']
                },
                'oauth' : {
                    'productOnly' : false
                }
            }
    
            var proxies = [{
                'apiProxyName' : 't1',
                'revision' : "343",
                'revision' : 'sdhf;',
                'url' : 'slfjsdof'
            },
            {
                'apiProxyName' : 't2',
                'revision' : "343",
                'revision' : 'sdhf;',
                'url' : 'slfjsdof'
            }]
            var products = [{"proxies" : ['t1','t2']},{"proxies" : ['t1','t2']}]
                
            var keys = []
            //
            var testSource = 'sldijfsdlfsdl' 
            //
    
            class TestRequest {
                constructor() {
                }
                get(opts,caller,cb) {
                    var err = null
                    var response = {
                        'statusCode' : 200
                    }
                    var body = {}
                    cb(err, response, body)
                }
            }
    
            class TestKut {
                constructor() {
                }

                loadSync(obj) {
                    // this is a test

                }

                getDefaultProxy(proxies, config, options) {
                    //
                    return({ 'test' : 'proxy' })
                }

                validateUrls() {

                }

                writeConfig(source,body) {
                    assert(testSource === source)
                }

                loadStatus(str,url,err,response,body,cb) {
                    // 'products', config.edge_config.products, err, response, body, cb
                    assert(str === "config")
                    assert(cb === '() => {}')
               }
                enableTLS(config, opts) {
                    assert(config.edge_config !== undefined )
                }
    
                mergeKeys(mergedConfig, keys) {
                    //
                }
    
                mapEdgeProxies(a) {
                    return(1)
                }
    
                mapEdgeProducts(a,b) {
                    return(2)
                }
    
    
                merge(a,b,c) {
    
                }
            }
    

            class TestDefaultValidator {
                constructor() {
    
                }
    
                validate() {
                    return(true)
                }
            }
    
    
            var iolib = () => {
                return(new TestIoLib())
            }
    
            class TestIoLib {
                constructor() {}
                loadSync(object) {
                    return({})
                }
            }
            //
            var testRequest = new TestRequest()
            var testKut = new TestKut()
            //
            network.__set__('request',testRequest)
            network.__set__('kut',testKut)
            network.__set__('ioLib',iolib)
    
    
            class proxyValidator {
                constructor() {}
                validate(something) {
                    //
                }
            }
            //
            network.__set__('proxy_validator',new proxyValidator())
            network.__set__('default_config_validator',new TestDefaultValidator())

            callback = () => {}
            networkLoadCallback(null,  proxies, products, keys, config, callback)
            // networkLoadCallback
                proxies = [{
                'apiProxyName' : 't1',
                'revision' : "343",
                'revision' : 'sdhf;',
                'url' : 'slfjsdof',
                'proxyEndpoint' : {}
            }]

            //
            var options = {
                'keys' : {
                    'key' : 'woturostuweroiu',
                    'secret' : 'akdaskjd'
                },
                'source' : testSource
            }
            var callback = () => {}



            netw = network(new TestIoLib())
            assert(true)


            process.env.EDGEMICRO_LOCAL = "1"   // first branch
            netw.get(options,callback)
            //

            var TestLoadConfiguration = (config, keys, callback) => {

            }

            network.__set__('loadConfiguration',TestLoadConfiguration)
     

            process.env.EDGEMICRO_LOCAL = false  // first branch
            netw.get(options,callback)
 
            options.configurl = "sfsojfso"
            netw.get(options,callback)



        } catch(e) {
            console.log(e)
            assert(false)
        }

        //
        network.__set__('request',request)
        network.__set__('kut',kut)
        network.__set__('ioLib',ioLib_back)
        network.__set__('proxy_validator',proxy_validator)
        network.__set__('default_config_validator',default_config_validator)
        network.__set__('loadConfiguration',loadConfiguration)
        //
        done();
    });

})
