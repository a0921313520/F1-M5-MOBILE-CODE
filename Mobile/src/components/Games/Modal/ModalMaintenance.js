import Modal from "@/components/View/Modal";
import Button from "@/components/View/Button";

function ModalMaintenance(props){
  const {visible, onOk} = props;
  return (
    <Modal
      visible={visible}
      title="แจ้งเตือน"
      className="commonModal gameMaintenanceModal"
      closable={true}
      onCancel={onOk}
    >
       <p data-CN="您打開的遊戲正在進行維護，請稍後在試，若有欲查詢的訊息請聯繫客服">
        เกมที่คุณเปิดอยู่ระหว่างปิดปรับปรุง กรุณาลองอีกครั้งภายหลัง<br/>
        หากมีข้อมูลต้องการสอบถาม กรุณาติดต่อฝ่ายบริการลูกค้า
      </p>
      <div className="buttonBox">
        <Button 
          data-CN="確定" 
          onClick={()=>{
            onOk();
          }}
        >
          ตกลง
        </Button>
      </div>
    </Modal>
  )
}
export default ModalMaintenance;
