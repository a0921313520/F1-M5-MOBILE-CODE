import Toast from '@/components/View/Toast';
import { checkIsLogin } from '@/lib/js/util';
import Layout from '@/components/Layout';
import { ACTION_User_getDetails } from '@/lib/redux/actions/UserInfoAction';
import { connect } from 'react-redux';
import { withRouter } from 'next/router';
import Router from 'next/router';
import { qqReg } from '@/lib/SportReg';
import { setMemberInfo } from '@/api/userinfo';
import Flexbox from '@/components/View/Flexbox/';
import InputItem from '@/components/View/Input';
import classNames from 'classnames';
import React from 'react';
import { getStaticPropsFromStrapiSEOSetting } from '@/lib/seo';

export async function getStaticProps() {
	return await getStaticPropsFromStrapiSEOSetting('/me/account-info'); //參數帶本頁的路徑
}
class QQModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			QQ: (props.userInfo.memberInfo && props.userInfo.memberInfo.QQ) || ''
		};
	}

	componentDidMount() {
		if (checkIsLogin()) {
			this.GetUser();
		} else {
			Router.push('/register_login');
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
	componentDidUpdate(prevProps) {
		if (this.props.userInfo.memberInfo.QQ !== prevProps.userInfo.memberInfo.QQ) {
			this.setState({
				QQ: this.props.userInfo.memberInfo.QQ
			});
		}
	}

	updateQQ = () => {
		// globalGtag('Submit_QQ_personal');
		const { QQ } = this.state;
		if (!QQ) {
			Toast.error('请填写您的QQ号');
			return;
		}

		if (!qqReg.test(QQ)) {
			Toast.error('qq号格式错误');
			return;
		}
		const params = {
			key: 'QQ',
			value1: QQ
		};
		Toast.loading('Đang gửi đi, xin vui lòng chờ...');
		setMemberInfo(params, (res) => {
			Toast.destroy();
			if (res.isSuccess == true) {
				Toast.success('Cập nhật thành công!', 3);
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
		const { QQ } = this.state;
		const { memberInfo } = this.props.userInfo;
		let disabled = memberInfo && memberInfo.QQ && memberInfo.QQ !== '' ? true : false;
		return (
			<Layout
				title="FUN88乐天堂官网｜2022卡塔尔世界杯最佳投注平台"
				Keywords="乐天堂/FUN88/2022 世界杯/世界杯投注/卡塔尔世界杯/世界杯游戏/世界杯最新赔率/世界杯竞彩/世界杯竞彩足球/足彩世界杯/世界杯足球网/世界杯足球赛/世界杯赌球/世界杯体彩app"
				Description="乐天堂提供2022卡塔尔世界杯最新消息以及多样的世界杯游戏，作为13年资深品牌，安全有保障的品牌，将是你世界杯投注的不二选择。"
				BarTitle="QQ号"
				status={2}
				hasServer={false}
				barFixed={true}
				seoData={this.props.seoData}
			>
				<Flexbox className="AccountinfoContent">
					<Flexbox className="Left-Txt Wrapper Dataset">
						<label>QQ号</label>
						<InputItem
							disabled={disabled}
							value={QQ}
							maxLength={30}
							placeholder="请输入您的QQ号"
							onChange={(v) => {
								this.setState({
									QQ: v.target.value.trim()
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
							this.updateQQ();
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
