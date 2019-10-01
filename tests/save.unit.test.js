const path = require('path');
const assert = require('assert');
const fs = require('fs');
const config = require('../index.js');
const fixtureDefaultConfig = path.join(__dirname, 'fixtures', 'default.yaml');
const fixtureCachedConfig = path.join(__dirname, 'fixtures', 'cached.yaml');
const fixtureSavedConfig = path.join(__dirname, 'fixtures', 'savedConfig.yaml');
const fixtureDefaultConfigMaxConnections = 9001;
const fixtureCachedConfigPollInterval = 24;

describe('config - save', () => {

    after(done => {
        if (fs.existsSync(fixtureSavedConfig)) fs.unlinkSync(fixtureSavedConfig);
        done();
    });

    it('saves loaded config file', done => {
        let cachedConfig = config.load({ source: fixtureCachedConfig });
        assert.deepStrictEqual(cachedConfig.edgemicro.config_change_poll_interval, fixtureCachedConfigPollInterval);
        try {
            config.save(cachedConfig, fixtureSavedConfig);
        } catch (err) {
            assert.equal(err, null);
        }
        let savedConfig = config.load({ source: fixtureSavedConfig });
        assert.deepStrictEqual(savedConfig.edgemicro.config_change_poll_interval, fixtureCachedConfigPollInterval);
        done();
    });

})