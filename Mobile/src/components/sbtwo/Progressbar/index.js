import React, { Component } from "react";

export default class Progressbar extends Component {
    render() {
        const { activeStep, steps = Array(2).fill("") } = this.props;

        return (
            <div className="progressbar_container">
                <ul className="progressbar">
                    {steps.map((item, index) => {
                        return (
                            <li
                                key={index}
                                className={
                                    index <= activeStep - 1 ? "active" : ""
                                }
                            />
                        );
                    })}
                </ul>
            </div>
        );
    }
}
