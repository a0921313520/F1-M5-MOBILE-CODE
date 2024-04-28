import { useDispatch } from "react-redux";
import Modal from "@/components/View/Modal";
import BackBar from '@/components/Header/BackBar';
import Button from '@/components/View/Button';
import ReactIMG from '@/components/View/ReactIMG';
import Item from '@/components/View/FormItem';
import Input from '@/components/View/Input';
import { createForm } from "rc-form";
import { realyNameReg, pickNotFitRealNameThaiReg } from '@/lib/SportReg';
import { setMemberInfo } from '@/api/userinfo';
import Toast from '@/components/View/Toast';
import Router from 'next/router';
import { ACTION_User_getDetails } from '@/lib/redux/actions/UserInfoAction';

function RealNameVerify(props) {
    const { visible, onClose, isPhoneVerified, triggerFor } = props
    const { getFieldError, getFieldDecorator, getValueFromEvent, getFieldValue,setFieldsValue } = props.form;
    const dispatch = useDispatch();

    function setRealName() {
        const realName = getFieldValue("realName").trim()
        // const [first, ...last] = realName.split(" ")

        if (!realName) {
            Toast.error("Lỗi định dạng, tên thật cần có từ 2-50 ký tự chữ"); //請輸入姓氏
            return
        }

        const params = {
            key: 'FirstName',
            value1: realName,
        };

        Toast.loading('Đang gửi đi, xin vui lòng chờ...');
        setMemberInfo(params, (res) => {
            Toast.destroy();
            if (res.result.isSuccess == true) {
                Toast.success({ content: "Xác Thực Thành Công", type: "loading" }, 3);
                dispatch(ACTION_User_getDetails());
                setTimeout(() => {
                    Toast.destroy();
                  }, 3000)
                if (!isPhoneVerified && triggerFor !== "deposit") {
                    if (triggerFor === "bankAccountManagement") {
                        Router.push(`/me/bank-account`)
                    } else {
                        Router.push(`/me/account-info/Phone?from=/${triggerFor !== "refereeTask" ? "referrer-activity" : ""}`)
                    }
                } else {
                    onClose();
                }
            } else {
                Modal.info({
                    className: 'Send-Modal',
                    icon: null,
                    centered: true,
                    type: 'confirm',
                    btnBlock: false,
                    btnReverse: false,
                    content: (
                        <React.Fragment>
                            <center>
                                <ReactIMG src="/svg/warn.svg" />
                            </center>
                            <div className="importantModal-wrap" style={{ marginTop: '20px' }}>
                            Rất tiếc, chúng tôi không thể gửi xác minh của bạn vào lúc này，<br />Vui lòng thử lại sau hoặc liên hệ với dịch vụ khách hàng trực tuyến。
                            </div>
                        </React.Fragment>
                    ),
                    okText: 'Tôi Hiểu'
                });
            }
        });

    }
    const isSubmittable = getFieldValue("realName") && !getFieldError("realName")
    return (
        <Modal
            wrapClassName="verifyModal"
            className="Fullscreen-Modal"
            visible={visible}
            title={
                <BackBar
                    key="main-bar-header"
                    title="Xác Thực Họ Tên Thật"
                    backEvent={() => {
                        onClose && onClose();
                        if (triggerFor === "deposit") {
                            history.go(-1)
                        }
                    }}
                    hasServer={true}
                />
            }
        >
            <ReactIMG src="/img/deposit/YZ.svg" />
            <div className={`verify realName ${triggerFor ? "skippable" : ""}`}>
                <p className="description">
                    {`Vui lòng điền tên thật của bạn trùng với tên trong \ntài khoản ngân hàng của bạn để tránh giao dịch \ngửi /rút tiền không được xử lý`}
                </p>
                <div className="verify_box">
                    <div className="input_set">
                        <Item label={`Họ Tên Thật`} errorMessage={getFieldError('realName')}>
                            {getFieldDecorator('realName', {
                                rules: [
                                    { required: true, message: 'Họ Tên Thật không được để trống' },
                                    {
                                        validator: (rule, value, callback) => {
                                            setFieldsValue({
                                                realName: value.replace(/\s{2,}/g," ")
                                            })
                                            if (value && !realyNameReg.test(value)) {
                                                callback('Lỗi định dạng, tên thật cần có từ 2-50 ký tự chữ');
                                            }
                                            callback();
                                        }
                                    }
                                ]
                            })(
                                <Input
                                    placeholder="Vui lòng điền tên thật của bạn"
                                    type="text"
                                    minLength={2}
                                    maxLength={50}
                                />
                            )}
                        </Item>
                    </div>
                </div>
                <Button
                    disabled={!isSubmittable}
                    onClick={setRealName}
                    className={'submit-btn'}
                >
                    Xác Thực Ngay
                </Button>
                {triggerFor && (
                    <p
                        className="verifyLater"
                        onClick={() => {
                            if (triggerFor === "deposit") {
                                history.go(-1)
                            } else {
                                onClose()
                            }
                        }}
                    >
                        Xác Thực Sau
                    </p>
                )
                }
            </div>
        </Modal>
    )
}

export default createForm({ filedNameProp: "real_name_verify" })(RealNameVerify);