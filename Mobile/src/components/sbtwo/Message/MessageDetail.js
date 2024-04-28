import React from "react";
import MessageDetailItem from "$SBTWO/Message/MessageDetailItem";
import Modal from "$SBTWO/Modal";
import { ReactSVG } from "$SBTWO/ReactSVG";

export default function MessageDetail(props) {
    return (
        <Modal
            className="sbtwo sbtwo-message__modal"
            visible={props.isShowDetail}
            onClose={props.onClose}
            closable={false}
        >
            <div className="sbtwo-header-wrapper header-bar">
                <ReactSVG
                    className="back-icon"
                    src="/img/svg/LeftArrow.svg"
                    onClick={props.onClose}
                />
                <span style={{width:"200px"}}>消息详情</span>

                {/* 為維持排版，勿刪 */}
                <div style={{width:"32px"}}></div>
            </div>
            <MessageDetailItem getTime={props.getTime} data={props.data} detailTime={props.detailTime} type={props.type} />
        </Modal>
    );
}
