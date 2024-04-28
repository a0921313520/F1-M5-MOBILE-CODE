/*
 * @Author: Alan
 * @Date: 2021-03-12 21:29:20
 * @LastEditors: Alan
 * @LastEditTime: 2022-12-29 13:03:03
 * @Description: 添加寄送地址
 * @FilePath: \Mobile\pages\daily-gift\Address\index.js
 */

import React from 'react';
import Input from '@/components/View/Input';
import Toast from '@/components/View/Toast';
import Router from 'next/router';
import {ShippingAddress, DailyDeals,EditShippingAddress} from '@/api/promotions';
import Modal from '@/components/View/Modal';
import Button from '@/components/View/Button';
import Layout from '@/components/Layout';
import {withRouter} from 'next/router';
import Flexbox from '@/components/View/Flexbox';
import {ReactSVG} from '@/components/View/ReactSVG';
import Item from '@/components/View/FormItem';
import {IoIosAddCircleOutline} from "react-icons/io";
import { getStaticPropsFromStrapiSEOSetting } from '@/lib/seo';

export async function getStaticProps() {
	return await getStaticPropsFromStrapiSEOSetting('/me/shipment-address'); //參數帶本頁的路徑
}
class PromotionsAddress extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            Address: [],
            Remark: '',
            Active: -1,
            Successmsg: '恭喜!您申请成功',
            ShowFailPopup: false,
            ShowSuccessPopup: false,
            Failmsg: '您暂时不符合此好礼资格，建议马上存款。'
        };
    }

    componentDidMount() {
        const {id} = this.props.router.query;
        let Addressdata = JSON.parse(localStorage.getItem('Address'));
        if (Addressdata && Addressdata != '') {
            let havedefault = Addressdata.find((item) => item.defaultAddress == true);
            if (havedefault) {
                this.setState({
                    Active: havedefault.recordNo
                });
            } else {
                this.setState({
                    Active: Addressdata[0].recordNo
                });
            }
            this.setState({
                Address: Addressdata
            });
        }
        this.setState({
            promoid: id == 'undefined' ? '' : id
        });

        this.GetShippingAddress();
    }

    /**
     * @description: 获取会员的收礼地址列表
     * @return {Array}
     */

    GetShippingAddress = (key) => {
        ShippingAddress((res) => {
            if (res.isSuccess && res.result) {
                let Addressdata = res.result
                this.setState({
                    Address: res.result
                });
                if (Addressdata) {
                    let havedefault = Addressdata.find((item) => item.defaultAddress == true);
                    if (havedefault) {
                        this.setState({
                            Active: havedefault.recordNo
                        });
                    } else {
                        // this.setState({
                        //     Active: Addressdata[0].recordNo
                        // });
                        //不存在默认的地址时，将api返回的的第一个地址设为默认
                        !key &&  this.setDefaultAddress(Addressdata[0])
                    }
                }
                localStorage.setItem('Address', JSON.stringify(res.result));
            }
        });
    };

    /**
     * 默认地址
     * @param {Object} res 
     * 不存在默认的地址时，将api返回的的第一个地址设为默认
     */
    setDefaultAddress =(res={})=> {
        if(res){
            const data = {
                recordNo: res.recordNo||"",
                recipientFirstName: res.firstName||"",
                recipientLastName: "",
                postalCode: res.postalCode||"",
                contactNo: res.cellphoneNo||"",
                email: res.email||"",
                provinceId: res.provinceID||"",
                districtId: res.districtID||"",
                townId: res.townID||"",
                villageId: res.villageID||"",
                houseNumber: res.houseNum||"",
                zone: res.zone||"",
                address: res.address||"",
                defaultAddress: true
            }
            EditShippingAddress(data,(res)=>{
                if(res?.isSuccess){
                    this.GetShippingAddress("break")
                    console.log("🚀 ~ file: index.js:116 ~ PromotionsAddress ~ EditShippingAddress ~ 设置成功:", 设置成功)
                } else {
                    console.log("🚀 ~ file: index.js:116 ~ PromotionsAddress ~ EditShippingAddress ~ 设置失败:", 设置失败)
                }
            })
        }
    }

    /**
     * @description: 申请每日好礼优惠
     * @param {*}
     * @return {Object}
     */

    ApplyDailyDeals = () => {
        Toast.loading();
        let Addressdata =
            this.state.Active == -1
                ? this.state.Address.find((item) => item.defaultAddress == true)
                : this.state.Address.find((item) => item.recordNo == this.state.Active);
        let data = {
            recipientFirstName: Addressdata.firstName,
            recipientLastName: Addressdata.lastName,
            postalCode: Addressdata.postalCode,
            contactNo: Addressdata.cellphoneNo,
            email: Addressdata.email,
            province: Addressdata.provinceName,
            district: Addressdata.districtName,
            town: Addressdata.townName,
            village: Addressdata.villageName,
            houseNumber: Addressdata.houseNum,
            zone: '',
            address: Addressdata.address,
            remark: this.state.Remark,
            bonusRuleId: this.props.router.query.id
        };

        DailyDeals(data, (res) => {
            if (res) {
                Pushgtagdata( 
                    "Promotion_ShipmentAddress", 
                    "Submit Address", 
                    "Promotion_ShipmentAddress_S_Address",
                    false,
                    [{
                        customVariableKey: res.isSuccess ? false :"Promotion_ShipmentAddress_S_Address_ErrorMsg",
                        customVariableValue: res.isSuccess ? false :res.errors[0].description
                    }]

                )
                Toast.destroy();
                if (res.isSuccess) {
                    Router.push('/daily-gift');
                    Toast.success('Gửi Thành Công');
                } else {
                    Toast.error(res.errors[0].description);
                }
            }
        });
    };

    render() {
        const {Address, Remark, Active, promoid, Failmsg, ShowFailPopup, Successmsg, ShowSuccessPopup} = this.state;
        console.log(promoid, 'promoid')
        console.log(Active);
        return (
            <Layout
                title="FUN88乐天堂官网｜2022卡塔尔世界杯最佳投注平台"
                Keywords="乐天堂/FUN88/2022 世界杯/世界杯投注/卡塔尔世界杯/世界杯游戏/世界杯最新赔率/世界杯竞彩/世界杯竞彩足球/足彩世界杯/世界杯足球网/世界杯足球赛/世界杯赌球/世界杯体彩app"
                Description="乐天堂提供2022卡塔尔世界杯最新消息以及多样的世界杯游戏，作为13年资深品牌，安全有保障的品牌，将是你世界杯投注的不二选择。"
                status={2}
                hasServer={true}
                BarTitle={promoid ? "Địa Chỉ Nhận Thưởng" : "Quản Lý Địa Chỉ Nhận Thưởng" }
                seoData={this.props.seoData}
            >
                <div className="DailyGiftAddress">
                    <div className="Notice">Hãy chắc chắn rằng địa chỉ giao hàng này là chính xác để đảm bảo rằng món quà có thể được giao đúng dự kiến
                    </div>
                    {Address &&
                        Address.map((data, index) => {
                            const {
                                firstName,
                                lastName,
                                cellphoneNo,
                                houseNum,
                                provinceName,
                                districtName,
                                townName,
                                address,
                                postalCode,
                                recordNo,
                                defaultAddress
                            } = data;
                            let status = this.state.Active == -1 ? defaultAddress : Active == recordNo;
                            return (
                                <div key={index}>
                                    <Flexbox
                                        className="Addresslist"
                                        key={index}
                                        onClick={() => {
                                            this.setState({
                                                Active: recordNo
                                            });
                                        }}
                                    >
                                        {promoid &&
                                            <Flexbox className="left" alignItems="center">
                                                <div className="cap-list">
                                                    <div className="cap-item">
                                                        <div
                                                            className={status ? `cap-item-circle curr` : 'cap-item-circle'}
                                                        />
                                                    </div>
                                                </div>
                                            </Flexbox>
                                        }

                                        <div className="right" style={{paddingLeft: promoid ? '' : '0.26667rem'}}>
                                            <div style={{fontSize: '0.4rem'}}> 
                                                <span>{lastName + " " +firstName}</span>
                                            </div>
                                            <div style={{color: '#999999'}}>
                                                <span>+84 {cellphoneNo}</span>
                                            </div>
                                            <div style={{color: '#999999', marginTop: '0.2rem'}}>
                                                {address + ', ' + provinceName + ', ' + districtName + ', ' + townName + ', ' + postalCode}
                                            </div>
                                            <ReactSVG
                                                src="/img/svg/edit.svg"
                                                onClick={() => {
                                                    Router.push(
                                                        `shipment-address/Details?id=${this.props.router.query.id}&type=edit&addresskey=${recordNo}`
                                                    );
                                                }}
                                            />
                                            {defaultAddress && <span className="default">
                                                <ReactSVG
                                                    src="/img/svg/done.svg"
                                                />
                                                Mặc Định</span>}
                                        </div>
                                    </Flexbox>
                                </div>
                            );
                        })}
                    {Address.length < 3 &&
                        <Button
                            className="Btn"
                            ghost
                            onClick={() => {
                                if(promoid){
                                    Pushgtagdata( "Promotion_ShipmentAddress", "Go to Add Address", "Promotion_ShipmentAddress_C_AddAddress")
                                }else{
                                    Pushgtagdata( "ShipmentAddress", "Go to Add Address", "ShipmentAddress_C_AddAddress")
                                }
                                Router.push(`shipment-address/Details?id=${this.props.router.query.id}&type=${'add'}`);
                            }}
                        >
                            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                <IoIosAddCircleOutline size={20} style={{marginRight: '0.1rem'}}></IoIosAddCircleOutline>Thêm Địa Chỉ
                            </div>
                        </Button>
                    }

                    {Address.length && promoid ? (
                        <div>
                            <br/>
                            <br/>
                            <Item label={`Ghi Chú`}>
                                <Input
                                    maxLength={100}
                                    size="large"
                                    placeholder=""
                                    value={Remark}
                                    onChange={(e) => {
                                        this.setState({
                                            Remark: e.target.value
                                        });
                                    }}
                                />
                            </Item>
                            <Button
                                className="white Btn skyblueBg"
                                onClick={() => {
                                    if (this.state.Active == -1) {
                                        Toast.error('请选择一条地址');
                                        return;
                                    }
                                    this.ApplyDailyDeals();
                                }}
                            >
                                Gửi
                            </Button>
                        </div> 
                    ): null}

                    {/* ------------------申请失败弹窗----------------- */}
                    <Modal closable={false} className="Proms" title="条件不足" visible={ShowFailPopup}>
                        <p className="txt">{Failmsg}</p>
                        <div className="flex justify-around">
                            <div
                                className="Btn-Common"
                                onClick={() => {
                                    this.setState({
                                        ShowFailPopup: false
                                    });
                                }}
                            >
                                关闭
                            </div>
                            <div
                                className="Btn-Common active"
                                onClick={() => {
                                    //window.location.href = `${window.location.origin}/deposit`;
                                    Router.push('/deposit');
                                }}
                            >
                                存款
                            </div>
                        </div>
                    </Modal>

                    {/* ------------------申请成功弹窗----------------- */}
                    <Modal closable={false} className="Proms" title="申请成功" visible={ShowSuccessPopup}>
                        <p className="txt">{Successmsg}</p>
                        <div className="flex justify-around">
                            <div
                                className="Btn-Common"
                                onClick={() => {
                                    this.setState({
                                        ShowSuccessPopup: false
                                    });
                                }}
                            >
                                关闭
                            </div>
                            <div
                                className="Btn-Common active"
                                onClick={() => {
                                    Router.push('/');
                                }}
                            >
                                立即游戏
                            </div>
                        </div>
                    </Modal>
                </div>
            </Layout>
        );
    }
}

export default withRouter(PromotionsAddress);
