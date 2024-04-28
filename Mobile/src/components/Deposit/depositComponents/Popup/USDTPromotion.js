import React from "react";
import Modal from "@/components/View/Modal";
import Button from "@/components/View/Button";
import ReactIMG from '@/components/View/ReactIMG';

export default function USDTPromotion(props) {
const { visible, onCancel } = props;
  return (
    <Modal
      className="USDT-modal"
      visible={visible}
      onCancel={onCancel}
      closable={false}
    >
      <ReactIMG src="/img/deposit/TRC-popup.png" />
      <Button size="large" type="primary" onClick={onCancel}>
        知道了
      </Button>
    </Modal>
  );
}
