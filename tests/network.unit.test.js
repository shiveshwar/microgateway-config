const path = require('path');
const fs = require('fs');
const assert = require('assert');
const jsyaml = require('js-yaml');

const fixtureDirectory = path.join(__dirname, 'fixtures');
const fixtureDefaultConfig = path.join(__dirname, 'fixtures', 'default.yaml');
const fixtureDefaultCustomConfigTester = path.join(__dirname, 'fixtures', 'default-custom-tester.yaml');
const fixtureDefaultConfigMaxConnections = 9001;

const network = require('../lib/network.js');
const io = require('../lib/io.js');
const kut = require('../lib/kernel-utilities.js');


describe('config - network', () => {

    var netw = null
    
    after(done => {
        //if (fs.existsSync(fixtureDefaultCustomConfig)) fs.unlinkSync(fixtureDefaultCustomConfig);
        done();
    });

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
        done();

    })



    it('network module is a real entity', done => {
        try {
            netw = network()
            assert(true)
        } catch(e) {
            assert(false)
        }
        done();
    });
})