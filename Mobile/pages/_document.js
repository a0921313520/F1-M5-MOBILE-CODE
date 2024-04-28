/*
 * @Author: Alan
 * @Date: 2022-03-07 11:49:02
 * @LastEditors: Alan
 * @LastEditTime: 2022-11-30 18:42:00
 * @Description: 静态入口
 * @FilePath: \Mobile\pages\_document.js
 */
import Document, { Html, Head, Main, NextScript } from 'next/document';

export default class MyDocument extends Document {
	render() {
		return (
			<Html lang="zh">
				<Head>
					<meta name="theme-color" content="#00a6ff" />
					<meta name="apple-mobule-web-app-status-bar-style" content="#00a6ff" />
					{/* <script src={process.env.BASE_PATH + '/js/Piwki.js?v=3.0'} /> */}
				</Head>
				<body id="fun88_sport" className="light">
					<Main />
					<NextScript />
				</body>
			</Html>
		);
	}
}
