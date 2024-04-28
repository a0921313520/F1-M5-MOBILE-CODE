/*
 * @Author: Alan
 * @Date: 2022-03-31 10:46:05
 * @LastEditors: Alan
 * @LastEditTime: 2022-04-18 22:24:24
 * @Description: 上传文件
 * @FilePath: \Mobile\src\api\uploader.js
 */
import { fetchRequest } from '@/server/Request';
import { ApiPort } from '@/api/index';
import HostConfig from '@/server/Host.config';
import Toast from '@/components/View/Toast';
import Qs from 'qs';

/**
 * @description 获取是否需要上传文档的状态
 * @param {*} call
 * @return {*}
 */
export function GetDocumentApprovalStatus(call) {
	fetchRequest(ApiPort.GetDocumentApprovalStatus, 'GET')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('GetDocumentApprovalStatus error:', error);
			return null;
		});
}

/**
 * @description 获取上传文档的进度
 * @param {*} call
 * @return {*}
 */
export function GetVerificationMemberDocuments(call) {
	fetchRequest(ApiPort.GetVerificationMemberDocuments, 'GET')
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('GetVerificationMemberDocuments error:', error);
			return null;
		});
}

/**
 * @description: 上传身份证资料
 * @param {*} params
 * @param {*} call
 * @return {*}
 */
export function UploadDocument(datas, call) {
	fetchRequest(ApiPort.UploadDocument + Qs.stringify(datas.params) + '&', 'POST', datas.data)
		.then((res) => {
			call(res);
		})
		.catch((error) => {
			console.log('UploadDocument error:', error);
			return null;
		});
}
