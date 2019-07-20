const path = require('path');
const fs = require('fs');
const assert = require('assert');
const jsyaml = require('js-yaml');

const fixtureDirectory = path.join(__dirname, 'fixtures');
const fixtureDefaultConfig = path.join(__dirname, 'fixtures', 'default.yaml');
const fixtureDefaultCustomConfig = path.join(__dirname, 'fixtures', 'default-custom.yaml');
const fixtureDefaultConfigMaxConnections = 9001;

const network = require('../lib/network.js');
const io = require('../lib/io.js');


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
                assert(err == null)
                assert(configPath === `${__dirname}/nodir/asdf.yaml`)
                assert(true)
                try {
                    test_io.initConfig(options, (err, configPath) => {
                        assert(err == null)
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
                "target" : "testthing.txt"
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
            test_io.save(config,opts);
            assert(true)
            done();
        } catch(e) {
            assert(false)
            done();
        }
    });

    it('io saves a file sync', done => {
        try {
            var test_io = io();
            //
            var opts = {
                "target" : "testthing.txt"
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
            test_io.saveSync(config,"testthing2.txt");
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