const path = require('path');
const fs = require('fs');
const assert = require('assert');
const jsyaml = require('js-yaml');
const config = require('../index.js');
//
const fixtureDirectory = path.join(__dirname, 'fixtures');
const fixtureDefaultConfig = path.join(__dirname, 'fixtures', 'default.yaml');
const fixtureDefaultCustomConfig = path.join(__dirname, 'fixtures', 'default-custom.yaml');
const fixtureDefaultConfigMaxConnections = 9001;


describe('config - init', () => {
    after(done => {
        if (fs.existsSync(fixtureDefaultCustomConfig)) fs.unlinkSync(fixtureDefaultCustomConfig);
        done();
    });

    it('initializes custom default source config to custom directory', done => {
        config.init({
            source: fixtureDefaultConfig,
            targetDir: fixtureDirectory,
            targetFile: 'default-custom.yaml',
            overwrite: true
        }, (err, configPath) => {
            assert.equal(null, err);
            assert.equal(configPath, fixtureDefaultCustomConfig);
            let configPathJSON = jsyaml.safeLoad(fs.readFileSync(fixtureDefaultCustomConfig, 'utf8'));
            assert.deepStrictEqual(configPathJSON.edgemicro.max_connections, fixtureDefaultConfigMaxConnections);
            done();
        });
    });

    it('initializes the logger',done => {
        var Deflogger = require('../lib/default-logger')
        test_configLogger = (level,object,msg) => {

        }

        global.G_configLogger = test_configLogger
        var testLogger = new Deflogger('test')
        testLogger.test()
        global.G_configLogger = undefined
        testLogger.test()
        done()
    })

})