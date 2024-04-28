import { fetchRequest } from '@/server/Request';
import { ApiPort } from '@/api/index';
import moment from 'moment';

export async function PromotionList(params) {
    // type = 'general'
    let { type } = params;

    let cmsRows;
    let cmsRowsData = [];
    let bffBonus = {};
    let bffHistories = {};
    let status = null;

    await fetchRequest(ApiPort.CMSPromotionList + `type=${type}`, 'GET')
        .then((res) => {
            cmsRows = res;
            cmsRowsData = res.data;
        })
        .catch((error) => {
            console.log('CMSPromotionList error: ', error);
        });
    let IS_LOGIN_MEMBER = JSON.parse(localStorage.getItem('memberToken'));
    let promotionType = type;
    let IS_DAILY_DEAL_TYPE = promotionType == 'daily';
    if (IS_LOGIN_MEMBER || IS_DAILY_DEAL_TYPE) {
        let startEndDate = [];
        if (cmsRowsData && cmsRowsData.length > 0) {
            let earlierStartDate = cmsRowsData[0].startDate; // "2022-03-28T04:00:00Z"
            let laterEndDate = cmsRowsData[0].endDate;

            for (let k = 0; k < cmsRowsData.length; k++) {
                if (k == 0) {
                    continue;
                }

                let data = cmsRowsData[k];

                if (earlierStartDate > data.startDate) {
                    earlierStartDate = data.startDate;
                }

                if (laterEndDate < data.endDate) {
                    laterEndDate = data.endDate;
                }
            }

            let earlierStartDateOnly = earlierStartDate.substr(0, earlierStartDate.indexOf('T'));
            let laterEndDateOnly = laterEndDate.substr(0, laterEndDate.indexOf('T'));
            startEndDate = [earlierStartDateOnly, laterEndDateOnly];
        }

        if (!startEndDate || startEndDate.length <= 0) {
            startEndDate = [moment().subtract(180,'days').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')];
        }

        // start to setup bffBonus and bffHistories

        if (promotionType == 'general') {
            const BONUS_TRANSACTION_TYPES = ['Deposit', 'Transfer'];
            let transactionTypes = BONUS_TRANSACTION_TYPES;

            let response;
            let bonusData = {}; //跑for迴圈所以放外層
            for (let i = 0; i < transactionTypes.length; i++) {
                await fetchRequest(
                    ApiPort.GETBonusListAPI + `transactionType=${transactionTypes[i]}&`,
                    'GET'
                )
                    .then((res) => {
                        response = res;
                    })
                    .catch((error) => {
                        console.log('GETBonusListAPI error: ', error);
                    });

                if (response && response.isSuccess) {
                    for (let bonus of response.result) {
                        bonusData[bonus.id] = bonus;
                    }
                } // end of 200
            }
            bffBonus = bonusData;
            if (startEndDate[0] && startEndDate[1]) {
                await fetchRequest(
                    ApiPort.AppliedHistory +
                    `startDate=${startEndDate[0]}&endDate=${startEndDate[1]}&`,
                    'GET'
                )
                    .then((res) => {
                        response = res;
                    })
                    .catch((error) => {
                        console.log('AppliedHistory error:', error);
                    });

                if (response && response.isSuccess) {
                    //按申請時間 遠->近 排序
                    if (response && response.result && response.result.length > 0) {
                        response.result.sort((a,b) => a.appliedDate > b.appliedDate ? 1 : (a.appliedDate == b.appliedDate ? 0 : -1))
                    }

                    let historyData = {};
                    for (let bonus of response.result) {
                        historyData[bonus.bonusRuleId] = bonus;
                    }
                    bffHistories = historyData;
                }
            }

        } else if (IS_DAILY_DEAL_TYPE) {
            let response;
            await fetchRequest(ApiPort.GETDailyDeals).then((res) => {
                    response = res;
                })
                .catch((error) => {
                    console.log('GETDailyDeals error:', error);
                });

            if (response && response.isSuccess) {
                let bonusData = {};
                for (let bonus of response.result) {
                    bonusData[bonus.bonusId] = bonus;
                }

                bffBonus = bonusData;
            } // end of 200

            if (IS_LOGIN_MEMBER) {
                if (startEndDate[0] && startEndDate[1]) {

                    await fetchRequest(
                        ApiPort.DailyDealsHistories +
                        `startDate=${startEndDate[0]}&endDate=${startEndDate[1]}&`,
                        'GET'
                    )
                        .then((res) => {
                            response = res;
                        })
                        .catch((error) => {
                            console.log('DailyDealsHistories error:', error);
                        });

                    if (response && response.isSuccess) {
                        let historyData = {};
                        for (let bonus of response.result) {
                            historyData[bonus.bonusRuleId] = bonus;
                        }
                        bffHistories = historyData;
                    } // end of 200
                }

            } // end of IS_LOGIN_MEMBER
        } else if (promotionType == 'free') {
            let response;

            await fetchRequest(ApiPort.FreebetBonusGroups, 'GET')
                .then((res) => {
                    response = res;
                })
                .catch((error) => {
                    console.log('FreebetBonusGroups error:', error);
                });

            if (response && response.isSuccess) {
                let bonusData = {}
                for (let bonus of response.result) {
                    if (typeof bonusData[bonus.bonusGroupId] === 'undefined') {
                        bonusData[bonus.bonusGroupId] = [];
                    }
                    bonusData[bonus.bonusGroupId].push(bonus);
                }
                bffBonus = bonusData;
            } // end of 200
            if (startEndDate[0] && startEndDate[1]) {
                await fetchRequest(
                    ApiPort.AppliedHistory +
                    `startDate=${startEndDate[0]}&endDate=${startEndDate[1]}&`,
                    'GET'
                )
                    .then((res) => {
                        response = res;
                    })
                    .catch((error) => {
                        console.log('AppliedHistory error:', error);
                    });

                if (response && response.isSuccess) {
                    //按申請時間 遠->近 排序
                    if (response && response.result && response.result.length > 0) {
                        response.result.sort((a,b) => a.appliedDate > b.appliedDate ? 1 : (a.appliedDate == b.appliedDate ? 0 : -1))
                    }

                    let historyData = {};
                    for (let bonus of response.result) {
                        historyData[bonus.bonusRuleId] = bonus;
                    }
                    bffHistories = historyData;
                } // end of 200
            }
        }
    }

    let rows = [];

    for (let i = 0; i < cmsRowsData.length; i++) {
        let dataRow = cmsRowsData[i];
        let shouldFilterBonus = false; // default
        if (dataRow.visibility == 'public') {
            shouldFilterBonus = false;
        } else {
            if (IS_LOGIN_MEMBER) {
                if (
                    dataRow.visibility == 'member' &&
                    dataRow.memberLevel == 'eligible'
                ) {
                    let isHideForFrontend =
                        !bffBonus[dataRow.bonus_id] && !bffHistories[dataRow.bonus_id];
                    if (isHideForFrontend) {
                        shouldFilterBonus = true;
                    }
                } else if (promotionType == 'daily') {
                    if (dataRow.memberLevel && dataRow.memberLevel == 'predefined') {
                        if (!bffBonus[dataRow.bonus_id]?.isPredefinedMember) {
                            shouldFilterBonus = true;
                        }
                    }
                }
            } else {
                if (dataRow.visibility != 'public') {
                    shouldFilterBonus = true;
                }
            }
        }

        if (shouldFilterBonus) {
            continue;
        }

        let row = {
            promoTitle: dataRow.promoTitle,
            promoImage: dataRow.promoImage,
            promoId: dataRow.promoId,
            isSticky: dataRow.isSticky == 1,
            parentTid: dataRow.rootParentTid,
            parentName: dataRow.rootParentName,
            promotionType: { bonusbutton: 'Bonus', applyform: 'Manual' }[
                dataRow.promotion_type
                ],
            actionType: {
                '-1': 'NO_ACTION',
                1: 'FUND_IN',
                2: 'APPLY_FORM',
                3: 'SOS',
                4: 'LIVECHAT',
                5: 'DEPOSIT_PAGE_ONLY'
            }[dataRow.action_type],
            category: dataRow.category,
            labels: dataRow.labels,
            eligibilityOverride: dataRow.eligibilityOverride,
            visibility: dataRow.visibility || '',
            memberLevel: dataRow.memberLevel || '',
            startDate: dataRow.startDate,
            endDate: dataRow.endDate,
            bonusData: bffBonus[dataRow.bonus_id], // BFF
            history: bffHistories[dataRow.bonus_id] // BFF
        };
        rows.push(row);
    }
    return rows;
}

export async function PromotionDetail(params) {
    let IS_LOGIN_MEMBER = JSON.parse(localStorage.getItem('memberToken'));
    let { id, jumpfrom } = params;
    let row = [];
    //API不再支援jumpfrom參數
    await fetchRequest(ApiPort.CMSPromotionDetail + `id=${id}`, 'GET')
        .then((res) => {
            row = res;
        })
        .catch((error) => {
            console.log('CMSPromotionDetailOrList error:', error);
        });

    console.log('CMSPromotionDetail: ', row);

    let isExistPromoData = row && row.hasOwnProperty('promotionMainType');
    // console.log('isExistPromoData===', isExistPromoData);

    //從banner跳轉的，額外拿bonusData和History(因為不是從promolist跳的，沒有promolist資料)
    if (isExistPromoData) {
        let bffBonus = {};
        let qs = params; // querystring object here from browser url
        if (qs.jumpfrom === 'BANNER') {
            // append .bonusData into row

            const parentsName = row.promotionMainType;

            console.log('parentsName: ', parentsName);
            if (parentsName == 'General') {
                const BONUS_TRANSACTION_TYPES = ['Deposit', 'Transfer'];
                let transactionTypes = BONUS_TRANSACTION_TYPES;

                let bffResponse = [];
                // start of (var type_ of transactionTypes)
                let bonusData = {}; //跑for迴圈所以放外層
                for (let type_ of transactionTypes) {
                    await fetchRequest(
                        ApiPort.GETBonusListAPI + `transactionType=${type_}&`,
                        'GET'
                    )
                        .then((res) => {
                            bffResponse = res;
                        })
                        .catch((error) => {
                            console.log('GETBonusListAPII error:', error);
                        });

                    //console.log('bffResponse :', bffResponse);

                    if (bffResponse && bffResponse.isSuccess) {
                        let data = bffResponse.result;

                        for (let i = 0; i < data.length; i++) {
                            let bonus = data[i];
                            bonusData[bonus.id] = bonus;
                        }
                    }
                } // end of (var type_ of transactionTypes)
                bffBonus = bonusData;
            } else if (parentsName == 'Daily Deal') {
                let bffResponse = [];
                await fetchRequest(ApiPort.GETDailyDeals, 'GET')
                    .then((res) => {
                        bffResponse = res;
                    })
                    .catch((error) => {
                        console.log('GETDailyDeals error:', error);
                    });

                let bonusData = {};
                if (bffResponse && bffResponse.isSuccess) {
                    let data = bffResponse.result;
                    for (let i = 0; i < data.length; i++) {
                        let bonus = data[i];
                        bonusData[bonus.bonusId] = bonus;
                    }
                }
                bffBonus = bonusData;
            } else if (parentsName == 'Free Bets') {
                let bffResponse = [];

                await fetchRequest(ApiPort.FreebetBonusGroups, 'GET')
                    .then((res) => {
                        bffResponse = res;
                    })
                    .catch((error) => {
                        console.log('FreebetBonusGroups error:', error);
                    });

                let bonusData = {};
                if (bffResponse && bffResponse.isSuccess) {
                    let data = bffResponse.result;
                    for (let i = 0; i < data.length; i++) {
                        let bonus = data[i];
                        if (!bonusData[bonus.bonusGroupId]) {
                            bonusData[bonus.bonusGroupId] = [bonus]; // initial
                        } else {
                            bonusData[bonus.bonusGroupId].push(bonus);
                        }
                    }
                }
                bffBonus = bonusData;
            } else if (parentsName == 'Rebate') { //應該是用不到?
                const dateRange = row.dateRange.split(' - '); // ['10/07/2021', '16:34', '11/01/2022', '15:10']

                let sdate = dateRange[0].split('/'); // ['10', '07', '2021']
                let sortSdate = sdate.pop();
                sdate.unshift(sortSdate);
                let startDate = sdate.join('-'); // '2021-10-07'

                let edate = dateRange[2].split('/');
                let sortEdate = edate.pop();
                edate.unshift(sortEdate);
                let endDate = edate.join('-');

                let response = [];
                let data = [];

                if (IS_LOGIN_MEMBER) {

                    if (startDate == endDate) {
                        await fetchRequest(ApiPort.RebateRunningDetails, 'GET')
                          .then((res) => {
                              response = res;
                              data = res.result;
                          })
                          .catch((error) => {
                              console.log('RebateRunningDetails error:', error);
                          });
                    } else {
                        await fetchRequest(
                          ApiPort.RebateHistories + `fromDate=${startDate}&toDate=${endDate}&`,
                          'GET'
                        )
                          .then((res) => {
                              response = res;
                              data = res.result;
                          })
                          .catch((error) => {
                              console.log('RebateHistories error:', error);
                          });
                    }
                    if (data) {
                        bffBonus = data;
                    }
                }
                //console.log('Rebate bffBonus :', bffBonus);
            }
            row.bonusData = bffBonus[row.bonusId];
        }
    }

    //daily deal和rebate用不到下面的(補拿history)

    // starting cloning PHP setBFFBonus function logic
    let DateRange = row.dateRange;
    let Date = DateRange.split('-');
    let Date0 = Date[0].trim().split('/');
    let StartDate = [Date0[2], Date0[0], Date0[1]].join('-');
    let Date2 = Date[2].trim().split('/');
    let EndDate = [Date2[2], Date2[0], Date2[1]].join('-');
    if ( IS_LOGIN_MEMBER ) {
        let resp;

        await fetchRequest(
            ApiPort.AppliedHistory + `startDate=${StartDate}&endDate=${EndDate}&`,
            'GET'
        )
            .then((res) => {
                resp = res;
            })
            .catch((error) => {
                console.log('AppliedHistory error: ', error);
            });

        // console.log('resp :', resp);

        if (resp && resp.isSuccess) {
            //按申請時間 遠->近 排序
            if (resp && resp.result && resp.result.length > 0) {
                resp.result.sort((a,b) => a.appliedDate > b.appliedDate ? 1 : (a.appliedDate == b.appliedDate ? 0 : -1))
            }

            let historyData = {};
            for (let bonus of resp.result) {
                historyData[bonus.bonusRuleId] = bonus;
            }
            row.history = historyData[row.bonusId];
        }
    }
    return row;
}

export async function GetAppliedHistory(params) {
    let IS_LOGIN_MEMBER = JSON.parse(localStorage.getItem('memberToken'));
    if( !IS_LOGIN_MEMBER ) {
        return {
            isSuccess:true,
            result:[]
        }
    }
    // startDate && endDate = '2022-01-01'
    const { startDate, endDate } = params;
    function ksort(obj) {
        const keys = Object.keys(obj).sort(),
            sortedObj = {};
        for (let i in keys) {
            sortedObj[keys[i]] = obj[keys[i]];
        }
        return sortedObj;
    }

    let rows = [];
    let response;
    let bonusResponses = {};
    await fetchRequest(
        ApiPort.AppliedHistory + `startDate=${startDate}&endDate=${endDate}&`,
        'GET'
    )
        .then((res) => {
            response = res;
        })
        .catch((error) => {
            console.log('AppliedHistory error: ', error);
        });

    //按申請時間 遠->近 排序
    if (response && response.result && response.result.length > 0) {
        response.result.sort((a,b) => a.appliedDate > b.appliedDate ? 1 : (a.appliedDate == b.appliedDate ? 0 : -1))
    }

    console.log('BFF - response: ', response);

    if (response && response.isSuccess) {
        const bonusIdArr = response.result.map((v) => v.bonusRuleId);
        //去重複
        let unique_bonusIdArr = bonusIdArr.filter((item, index) => bonusIdArr.indexOf(item) === index);
        let cmsRes = {success: false, data: []};
        if (unique_bonusIdArr && unique_bonusIdArr.length > 0) {
            //分頁查詢,上限100
            const pageSize = 90; //取少一點
            const maxPageNo = Math.ceil(unique_bonusIdArr.length / pageSize);
            for (let currentPageNo = 1; currentPageNo <= maxPageNo; currentPageNo++) {
                const startIndex = (currentPageNo - 1) * pageSize;
                const endIndex = Math.min(startIndex + pageSize, unique_bonusIdArr.length);
                const currentIdsArr = unique_bonusIdArr.slice(startIndex, endIndex);
                const currentIdsString = currentIdsArr.join(',');

                let thisTmpResult = {success: false, data: []};
                await fetchRequest(
                  ApiPort.CMSAppliedHistory + `bonusids/${currentIdsString}`,
                  'GET'
                )
                  .then((res) => {
                      thisTmpResult = res;
                  })
                  .catch((error) => {
                      console.log('AppliedHistory error: ', error);
                  });

                if (thisTmpResult && thisTmpResult.success && Array.isArray(thisTmpResult.data)) {
                    cmsRes.success = true;
                    cmsRes.data = cmsRes.data.concat(thisTmpResult.data);
                }
            }

        }

        console.log('CMS - cmsRes: ', cmsRes);

        if (cmsRes && cmsRes.success && cmsRes.data) {
            let cmsResData = cmsRes.data;
            let null_index = 1;
            for (let key = 0; key < response.result.length; key++) {
                let reuslt = response.result[key];
                let _nid = '';
                let _title = '';
                let _category = '';
                let _type = '';

                for (let j = 0; j < cmsResData.length; j++) {
                    const thisPromoData = cmsResData[j];
                    if (thisPromoData.bonus_id_val == reuslt.bonusRuleId) {
                        _nid = thisPromoData.nid;
                        _title = thisPromoData.title;
                        _category = thisPromoData.category;
                        _type = thisPromoData.promotion_type;
                        break;
                    }
                }
                response.result[key].promotionId = _nid;
                response.result[key].promotionTitle = _title;
                response.result[key].promotionCategory = _category;
                response.result[key].promotionType = _type;
                if (!_nid) {
                    _nid = 'null' + null_index++;
                }
                bonusResponses[_nid] = response.result[key];
            }
        }
    }

    // console.log('cmsApi bonusResponses : ', bonusResponses);

    await fetchRequest(
        ApiPort.MemberPromoHistories + `fromDate=${startDate}&toDate=${endDate}&`
    )
        .then((res) => {
            response = res;
        })
        .catch((error) => {
            console.log('MemberPromoHistories error: ', error);
        });

    // console.log('MemberPromoHistories response :', response);

    let manualResponses = {};
    let promotionInfos = {};
    if (response && response.isSuccess) {
        for (let i = 0; i < response.result.length; i++) {
            let data = response.result;

            if (manualResponses[data[i].promoId]) {
                let manualSids = data[i].promoId + '_' + i;
                manualResponses[manualSids] = data[i];
            } else {
                manualResponses[data[i].promoId] = data[i];
            }
        }

        console.log('manualResponses :', manualResponses);
        const manualIdArr = response.result.map((v) => v.promoId);
        //去重複
        let unique_manualIdArr = manualIdArr.filter((item, index) => manualIdArr.indexOf(item) === index);
        let cmsRes = {success: false, data: []};
        if (unique_manualIdArr && unique_manualIdArr.length > 0) {
            //分頁查詢,上限100
            const pageSize = 90; //取少一點
            const maxPageNo = Math.ceil(unique_manualIdArr.length / pageSize);
            for (let currentPageNo = 1; currentPageNo <= maxPageNo; currentPageNo++) {
                const startIndex = (currentPageNo - 1) * pageSize;
                const endIndex = Math.min(startIndex + pageSize, unique_manualIdArr.length);
                const currentIdsArr = unique_manualIdArr.slice(startIndex, endIndex);
                const currentIdsString = currentIdsArr.join(',');

                let thisTmpResult = {success: false, data: []};
                await fetchRequest(
                  ApiPort.CMSAppliedHistory + `ids/${currentIdsString}`,
                  'GET'
                )
                  .then((res) => {
                      thisTmpResult = res;
                  })
                  .catch((error) => {
                      console.log('CMSAppliedHistory error: ', error);
                  });

                if (thisTmpResult && thisTmpResult.success && Array.isArray(thisTmpResult.data)) {
                    cmsRes.success = true;
                    cmsRes.data = cmsRes.data.concat(thisTmpResult.data);
                }
            }
        }
        // console.log('CMSAppliedHistory cmsRes', cmsRes);

        if (cmsRes && cmsRes.success && cmsRes.data) {
            let data = cmsRes.data;
            for (let i = 0; i < data.length; i++) {
                let promotion = data[i];
                console.log('promotion : ========', promotion);
                promotionInfos[promotion.nid] = promotion;
            }

            // console.log('promotionInfos : ', promotionInfos);

            for (let k in manualResponses) {
                let manualResp = manualResponses[k];
                if (!promotionInfos[manualResp.promoId]) {
                    continue;
                }
                let promoInfo = promotionInfos[manualResp.promoId];

                console.log('promoInfo : ', promoInfo);
                console.log('manualResponses : ', manualResponses);
                manualResponses[k].promotionId = promoInfo.nid;
                manualResponses[k].promotionTitle = promoInfo.title;
                manualResponses[k].promotionStartDate = promoInfo.startDate;
                manualResponses[k].promotionEndDate = promoInfo.endDate;
                manualResponses[k].promotionCategory = promoInfo.category;
                manualResponses[k].promotionType = {
                    bonusbutton: 'Bonus',
                    applyform: 'Manual'
                }[promoInfo.promotionType];
            }
        }
    }

    let sortBonusResponses = ksort(bonusResponses);
    let sortManualResponses = ksort(manualResponses);
    let rowBonus = Object.values(sortBonusResponses);
    let rowManual = Object.values(sortManualResponses);
    rows = rowBonus.concat(rowManual);
    console.log('finaly rowBonus', rowBonus);
    console.log('finaly rowManual', rowManual);
    console.log('finaly rows', rows);
    return rows;
}

export async function GetRebateList(params) {

    let { startDate, endDate } = params;
    let bffData = {};
    if (startDate && endDate) {
        startDate = startDate.split(' ')[0];
        endDate = endDate.split(' ')[0];
        console.log('startDate, endDate :', startDate, endDate);
        if (startDate == endDate) {
            // 获取今天的日期
            const today = moment().format('YYYY-MM-DD');
            // 获取选择的日期
            const selectedDate = moment(startDate).format('YYYY-MM-DD');
            // 判断选择的日期是否等于今天
            if (today == selectedDate) {
                await fetchRequest(ApiPort.RebateRunningDetails, 'GET')
                .then((res) => {
                    bffData = res;
                })
                .catch((error) => {
                    console.log('RebateRunningDetails error:', error);
                });
            } else {
                await fetchRequest(
                    ApiPort.RebateHistories + `fromDate=${startDate}&toDate=${endDate}&`,
                    'GET'
                )
                    .then((res) => {
                        bffData = res;
                    })
                    .catch((error) => {
                        console.log('RebateHistories error:', error);
                    });
            }
        } else {
            await fetchRequest(
                ApiPort.RebateHistories + `fromDate=${startDate}&toDate=${endDate}&`,
                'GET'
            )
                .then((res) => {
                    bffData = res;
                })
                .catch((error) => {
                    console.log('RebateHistories error:', error);
                });
        }
        // 如果沒帶日期，給default data
    } else {
        await fetchRequest(ApiPort.RebateRunningDetails, 'GET')
            .then((res) => {
                bffData = res;
            })
            .catch((error) => {
                console.log('RebateRunningDetails error:', error);
            });
    }

    console.log('bffData: ', bffData);

    if (!bffData || !bffData.result) {
        return { result: [] };
    }

    const rebateIdv1Arr = bffData.result.filter((v) => !v.groupId).map((v) => v.rebateId);
    const rebateIdv2Arr =  bffData.result.filter((v) => v.groupId).map((v) => v.groupId);
    //去重複
    const unique_rebateIdv1Arr = rebateIdv1Arr.filter((item, index) => rebateIdv1Arr.indexOf(item) === index);
    const unique_rebateIdv2Arr = rebateIdv2Arr.filter((item, index) => rebateIdv2Arr.indexOf(item) === index);

    //獲取promo資料by rebate id
    const getRebatePromoDatas = async (idArr, apiUrl) => {
        let CMSresponse = {success: false, data: []};
        if (idArr && idArr.length > 0) {
            //分頁查詢,上限100
            const pageSize = 90; //取少一點
            const maxPageNo = Math.ceil(idArr.length / pageSize);
            for (let currentPageNo = 1; currentPageNo <= maxPageNo; currentPageNo++) {
                const startIndex = (currentPageNo - 1) * pageSize;
                const endIndex = Math.min(startIndex + pageSize, idArr.length);
                const currentIdsArr = idArr.slice(startIndex, endIndex);
                const currentIdsString = currentIdsArr.join(',');

                let thisTmpResult = {success: false, data: []};
                await fetchRequest(apiUrl + currentIdsString, 'GET')
                  .then((res) => {
                      thisTmpResult = res;
                  })
                  .catch((error) => {
                      console.log('CMSRebateHistory error:', apiUrl, error, error?.message);
                  });
                if (thisTmpResult && thisTmpResult.success && Array.isArray(thisTmpResult.data)) {
                    CMSresponse.success = true;
                    CMSresponse.data = CMSresponse.data.concat(thisTmpResult.data);
                }
            }
        }
        console.log('CMSresponse for :',apiUrl, JSON.parse(JSON.stringify(CMSresponse)));
        return CMSresponse;
    }

    const v1RebatePromoDatas = await getRebatePromoDatas(unique_rebateIdv1Arr, ApiPort.CMSRebateHistory);
    const v2RebatePromoDatas = await getRebatePromoDatas(unique_rebateIdv2Arr, ApiPort.CMSRebateHistory + 'v2/');

    // if BFF 200 success
    let rebateDataV1 = {};
    let rebateDataV2 = {};
    const bffDataResult = bffData.result;
    for (let i = 0; i < bffDataResult.length; i++) {
        let rebate = {...bffDataResult[i]};
        let noRebateRecord =
            rebate.totalBetAmount == 0 && rebate.totalGivenAmount == 0;
        if (noRebateRecord) {
            continue;
        }
        if (rebate.groupId) {
            if (!rebateDataV2[rebate.groupId]) {
                rebateDataV2[rebate.groupId] = [];
            }
            rebateDataV2[rebate.groupId].push(rebate);
        } else {
            if (!rebateDataV1[rebate.rebateId]) {
                rebateDataV1[rebate.rebateId] = [];
            }
            rebateDataV1[rebate.rebateId].push(rebate);
        }
    }

    console.log('rebateDatas :', rebateDataV1, rebateDataV2);

    //使用promo + rebate紀錄，組成rebate數據
    const makeRebateDatas = (CMSresponse, rebateData, rows) => {
        if (CMSresponse && CMSresponse.data) {
            for(let bonusId in rebateData) {
                let promoForThisRebate = null;
                for (let i = 0; i < CMSresponse.data?.length; i++) {
                    const thisPromo = CMSresponse.data[i];
                    if (thisPromo?.bonus_id_val == bonusId) {
                        promoForThisRebate = thisPromo;
                    }
                }

                //找不到對應promo就不展示
                if (!promoForThisRebate) {
                    continue;
                }

                let rebateArray = rebateData[bonusId];
                for (let r of rebateArray) {
                    let row = {
                        ...r,
                        promotionId: promoForThisRebate.nid,
                        promotionTitle: promoForThisRebate.title,
                        promotionCategory: promoForThisRebate.category
                    };
                    rows.result.push(row);
                }
            }
        }
    }

    let rows = { result: [] };
    makeRebateDatas(v1RebatePromoDatas,rebateDataV1,rows);
    makeRebateDatas(v2RebatePromoDatas,rebateDataV2,rows);

    console.log('RebateList rows : ', rows);
    return rows;
}