import React from "react";

export default function MessageDetailItem(props) {
    return (
        <div className="message__main">
            <div className="message__main__title">
                <div className="message__heading">
                    {props.type === "3" ? props.data.topic : props.data.title}
                </div>
                <div className="message__time">
                    {props.data.sendOn ? props.getTime(props.data.sendOn) : ''}
                </div>
            </div>

            <div
                className="message__main__content"
                dangerouslySetInnerHTML={{
                    __html: props.data.content,
                }}
            ></div>
        </div>
    );
}
