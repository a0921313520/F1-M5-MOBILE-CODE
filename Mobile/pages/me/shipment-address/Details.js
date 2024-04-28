/*
 * @Author: Alan
 * @Date: 2021-03-18 19:37:39
 * @LastEditors: Alan
 * @LastEditTime: 2022-11-11 23:25:07
 * @Description: 添加新的寄送地址
 * @FilePath: \Mobile\pages\daily-gift\Address\Details.js
 */

import React from 'react';
import Router from 'next/router';
import Input from '@/components/View/Input';
import Modal from '@/components/View/Modal';
import Toast from '@/components/View/Toast';
import Service from '@/components/Header/Service';
import Item from '@/components/View/FormItem';
import Flexbox from '@/components/View/Flexbox';
import Checkbox from '@/components/View/Checkbox';
import Button from '@/components/View/Button';
import { BsCheckSquareFill } from 'react-icons/bs';
import { createForm } from 'rc-form';
import SelectArddress from '@/components/View/SelectArddress/';
import Layout from '@/components/Layout';
import { AddShippingAddress, EditShippingAddress, DeleteShippingAddress } from '@/api/promotions';
import { withRouter } from 'next/router';
import SelectAddressSingle from '@/components/View/SelectAddressSingle'; 
let _name = /^[a-zA-Z_ƢƣÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêếìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹý\s]{2,50}$/
let _address = /^[0-9a-zA-Z_ƢƣÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêếìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹý  #'.,-/&()]{5,100}$/;
let _postalCode = /[1-9][0-9]{5}/;
class PromotionsAddressform extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			defaultAddress: true,
			ShowDeletPopup: false,
			recipientFirstName: '',
			recipientLastName: '',
			postalCode: '',
			contactNo: '',
			email: '',
			address: '',
			promoid: '',
			addressid: 0,
			showArddress: false,
			selectedAddress:{
				province:null,
				district:null,
				town:null
			}
		};
		this.AddressState = React.createRef();
	}

	componentDidMount() {
		const { type, addresskey, id } = this.props.router.query;
		this.setState({
			pagetype: type,
			promoid: id
		});
		/* ---------------------数据回显---------------------- */
		let Addressdata = JSON.parse(localStorage.getItem('Address'));
		let memberInfo = JSON.parse(localStorage.getItem('memberInfo'))
		if (memberInfo) {
			this.setState({email: memberInfo.email})
		}
		if (Addressdata && Addressdata != '') {
			let activeData = Addressdata.find((item) => item.recordNo == addresskey);
			if (activeData) {
				this.setState({
					selectedAddress:{
						province:{ name: activeData.provinceName, id: activeData.provinceID },
						district:{ name: activeData.districtName, id: activeData.districtID },
						town:{ name: activeData.townName, id: activeData.townID }
					}
				})
				let city = [
					{ name: activeData.provinceName, id: activeData.provinceID },
					{ name: activeData.districtName, id: activeData.districtID },
					{ name: activeData.townName, id: activeData.townID }
				];
				this.props.form.setFieldsValue({
					FirstName: activeData.firstName,
					LastName: activeData.lastName,
					phone: activeData.cellphoneNo,
					email: activeData.email,
					address: activeData.address,
					postalCode: activeData.postalCode,
					defaultAddress: activeData.defaultAddress,
				});
				this.setState({
					recipientFirstName: activeData.firstName,
					recipientLastName: activeData.lastName,
					contactNo: activeData.cellphoneNo,
					email: activeData.email,
					defaultAddress: activeData.defaultAddress,
					postalCode: activeData.postalCode,
					address: activeData.address,
				});
				this.setState({
					defaultAddress: activeData.defaultAddress,
					addressBeforeEdit:activeData
				});
			}
		}
	}

	/**
	 * @description:  添加一个新的地址和编辑地址公用一个方法
	 * @param {String}  recipientFirstName 姓氏
	 * @param {String}  recipientLastName  名字
 	 * @param {String}  address            详细地址
	 * @param {String}  email			   邮箱	
	 * @param {Number}  postalCode		   邮编
	 * @param {Number}  contactNo          手机号
	 * @param {Number}  provinceId		   省份
	 * @param {Number}  districtId         市区
	 * @param {Number}  townId             县
	 * @param {Number}  houseNumber		   邮编
	 * @param {Boolean}  defaultAddress	   设置为默认地址
	 * @return {Object}
	*/
	AddNewAddress = () => {
		const {
			defaultAddress,
			recipientFirstName,
			recipientLastName,
			postalCode,
			contactNo,
			email,
			address,
			promoid,
			pagetype,
			selectedAddress
		} = this.state;
		Toast.loading();
		if (pagetype == 'add') {
			let Data = {
				recipientFirstName: recipientFirstName,
				recipientLastName: recipientLastName,
				postalCode: postalCode,
				contactNo: contactNo,
				email: email,
				provinceId: selectedAddress.province.id,
				districtId: selectedAddress.district.id,
				townId: selectedAddress.town.id,
				villageId: 0,
				houseNumber: ' ',
				zone: '',
				address: address,
				defaultAddress: defaultAddress
			};
			console.log(Data, 'Data')
			AddShippingAddress(Data, (res) => {
				Pushgtagdata(
					"ShipmentAddress", 
					"Add Address", 
					"ShipmentAddress_S_NewAddress",
					res.isSuccess ? 2 : 1,
					[{
						customVariableKey: res.isSuccess ? false : "ShipmentAddress_S_NewAddress_ErrorMsg",
						customVariableValue:  res.isSuccess ? false : res.message
					}]
				)
				if (res.isSuccess) {
					Router.push(`/me/shipment-address?id=${this.props.router.query.id}`);
				} else {
					Toast.error(res.message);
				}
	
				Toast.destroy();
			});
		} else {
			let Data = {
				recordNo: this.props.router.query.addresskey,
				recipientFirstName: recipientFirstName,
				recipientLastName: recipientLastName,
				postalCode: postalCode,
				contactNo: contactNo,
				email: email,
				provinceId: selectedAddress.province.id,
				districtId: selectedAddress.district.id,
				townId: selectedAddress.town.id,
				villageId: 0,
				houseNumber: '',
				zone: '',
				address: address,
				defaultAddress: defaultAddress
			};
			EditShippingAddress(Data, (res) => {
				if (res.isSuccess) {
					Router.push(`/me/shipment-address?id=${this.props.router.query.id}`);
				} else {
					Toast.error(res.message);
				}
	
				Toast.destroy();
			});
		}

	};

	/**
	 * @description: 删除地址
	 * @param {Number} 
	 * @return {Object}
	*/

	DeleteAddress = () => {
		let query = {
			recordNo: this.props.router.query.addresskey
		};
		Toast.loading();
		DeleteShippingAddress(query, (res) => {
			if (res.isSuccess) {
				Router.push(`/me/shipment-address?id=${this.props.router.query.id}`);
			} else {
				Toast.error(res.message);
			}
			Toast.destroy();
		});
	};

	/**
	 * @description: 验证地址相关信息填写
	 * @return {*}
  	*/

	  submitBtnEnable = () => {
		const {addressBeforeEdit, selectedAddress} = this.state;
		const {getFieldValue} = this.props.form;
		const addressHasValue = Object.values(selectedAddress).every(item=>item?.name)
		let error = Object.values(this.props.form.getFieldsError()).some((v) => v !== undefined);
		let errors = Object.values(this.props.form.getFieldsValue()).some((v) => v == '' || v == undefined);
		const hasEdited = addressBeforeEdit?.firstName !== getFieldValue("FirstName") 
			|| addressBeforeEdit?.cellphoneNo !== getFieldValue("phone")
			|| addressBeforeEdit?.provinceName !== selectedAddress.province?.name
			|| addressBeforeEdit?.districtName !== selectedAddress.district?.name
			|| addressBeforeEdit?.townName !== selectedAddress.town?.name
			|| addressBeforeEdit?.address !== getFieldValue("address")
			|| addressBeforeEdit?.postalCode !== getFieldValue("postalCode")
			|| addressBeforeEdit?.defaultAddress !== this.state.defaultAddress
		
		return !errors && !error && hasEdited && addressHasValue;
	};

	render() {
		const {
			defaultAddress,
			ShowDeletPopup,
			address,
			addressid,
			pagetype,
			showArddress,
			defaultAccount,
			promoid,
			addressBeforeEdit
		} = this.state;
		let noreadOnly = pagetype == 'readOnly';
		const { getFieldDecorator, getFieldError } = this.props.form;
		return (
			<Layout
				title="FUN88乐天堂官网｜2022卡塔尔世界杯最佳投注平台"
				Keywords="乐天堂/FUN88/2022 世界杯/世界杯投注/卡塔尔世界杯/世界杯游戏/世界杯最新赔率/世界杯竞彩/世界杯竞彩足球/足彩世界杯/世界杯足球网/世界杯足球赛/世界杯赌球/世界杯体彩app"
				Description="乐天堂提供2022卡塔尔世界杯最新消息以及多样的世界杯游戏，作为13年资深品牌，安全有保障的品牌，将是你世界杯投注的不二选择。"
				status={2}
				hasServer={true}
				BarTitle={promoid !== 'undefined' ? "Địa Chỉ Nhận Thưởng" : "Quản Lý Địa Chỉ Nhận Thưởng"}
			>
				<div className="PromotionsAddressform">
					<div className="Notice">
					Hãy chắc chắn rằng địa chỉ giao hàng này là chính xác để đảm bảo rằng món quà có thể được giao đúng dự kiến
						{/* {noreadOnly ? (
							''
						) : (
							<span>
								. 若您需要更改地址， 请联系
								<u className="skyblue">
									<Service islink={true} />
								</u>。
							</span>
						)} */}
					</div>
					{/* -------------------用户名----------------- */}
					<Item label={`Họ và Tên`} errorMessage={getFieldError('FirstName')}>
						{getFieldDecorator('FirstName', {
							rules: [
								{ required: true, message: 'Vui lòng nhập họ tên thật' },
								{
									validator: (rule, value, callback) => {
										if (value && !_name.test(value)) {
											callback('Sai định dạng. Tên cần có từ 2-50 ký tự chữ');
										}
										callback();
									}
								}
							]
						})(
							<Input
								size="large"
								placeholder="Nhập Họ và Tên"
								disabled={noreadOnly}
								onChange={(e) => {
									this.setState({
										recipientFirstName: e.target.value
									});
								}}
								className="FirstName"
							/>
						)}
					</Item>

					{/* -------------------联系电话----------------- */}
					<Item label={`Số Điện Thoại`} className="shippingPhone" errorMessage={getFieldError('phone')}>
						<Input
							className="prefixNumber" 
							value="+ 84"
							disabled
						/>
						{getFieldDecorator('phone', {
							rules: [
								{ required: true, message: 'Vui lòng nhập số điện thoại' },
								{
									validator: (rule, value, callback) => {
										//最低位数
										let LengthCheck = value.length < 9; //minLength
										if (value != '' && LengthCheck) {
											callback('Số điện thoại cần có 9 chữ số và không điền số 0 ở đầu');
										}

										callback();
									}
								}
							]
						})(
							<Input
								className="phoneNumber"
								type="phone"
								placeholder="Nhập số điện thoại"
								maxLength={9}
								disabled={noreadOnly}
								onChange={(e) => {
									this.setState({
										contactNo: e.target.value.replace(/[^\d]/g, '')
									});
								}}
							/>
						)}
					</Item>

					{/* -------------------邮箱地址----------------- */}
					{/* <Item label={`Email`} errorMessage={getFieldError('email')}>
						{getFieldDecorator('email', {
							rules: [
								{ required: true, message: '请输入电子邮箱' },
								{
									validator: (rule, value, callback) => {
										if ((value && !email_reg.test(value)) || value.length > 100) {
											callback('错误电邮格式');
										}
										callback();
									}
								}
							]
						})(
							<Input
								type="text"
								placeholder="Email"
								disabled={noreadOnly}
								onChange={(e) => {
									this.setState({
										email: e.target.value
									});
								}}
							/>
						)}
					</Item> */}

					{/* -------------------详细地址----------------- */}
					<Item label={`Địa Chỉ`}>
						<div>
							<SelectAddressSingle
								addressBeforeEdit={addressBeforeEdit}
								setParentAddressState={(result)=>{
									this.setState({
										selectedAddress:result
									})
								}}
							/>
							
						</div>
					</Item>
					<Item errorMessage={getFieldError('address')}>
						{getFieldDecorator('address', {
							rules: [
								{ required: true, message: 'Vui lòng nhập số nhà và tên đường' },
								{
									validator: (rule, value, callback) => {
										if (value && !_address.test(value)) {
											callback("Sai định dạng. Chỉ chấp nhận các ký tự đặc biệt # ' . , - / & ( )");
										}
										callback();
									}
								}
							]
						})(
							<Input
								size="large"
								placeholder="Nhập số nhà và tên đường"
								disabled={noreadOnly}
								onChange={(e) => {
									this.setState({
										address: e.target.value
									});
								}}
							/>
						)}
					</Item>
					{/* <Item errorMessage={getFieldError('houseNumber')}>
						{getFieldDecorator('houseNumber', {
							// rules: [
							// 	{ required: false, message: '请输入邮政编码' },
							// 	{
							// 		validator: (rule, value, callback) => {
							// 			if (value && !_postalCode.test(value)) {
							// 				callback('Mã bưu điện không hợp lệ (chỉ nhập số)');
							// 			}
							// 			callback();
							// 		}
							// 	}
							// ]
						})(
							<Input
								size="large"
								placeholder="Nhập Số Nhà​"
								disabled={noreadOnly}
								onChange={(e) => {
									this.setState({
										houseNumber: e.target.value
									});
								}}
							/>
						)}
					</Item> */}

					{/* -------------------邮政编码----------------- */}
					<Item label={`Mã Bưu Chính`} errorMessage={getFieldError('postalCode')}>
						{getFieldDecorator('postalCode', {
							rules: [
								{ required: true, message: 'Vui lòng nhập mã bưu chính' },
								{
									validator: (rule, value, callback) => {
										this.props.form.setFieldsValue({
											postalCode: value.replace(/[^\d.]/g, "")
								
										});
										this.setState({
											postalCode: value.replace(/[^\d.]/g, "")
										})
										if (value && !_postalCode.test(value)) {
											callback('Mã bưu chính cần có 6 chữ số');
										}
										callback();
									}
								}
							]
						})(
							<Input
								size="large"
								placeholder="Nhập mã bưu chính"
								// value={this.state.postalCode}
								maxLength={6}
								disabled={noreadOnly}
								onChange={(e) => {
									this.setState({
										postalCode: e.target.value
									});
								}}
							/>
						)}
					</Item>

					{/* -------------------设为默认运送地址----------------- */}
					<Checkbox
						icon={<BsCheckSquareFill color="#00A6FF" size={18} />}
						checked={defaultAddress}
						onChange={(value) => {
							this.setState({
								defaultAddress: value
							});
						}}
						label="Cài đặt làm địa chỉ giao hàng mặc định"
					/>
					<br />
					<Button
						onClick={() => { 
							this.AddNewAddress();
						}}
						disabled={!this.submitBtnEnable() ||  (this.state.postalCode.length != 6)}
						key="save"
					>
						Lưu
					</Button>
					<br/>
					{pagetype === 'edit' &&
						<Button
							style={{background: 'white', border: '1px solid #00A6FF', color: '#00A6FF'}}
							onClick={() => {
								Pushgtagdata(
									"ShipmentAddress", 
									"Delete Address", 
									"ShipmentAddress_C_DeleteAddress",
								)
								this.setState({
									ShowDeletPopup: true
								});
							}}
							key="del"
						>
							Xoá
						</Button>
					 }
					{/* ------------------会员删除地址----------------- */}
					<Modal closable={false} className="Proms" title="Xóa Địa Chỉ" visible={ShowDeletPopup}>
						<p className="txt">Bạn có muốn xóa địa chỉ nhận thưởng này không?</p>
						<Flexbox>
							<Flexbox flex="1" margin="10px">
								<Button
									className="Btn-Common"
									onClick={() => {
										this.setState({
											ShowDeletPopup: false
										});
									}}
									ghost
								>
									Không
								</Button>
							</Flexbox>
							<Flexbox flex="1" margin="10px">
								<Button
									className="Btn-Common active"
									onClick={() => {
										this.DeleteAddress(addressid);
									}}
								>
									Xoá
								</Button>
							</Flexbox>
						</Flexbox>
					</Modal>
				</div>
			</Layout>
		);
	}
}

export default withRouter(createForm({ fieldNameProp: 'address' })(PromotionsAddressform));
