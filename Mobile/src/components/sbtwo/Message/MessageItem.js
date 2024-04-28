import React from "react";
import { ReactSVG } from "$SBTWO/ReactSVG";

const getTitle = (props) => {
  if (props.type === "Announcement") {
    return props.item.topic;
  } else if (props.type === "Transfer") {
    switch (props.item.memberNotificationCategoryID) {
      case 1:
        return "存款已成功到账";
      case 2:
        return "存款已被拒绝";
      case 3:
        return "取款已成功到账";
      case 4:
        return "取款已被拒绝";
      default:
        return props.item.title;
    }
  } else {
    return props.item.title;
  }
};

export default function MessageItem(props) {
  return (
    <div
      key={
        props.type === "Announcement"
          ? props.item.announcementID
          : props.item.memberNotificationID
      }
      className={
        props.item.isRead
          ? "sbtwo-information__box__item isRead"
          : "sbtwo-information__box__item"
      }
      onClick={() => props.goDetail(props.type, props.item)}
    >
      <div className={props.getMessageIcon(props.type, props.item)} />
      <div className="information__item__mid">
        <div className="information__mid__title">
          <span className="information__title">{getTitle(props)}</span>
          <span className="information__time">
            {props.item.sendOn ? props.getTime(props.item.sendOn) : ""}
          </span>
        </div>
        <div
          className={
            props.type === "Transfer"
              ? "sbtwo-information__content Transfer_content "
              : "sbtwo-information__content"
          }
          dangerouslySetInnerHTML={{
            __html: props.item.content
          }}
        ></div>
      </div>
      {props.type !== "Transfer" && <ReactSVG src="/img/svg/RightArrow.svg" />}
    </div>
  );
}
