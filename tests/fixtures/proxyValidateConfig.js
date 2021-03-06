module.exports = {
	oauth: {
		allowNoAuthorization: false,
		allowInvalidAuthorization: false,
		verify_api_key_url: 'https://victorshaw-eval-test.apigee.net/edgemicro-auth/verifyApiKey',
		public_key:
			'-----BEGIN CERTIFICATE-----\nAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\n-----END CERTIFICATE-----',
		product_to_proxy: {
			EdgeMicroTestNode01: ['edgemicro-auth', 'edgemicro_node01'],
			EdgeMicroTestProductHelloecho: ['edgemicro_helloecho'],
			EdgeMicroTestProduct: ['edgemicro-auth', 'edgemicro_hello'],
			'helloworld_apikey-Product': ['helloworld_apikey']
		},
		product_to_api_resource: {
			EdgeMicroTestNode01: ['/', '/**'],
			EdgeMicroTestProductHelloecho: ['/', '/**'],
			EdgeMicroTestProduct: ['/', '/**'],
			'helloworld_apikey-Product': ['/', '/**'],
			helloworld: []
		}
	},
	analytics: {
		source: 'microgateway',
		proxy: 'dummy',
		proxy_revision: 1,
		compress: false,
		flushInterval: 5000,
		uri: 'https://edgemicroservices.apigee.net/edgemicro/axpublisher/organization/victorshaw-eval/environment/test',
		bufferSize: 10000,
		batchSize: 500
	},
	edgemicro: {
		port: 8000,
		max_connections: 1000,
		config_change_poll_interval: 600,
		logging: { level: 'error', dir: '/var/tmp', stats_log_interval: 60, rotate_interval: 24 },
		plugins: { sequence: ['oauth'] }
	},
	headers: {
		'x-forwarded-for': true,
		'x-forwarded-host': true,
		'x-request-id': true,
		'x-response-time': true,
		via: true
	},
	_hash: 0,
	proxies: [
		{
			max_connections: 1000,
			name: 'edgemicro_node01',
			revision: '1',
			proxy_name: 'default',
			base_path: '/node01',
			target_name: 'default',
			url: 'http://10.138.140.138:3000'
		},
		{
			max_connections: 1000,
			name: 'edgemicro_hello',
			revision: '1',
			proxy_name: 'default',
			base_path: '/hello',
			target_name: 'default',
			url: 'https://victorshaw-eval-test.apigee.net/v0/hello'
		}
	],
	apikeys: {
		public_key:
			'-----BEGIN CERTIFICATE-----\nAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\n-----END CERTIFICATE-----',
		product_to_proxy: {
			EdgeMicroTestNode01: ['edgemicro-auth', 'edgemicro_node01'],
			EdgeMicroTestProductHelloecho: ['edgemicro_helloecho'],
			EdgeMicroTestProduct: ['edgemicro-auth', 'edgemicro_hello'],
			'helloworld_apikey-Product': ['helloworld_apikey']
		},
		product_to_api_resource: {
			EdgeMicroTestNode01: ['/', '/**'],
			EdgeMicroTestProductHelloecho: ['/', '/**'],
			EdgeMicroTestProduct: ['/', '/**'],
			'helloworld_apikey-Product': ['/', '/**'],
			helloworld: []
		}
	},
	oauthv2: {
		public_key:
			'-----BEGIN CERTIFICATE-----\nAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\n-----END CERTIFICATE-----',
		product_to_proxy: {
			EdgeMicroTestNode01: ['edgemicro-auth', 'edgemicro_node01'],
			EdgeMicroTestProductHelloecho: ['edgemicro_helloecho'],
			EdgeMicroTestProduct: ['edgemicro-auth', 'edgemicro_hello'],
			'helloworld_apikey-Product': ['helloworld_apikey']
		},
		product_to_api_resource: {
			EdgeMicroTestNode01: ['/', '/**'],
			EdgeMicroTestProductHelloecho: ['/', '/**'],
			EdgeMicroTestProduct: ['/', '/**'],
			'helloworld_apikey-Product': ['/', '/**'],
			helloworld: []
		}
	},
	product_to_proxy: {
		EdgeMicroTestNode01: ['edgemicro-auth', 'edgemicro_node01'],
		EdgeMicroTestProductHelloecho: ['edgemicro_helloecho'],
		EdgeMicroTestProduct: ['edgemicro-auth', 'edgemicro_hello'],
		'helloworld_apikey-Product': ['helloworld_apikey']
	},
	product_to_api_resource: {
		EdgeMicroTestNode01: ['/', '/**'],
		EdgeMicroTestProductHelloecho: ['/', '/**'],
		EdgeMicroTestProduct: ['/', '/**'],
		'helloworld_apikey-Product': ['/', '/**'],
		helloworld: []
	},
	quota: {
		EdgeMicroTestNode01: {
			allow: 'null',
			interval: 'null',
			timeUnit: 'null',
			bufferSize: 10000,
			uri: 'https://edgemicroservices.apigee.net/edgemicro/quotas/organization/victorshaw-eval/environment/test'
		},
		EdgeMicroTestProductHelloecho: {
			allow: 'null',
			interval: 'null',
			timeUnit: 'null',
			bufferSize: 10000,
			uri: 'https://edgemicroservices.apigee.net/edgemicro/quotas/organization/victorshaw-eval/environment/test'
		},
		EdgeMicroTestProduct: {
			allow: 'null',
			interval: 'null',
			timeUnit: 'null',
			bufferSize: 10000,
			uri: 'https://edgemicroservices.apigee.net/edgemicro/quotas/organization/victorshaw-eval/environment/test'
		},
		'helloworld_apikey-Product': {
			allow: 'null',
			interval: 'null',
			timeUnit: 'null',
			bufferSize: 10000,
			uri: 'https://edgemicroservices.apigee.net/edgemicro/quotas/organization/victorshaw-eval/environment/test'
		}
	}
};
