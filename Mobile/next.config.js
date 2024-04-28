

/*
 * @Author: Alan
 * @Date: 2022-01-22 14:20:20
 * @LastEditors: Alan
 * @LastEditTime: 2023-05-05 14:09:07
 * @Description: Next.js 配置
 * @FilePath: \Mobile\next.config.js
 */
const path = require('path');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
	enabled: process.env.BUNDLE_ANALYZE === 'true'
});
const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');
const webpack = require('webpack');
const withTM = require('next-transpile-modules')(['central-payment']);
function nextConfig(phase) {
	// when started in development mode `next dev` or `npm run dev` regardless of the value of STAGING environmental variable
	const isDev = phase === PHASE_DEVELOPMENT_SERVER;
	const basePath = '/vn'; //根目錄，默認空，如果放在子目錄下，在這裡指定(例子：/ec2021 )

	return {
		images: {
			domains: [
				'cache.f866u.com',
				'cache.jiadingyeya.com',
				'f1-api-stage-web.fubnb.com',
				'media.stagingp3.fun88.biz'
			],
			formats: [ 'image/avif', 'image/webp' ],
			loader: 'akamai',
			path: ''
		},
		swcMinify: true,
		compiler: {
			styledComponents: true,
            removeConsole: (process.env.NODE_ENV === "production")
              ? {
                    exclude: ['error'], //只保留error紀錄
                }
              : false,
		},
		// 后缀名解析
		// pageExtensions: ['js', 'jsx'],
		// 自定义编译目录
		distDir: 'build',
		trailingSlash: true,
		env: {
			CURRENCY: 'CNY',
			ISLOCALDEV: isDev,
			BASE_PATH: basePath //這個給程序用，用來處理圖片(img src)路徑
		},
		// assetPrefix: basePath,
		basePath: basePath, //next內建支持根目錄 處理js和css引用，圖片(img src),css裡面的圖片路徑 要另外處理
		sassOptions: {
			includePaths: [ path.join(__dirname, './src/styles') ]
		},
		// experimental: { scss: true },
		webpack(config, { isServer }) {
			// webpack会执行两次，第一次为客户端，第二次为服务器端
			// //console.log(isServer)
			// //console.log(process.env.NODE_ENV)

			config.resolve.alias = {
				...(config.resolve.alias || {}),
				'@': path.resolve(__dirname, './src'),
				$Deposits: path.resolve(__dirname, './node_modules/central-payment/Deposit/M3'),
				// $Deposits: path.resolve(__dirname, './Central-Payment/Deposit/M3'),
				$SBTWO: path.resolve(__dirname, './src/components/sbtwo'),
				$SBTWOLIB: path.resolve(__dirname, './src/lib/sbtwo')
			};

			if (!isServer) {
				config.optimization.splitChunks.cacheGroups = {
					vendorSABA: {
						test(module) {
							//包含node_modules/sbtech相關模塊
							return /[/\\]lib[/\\]vendor[/\\]saba[/\\]VendorSABA/.test(module.nameForCondition() || '');
						},
						chunks: 'all',
						name: 'SABA',
						priority: 100,
						enforce: true
					},
					vendorBTI: {
						test(module) {
							//包含node_modules/sbtech相關模塊
							return (
								/[/\\]lib[/\\]vendor[/\\]bti[/\\]VendorBTI/.test(module.nameForCondition() || '') ||
								/[/\\]node_modules[/\\]sbtech/.test(module.nameForCondition() || '')
							);
						},
						chunks: 'all',
						name: 'BTI',
						priority: 99,
						enforce: true
					},
					vendorIM: {
						test(module) {
							return /[/\\]lib[/\\]vendor[/\\]im[/\\]VendorIM/.test(module.nameForCondition() || '');
						},
						chunks: 'all',
						name: 'IM',
						priority: 98,
						enforce: true
					},
					vendorShared: {
						test(module) {
							return /[/\\]lib[/\\]vendor[/\\]/.test(module.nameForCondition() || '');
						},
						chunks: 'all',
						name: 'vendor-common',
						priority: 97,
						enforce: true
					},
					...(config.optimization.splitChunks.cacheGroups || {})
				};
			}
			return config;
		},
		exportPathMap: function(defaultPathMap) {
			return {
				...defaultPathMap,
				'/register_login/index.htm': { page: '/safehouse' }
			};
		}
	};
}

module.exports = (phase) => {
	const configWithTM = withTM(nextConfig(phase));
	return withBundleAnalyzer(configWithTM);
};



// Inected Content via Sentry Wizard Below

const { withSentryConfig } = require("@sentry/nextjs");

module.exports = withSentryConfig(
  module.exports,
  {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    // Suppresses source map uploading logs during build
    silent: true,

    org: "f1-m1-mobile",
    project: "st",
  },
  {
    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Transpiles SDK to be compatible with IE11 (increases bundle size)
    transpileClientSDK: false,

    // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
    //tunnelRoute: "/monitoring",

    // Hides source maps from generated client bundles
    hideSourceMaps: true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,
  }
);
