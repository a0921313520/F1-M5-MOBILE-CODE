/*
 * @Author: Alan
 * @Date: 2022-02-07 12:07:15
 * @LastEditTime: 2022-08-03 12:40:21
 * @Description: PostCss配置
 * @FilePath: \Mobile\postcss.config.js
 */
// 默认的配置
module.exports = {
	plugins: [
		"postcss-flexbugs-fixes",
		[
			"postcss-preset-env",
			{
				"autoprefixer": {
					"flexbox": "no-2009"
				},
				"stage": 3,
				"features": {
					"custom-properties": false
				}
			}
		],
		[
			'postcss-pxtorem',
			{
				rootValue: 37.5,
				unitPrecision: 5,
				propList: ["*"],
				selectorBlackList: [/^\.html/,'html'], //排除html样式
				replace: true,
				mediaQuery: false,
				minPixelValue: 0,
			}
		]
	]
};
