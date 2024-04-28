/*
 * @Author: Alan
 * @Date: 2022-06-28 14:43:54
 * @LastEditors: Alan
 * @LastEditTime: 2022-06-28 14:54:04
 * @Description: 地区限制
 * @FilePath: \Mobile\src\components\RestrictAccess\index.js
 */
import { ReactSVG } from '@/components/View/ReactSVG';
import { PopUpLiveChat } from '@/lib/js/util';
import Button from '@/components/View/Button';
import ReactIMG from '@/components/View/ReactIMG';

const RestrictAccess = () => [
	<div className="main-maintain" key="RestrictAccess">
		<div className="page404__header header-wrapper">
			<ReactSVG className="logo" src="/img/svg/Fun88Logo.svg" />
		</div>
		<div className="restrict-body">
			<ReactIMG className="restrict-img" src="/img/restrict.png" />
			<div className="maintain-heading">访问受限</div>
			<div className="maintain-desc">
				抱歉！您所在的地区受到限制,
				<br /> 无法正常游览我们的网站哦。若有不便之处, 请多多原谅。
				<br /> 若您有任何疑问, 请联系我们的在线客服或发邮件
			</div>
			<Button
				className="maintain-cs"
				onClick={() => {
					PopUpLiveChat();
				}}
			>
				线上客服
			</Button>
			<a className="maintain-contact" href="mailto: cs@fun88.com">
				电邮: cs@fun88.com
			</a>
		</div>
	</div>
];

export default RestrictAccess;
