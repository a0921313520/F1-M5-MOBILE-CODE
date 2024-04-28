import React from 'react';
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
import Item from '@/components/View/FormItem';
import { realyNameReg } from '@/lib/SportReg';
import { createForm } from 'rc-form';
import Router from 'next/router';
import { getStaticPropsFromStrapiSEOSetting } from '@/lib/seo';

export async function getStaticProps() {
	return await getStaticPropsFromStrapiSEOSetting('/me/account-info'); //參數帶本頁的路徑
}
class RealNameSet extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showCofirmModal: false,
			realName: (props.userInfo.memberInfo && props.userInfo.memberInfo.firstName) || ''
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
				realName: this.props.userInfo.memberInfo.firstName
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
 	* @description: 提交数据检查
	* @param {*}
	* @return {*}
  	*/
	  submit = () => {
		const { realName } = this.state;
		const [first, ...last] = realName.split(" ")
		if (realName == '') {
			Toast.error('Họ Tên Thật không được để trống');
			return;
		}

		if(!last.length){
			Toast.error("Họ Tên Thật không được để trống"); //請輸入姓氏
			return
		}

		if (!realyNameReg.test(realName)) {
			Toast.error('Lỗi định dạng, tên thật cần có từ 2-50 ký tự chữ');
			return;
		}

		this.cofirmModalChg();
	};

	/**
 	* @description: 更新真实姓名资料
	* @param {*} 
	* @return {*}
	*/
	updateRealName = () => {
		const { realName } = this.state;
		const [first, ...last] = realName.split(" ")
		const params = {
			key: 'FirstName',
			value1: first,
			value2: (last.join(" ")).trim()
		};
		this.cofirmModalChg();
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

	submitBtnEnable = () => {
		let { realName } = this.state;
		let error = Object.values(this.props.form.getFieldsError()).some((v) => v !== undefined);
		let errors = Object.values(this.props.form.getFieldsValue()).some((v) => v == '' || v == undefined);
		return realName !== '' && !errors && !error;
	};

	render() {
		const { realName } = this.state;
		const { memberInfo } = this.props.userInfo;
		let disabled = memberInfo && memberInfo.firstName != '' ? true : false;
		console.log(memberInfo && memberInfo.firstName);
		const { getFieldDecorator, getFieldError, setFieldsValue } = this.props.form;
		return (
			<React.Fragment>
				<Layout
					title="FUN88乐天堂官网｜2022卡塔尔世界杯最佳投注平台"
					Keywords="乐天堂/FUN88/2022 世界杯/世界杯投注/卡塔尔世界杯/世界杯游戏/世界杯最新赔率/世界杯竞彩/世界杯竞彩足球/足彩世界杯/世界杯足球网/世界杯足球赛/世界杯赌球/世界杯体彩app"
					Description="乐天堂提供2022卡塔尔世界杯最新消息以及多样的世界杯游戏，作为13年资深品牌，安全有保障的品牌，将是你世界杯投注的不二选择。"
					BarTitle="Họ Tên Thật"
					status={2}
					hasServer={false}
					barFixed={true}
					seoData={this.props.seoData}
				>
					<Flexbox className="AccountinfoContent">
						<Flexbox className="Wrapper Dataset">
							{/* <label>真实姓名</label>
							<InputItem
								value={realName}
								disabled={disabled ? true : false}
								maxLength={50}
								placeholder="请填写真实姓名"
								className="realname-input color-grey999"
								onChange={(v) => {
									this.setState({
										realName: v.target.value.trim()
									});
								}}
							/>
							<p className="note">姓名只允许修改一次。</p> */}
							<Item label={`Họ Tên Thật`} errorMessage={getFieldError('realName')}>
								{getFieldDecorator('realName', {
									initialValue: disabled ? memberInfo.firstName : '',
									rules: [
										{ required: true, message: 'Họ Tên Thật không được để trống' },
										{
											validator: (rule, value, callback) => {
												setFieldsValue({
													realName: value.replace(/\s{2,}/g," ")
												})
												if (value && !realyNameReg.test(value)) {
													callback('Lỗi định dạng, tên thật cần có từ 2-50 ký tự chữ');
												}
												callback();
											}
										}
									]
								})(
									<InputItem
										size="large"
										placeholder="Vui lòng điền tên thật của bạn"
										onChange={(v) => {
											this.setState({
												realName: v.target.value.trim()
											});
										}}
										disabled={disabled}
										maxLength="50"
									/>
								)}
							</Item>
							<Flexbox className="note" margin="0 !important">
							Lưu ý: Họ Tên thật của bạn phải trùng với tên trong tài khoản ngân hàng của Bạn để tránh giao dịch gửi /rút tiền không được xử lý.
							</Flexbox>
						</Flexbox>
						<Flexbox
							className={classNames({
								disabled: disabled || !this.submitBtnEnable(),
								submit: this.submitBtnEnable(),
								btn: true
							})}
							onClick={() => {
								if (disabled || !this.submitBtnEnable()) {
									return;
								}
								// globalGtag('Submit_realname_personal');
								this.submit();
							}}
						>
							Gửi
						</Flexbox>
					</Flexbox>

					{this.state.showCofirmModal ? (
						<ConfirmModal cancel={this.cofirmModalChg} submit={this.updateRealName} />
					) : null}
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

export default connect(mapStateToProps, mapDispatchToProps)(createForm({ fieldNameProp: 'realnameset' })(RealNameSet));
