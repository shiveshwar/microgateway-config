'use strict';

const path = require('path');
const assert = require('assert');
const defaultValidator = require('../lib/default-validator.js');
const fixtureDirectory = path.join(__dirname, 'fixtures');
const defaultOrgEnvFilename = `load-victorshaw-eval-test-config.yaml`;
let customFixtureDirPath = path.join(fixtureDirectory, defaultOrgEnvFilename);
// let cachedConfigFixturePath = path.join(fixtureDirectory, 'cached.yaml');
const config = require('../index.js');
const loadedConfig = config.load({ source: customFixtureDirPath });


describe('default-validator module', () => {

    it('validates config', (done) => {
        try {
            defaultValidator.validate(loadedConfig);
        } catch (err) {
            assert.equal(err, null);
        }
        done();
    });


    it('validates complete config', (done) => {
        try {

            var completeConfig = { //
                edge_config  : {
                    bootstrap : true,
                    jwt_public_key : "sefs",
                    retry_interval : 15000,
                    refresh_interval : (3600000 + 100),
                    proxy : "http://www.google.com",
                    proxy_tunnel : true
                },

                oauth : {
                    allowNoAuthorization : true,
                    allowInvalidAuthorization : true
                },

                edgemicro : {
                    port : 8000,
                    logging : {
                        level : 'error',
                        to_console : false,
                        dir : "hopeful",
                    },
                    max_connections : 99,
                },

                plugins : {
                    sequence : []
                },

                quota : {
                    timeUnit : 'hour',
                    interval : 200,
                    allow : 10
                },

                analytics : {
                    bufferSize : 1000,
                    flushInterval : 10,
                    batchSize : 90
                },
                
                spikearrest : {
                    timeUnit : "minute",
                    bufferSize : 2000,
                    allow : 10
                },

                quotas : {
                    'hour' : {
                        'bufferSize' : 1000
                    }
                }
            };
            //
            defaultValidator.validate(completeConfig);
            
            completeConfig.quotas = {
                'week' : {
                    'bufferSize' : 1000
                }
            }
            defaultValidator.validate(completeConfig);


        } catch (err) {
            assert.equal(err, null);
        }
        done();
    });

    it('throws error for invalid quota timeunit', (done) => {
        const invalidQuotaConfig = Object.assign({}, loadedConfig, { quota: { timeUnit: 'millenia' } })
        try {
            defaultValidator.validate(invalidQuotaConfig);
        } catch (err) {
            assert(err instanceof Error);
            assert(err.message.includes('invalid value for config.quota.timeUnit'));
        }
        done();
    });

    it('throws error for invalid spikearrest buffersize', (done) => {
        const invalidSpikeArrest = Object.assign({}, loadedConfig, { spikearrest: { timeUnit: 'minute', bufferSize: 'over9000' } })
        try {
            defaultValidator.validate(invalidSpikeArrest);
        } catch (err) {
            assert(err.message.includes('config.spikearrest.bufferSize is not a number'));
        }
        done();
    });

    it('throws error for invalid port', (done) => {
        const invalidPortConfig = Object.assign({}, loadedConfig, { edgemicro: { port: 'over9000' } })
        try {
            defaultValidator.validate(invalidPortConfig);
        } catch (err) {
            assert(err instanceof Error);
            assert(err.message.includes('invalid value for config.edgemicro.port'));
        }
        done();
    });

    it('throws error for invalid refresh interval', (done) => {
        const edgeconfigRefreshInterval = Object.assign({}, loadedConfig.edge_config, { retry_interval: 9001, refresh_interval: 9001 })
        const invalidRefreshInterval = Object.assign({}, loadedConfig, { edge_config: edgeconfigRefreshInterval })
        try {
            defaultValidator.validate(invalidRefreshInterval);
        } catch (err) {
            assert(err instanceof Error);
            assert(err.message.includes('config.edge_config.refresh_interval is too small (min 1h)'));
            done();
        };
    });

    it('throws error for invalid quotas type', (done) => {
        const quotas = Object.assign({}, loadedConfig, { quotas: 2})
        try {
            defaultValidator.validate(quotas);
        } catch (err) {
            assert(err.message.includes('config.quotas is not an object'));
        }
        done();
    });

    it('throws error for invalid quotas key', (done) => {
        const quotas = Object.assign({}, loadedConfig, { quotas: { invalid: {}}})
        try {
            defaultValidator.validate(quotas);
        } catch (err) {
            assert(err.message.includes('invalid value in config.quotas'));
        }
        done();
    });

    it('throws error for missing quotas bufferSize', (done) => {
        const quotas = Object.assign({}, loadedConfig, { quotas: { default: { }}})
        try {
            defaultValidator.validate(quotas);
        } catch (err) {
            assert(err.message.includes('default.bufferSize is not a number'));
        }
        done();
    });

    it('throws error for non-number bufferSize', (done) => {
        const quotas = Object.assign({}, loadedConfig, { quotas: { default: { bufferSize: 'over9000' }}})
        try {
            defaultValidator.validate(quotas);
        } catch (err) {
            assert(err.message.includes('default.bufferSize is not a number'));
        }
        done();
    });

    it('throws error for invalid quotas bufferSize', (done) => {
        const quotas = Object.assign({}, loadedConfig, { quotas: { default: { bufferSize: -1 }}})
        try {
            defaultValidator.validate(quotas);
        } catch (err) {
            assert(err.message.includes('default.bufferSize must be greater than or equal to zero'));
        }
        done();
    });

    it('accepts a zero quota bufferSize', (done) => {
        const quotas = Object.assign({}, loadedConfig, { quotas: { minute: { bufferSize: 0 }}})
        defaultValidator.validate(quotas);
        done();
    });

    it('accepts a valid quota bufferSize', (done) => {
        const quotas = Object.assign({}, loadedConfig, { quotas: { minute: { bufferSize: 1 }}})
        defaultValidator.validate(quotas);
        done();
    });
});
