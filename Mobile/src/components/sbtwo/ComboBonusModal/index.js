
import React from "react";
import Modal from "$SBTWO/Modal";
import { ReactSVG } from "$SBTWO/ReactSVG";

class ComboBonusModal extends React.Component {
	render() {
		return (
            <Modal
                closable={false}
                className="recommend-race-modal combo-bonus-modal"
                title="混合过关盈利升级"
                visible={this.props.visible}
                onCancel={this.props.onClose}
            >
                <div className="combo-bonus-wrap">
                    <div className="combo-bonus-title">
                        <div className="combo-bonus-brief">
                            <div className="combo-bonus">
                                <span className="bonus-tile">产品：</span>
                                <span>乐天堂体育</span>
                            </div>
                            <div className="combo-bonus">
                                <span className="bonus-tile">运动项目：</span>
                                <span>足球和篮球</span>
                            </div>
                            <div className="combo-bonus">
                                <span className="bonus-tile">最高奖励</span>
                                <span>￥5000</span>
                            </div>
                        </div>
                        <div className="combo-bonus-brief">
                            <div className="combo-bonus">
                                <span className="bonus-tile">要求：</span>
                                <ol>
                                    <li>投注混合过关，串关&gt;=3串</li>
                                    <li>单场最低赔率&gt;=1.70</li>
                                    <li>每张注单投注额&gt;=100</li>
                                    <li>仅限早盘赛事</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                    <div className="combo-bonus">
                        <span className="bonus-tile">注：系统混合过关不包含在内。</span>
                    </div>
                    <ul className="combo-bonus-content">
                        <li className="combo-bonus-label">
                            <div>混合过关场数</div>
                            <div>盈利升级</div>
                        </li>
                        <li>
                            <div>3场</div>
                            <div>3%</div>
                        </li>
                        <li>
                            <div>4场</div>
                            <div>5%</div>
                        </li>
                        <li>
                            <div>5场</div>
                            <div>8%</div>
                        </li>
                        <li>
                            <div>6场</div>
                            <div>10%</div>
                        </li>
                        <li>
                            <div>7场</div>
                            <div>12%</div>
                        </li>
                        <li>
                            <div>8场</div>
                            <div>15%</div>
                        </li>
                        <li>
                            <div>9场</div>
                            <div>20%</div>
                        </li>
                    </ul>
                </div>
                <ReactSVG className="recommend" src="/img/svg/close.svg" onClick={this.props.onClose} />
            </Modal>
		);
	}
}

export default ComboBonusModal;
