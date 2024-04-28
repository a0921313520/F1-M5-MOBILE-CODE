/*
 * @Author: Alan
 * @Date: 2022-06-10 14:20:37
 * @LastEditors: Alan
 * @LastEditTime: 2022-08-26 21:22:46
 * @Description: 成功提交
 * @FilePath: \Mobile\src\components\Withdrawal\Components\FinishStep\index.js
 */
import * as React from 'react';
import { ReactSVG } from '@/components/View/ReactSVG';
import Copy from '@/components/Deposit/depositComponents/Copy/';
import Button from '@/components/View/Button';
import Steps, { Step } from 'rc-steps';
//import UploadFile from '../../uploadFile/';
import BackBar from '@/components/Header/BackBar';
import Modal from '@/components/View/Modal';
import Router from 'next/router';
import classNames from 'classnames';
import { HiCheckCircle } from "react-icons/hi";
import { BsRecordCircleFill } from "react-icons/bs";
const FinishStep = ({ showModal, CloseModal, FinishData, payMoney }) => {
	const { transactionId, rebateAmount, payoutMode, maxPayoutDurationInMins } = FinishData.result;
	console.log(FinishData);
	console.log('--->', rebateAmount);
	console.log("payoutMode",payoutMode)
	function handleTime(time){
		if(time==0){
			return(`您的提现将于1小时内完成， 请您耐心等待！`)
		}
		else if(time/60>=1){
			if(time%60==0){
				return(`您的提现将于${time/60}小时内完成， 请您耐心等待！`)
			}else{
				return(`您的提现将于${parseInt(time/60)}小时${time%60}分钟内完成， 请您耐心等待！`)
			}
			
		}else{
			return(`您的提现将于${time%60}分钟内完成， 请您耐心等待！`)
		}
	}
	return (
		<Modal
			visible={showModal}
			transparent
			maskClosable={false}
			closable={false}
			title={
				<BackBar
					key="main-bar-header"
					title={'提款'}
					backEvent={() => {
						CloseModal();
					}}
					hasServer={true}
				/>
			}
			wrapClassName="SR-withdraw-success-modal"
			className={classNames({
				WhiteBg: false,
				'Fullscreen-Modal': true,
				ShowMask: false
			})}
		>
			<div className="lb-third-step-wrap">
				<div className='info-box'>
					<div className="sport-deposit-receipt">
						<div style={{ textAlign: 'center' }}>
							<ReactSVG src="/img/svg/Success.svg" />
							<div className="check-success">
								<div>已成功提交</div>
							</div>
						</div>
						<ul>
							<li className="item-wrap">
								<span className="item-label">提款金额</span>
								<span className="item-content" style={{ color: '#000' }}>
									<span style={{ fontSize: '14px' }}>￥</span>
									<span style={{ fontSize: '20px' }}>{payMoney}</span>
								</span>
							</li>
							<li className="item-wrap transaction-id">
								<span className="item-label">交易单号</span>
								<span className="item-content" style={{ maxWidth: '80%', display: 'flex' }}>
									<span className="item-transactionId">{transactionId}</span>
									<div className="CopySet">
										<Copy targetText={transactionId} />
									</div>
								</span>
							</li>
						</ul>
						<Steps className="third-step-wrap" direction="vertical" size="small">
							<Step title="提交成功" description={`处理中`} icon={<span className='step-icon'><HiCheckCircle size={15} color="#00A6FF"/></span>}/>
							{/*這裡要改成使用者選擇的時間*/}
							<Step title= {handleTime(maxPayoutDurationInMins)} icon={<span className='step-icon'><BsRecordCircleFill size={9} /></span>}/>
						</Steps>
					</div>
						{payoutMode == 'SmallRiver' && (
							<div className="DONENOTE">
								{rebateAmount != undefined &&
								rebateAmount != 0 && (
									<h3>恭喜您！您在此笔提现交易中将获得额外红利，若您收到该笔交易金额后，可在交易记录页面中查看额外红利并点击“确认到账”领取额外红利。​</h3>
								)}
								{(!rebateAmount || rebateAmount == 0) && <h3>若银行账户已收到该款项，请前往交易记录页面点击”确认到账“。</h3>}
								<br />
								1. 请注意，乐天堂不会在金额还没到账前通知会员点击 “确认到账”。<span className="red">请留意您的资金安全</span>。 <br />
								2. 若您在尚未检查的情况下点击“确认到账”，所产生的损失乐天堂<span className="red">概不负责赔偿</span>。 <br />
								​3. 请确认您的金额是否已到账。
							</div>
						)}
				</div>
				
				<div className="btn-wrap FinishStep-btn-wrap">
					<Button
						size="large"
						type="primary"
						onClick={() => {
							Router.push('/transaction-record?page=Withdraw');
							// Pushgtagdata(`Transaction Record`, 'View', `View_TransactionRecord_Withdraw`);
						}}
					>
						查看交易记录
					</Button>
					<br />
					<Button
						ghost
						size="large"
						type="primary"
						onClick={() => {
							Router.push('/');
						}}
					>
						回到首页
					</Button>
					<br />
				</div>
			</div>
		</Modal>
	);
};

export default FinishStep;
