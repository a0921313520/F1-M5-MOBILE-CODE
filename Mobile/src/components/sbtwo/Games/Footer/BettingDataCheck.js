
/* 金额分割 */
export const numberWithCommas = (num) => {
	return num !== '' ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';
};
