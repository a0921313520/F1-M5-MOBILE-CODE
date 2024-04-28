import Flexbox from '@/components/View/Flexbox/';
import Toast from '@/components/View/Toast';
import InputItem from '@/components/View/Input';
import { checkIsLogin } from '@/lib/js/util';
import Layout from '@/components/Layout';
import classNames from 'classnames';
import ConfirmModal from '@/components/Me/ConfirmModal';
import { setMemberInfo } from '@/api/userinfo';
import { ACTION_User_getDetails } from '@/lib/redux/actions/UserInfoAction';
import { connect } from 'react-redux';
import { withRouter } from 'next/router';
import { idCard } from '@/lib/SportReg';
import React from 'react';
import Router from 'next/router';
import { getStaticPropsFromStrapiSEOSetting } from '@/lib/seo';

export async function getStaticProps() {
	return await getStaticPropsFromStrapiSEOSetting('/me/account-info'); //參數帶本頁的路徑
}
class IdentityCard extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showCofirmModal: false,
			IdentityCard: (props.userInfo.memberInfo && props.userInfo.memberInfo.identityCard) || '',
			ErrorIdentityCardTip: ''
		};
		console.log(props.userInfo_getDetails())
	}

	componentDidMount() {
		if (checkIsLogin()) {
			this.GetUser();
		} else {
			Router.push('/register_login');
		}
	}

	componentDidUpdate(prevProps) {
		if (this.props.userInfo.memberInfo.identityCard !== prevProps.userInfo.memberInfo.identityCard) {
			this.setState({
				IdentityCard: this.props.userInfo.memberInfo.identityCard
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

	/**
	 * @description: 确认弹窗
	 * @param {*}
	 * @return {*}
  	*/
	cofirmModalChg = () => {
		this.setState({
			showCofirmModal: !this.state.showCofirmModal
		});
	};

	/**
	 * @description: 提交确认
	 * @param {*}
	 * @return {*}
  	*/
	submit = () => {
		this.cofirmModalChg();
	};

	/**
	 * @description: 更新身份证
	 * @param {*}
	 * @return {*}
	*/
	updateIdentityCard = () => {
		const { IdentityCard } = this.state;
		const params = {
			key: 'identityCard',
			value1: IdentityCard
		};
		this.cofirmModalChg();
		Toast.loading('Đang gửi đi, xin vui lòng chờ...');
		setMemberInfo(params, (res) => {
			Toast.destroy();
			console.log(res)
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
		const { memberInfo } = this.props.userInfo;
		let disabled = memberInfo && memberInfo.identityCard && memberInfo.identityCard !== '' ? true : false;
		const { IdentityCard, ErrorIdentityCardTip } = this.state;

		return (
			<React.Fragment>
				<Layout
					title="FUN88乐天堂官网｜2022卡塔尔世界杯最佳投注平台"
					Keywords="乐天堂/FUN88/2022 世界杯/世界杯投注/卡塔尔世界杯/世界杯游戏/世界杯最新赔率/世界杯竞彩/世界杯竞彩足球/足彩世界杯/世界杯足球网/世界杯足球赛/世界杯赌球/世界杯体彩app"
					Description="乐天堂提供2022卡塔尔世界杯最新消息以及多样的世界杯游戏，作为13年资深品牌，安全有保障的品牌，将是你世界杯投注的不二选择。"
					BarTitle="身份证号码"
					status={2}
					hasServer={false}
					barFixed={true}
					seoData={this.props.seoData}
				>
					<Flexbox className="AccountinfoContent">
						<Flexbox className="Wrapper Dataset">
							<label>身份证号码</label>
							<InputItem
								value={IdentityCard}
								maxLength={18}
								disabled={disabled}
								placeholder="请输入您的身份证号码"
								className="realname-input color-grey999"
								onChange={(v) => {
									this.setState({
										IdentityCard: v.target.value,
										ErrorIdentityCardTip: !idCard.test(v.target.value) ? '身份证号码格式错误' : ''
									});
								}}
								style={{ textAlign: 'left' }}
							/>
							<p className="note">身份证号码一旦提交，将无法更改。</p>
							{IdentityCard &&
							ErrorIdentityCardTip && <p className="error">{this.state.ErrorIdentityCardTip}</p>}
						</Flexbox>

						<Flexbox
							className={classNames({
								disabled: disabled || ErrorIdentityCardTip,
								submit: !disabled && IdentityCard && !ErrorIdentityCardTip,
								btn: true
							})}
							onClick={() => {
								if (disabled) {
									return;
								}
								// globalGtag('Submit_realname_personal');
								this.submit();
							}}
						>
							提交
						</Flexbox>
					</Flexbox>
				</Layout>

				{this.state.showCofirmModal ? (
					<ConfirmModal cancel={this.cofirmModalChg} submit={this.updateIdentityCard} />
				) : null}
			</React.Fragment>
		);
	}
}

const mapStateToProps = (state) => ({
	userInfo: state.userInfo
});

const mapDispatchToProps = {
	userInfo_getDetails: () => ACTION_User_getDetails()
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(IdentityCard));
