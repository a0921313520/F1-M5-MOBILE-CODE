import React from 'react';
import Toast from '@/components/View/Toast';
import Layout from '@/components/Layout';
import { ACTION_User_getDetails } from '@/lib/redux/actions/UserInfoAction';
import { checkIsLogin } from '@/lib/js/util';
import { connect } from 'react-redux';
import { withRouter } from 'next/router';
import { wechatReg } from '@/lib/SportReg';
import { setMemberInfo } from '@/api/userinfo';
import Flexbox from '@/components/View/Flexbox/';
import InputItem from '@/components/View/Input';
import classNames from 'classnames';
import Router from 'next/router';
import { getStaticPropsFromStrapiSEOSetting } from '@/lib/seo';

export async function getStaticProps() {
	return await getStaticPropsFromStrapiSEOSetting('/me/account-info'); //參數帶本頁的路徑
}
class QQModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			WeChat: (props.userInfo.memberInfo && props.userInfo.memberInfo.WeChat) || ''
		};
	}

	componentDidMount() {
		if (checkIsLogin()) {
			this.GetUser();
		} else {
			Router.push('/register_login');
		}
	}

	componentDidUpdate(prevProps) {
		if (this.props.userInfo.memberInfo.WeChat !== prevProps.userInfo.memberInfo.WeChat) {
			this.setState({
				WeChat: this.props.userInfo.memberInfo.WeChat
			});
		}
	}

	/**
	 * @description: 获取会员详情
	 * @param {*}
	 * @return {*}
  	*/
	GetUser = () => {
		this.props.userInfo_getDetails();
	};

	updateWeChat = () => {
		// globalGtag('Submit_wechat_personal');
		const { WeChat } = this.state;
		if (!WeChat) {
			Toast.error('请填写您的微信号');
			return;
		}

		if (!wechatReg.test(WeChat)) {
			Toast.error('微信号格式错误');
			return;
		}
		const params = {
			key: 'WeChat',
			value1: WeChat
		};
		Toast.loading('Đang gửi đi, xin vui lòng chờ...');
		setMemberInfo(params, (res) => {
			Toast.destroy();
			if (res.isSuccess == true) {
				Toast.success('Cập Nhật Thành Công', 3);
				this.GetUser();
				Router.push('/me/account-info');
			} else if (res.isSuccess == false) {
				Toast.error(res.result.message || 'Cập nhật không thành công!');
			} else {
				Toast.error('Cập nhật không thành công!');
			}
		});
	};

	render() {
		const { WeChat } = this.state;
		const { memberInfo } = this.props.userInfo;
		let disabled = memberInfo && memberInfo.WeChat && memberInfo.WeChat !== '' ? true : false;
		return (
			<Layout
				title="FUN88乐天堂官网｜2022卡塔尔世界杯最佳投注平台"
				Keywords="乐天堂/FUN88/2022 世界杯/世界杯投注/卡塔尔世界杯/世界杯游戏/世界杯最新赔率/世界杯竞彩/世界杯竞彩足球/足彩世界杯/世界杯足球网/世界杯足球赛/世界杯赌球/世界杯体彩app"
				Description="乐天堂提供2022卡塔尔世界杯最新消息以及多样的世界杯游戏，作为13年资深品牌，安全有保障的品牌，将是你世界杯投注的不二选择。"
				BarTitle="微信号"
				status={2}
				hasServer={false}
				barFixed={true}
				seoData={this.props.seoData}
			>
				<Flexbox className="AccountinfoContent">
					<Flexbox className="Left-Txt Wrapper Dataset">
						<label>微信号</label>
						<InputItem
							disabled={disabled}
							value={WeChat}
							maxLength={60}
							placeholder="请输入您的微信号"
							onChange={(v) => {
								this.setState({
									WeChat: v.target.value.trim()
								});
							}}
						/>
					</Flexbox>

					<Flexbox
						className={classNames({
							disabled: disabled,
							submit: true,
							btn: true
						})}
						onClick={() => {
							this.updateWeChat();
						}}
					>
						提交
					</Flexbox>
				</Flexbox>
			</Layout>
		);
	}
}

const mapStateToProps = (state) => ({
	userInfo: state.userInfo
});

const mapDispatchToProps = {
	userInfo_getDetails: () => ACTION_User_getDetails()
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(QQModal));
