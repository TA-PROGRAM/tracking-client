import React from "react";
import { Button, InputText, Dialog, Dropdown } from "primereact";

const InsertModal = ({ visible, onHide }) => {
  const footer = (
    <div>
      <Button label="ยกเลิก" icon="pi pi-times" onClick={onHide} className="p-button-text" />
      <Button label="ตกลง" icon="pi pi-check" autoFocus onClick={onHide}/>
    </div>
  );

  return (
    <Dialog header="เพิ่มกล้อง" visible={visible} style={{ width: "50vw" }} onHide={onHide} footer={footer}>
      <div className="grid grid-cols-2 gap-y-1 gap-x-4">
        <div >
          <div>หมายเลขกล้อง</div>
          <InputText className="w-full" placeholder="กรุณาระบุหมายเลขกล้อง" />
        </div>
        <div >
          <div>ชื่อกล้อง</div>
          <InputText className="w-full" placeholder="กรุณาระบุชื่อกล้อง" />
        </div>

        <div className="col-span-2">
          <div>
            <div>โครงการ</div>
            <InputText className="w-full" placeholder="กรุณาระบุโครงการ" />
          </div>
        </div>
        <div>
          <div>คู่สัญญา</div>
          <InputText className="w-full" placeholder="กรุณาระบุคู่สัญญา" />
        </div>
        <div>
          <div>งบประมาณ</div>
          <InputText className="w-full" placeholder="กรุณาระบุงบประมาณ" />
        </div>
        <div>
          <div>ละติจูด</div>
          <InputText className="w-full" placeholder="กรุณาระบุละติจูด" />
        </div>
        <div>
          <div>ลองจิจูด</div>
          <InputText className="w-full" placeholder="กรุณาระบุลองจิจูด" />
        </div>
      </div>
    </Dialog>
  );
};

export default InsertModal;
