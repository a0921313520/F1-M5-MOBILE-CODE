import Flexbox from '@/components/View/Flexbox/';
import Toast from '@/components/View/Toast';
import InputItem from '@/components/View/Input';
import { password_reg } from '@/lib/SportReg';
import { setIsLogout, redirectToLogin } from '@/lib/js/util';
import Layout from '@/components/Layout';
import classNames from 'classnames';
import { ReactSVG } from '@/components/View/ReactSVG';
import { UpdatePassWord } from '@/api/userinfo';
import React from 'react';
import Item from '@/components/View/FormItem';
import { createForm } from 'rc-form';
import Router from 'next/router';
import { getStaticPropsFromStrapiSEOSetting } from '@/lib/seo';

export async function getStaticProps() {
	return await getStaticPropsFromStrapiSEOSetting('/me/account-info'); //參數帶本頁的路徑
}
class _Password extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			oldPassword: '',
			newPassword: '',
			confirmPassword: '',
			iconName1: 'close',
			iconName2: 'close',
			iconName3: 'close',
			errorMessage: '',
			inputType1: 'password',
			inputType2: 'password',
			inputType3: 'password',
			sameOldPassword: false
		};
	}

	componentDidMount() {}

	setValue = (type, value) => {
		this.setState({
			[type]: value
		});
	};

	SetupdatePassWord = () => {
		const { oldPassword, newPassword, confirmPassword } = this.state;

		const fetchData = {
			oldPassword,
			newPassword
		};

		Toast.loading('Đang gửi đi, xin vui lòng chờ...');

		UpdatePassWord(fetchData, (res) => {
			Toast.destroy();
			if (res.isSuccess == true) {
				Toast.success(res.result.message || '更改成功,请重新登录!');
				setTimeout(() => {
					setIsLogout();
					redirectToLogin();
				}, 1000);
			} else if (res.isSuccess == false) {
				if (res.errors[0].errorCode == 'MEM99999') {
					this.setState({
						sameOldPassword: true
					})
				} else {
					Toast.error('修改失败！', 2);
				}
			} else {
				Toast.error('出现错误请稍候重试');
			}
		});
	};

	/**
  	* @description: 显示密码切换
  	* @param {*}
  	* @return {*}
  	*/
	changeIconName = (i) => {
		if ( this.state[`iconName${i}`] === 'open') {
			this.setState({
				[`iconName${i}`]: 'close',
				[`inputType${i}`]: 'password'
			});
		} else {
			this.setState({
				[`iconName${i}`]: 'open',
				[`inputType${i}`]: 'text'
			});
		}
	};

	submitBtnEnable = () => {
		let { oldPassword, newPassword, confirmPassword } = this.state;
		let error = Object.values(this.props.form.getFieldsError()).some((v) => v !== undefined);
		let errors = Object.values(this.props.form.getFieldsValue()).some((v) => v == '' || v == undefined);
		return oldPassword != '' && newPassword != '' && confirmPassword != '' && !errors && !error;
	};

	render() {
		const { oldPassword, newPassword, confirmPassword, iconName1, iconName2, iconName3 } = this.state;
		const { getFieldDecorator, getFieldError, getFieldValue } = this.props.form;

		console.log(this.submitBtnEnable());
		return (
			<Layout
				title="FUN88乐天堂官网｜2022卡塔尔世界杯最佳投注平台"
				Keywords="乐天堂/FUN88/2022 世界杯/世界杯投注/卡塔尔世界杯/世界杯游戏/世界杯最新赔率/世界杯竞彩/世界杯竞彩足球/足彩世界杯/世界杯足球网/世界杯足球赛/世界杯赌球/世界杯体彩app"
				Description="乐天堂提供2022卡塔尔世界杯最新消息以及多样的世界杯游戏，作为13年资深品牌，安全有保障的品牌，将是你世界杯投注的不二选择。"
				BarTitle="Thay Đổi Mật Khẩu"
				status={2}
				hasServer={false}
				barFixed={true}
				seoData={this.props.seoData}
			>
				<Flexbox className="AccountinfoContent">
					<Flexbox className="Left-Txt Wrapper Dataset">
						<Item label={`Mật Khẩu Hiện Tại`} errorMessage={getFieldError('oldPassword')}>
							{getFieldDecorator('oldPassword', {
								rules: [
									{ required: true, message: 'Mật Khẩu Hiện Tại không được để trống' },
									{
										validator: (rule, value, callback) => {
											this.setState({
												sameOldPassword: false
											})
											if (value !== '' && !password_reg.test(value)) {
												callback("Mật khẩu phải gồm có 6-20 ký tự chữ và số 'A-Z', 'a-z', '0-9' và có thể bao gồm 4 ký tự đặc ^ # $ @");
											}
											callback();
										}
									}
								]
							})(
								<InputItem
									style={{border: this.state.sameOldPassword ? '1px solid #eb2121' : ''}}
									type={this.state.inputType1}
									placeholder="Nhập mật khẩu"
									maxLength={20}
									suffix={
										<ReactSVG
											className={`loginSVG login__pwd__${iconName1}`}
											src={`/img/svg/login/eyes-${iconName1}.svg`}
											onClick={() => this.changeIconName('1')}
										/>
									}
									onChange={(v) => this.setValue('oldPassword', v.target.value)}
								/>
							)}
							{this.state.sameOldPassword &&
								<div className='input-error-message' style={{transform: 'none'}}>
									Mật khẩu hiện tại không chính xác
								</div>
							}
						</Item>

						<Item label={`Nhập mật khẩu`} errorMessage={getFieldError('newPassword')}>
							{getFieldDecorator('newPassword', {
								rules: [
									{ required: true, message: 'Mật khẩu mới không được để trống' },
									{
										validator: (rule, value, callback) => {
											if (value !== '' && !password_reg.test(value)) {
												callback("Mật khẩu phải gồm có 6-20 ký tự chữ và số 'A-Z', 'a-z', '0-9' và có thể bao gồm 4 ký tự đặc ^ # $ @");
											}
											if (value !== '' && getFieldValue('oldPassword') === value) {
												callback('Mật khẩu mới không thể trùng với mật khẩu hiện tại');
											}
											// if (value !== '' && getFieldValue('confirmPassword') !== value) {
											// 	callback('请确认密码是否一致！');
											// }
											callback();
										}
									}
								]
							})(
								<InputItem
									type={this.state.inputType2}
									placeholder="Nhập mật khẩu mới"
									maxLength={20}
									suffix={
										<ReactSVG
											className={`loginSVG login__pwd__${iconName2}`}
											src={`/img/svg/login/eyes-${iconName2}.svg`}
											onClick={() => this.changeIconName('2')}
										/>
									}
									onChange={(v) => this.setValue('newPassword', v.target.value)}
								/>
							)}
						</Item>

						<Item label={`Nhập Lại Mật Khẩu Mới`} errorMessage={getFieldError('confirmPassword')}>
							{getFieldDecorator('confirmPassword', {
								rules: [
									{ required: true, message: 'Nhập Lại Mật Khẩu Mới không được để trống' },
									{
										validator: (rule, value, callback) => {
											if (value !== '' && !password_reg.test(value)) {
												callback("Mật khẩu phải gồm có 6-20 ký tự chữ và số 'A-Z', 'a-z', '0-9' và có thể bao gồm 4 ký tự đặc ^ # $ @");
											}
											if (value !== '' && getFieldValue('oldPassword') === value) {
												callback('Mật khẩu mới không thể trùng với mật khẩu hiện tại');
											}
											if (value !== '' && getFieldValue('newPassword') !== value) {
												callback('Mật khẩu không trùng khớp');
											}
											callback();
										}
									}
								]
							})(
								<InputItem
									type={this.state.inputType3}
									placeholder="Nhập lại mật khẩu mới"
									maxLength={20}
									suffix={
										<ReactSVG
											className={`loginSVG login__pwd__${iconName3}`}
											src={`/img/svg/login/eyes-${iconName3}.svg`}
											onClick={() => this.changeIconName('3')}
										/>
									}
									onChange={(v) => this.setValue('confirmPassword', v.target.value)}
								/>
							)}
						</Item>
					</Flexbox>

					<Flexbox
						className={classNames({
							disabled: !this.submitBtnEnable(),
							submit: true,
							btn: true
						})}
						onClick={() => {
							// globalGtag('Submit_PWmodification_personal');
							if (this.submitBtnEnable()) {
								this.SetupdatePassWord();
							}
						}}
					>
						Gửi
					</Flexbox>
				</Flexbox>
			</Layout>
		);
	}
}

export default createForm({ fieldNameProp: 'pwd' })(_Password);
