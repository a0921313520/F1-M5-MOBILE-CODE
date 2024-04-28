import React from 'react';
import Toast from '@/components/View/Toast'
import { fetchRequest } from "@/server/Request";
import { ApiPort } from "@/api/index";
import Modal from '@/components/View/Modal';
import Button from '@/components/View/Button';
import Flexbox from '@/components/View/Flexbox/';
import ReactIMG from '@/components/View/ReactIMG';
export default class Vipcustomerservice extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			feedback:'',
			feedbackTip:'',
			isDisabled: true,
			isSuccess: false
        }
    }
	componentDidUpdate(prevProps){
		if(prevProps.visible !== this.props.visible && this.props.visible){
			this.setState({
				isSuccess: false,
				isDisabled: true,
				feedbackTip:'',
				feedback:''
			})
		}
	}
	textareaChange = v =>{
		if (v.target.value.trim()) {
			this.setState({
				feedback: v.target.value,
				feedbackTip: v.target.value.trim().length > 50 ? '问题反馈仅限50字符以内' : '',
				isDisabled: v.target.value.trim().length < 51 ? false : true
			})
		} else {
			this.setState({
				feedback: v.target.value,
				feedbackTip: '问题反馈内容不得为空',
				isDisabled: true
			})
		}
		console.log(this.state.feedbackTip)
	}
	submit=()=>{
		if(!this.state.isSuccess){
			Toast.loading();
			const postData ={
				comment: this.state.feedback
			}
			fetchRequest(ApiPort.Vipfeedback ,'POST', postData).then((res)=>{
				Toast.destroy();
				if(res && res.isSuccess){
					this.setState({isSuccess: true})
				}else{
					Toast.error('网络错误，请重试', 3);
				}
			}).catch((error) => {
				console.log(error);
			});
		}else{
			this.props.onCloseModal()
		}
	}
	render() {
		const {feedbackTip,isDisabled,isSuccess,feedback} = this.state;
		const {visible,onCloseModal} = this.props;
		return (
            <React.Fragment>
				<Modal
					className="commonModal vip-customerservice"
					visible={visible}
					onCancel={onCloseModal}
					closable={true}
					animation={false}
					mask={false}
					title={!isSuccess ? '回拨服务' : '提交成功'}
				>
					<div className="content">
						{!isSuccess ? <div>
							<p className='text1'>亲爱的VIP会员，请描述并提交所遇到的问题，VIP客服将在 5 分钟内回拨至您绑定的手机号码</p>
							<textarea 
								className={`textarea-input ${feedbackTip ? 'error' : ''} ${feedback ? 'hasText':''}`}
								maxLength={500}
								placeholder='最多50个字' 
								onChange={(v)=>this.textareaChange(v)}
							/>
							{feedbackTip ? <div className='tip'>{feedbackTip}</div> : null}
						</div>
						:<div>
							<ReactIMG src="/img/success.png" />
							<p  className='text2'>乐天使已收到您的留言，VIP专属客服将会使用国家代码电话为 +852 的手机于 5 分钟内与您联系，记得留意您的手机哟。 谢谢</p>
						</div>}
						<Flexbox className="flexwrap">
							<Button disabled={isDisabled} onClick={this.submit}>{!isSuccess ?'提交':'知道了'}</Button>
						</Flexbox>
					</div>
				</Modal>
            </React.Fragment>
		)
	}
}

