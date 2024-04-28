/*
 * @Author: Alan
 * @Date: 2022-06-25 23:31:55
 * @LastEditors: Alan
 * @LastEditTime: 2022-06-27 23:04:29
 * @Description: USDT 教程
 * @FilePath: \Mobile\pages\About\UsdtInfoTutorial.js
 */
import React from 'react';
import Modal from '@/components/View/Modal';
import classNames from 'classnames';
import BackBar from '@/components/Header/BackBar';
class USDT extends React.Component {
	constructor(props, context) {
		super(props, context);
		this.state = {
			questionList: []
		};
	}

	componentDidMount() {}

	render() {
		const { InfoVisible, CloseDetail } = this.props;
		return (
			<Modal
				visible={InfoVisible}
				transparent
				maskClosable={false}
				closable={false}
				title={
					<BackBar
						key="main-bar-header"
						title={'钱包协议的区别'}
						backEvent={() => {
							CloseDetail();
						}}
						hasServer={true}
					/>
				}
				className={classNames({
					'Fullscreen-Modal': true
					// PromoModalDetail: true
				})}
			>
				<div className="content">111111111111</div>
			</Modal>
		);
	}
}
export default USDT;
