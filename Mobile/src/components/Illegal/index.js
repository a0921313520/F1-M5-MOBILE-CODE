/*
 * @Author: Alan
 * @Date: 2022-08-02 15:25:51
 * @LastEditors: Alan
 * @LastEditTime: 2022-08-02 16:11:05
 * @Description: 黑名单页面
 * @FilePath: \Mobile\src\components\Illegal\index.js
 */
import { ReactSVG } from '@/components/View/ReactSVG';
import ReactIMG from '@/components/View/ReactIMG';
import React from 'react';
import { PopUpLiveChat } from '@/lib/js/util';

const Illegal = () => [
	<div className="main-maintain" key="RestrictAccess">
		<div className="page404__header header-wrapper">
			<ReactSVG className="logo" src="/img/svg/Fun88Logo.svg" />
			<div
				className="sport-sprite sport-service"
				onClick={() => {
					PopUpLiveChat();
				}}
			>
				{/* 客服按钮 */}
			</div>
		</div>
		<div className="illegal-body">
			<ReactIMG className="restrict-img" src="/img/svg/Rederror.svg" />
			<div className="maintain-heading">账号违反乐天堂条规</div>
			<div className="maintain-desc">对不起，您的账号违反乐天堂条规，我们将暂停服务或关闭您的用户账户。</div>
		</div>
	</div>
];

export default Illegal;
