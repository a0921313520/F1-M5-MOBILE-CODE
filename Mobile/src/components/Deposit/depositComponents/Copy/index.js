/*
 * @Author: Alan
 * @Date: 2022-06-10 14:20:37
 * @LastEditors: Alan
 * @LastEditTime: 2022-06-17 08:51:59
 * @Description: 复制
 * @FilePath: \Mobile\src\components\Deposit\depositComponents\Copy\index.js
 */
import * as React from 'react';
import copy from 'copy-to-clipboard';
import Toast from '@/components/View/Toast';
import { ReactSVG } from '@/components/View/ReactSVG';

const oneKeyCopy = (targetText) => {
	copy(targetText.length === 0 ? ' ' : targetText);
	Toast.success('Sao Chép Thành Công', 2);
};

const Copy = ({ targetText }) => {
	return (
		<span className="item-copy">
			<ReactSVG src="/img/svg/copy.svg" onClick={() => oneKeyCopy(targetText)} />
		</span>
	);
};

export default Copy;
