/*
 * @Author: Alan
 * @Date: 2022-06-10 14:20:37
 * @LastEditors: Alan
 * @LastEditTime: 2022-11-08 11:52:55
 * @Description: 成功提交
 * @FilePath: \Mobile\src\components\Deposit\depositComponents\FinishStep\index.js
 */
// import * as React from 'react';
import React, { useEffect } from 'react';
import { ReactSVG } from '@/components/View/ReactSVG';
import Copy from '../Copy';
import Button from '@/components/View/Button';
import Steps, { Step } from 'rc-steps';
import UploadFile from '../../uploadFile/';
import Router from 'next/router';
import { BsCheckCircleFill, BsCircle } from 'react-icons/bs';
const FinishStep = ({ transactionId, depositMoney, time, goHome, RequestedBy, PaymentMethod, closeModal, callbackToHome,lbStep,FinishRes }) => {
	useEffect(()=>{
		if(!callbackToHome){
			return
		}else{
			callbackToHome(lbStep)
		}
	},[])
	return (
		<div className="lb-third-step-wrap">
			<div className="sport-deposit-receipt">
				<div style={{ textAlign: 'center' }}>
					<ReactSVG src="/img/svg/Success.svg" />
					<div className="check-success">
						<div>已成功提交</div>
					</div>
				</div>
				<ul>
					<li className="item-wrap">
						<span className="item-label">存款金额</span>
						<span className="item-content" style={{ color: '#000' }}>
							<span style={{ fontSize: '14px' }}>￥</span>
							<span style={{ fontSize: '20px' }}>{depositMoney}</span>
						</span>
					</li>
					<li className="item-wrap">
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
					<Step title="提交成功" description={`处理中`} icon={<BsCheckCircleFill color="#108ee9" size={17} />} />
					<Step
						title={`预计${time}分钟到账`}
						icon={<BsCircle color="#999999" size={12} style={{ marginLeft: '1px' }} />}
					/>
				</Steps>
				{PaymentMethod == 'SR' && (
					<p style={{ color: '#666666', lineHeight: '18px' }}>
						存款提交后，会员务必在 <span className="red">30 分钟内完成转账</span>，以避免延迟到账。若会员转账后，仍尚未到账，请立即联系在线客服。
					</p>
				)}
			</div>
			{/* 上传存款凭证 */}
			{(PaymentMethod == 'PPB' || PaymentMethod == 'SR') && (
				<UploadFile RequestedBy={RequestedBy} transactionId={transactionId} PaymentMethod={PaymentMethod} />
			)}

			<div className="FinishStep-notice-text">
				您可以回到首页继续投注，请等待{time.split(':')[0]}分钟以刷新金额，
				<br />
				如果有任何问题，请联系我们的在线客服
			</div>
			<div className="btn-wrap FinishStep-btn-wrap">
				<Button
					size="large"
					type="primary"
					onClick={() => {
						goHome && goHome();
						closeModal && closeModal();
						Router.push('/transaction-record?page=Deposit');
						// Pushgtagdata(`Transaction Record`, 'View', 'View_TransactionRecord_Deposit');
					}}
				>
					查看交易记录
				</Button>
				<br />
				<Button
					size="large"
					type="primary"
					onClick={() => {
						goHome && goHome();
						closeModal && closeModal();
					}}
					ghost
				>
					回到首页
				</Button>
			</div>
		</div>
	);
};

export default FinishStep;
