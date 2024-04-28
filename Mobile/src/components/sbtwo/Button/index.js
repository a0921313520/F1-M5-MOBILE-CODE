import React from "react";
import { ReactSVG } from '$SBTWO/ReactSVG';

export default class Button extends React.Component {
    constructor (props) {
        super(props)
        this.state = {
        }
        this.filterProps = {}
        Object.keys(this.props).forEach((v) => {
            if (!~["ghost", "inline", "radius", "loading"].indexOf(v)) {
                this.filterProps[v] = this.props[v];
            }
        })
    }
    componentDidMount () {
    }
    render() {
        return <button
            {...this.filterProps}
            className={`sportBtn ${this.props.ghost ? 'ghost' : ""} ${this.props.radius ? 'radius' : ""} ${this.props.loading ? 'loading' : ""} ${this.props.inline ? 'inline' : ""}${
                this.props.className ? (" " + this.props.className) : ""
            }`}
        >
            <span>{this.props.loading ? <ReactSVG className="loading" src="/img/svg/loading.svg" /> : null}{this.props.children}</span>
            {this.props.fufix ? this.props.fufix : null}
        </button>
    }
}
