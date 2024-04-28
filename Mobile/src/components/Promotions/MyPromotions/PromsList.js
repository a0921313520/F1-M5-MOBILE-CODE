/**
 * 优惠数据 相关类型 还有每个类型 需要对应的条件:
 * -----------------------------------------------------------------------------------------------------------------------------------
 * @data 					| 	Promotionsdata																						     
 * @description:			|			 																	     					  
 * -----------------------------------------------------------------------------------------------------------------------------------
 * @type  {Bonus} 			|	 	 																								  
 * @type  {Manual} 			|	三种奖金类型 Bonus Manual Other																		   
 * @type  {Other} 			|																										  
 * -----------------------------------------------------------------------------------------------------------------------------------																			
 * @param {Pending} 		|	=> @type Bonus   展示 待处理和交易编码																	
 * -----------------------------------------------------------------------------------------------------------------------------------
 *  						|	=> @type Bonus   展示:
 * 												 最后更新时间 = updatedDate 														   				 
 * 							|				     红利结束时间 	 = bonusProductList(Array) = expireDateTime 									 	
 * @param {Serving}			|			         进度条 		= percentage 																 
 * 							|				     还需要多少流水  = turnoverNeeded 														 	
 *	 						|				     200红利        = bonusAmount																
 * -----------------------------------------------------------------------------------------------------------------------------------
 * @param {Waiting for release} => @type Bonus   展示 待派发 => 200紅利 = bonusAmount
 * -----------------------------------------------------------------------------------------------------------------------------------
 * @param {Release}  		|	=> @type Bonus   展示 领取 when [ isClaimable = true ]
 * -----------------------------------------------------------------------------------------------------------------------------------
 * @param {Processing} 		|	=> @type Manual  展示 待处理 【查看已提交资料】 按钮 
 * -----------------------------------------------------------------------------------------------------------------------------------				
 * @param {Served} 			|	=> @type Bonus   失效 已领取  展示=>红利结束时间 bonusProductList = expireDateTime | 200红利 = bonusAmount	
 * @param {Force to served} |	=> @type Bonus   失效 已领取  展示=>红利结束时间 bonusProductList = expireDateTime | 200红利 = bonusAmount
 * -----------------------------------------------------------------------------------------------------------------------------------	
 * @param {Cancelled} 		|	=> @type Bonus   失效 已取消  展示=>红利结束时间 bonusProductList = expireDateTime | 200红利 = bonusAmount
 * -----------------------------------------------------------------------------------------------------------------------------------	
 * @param {Approved} 		|	=> @type Manual  失效 已过期  展示=>禁用【查看已提交资料】 按钮												 												
 * @param {Not eligible} 	|   => @type Manual  失效 已过期  展示=>禁用【查看已提交资料】 按钮
 * @param {Expired} 		|	=> @type Bonus   失效 已过期   																				
 * ------------------------------------------------------------------------------------------------------------------------------------
 * 
*/

import React from 'react';
import Modal from '@/components/View/Modal';
import Toast from '@/components/View/Toast';
import Button from '@/components/View/Button';
import Router from 'next/router';
import moment from 'moment';
import Input from '@/components/View/Input';
import Image from '@/components/View/ReactIMG';
import { fetchRequest } from '@/server/Request';
import { ApiPort } from '@/api/index';
import Flexbox from '@/components/View/Flexbox/';
import { RiSettings5Fill } from 'react-icons/ri';
import Popover from '@/components/View/Popover';
import DetailModal from "../Detail";

export class PromotionsCard extends React.Component {
	state = {
		/* 展开取消申请优惠弹窗 */
		ShowCancellPopup: false,
		remark: '选错优惠',
		remarkKey: 0,
		remarkLengthError: false,
		ShowDetail:false
	};
	componentWillUnmount(){
		this.setState =()=> false
	}
	/**
	 * @description: 领取红利
	 * @param {*} id 优惠ID
	*/
	ClaimBonus = (ID) => {
		let postData = {
			playerBonusId: ID
		};
		Toast.loading();
		fetchRequest(ApiPort.ClaimBonus, 'POST', postData)
			.then((res) => {
				console.log(res);
				if (res) {
					if (res.isClaimSuccess) {
						Toast.success(res.message);
					} else {
						Toast.error(res.message);
					}
				}
				Toast.destroy();
			})
			.catch((error) => {
				console.log(error);
			});
	};

	/**
	 * @description: 取消优惠
	 * @param {*} bonusID 红利id
	 * @param {*} playerBonusID 优惠id
	 *
	*/

	CancelPromotion = (bonusID, playerBonusID) => {
		Toast.loading();
		let data = {
			bonusId: bonusID,
			playerBonusId: playerBonusID,
			remark: this.state.remark
		};
		fetchRequest(ApiPort.CancelPromotion, 'POST', data)
			.then((res) => {
				Toast.destroy();
				console.log(res);
				if (res) {
					if (res.isSuccess) {
						this.setState({
							ShowCancellPopup: false
						});
						Toast.success(res.message);
						this.props.Promotions();
					} else {
						Toast.error(res.message);
					}
				}
			})
			.catch((error) => {
				console.log(error);
			});
	};

	goPromotionDetail =()=> {
		const {promotionId} = this.props.data;
		if(promotionId){
			this.setState({
				ShowDetail: true
			})
		}
		else{
			Toast.error("API no retrun promotionId");
		}
	}
		
	
	render() {
		const { ShowCancellPopup, remark, remarkKey,remarkLengthError ,ShowDetail} = this.state;
		const {
			/* 标题 */
			bonusName,
			/* 红利数组 */
			bonusProductList,
			/* 红利状态 */
			status,
			/* 红利ID */
			contentId,
			/* 红利过期时间 */
			expiredDate,
			bonusId,
			/* 红利的类型 */
			type,
			/* 红利金额 */
			bonusAmount,
			/* 进度 */
			percentage,
			/* 需要多少流水 */
			turnoverNeeded,
			playerBonusId,
			promotionId,
			remarks,
			/* 优惠标题 */
			promotionTitle,
			promotionCategory,
			promotionEndDate,
			promotionType,
			isClaimable,
		} = this.props.data;
		const { dataindex } = this.props;
		console.log("this.props.data",this.props.data)
		let Bonus = bonusProductList ? bonusProductList[0] : [];
		const category = JSON.parse(sessionStorage.getItem("Promotions"))?.find(categories=>categories.PromoCatCode===promotionCategory)
		console.log('getObj ',category)
		return (
			<div className="Card">
				<div className="list" onClick={this.goPromotionDetail}>
					<Flexbox alignItems="center">
						<img
							className="Set_GameIcon"
							src={category 
									? category.promoCatImageUrl
									: `/vn/mobile/img/P5/Promotions/icon-General.png`}
						/>
						<div className="name">
							<Flexbox justifyContent="space-between" >
								<b style={{marginBottom:"8px"}}>{promotionTitle || bonusName}</b>
								{/*气泡框 进行中的优惠才显示，点击可以弹出 (取消优惠按钮) 与（不可取消的优惠联系客服提示*/}
								{type != 'Manual' &&
								(status == 'Waiting for release' ||
									status == 'Processing' ||
									status == 'Pending' ||
									status == 'Serving' ||
									status == 'Expired') && (
									<div>
										<RiSettings5Fill
											size={20}
											color="#646464"
											onClick={() => {
												if(status == 'Expired'){
													return
												}
												this.setState({
													['ShowBubble' + dataindex]: !this.state['ShowBubble' + dataindex]
												});
											}}
										/>

										<Popover
											direction="top"
											className="Freebet-popover"
											visible={this.state['ShowBubble' + dataindex]}
											onClose={() => {
												this.setState({
													['ShowBubble' + dataindex]: false
												});
											}}
										>
											{status != 'Pending' ? (
												<p>Thưởng cược miễn phí không thể hủy. Để biết thêm thông tin, bạn có thể liên hệ Live Chat.</p>
											) : (
												<React.Fragment>
													<p>Bạn muốn hủy ưu đãi??</p>
													<div
														className="cancelBtn"
														onClick={() => {
															this.setState({
																ShowCancellPopup: true
															});
														}}
													>
														Hủy
													</div>
												</React.Fragment>
											)}
										</Popover>
									</div>
								)}
								{type != 'Manual' && (status == "Approved" || status=="Not Eligible" || status==="Served") &&(
									<div>
										<RiSettings5Fill
											size={20}
											color="#646464"
											onClick={() => {}}
										/>
									</div>
								)}
							</Flexbox>
							<small className="time">
								{status != 'Pending' && (
									<span>
										Thời Gian Giao Dịch: {promotionType == 'Manual' ? moment(new Date(promotionEndDate)).format('YYYY-MM-DD hh:mm:ss')
										: expiredDate ? moment(new Date(expiredDate)).format('YYYY-MM-DD hh:mm:ss') : '--'
									}
									</span>
								)}
							</small>
						</div>
					</Flexbox>

					{/*-------------------------------- 
								流水进度条 
					---------------------------------*/}
					{status == 'Serving' && (
						<React.Fragment>
							<Flexbox>
								<div className="ProgressBar ">
									<div className="Progress" style={{ width: percentage + '%' }} />
								</div>
							</Flexbox>
							<Flexbox justifyContent="space-between">
								<p className="turnoverNeeded ">Cần Thêm {turnoverNeeded}</p>
								{(status == 'Serving' || status == 'Release') && (
									<span className="blue">{bonusAmount} đ Tiền Khuyến Mãi</span>
								)}
							</Flexbox>
						</React.Fragment>
					)}

					{/*----------------------------------------
							已领取
					------------------------------------------*/}
					{(status == 'Served' || status == 'Force to served' ) && (
						<div style={{ paddingTop: '10px' }}>
								{/* {bonusAmount && (
							<p
								className="blue"
								style={{
									paddingLeft: '44px',
									color: '#00a6ff',
								}}
							>
								{bonusAmount} đ Tiền Khuyến Mãi
							</p>
							)} */}
						<Flexbox paddingTop="15px">
							<Button
								disabled
								style={{
									height: '40px'
								}}
							>
								Hết Hạn
							</Button>
						</Flexbox>
						</div>	
					)}

					{/*----------------------------------------
							已失效的流水进度条
					------------------------------------------*/}

					{(status == 'Expired' || status == 'Canceled') && (
					<React.Fragment>
					<Flexbox>
						<div className="ProgressBar ">
							<div className="Progress" style={{ width: percentage + '%' }} />
						</div>
					</Flexbox>
					<Flexbox justifyContent="space-between">
						<p className="turnoverNeeded" style={{color:"grey"}}>Cần Thêm {turnoverNeeded}</p>
							<span className="blue">{bonusAmount} đ Tiền Khuyến Mãi</span>
					</Flexbox>
					</React.Fragment>
					)}
					{/*----------------------------------------
							已批准
					------------------------------------------*/}

					{(status == 'Approved') && (
						<Flexbox paddingTop="15px">
						<Button
							disabled
							style={{
								height: '40px'
							}}
						>
							已批准
						</Button>
					</Flexbox>
					)}

					{/*----------------------------------------
							不符合資格
					------------------------------------------*/}

					{status == 'Not Eligible' && (
						<Flexbox paddingTop="15px">
						<Button
							disabled
							style={{
								height: '40px'
							}}
						>
							不符合资格
						</Button>
					</Flexbox>
					)}

					{/*----------------------------------------
							待派发
					------------------------------------------*/}

					{status == 'Waiting for release' && (
					<div style={{ paddingTop: '10px' }}>
						{bonusAmount && (
						<p
							className="StatusType"
							style={{
								paddingLeft: '51px',
								color: '#00a6ff',
							}}
						>
							{bonusAmount} đ Tiền Khuyến Mãi
						</p>
					)}
						<Flexbox paddingTop="15px">
							<Button
								disabled
								style={{
									height: '40px'
								}}
							>
								Đã Gửi
							</Button>
						</Flexbox>
						</div>	
					)}
					
					{/*----------------------------------------
							已达到领取红利的条件 等待领取
					------------------------------------------*/}
					{status == 'Release' && (
						<div style={{ paddingTop: '10px' }}>
							{bonusAmount && (
						<p
							className="StatusType"
							style={{
								paddingLeft: '51px',
								color: '#00a6ff',
							}}
						>
							{bonusAmount} đ Tiền Khuyến Mãi
						</p>
					)}
							<div
								className="ClaimBonus"
								onClick={() => {
									isClaimable && this.ClaimBonus(playerBonusId);
								}}
							>
								Nhận Thưởng Ngay
							</div>
						</div>
					)}

					{/*---------------------------------
							待处理红利（可取消）
					----------------------------------*/}
					{(status == 'Pending' || status == 'Processing') && (
						<div style={{ paddingTop: '10px' }}>
							<p
								className="StatusType"
								style={{
									paddingLeft: '51px',
									color: '#00a6ff'
								}}
							>
								Đang Xử lý
							</p>
							{status == 'Pending' && (
								(Bonus.reference) && <small className="gray flex">mã giao dịch {Bonus.reference?.split(':')[1]}</small>
							)}
							{status == 'Processing' && (
								<div
									className="Btn-Common"
									onClick={(e) => {
										e.stopPropagation()
										Router.push(`/promotions/manual?id=${promotionId}&title=${promotionTitle}&remarks=${remarks}`);
									}}
									style={{
										backgroundColor: 'white',
										border: '1px solid #00a6ff',
										color: '#00a6ff'
									}}
								>
									Xem Lại Đơn Đăng Ký
								</div>
							)}
						</div>
					)}
				</div>

				{/*-------------------------------取消优惠弹窗 选择取消的原因 -----------------------------------*/}
				<Modal closable={false} className="Proms cancel-discount-application" title="Bạn muốn hủy Thưởng Cược Miễn Phí ?" visible={ShowCancellPopup}>
					<label><b>Lý do hủy bỏ</b></label>
					<ul className="cap-list cancell-list">
						{[ 'Chọn sai', 'Lỗi thông tin tiền gửi', 'Quá nhiều', 'Tiền gửi chưa đến', 'Khác :' ].map((val, index) => {
							return (
								<li
									className="cap-item"
									key={index}
									onClick={() => {
										this.setState({
											remarkKey: index,
											remark: val
										});
									}}
								>
									<div className={`cap-item-circle${remarkKey === index ? ' curr' : ''}`} />
									<div className="padding-left-xs">{val}</div>
									{val == 'Khác :' && (
										<Input
											size="large"
											placeholder=""
											value={remarkKey == 4 && remark != 'Khác :' ? remark : ''}
											onChange={(e) => {
												this.setState({
													remark: e.target.value,
													remarkLengthError: e.target?.value.length > 30
												});
											}}
											maxLength={31}
										/>
									)}
								</li>
							);
						})}
						{remarkLengthError && <li className="error-msg">Giới hạn 30 ký tự.</li>}
					</ul>
					<Flexbox justify-content="space-around">
						<Button
							className="Btn-Common Cancell _active"
							ghost
							onClick={() => {
								this.setState({
									ShowCancellPopup: false
								});
							}}
						>
							Hủy
						</Button>
						<Button
							className="Btn-Common active"
							onClick={() => {
								this.CancelPromotion(promotionId, playerBonusId);
							}}
						>
							Gửi
						</Button>
					</Flexbox>
				</Modal>

				{ShowDetail && <DetailModal
					ShowDetail={ShowDetail}
					CloseDetail={() => {
						this.setState({
							ShowDetail: false
						});
					}}
					PromoId={promotionId}
				/>}

				<style jsx global>{`
					._active {
						border: 1px solid #00a6ff !important;
						color: #00a6ff !important;
					}
				`}</style>
			</div>
		);
	}
}

export default PromotionsCard;
