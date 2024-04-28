import React, { Component } from 'react';
import Input from '@/components/View/Input';
import Item from '@/components/Deposit/depositComponents/Item';
import { userName_reg, password_reg, email_reg } from '@/lib/SportReg';
import { ReactSVG } from '@/components/View/ReactSVG';
import { fetchRequest } from '@/server/Request';
import { ApiPort } from '@/api/index';
import { Cookie, getUrlVars } from '@/lib/js/Helper';
import { getE2BBValue } from '@/lib/js/util';
import Toast from '@/components/View/Toast';
import { createForm } from 'rc-form';
import Router from 'next/router';
import ReactCaptcha from '@/components/Captcha/ReactCaptcha';

class TabRegister extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			name: '', //用戶名
			password: '', //密碼
			number: '', //電話
			email: '', //郵箱
			iconName: 'close',
			inputType: 'password',
			referer: '', // 推薦代碼,
			isAffDisabled: false,
			maxLength: '',
			minLength: '',
			prefixes: [],
			displayDomain: false,
			filteredEmail: [],
			emailError: false,
			usernameError: false,
			usernameErrorMsg: ''
		};
	}

	componentDidMount() {
		this.Checkdomin();
		this.getPreFixPhone();
		// window.Pushgtagdata && Pushgtagdata(window.location.origin, 'Launch', `register`);
		if (sessionStorage.getItem('ReferCode')) {
			this.setState({
				referCode: sessionStorage.getItem('ReferCode')
			});
		}
	}

	/**
	 * @description: 获取代理码 如有Affcode 註冊頁所顯示Aff  不能編輯及更改 
	 * @param {*}
	 * @return {*}
  	*/
	Checkdomin = () => {
		var vars = getUrlVars();
		if (Cookie.GetCookieKeyValue('CO_affiliate') != '') {
			this.setState({
				isAffDisabled: true,
				referer: Cookie.GetCookieKeyValue('CO_affiliate')
			});
		} else if (sessionStorage.getItem('affCode')) {
			this.setState({
				isAffDisabled: true,
				referer: sessionStorage.getItem('affCode')
			});
		} else {
			fetchRequest(ApiPort.Domaincheck + global.location.protocol + '//' + global.location.host + '&', 'GET')
				.then((res) => {
					if (res.isSuccess && res.result && res.result.affiliateCode != '') {
						this.setState({
							isAffDisabled: true,
							referer: res.result.affiliateCode ? res.result.affiliateCode : ''
						});
					} else if (vars.aff && vars.aff !== '') {
						this.setState({
							isAffDisabled: true,
							referer: vars.aff
						});
					}
				})
				.catch((error) => {
					console.log(error);
				});
		}
	};

	/**
	 * @description: 提交乐天堂注册
	 * @param {*}
	 * @return {*}
  	*/
	postRegist = () => {
		const { name, password, number, email } = this.state;
		const postData = {
			currency: 'VND',
			HostName: window.location.origin,
			RegWebsite: 17,
			Language: 'vi-vn',
			Mobile: '84-' + number.replace(/ /g, ''),
			UserName: name,
			MediaCode: Cookie.GetCookieKeyValue('CO_Media') || null,
			Referer: Cookie.GetCookieKeyValue('CO_Referer') || sessionStorage.getItem('affCode') || null, // 推荐码// 推荐码,
			affiliateCode: this.state.referer || '',
			Email: email,
			Password: password,
			BrandCode: 'FUN88',
			regWebsite: 38,
			blackBoxValue: getE2BBValue(),
			e2BlackBoxValue: getE2BBValue(),
			queleaReferrerid: sessionStorage.getItem('ReferCode')
		};

		Toast.loading('Đăng Kí...');
		fetchRequest(ApiPort.Register, 'POST', postData)
			.then((data) => {
				Toast.destroy();
				if (data.isSuccess) {
					if (!localStorage.getItem('isFirstLogin')) {
						localStorage.setItem('isFirstLogin', 1);
					}
					if (!localStorage.getItem('isShowHelp')) {
						localStorage.setItem('isShowHelp', 1);
					}
					this.props.postLogin(name, password, 'isFirstLogin');
					sessionStorage.removeItem('ReferCode');
				} else {
					Pushgtagdata(
						"Register", 
						"Submit Register", 
						"Register_S_Register",
						1,
						[{
							customVariableKey:"Register_S_Register_ErrorMsg",
							customVariableValue:  data.errors && data.errors[0].description
						},
						{
							customVariableKey:"Register_S_Register_AffiliateCode",
							customVariableValue: this.state.referer
						}]
					);
					if (data.errors && data.errors[0] && data.errors[0].errorCode == "VAL08005") {
						this.setState({
							usernameError: true,
							usernameErrorMsg: 'Tên đăng nhập không khả dụng, vui lòng thử tên khác'
						})
						return;
					}
					if (data.result.code == 'MEM00026') {
						Toast.error('用户名已注册', 2);
						return;
					} else if (data.result.code == 'MEM00064') {
						Toast.error('发现禁止的措辞', 2);
						return;
					} else if (data.result.code == 'MEM00041') {
						this.setState({
							emailError: true,
							emailErrorMsg: 'Địa chỉ email không khả dụng, vui lòng thử email khác'
						})
						return;
					} else if (data.result.code == 'VAL00002') {
						Toast.error('电话号码格式无效，请您检查。', 2);
						return;
					} else {
						//console.log(data.result.Message);
						Toast.error('发生错误, ' + data.result.message, 2);
					}
				}
			})
			.catch((err) => {
				Toast.destroy();
			});
		// Pushgtagdata(`Register`, 'Submit', `Submit_Register`);
	};

	/**
	 * @description: 密码展开/关闭
	 * @param {*}
	 * @return {*}
  	*/
	changeIconName = () => {
		if (this.state.iconName === 'open') {
			this.setState({
				iconName: 'close',
				inputType: 'password'
			});
		} else {
			this.setState({
				iconName: 'open',
				inputType: 'text'
			});
		}
	};

	/**
	 * @description: 获取手机检测
	 * @param {*}
	 * @return {*}
	*/
	getPreFixPhone = () => {
		fetchRequest(ApiPort.VerifyPhone, 'GET', '').then((res) => {
			if (res && res.result) {
				this.setState({
					maxLength: res.result.maxLength,
					minLength: res.result.minLength,
					prefixes: res.result.prefixes
				});
			}
		});
	};

	/**
	 * @description: 如果通过验证 提交数据 
	 * @param {*}
	 * @return {*}
  	*/

	submitBtnEnable = () => {
		let error = Object.values(this.props.form.getFieldsError()).some((v) => v !== undefined);
		let errors = Object.values(this.props.form.getFieldsValue()).some((v) => v == '' || v == undefined);
		return !errors && !error;
	};

	getEmailDomain = (e) => {
		let value = e.target.value;
		const Domain = [{domain: '@gmail.com'}, {domain: '@icloud.com'}, {domain: '@yahoo.com'}, {domain: '@yahoo.com.vn'}, {domain: '@hotmail.com'}, {domain: '@outlook.com'}, {domain: '@outlook.com.vn'}, {domain: '@caothang.edu.vn'}, {domain: '@live.com'}, {domain: '@cdktcnqn.edu.vn'}]
		const check = value.indexOf("@");
		this.setState({
			email: value
		})
		if (check > 0) {
			const splitEmail = value.split('@');
			if (splitEmail[1].length == 0) {
				this.setState({
					emailHead: splitEmail[0],
					displayDomain: true,
					filteredEmail: Domain
				})
			} else {
				const filteredEmail = Domain.filter((list) => {
					return list.domain.search(splitEmail[1]) == 1
				})
				this.setState({
					emailHead: splitEmail[0],
					displayDomain: true,
					filteredEmail
				})
			}
		} 
		if (value.length == 0) {
			this.setState({
				emailError: true,
				emailErrorMsg: 'Vui lòng điền Địa chỉ Email'
			})
		} else if (value && value.length > 50) {
			this.setState({
				emailError: true,
				emailErrorMsg: 'Vui lòng điền tối đa 50 ký tự'
			})
		} else if ((value && !email_reg.test(value))) {
			this.setState({
				emailError: true,
				emailErrorMsg: 'Vui lòng điền địa chỉ email hợp lệ'
			})
		} else {
			this.setState({
				emailError: false
			})
		}
	}

	updateEmail = (e) => {
		this.setState({
			email: this.state.emailHead + e,
			displayDomain: false,
			emailError: false
		})
	}

	CaptchaValidate = () =>{
		this.setState({captchaVisible:true})
		if (this.Captcha) {
			this.Captcha.getCaptchaInfo(this.state.name);
		}
	}

	
	onMatch = (challengeUuid) => {
		const {name,password} = this.props.form.getFieldsValue(["name","password"]);
		this.setState(
			{
				challengeUuid: challengeUuid,
				captchaVisible: false
			},
			() => {
				this.postRegist();
			}
		);
	};

	closeCaptcha = () => {
		this.setState({
			captchaVisible: false
		});
	};

	render() {
		const { email, number, referer, iconName, inputType, maxLength, minLength, prefixes, referCode, displayDomain, filteredEmail, emailError, name, usernameError, usernameErrorMsg } = this.state;
		const { getFieldDecorator, getFieldError } = this.props.form;
		return (
			<div className="reg__wrap">
				<div className="reg__main">
					<Item>
						{/* {getFieldDecorator('NameState', {
							rules: [
								{ required: true, message: 'Vui lòng điền Tên đăng nhập' },
								{
									validator: (rule, value, callback) => {
										if (value && !userName_reg.test(value)) {
											callback("Tên đăng nhập phải gồm có 6-14 kí tự chữ và số 'A-Z', 'a-z', '0-9'");
										}
										callback();
									}
								}
							]
						})( */}
							<Input
								style={{border: usernameError ? '1px solid #F11818' : '', boxShadow: usernameError ? 'none' : ''}}
								value={name}
								type="text"
								placeholder="Tên đăng nhập"
								prefix={<ReactSVG className="loginSVG" src="/img/svg/login/user.svg" />}
								maxLength={14}
								onChange={(e) => {
									if (e.target.value && !userName_reg.test(e.target.value)) {
										this.setState({
											usernameErrorMsg: "Tên đăng nhập phải gồm có 6-14 kí tự chữ và số 'A-Z', 'a-z', '0-9'",
											usernameError: true
										})
									} else {
										this.setState({
											usernameErrorMsg: "",
											usernameError: false
										})
									}
									this.setState({
										name: e.target.value
									});
								}}
							/>
							{usernameError ? 
								<div className='input-error-message' style={{marginTop: '10px', transform: 'none'}}>
									{this.state.usernameErrorMsg}
								</div>
								: 
								null
							}
							
						{/* )} */}
					</Item>

					<Item errorMessage={getFieldError('passwordState')}>
						{getFieldDecorator('passwordState', {
							rules: [
								{ required: true, message: 'Vui lòng điền Mật khẩu' },
								{
									validator: (rule, value, callback) => {
										if (value && !password_reg.test(value)) {
											callback("Mật khẩu phải gồm có 6-20 ký tự chữ và số 'A-Z', 'a-z', '0-9' và có thể bao gồm 4 ký tự đặc  ^ # $ @");
										}
										callback();
									}
								}
							]
						})(
							<Input
								placeholder="Mật khẩu"
								prefix={<ReactSVG className="loginSVG" src="/img/svg/login/lock.svg" />}
								type={inputType}
								maxLength={20}
								onChange={(e) => {
									this.setState({
										password: e.target.value
									});
								}}
							>
								<ReactSVG
									className={`loginSVG login__pwd__${iconName}`}
									src={`/img/svg/login/eyes-${iconName}.svg`}
									onClick={this.changeIconName}
								/>
							</Input>
						)}
					</Item>

					<Item errorMessage={getFieldError('numberState')}>
						{getFieldDecorator('numberState', {
							rules: [
								{ required: true, message: 'Vui lòng điền Số điện thoại' },
								{
									validator: (rule, value, callback) => {
										let testNumber = /^\d+$/;
										//最低位数
										let LengthCheck = value.length < 9; //minLength;
										// 前三碼檢測
										// let FirstThreeCheck = prefixes.some((v) => v === value.substring(0, 3));
										if (value != '' && value[0] == '0') {
											callback("Số điện thoại phải gồm có 9 số, không điền số 0 ở đầu'");
										}
										if (value != '' && !testNumber.test(value)) {
											callback("Số điện thoại phải gồm có 9 số, không điền số 0 ở đầu'");
										}	
										if (value != '' && LengthCheck) {
											callback('Số điện thoại phải gồm có 9 số, không điền số 0 ở đầu');
										}
										// if (value && !FirstThreeCheck) {
										// 	callback('此电话号码无效或属于网络运营商。');
										// }
										callback();
									}
								}
							]
						})(
							<Input
								type="phone"
								placeholder="Số điện thoại"
								prefix={<ReactSVG className="loginSVG" src="/img/svg/login/phone.svg" />}
								maxLength={9 /* maxLength */}
								prefixText="+ 84"
								onChange={(e) => {
									this.setState({
										number: e.target.value.replace(/[^\d]/g, '')
									});
								}}
							/>
						)}
					</Item>
						<Item>
							<Input
								style={{border: emailError ? '1px solid #F11818' : '', boxShadow: emailError ? 'none' : ''}}
								value={email}
								type="text"
								placeholder="Địa chỉ Email"
								prefix={<ReactSVG className="loginSVG" src="/img/svg/login/mail.svg" />}
								onChange={this.getEmailDomain}
							/>
							{emailError ? 
								<div className='input-error-message' style={{marginTop: '10px', transform: 'none'}}>
									{this.state.emailErrorMsg}
								</div>
								: 
								null
							}

						{displayDomain ?						
							<div className='emailDomainCon'>
								{filteredEmail.map((item) => {
									return (
										<div onClick={() => this.updateEmail(item.domain)}>
											{this.state.emailHead}{item.domain}
										</div>
									)
								})}
							</div> 
						: null}
					</Item>
					{!referCode && (
						<Input
							type="text"
							placeholder="Mã đại lý"
							prefix={<ReactSVG className="loginSVG" src="/img/svg/login/sCode.svg" />}
							value={referer}
							maxLength={16}
							disabled={this.state.isAffDisabled}
							onChange={(e) => {
								this.setState({
									referer: e.target.value
								});
							}}
						>
							<div className="not-required-text">(không bắt buộc)</div>
						</Input>
					)}

					<div className="reg__rule">
						Bằng việc nhấp vào nút “Đăng Ký” nghĩa là Bạn đã 21 tuổi và đồng ý với&nbsp;
						<span
							style={{color: '#00A6FF'}}
							onClick={()=> {
								Pushgtagdata("Register", "View TC", "Register_V_T&C")
								Router.push('/help/Detail/?id=81')
							}}
							// href="https://www.fun8003.com/cn/help/policy-termsandcondition.htm"
							// target="_blank"
							// rel="noreferrer noopener"
						>
							Điều khoản và Điều kiện&nbsp; 
						</span>
						và&nbsp;
						<span
							style={{color: '#00A6FF'}}
							onClick={()=> {
								Pushgtagdata("Register", "View TC", "Register_V_T&C");
								Router.push('/help/Detail/?id=83')
							}}
							// href="https://www.fun8003.com/cn/help/policy-privacy.htm"
							// target="_blank"
							// rel="noreferrer noopener"
						>
							Chính sách bảo mật&nbsp;
						</span>
						của chúng tôi.
					</div>

					<div className="login__button">
						<button
							className={`login__btn__submit ${!this.submitBtnEnable() ? 'btn-disable' : ''}`}
							disabled={!this.submitBtnEnable()}
							onClick={this.CaptchaValidate}
						>
							Đăng Ký
						</button>
					</div>
				</div>
				<ReactCaptcha
					visible={this.state.captchaVisible}
					onMatch={(e) => {
						this.onMatch(e);
					}}
					tabKey={this.props.tabKey}
					close={this.closeCaptcha}
					getCaptchaInfo={(props) => {
						this.Captcha = props;
					}}
				/>
			</div>
		);
	}
}
export default createForm({ fieldNameProp: 'register' })(TabRegister);
