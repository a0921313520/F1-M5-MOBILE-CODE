/*
 * @Author: Alan
 * @Date: 2022-10-28 13:49:34
 * @LastEditors: Alan
 * @LastEditTime: 2022-12-20 17:27:12
 * @Description: 维护页面
 * @FilePath: \Mobile\src\components\sbtwo\Maintain\index.js
 */
import Button from '$SBTWO/Button';
import { ReactSVG } from '$SBTWO/ReactSVG';
import { ApiPort } from '$SBTWOLIB/SPORTAPI';
import Router from 'next/router';
let FUNLive = null;
function openServer(tlcServerUrl) {
	FUNLive.document.title = '乐天堂在线客服';
	FUNLive.location.href = tlcServerUrl;
	FUNLive.focus();
}
const PopUpLiveChat = () => {
	FUNLive && FUNLive.close();
	FUNLive = window.open(
		'about:blank',
		'chat',
		'toolbar=yes, location=yes, directories=no, status=no, menubar=yes, scrollbars=yes, resizable=no, copyhistory=yes, width=540, height=650'
	);
	fetch(ApiPort.GETLiveChat + 'api-version=2.0&Platform=Mobile', {
		method: 'GET',
		headers: new Headers({
			'Content-Type': 'application/json',
			Accept: 'application/json',
			Culture: 'ZH-CN',
			token: '71b512d06e0ada5e23e7a0f287908ac1',
			'x-bff-key': '51EXaTN7NUeCbjnvg95tgA=='
		})
	})
		.then(function(response) {
			return response.json();
		})
		.then(function(response) {
			if (response) {
				localStorage.setItem('serverUrl', response.result);
				openServer(response.result);
			}
		})
		.catch((error) => {
			console.log('ApiHost.serverUrl:' + error);
		});
};

const Maintain = () => [
	<div className="main-maintain" key="main-maintain">
		<div className="page404__header header-wrapper">
			<ReactSVG
				className="back-icon"
				src="/img/svg/LeftArrow.svg"
				onClick={() => {
					Router.push('/');
				}}
			/>
			<ReactSVG className="logo" src="/img/svg/Fun88Logo.svg" />
		</div>
		<div className="maintain-body">
			<div className="maintain-heading">亲爱的客户</div>
			<div className="maintain-desc">我们的系统正在升级维护中，请稍后再尝试登入 您可以通过以下方式联系我们在线客服</div>
			<Button className="maintain-cs" onClick={PopUpLiveChat}>
				线上客服
			</Button>
			<a className="maintain-contact" href="mailto: cs@fun88.com">
				电邮: cs@fun88.com
			</a>
			<a style={{ marginBottom: '16px' }} className="maintain-contact" href="tel:+86 400 842 891">
				热线电话: +86 400 842 891
			</a>
		</div>
	</div>
];

export default Maintain;
