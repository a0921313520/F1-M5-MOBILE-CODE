import React from "react";
/*
 * @Author: Alan
 * @Date: 2021-05-28 19:07:41
 * @LastEditors: Alan
 * @LastEditTime: 2021-06-10 20:00:45
 * @Description: 赛事情报 骨架屏
 * @FilePath: \Fun88-Sport-Code2.0\components\Skeleton\smartcoach.js
 */

export default class Smartcoach extends React.PureComponent {
	render() {
		return (
			<div className="RealTimeCommunication">
				<div className="box">
					{/* 即时情报 */}
					{[ ...Array(5) ].map((item, key) => {
						return (
							<div
								className={key % 2 == 0 ? 'item left' : 'item right'}
								key={key}
								style={{ marginBottom: '20px' }}
							>
								<span className="message" style={{ border: 0 }}>
									<span style={{ width: '70%', textIndent: '-9999px', backgroundColor: '#e0e0e9' }}>
										11
									</span>
								</span>
							</div>
						);
					})}
				</div>
			</div>
		);
	}
}
