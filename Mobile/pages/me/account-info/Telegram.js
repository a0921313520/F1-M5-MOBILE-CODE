import React from 'react';
import Flexbox from '@/components/View/Flexbox/';
import Toast from '@/components/View/Toast';
import InputItem from '@/components/View/Input';
import { checkIsLogin } from '@/lib/js/util';
import Layout from '@/components/Layout';
import classNames from 'classnames';
import { setMemberInfoPUT } from '@/api/userinfo';
import { ACTION_User_getDetails } from '@/lib/redux/actions/UserInfoAction';
import { connect } from 'react-redux';
import Item from '@/components/View/FormItem';
import { telegramReg } from '@/lib/SportReg';
import { createForm } from 'rc-form';
import Router from 'next/router';
import { getStaticPropsFromStrapiSEOSetting } from '@/lib/seo';

export async function getStaticProps() {
	return await getStaticPropsFromStrapiSEOSetting('/me/account-info'); //參數帶本頁的路徑
}
class Telegram extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			telegram: (props.userInfo.memberInfo && props.userInfo.memberInfo.firstName) || ''
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
		if (this.props.userInfo.memberInfo.firstName !== prevProps.userInfo.memberInfo.firstName) {
			this.setState({
				telegram: this.props.userInfo.memberInfo.firstName
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

	submit = () => {
		const { telegram } = this.state;
		if (telegram == '') {
			Toast.error('Tài khoản Telegram không được để trống');
			return;
		}

		if (!telegramReg.test(telegram)) {
			Toast.error('Chỉ chấp nhận từ 5-32 ký tự chữ a-z, số 0-9  và ký tự gạch dưới _');
			return;
		}

		this.updateTelegram();
	};

	/**
 	* @description: 更新真实姓名资料
	* @param {*} 
	* @return {*}
	*/
	updateTelegram = () => {
		const { telegram } = this.state;
		const params = {
			messengerDetails: [
				{
					Contact: telegram,
					ContactTypeId: '15'
				}
			]
		};
		console.log(params)
		Toast.loading('Đang gửi đi, xin vui lòng chờ...');
		setMemberInfoPUT(params, (res) => {
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

	submitBtnEnable = () => {
		let { telegram } = this.state;
		let error = Object.values(this.props.form.getFieldsError()).some((v) => v !== undefined);
		let errors = Object.values(this.props.form.getFieldsValue()).some((v) => v == '' || v == undefined);
		return telegram !== '' && !errors && !error;
	};

	render() {
		const { memberInfo } = this.props.userInfo;
		const { getFieldDecorator, getFieldError } = this.props.form;
		return (
			<React.Fragment>
				<Layout
					title="FUN88乐天堂官网｜2022卡塔尔世界杯最佳投注平台"
					Keywords="乐天堂/FUN88/2022 世界杯/世界杯投注/卡塔尔世界杯/世界杯游戏/世界杯最新赔率/世界杯竞彩/世界杯竞彩足球/足彩世界杯/世界杯足球网/世界杯足球赛/世界杯赌球/世界杯体彩app"
					Description="乐天堂提供2022卡塔尔世界杯最新消息以及多样的世界杯游戏，作为13年资深品牌，安全有保障的品牌，将是你世界杯投注的不二选择。"
					BarTitle="Tài Khoản Telegram"
					status={2}
					hasServer={false}
					barFixed={true}
					seoData={this.props.seoData}
				>
					<Flexbox className="AccountinfoContent">
						<Flexbox className="Wrapper Dataset">
							<Item label={`Tài Khoản Telegram`} errorMessage={getFieldError('telegram')}>
								{getFieldDecorator('telegram', {
									initialValue: memberInfo && memberInfo.telegram ? memberInfo.telegram : '',
									rules: [
										{ required: true, message: 'Tài khoản Telegram không được để trống' },
										{
											validator: (rule, value, callback) => {
												if (value && !telegramReg.test(value)) {
													callback('Chỉ chấp nhận từ 5-32 ký tự chữ a-z, số 0-9  và ký tự gạch dưới _');
												}
												callback();
											}
										}
									]
								})(
									<InputItem
										size="large"
										placeholder="Nhập tài khoản Telegram của bạn"
										onChange={(v) => {
											this.setState({
												telegram: v.target.value.trim()
											});
										}}
										// disabled={disabled}
										maxLength="50"
									/>
								)}
							</Item>
						</Flexbox>
						<Flexbox
							className={classNames({
								disabled: !this.submitBtnEnable(),
								submit: this.submitBtnEnable(),
								btn: true
							})}
							onClick={() => {
								// globalGtag('Submit_realname_personal');
								this.submit();
							}}
						>
							Gửi
						</Flexbox>
					</Flexbox>

				</Layout>
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

export default connect(mapStateToProps, mapDispatchToProps)(createForm({ fieldNameProp: 'Telegram' })(Telegram));
