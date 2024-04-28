/*
 * @Author: Alan
 * @Date: 2022-01-27 21:50:21
 * @LastEditors: Alan
 * @LastEditTime: 2022-10-21 18:56:35
 * @Description: 客服
 * @FilePath: \Mobile\Server_Dev.js
 */
// server.js
const express = require('express');
const next = require('next');
const proxyMiddleware = require('http-proxy-middleware');

const devProxy = {
	'/zh-hans': {
		//target: 'https://f1m1-worldcup-stage-web.fubnb.com', //调试世界杯活动启用此api
		target: 'https://f1-api-stage-web.fubnb.com',
		// pathRewrite: {
		// 	'^/zh-hans': ''
		// },
		changeOrigin: true,
		secure: false,
		onProxyRes: (proxyRes, req, res) => {
			proxyRes.headers['Access-Control-Allow-Origin'] = '*'; // add new header to response
		}
	}
};

const port = parseInt(process.env.PORT, 10) || 5858;
const dev = process.env.NODE_ENV !== 'production';
const app = next({
	dev
});
const handle = app.getRequestHandler();

app
	.prepare()
	.then(() => {
		const server = express();
		if (dev && devProxy) {
			Object.keys(devProxy).forEach(function(context) {
				server.use(proxyMiddleware(context, devProxy[context]));
			});
		}

		server.all('*', (req, res) => {
			handle(req, res);
		});

		server.listen(port, (err) => {
			if (err) {
				throw err;
			}
			//console.log(`> Ready on http://localhost:${port}`);
		});
	})
	.catch((err) => {
		//console.log('An error occurred, unable to start the server');
		//console.log(err);
	});
