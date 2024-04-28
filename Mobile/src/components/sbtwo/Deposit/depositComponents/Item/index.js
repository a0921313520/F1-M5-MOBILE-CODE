
import React from "react";
import { CSSTransition } from "react-transition-group";

class Item extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isShow: true,
            isAdded: false,
        };
    }
    componentDidUpdate(prevProps) {
        if (prevProps.errorMessage !== this.props.errorMessage) {
            if (
                this.props.errorMessage !== undefined &&
                this.props.errorMessage[0] !== "string"
            ) {
                this.setState({
                    isShow: !!this.props.errorMessage,
                    isAdded: this.props.errorMessage[0] === "string",
                });
            }
        }
    }
    render() {
        let { label, children, className, errorMessage } = this.props;
        if (errorMessage && typeof errorMessage[0] !== "string") {
            errorMessage = undefined;
        }
        return (
            <div
                className={`form-item${className ? " " + className : ""}`}
                style={this.props.style || null}
            >
                {label ? <label>{label}</label> : null}
                <div className={errorMessage ? "has-error" : ""}>
                    {children || ""}
                </div>
                {this.state.isAdded || errorMessage ? (
                    <CSSTransition
                        in={!!(errorMessage || this.state.isShow)}
                        appear={true}
                        classNames="sprot-bottom-scale"
                        timeout={160}
                        onExited={() => {
                            this.setState({ isAdded: false });
                        }}
                    >
                        <div className="input-error-message">
                            {errorMessage}
                        </div>
                    </CSSTransition>
                ) : null}
            </div>
        );
    }
}
export default Item;
