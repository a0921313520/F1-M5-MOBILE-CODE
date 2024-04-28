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
export class PromotionsCard extends React.Component {
	state = {
		/* 展开取消申请优惠弹窗 */
		ShowCancellPopup: false,
		remark: '选错优惠',
		remarkKey: 0
	};

	/**
	 * @description: 领取红利
	 * @param {*} id 优惠ID
	*/
	ClaimBonus = (ID) => {
		let postData = {
			playerBonusId: ID
		};
		Toast.loading('请稍候...');
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
		const hide = Toast.loading('请稍候...');
		let data = {
			bonusId: bonusID,
			playerBonusId: playerBonusID,
			remark: this.state.remark
		};
		fetchRequest(ApiPort.CancelPromotion, 'POST', data)
			.then((res) => {
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
				hide();
			})
			.catch((error) => {
				console.log(error);
			});
	};

	render() {
		const { ShowCancellPopup, remark, remarkKey } = this.state;
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
			/* 优惠标题 */
			promotionTitle,
			promotionCategory,
			promotionEndDate,
			promotionType,
			isClaimable,
		} = this.props.data;
		const { dataindex } = this.props;
		let Bonus = bonusProductList ? bonusProductList[0] : [];
		const category = JSON.parse(sessionStorage.getItem("Promotions"))?.find(categories => categories.PromoCatCode===promotionCategory)
		return (
			<div className="Card">
				<div className="list">
					<Flexbox alignItems="center">
						<Image
							className="Set_GameIcon"
							src={`/img/P5/Promotions/icon-${category?.PromoCatCode || 'General'}.png?v=123`}
						/>
						<div className="name">
							<Flexbox justifyContent="space-between">
								<b>{promotionTitle || bonusName}</b>
								{/*气泡框 进行中的优惠才显示，点击可以弹出 (取消优惠按钮) 与（不可取消的优惠联系客服提示*/}
								{type != 'Manual' &&
								(status == 'Waiting for release' ||
									status == 'Processing' ||
									status == 'Pending' ||
									status == 'Serving' ||
									status == 'Expired' ) && (
									<div>
										<RiSettings5Fill
											size={20}
											color="#646464"
											onClick={() => {
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
												<p>若想取消优惠，请联系客服</p>
											) : (
												<React.Fragment>
													<p>需要取消优惠吗?</p>
													<div
														className="cancelBtn"
														onClick={() => {
															this.setState({
																ShowCancellPopup: true
															});
														}}
													>
														取消
													</div>
												</React.Fragment>
											)}
										</Popover>
									</div>
								)}
								{type != 'Manual' && (status == "Approved" || status=="Not Eligible") &&(
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
										结束时间：{promotionType == 'Manual' ? moment(new Date(promotionEndDate)).format('YYYY-MM-DD hh:mm:ss')
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
								<p className="turnoverNeeded ">还需 {turnoverNeeded} 流水</p>
								{(status == 'Serving' || status == 'Release') && (
									<span className="blue">{bonusAmount}元红利</span>
								)}
							</Flexbox>
						</React.Fragment>
					)}

					{/*----------------------------------------
							已领取
					------------------------------------------*/}
					{(status == 'Served' || status == 'Force to served' ) && (
						<div style={{ paddingTop: '10px' }}>
								{bonusAmount && (
							<p
								className="blue"
								style={{
									paddingLeft: '44px',
									color: '#00a6ff',
								}}
							>
								{bonusAmount}元红利
							</p>
							)}
						<Flexbox paddingTop="15px">
							<Button
								disabled
								style={{
									height: '40px'
								}}
							>
								已领取
							</Button>
						</Flexbox>
						</div>	
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
							{bonusAmount}元红利
						</p>
					)}
						<Flexbox paddingTop="15px">
							<Button
								disabled
								style={{
									height: '40px'
								}}
							>
								待派发
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
							{bonusAmount}元红利
						</p>
					)}
							<div
								className="ClaimBonus"
								onClick={() => {
									isClaimable && this.ClaimBonus(playerBonusId);
								}}
							>
								领取红利
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
								处理中
							</p>
							{status == 'Pending' && (
								(Bonus.reference) && <small className="gray flex">交易编码 {Bonus.reference?.split(':')[1]}</small>
							)}
							{status == 'Processing' && (
								<div
									className="Btn-Common"
									onClick={() => {
										Router.push(`/promotions/manual?id=${promotionId}&title=${promotionTitle}&remarks=${remarks}`);
									}}
									style={{
										backgroundColor: 'white',
										border: '1px solid #00a6ff',
										color: '#00a6ff'
									}}
								>
									查看已提交资料
								</div>
							)}
						</div>
					)}
				</div>

				{/*-------------------------------取消优惠弹窗 选择取消的原因 -----------------------------------*/}
				<Modal closable={false} className="Proms" title="您真的要取消优惠？" visible={ShowCancellPopup}>
					<label>取消原因</label>
					<ul className="cap-list cancell-list">
						{[ '选错优惠', '存款资料错误', '流水太多', '存款未到账', '其他' ].map((val, index) => {
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
									{val == '其他' && (
										<Input
											size="large"
											placeholder=""
											value={remarkKey == 4 && remark != '其他' ? remark : ''}
											onChange={(e) => {
												this.setState({
													remark: e.target.value
												});
											}}
										/>
									)}
								</li>
							);
						})}
					</ul>
					<Flexbox justify-content="space-around">
						<Button
							className="Btn-Common Cancell _active"
							ghost
							onClick={() => {
								this.CancelPromotion(promotionId, playerBonusId);
							}}
						>
							确认取消
						</Button>
						<Button
							className="Btn-Common active"
							onClick={() => {
								this.setState({
									ShowCancellPopup: false
								});
							}}
						>
							保留优惠
						</Button>
					</Flexbox>
				</Modal>
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
