/*
 * @Author: Alan
 * @Date: 2022-05-11 18:17:51
 * @LastEditors: Alan
 * @LastEditTime: 2022-06-28 00:46:02
 * @Description: 其他账户
 * @FilePath: \Mobile\src\components\Deposit\depositComponents\OtherAccount\index.js
 */
import React from 'react';
import Input from "@/components/View/Input";
import Item from "./../Item";
import { sixLastNumReg } from "@/lib/SportReg";
import Collapse, { Panel } from "rc-collapse";

class MoneyInput extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        const {
            getFieldDecorator,
            getFieldError,
            setOtherAccountStatus
        } = this.props;
        return (
            <div className="wrong-acc-wrap">
                <Collapse accordion={true} onChange={setOtherAccountStatus}>
                    <Panel
                        header="糟了! 我存到旧账号了"
                        headerClass="my-header-class"
                    >
                        <Item
                            className="other-account"
                            errorMessage={getFieldError("lastSixNum")}
                        >
                            {getFieldDecorator("lastSixNum", {
                                rules: [
                                    // { required: true, message: '请输入最后6位号码！' },
                                    {
                                        validator: (rule, value, callback) => {
                                            // const { form } = this.props;
                                            if (
                                                value &&
                                                !sixLastNumReg.test(value)
                                            ) {
                                                callback(
                                                    "请输入正确的6位号码！"
                                                );
                                            }
                                            callback();
                                        },
                                    },
                                ],
                            })(
                                <Input
                                    className="small-radius"
                                    autoComplete="off"
                                    maxLength={6}
                                    placeholder="请输入旧账号后6位数字"
                                    inputMode="numeric"
                                />
                            )}
                        </Item>
                    </Panel>
                </Collapse>
            </div>
        );
    }
}
export default MoneyInput;
