import React, { Component } from "react";
import Modal from "@/components/View/Modal";
import { ReactSVG } from "@/components/View/ReactSVG";
import Service from "@/components/Header/Service";

export default class index extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
    }
    render() {
        let testiframe = this.props.content
        return (
            <Modal
                className="verify__notice__modal thirdParty-modal"
                visible={this.props.visible}
                closable={false}
                animation={false}
                mask={false}
            >
                <div className="header-wrapper header-bar">
                    <ReactSVG
                        className="back-icon"
                        src="/img/svg/close.svg"
                        onClick={this.props.closeThirdParty}
                    />
                    <span>{this.props.title}</span>
                    <div className="header-tools-wrapper">
                        <Service />
                    </div>
                </div>
                <iframe id="thirdParty-iframe" srcDoc={testiframe} />
            </Modal>
        );
    }
}
