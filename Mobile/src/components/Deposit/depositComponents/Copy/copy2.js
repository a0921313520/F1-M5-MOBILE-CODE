/*
 * @Author: Alan
 * @Date: 2022-07-24 22:47:47
 * @LastEditors: Alan
 * @LastEditTime: 2022-07-24 22:48:21
 * @Description: 复制
 * @FilePath: \Mobile\src\components\Deposit\depositComponents\Copy\copy2.js
 */
import React, { useState,useImperativeHandle } from "react";
import copy from "copy-to-clipboard";
import Toast from '@/components/View/Toast';

const Copy2 = React.forwardRef(({ targetText, onCopyIconClicked = null}, ref) => {
    const [copied, setCopied] = useState(false);

    useImperativeHandle(ref, () => ({
        setNotCopied: () => {
            setCopied(false);
        }
    }));

    const copyIconClick = () => {
        onCopyIconClicked && onCopyIconClicked();
        copy(targetText ? targetText : ' ');
        Toast.success("已复制", 2);
        setCopied(true);
    };

    return <>
        <span className="copy2-action-icon" onClick={() => {copyIconClick()}} />
        <span className={'copy2-copied-icon-container' + ( copied ? ' copy2-copied-icon-show' : '' )} />
    </>;
});

export default Copy2;
