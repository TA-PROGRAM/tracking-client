// project-audit (สถานะโครงการ) and project-approve (ขออนุมัติโครงการ) history screens
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "primereact/button";
import { Page, Card, Btn, FormBuilder, useForm, alertSuccess, confirmAction, RowMenu } from "../../components/kit";
import { BackButton, ProjectInfoPanel, StepRibbon, SimpleTable, Modal } from "../shared";
import db from "../../mock/db";
import { useAuth } from "../../role-access/authContext";
import { thDateShort } from "../../utils/format";

const CFG = {
  audit: {
    title: "บันทึกสถานะโครงการ",
    step: 2,
    section: "สถานะโครงการ",
    table: "project_status",
    numb: "status_numb",
    typeTable: "project_status_type",
    typeField: "status_id",
    dateField: "status_date",
    remarkField: "status_remark",
    projectField: "project_status",
    selectLabel: "สถานะโครงการ",
  },
  approve: {
    title: "บันทึกขออนุมัติโครงการ",
    step: 3,
    section: "ขออนุมัติโครงการ",
    table: "project_approve_hist",
    numb: "approve_numb",
    typeTable: "project_approve_type",
    typeField: "approve_id",
    dateField: "approve_date",
    remarkField: "approve_remark",
    projectField: "project_approve",
    selectLabel: "ขออนุมัติ",
  },
};

const History = ({ kind }) => {
  const c = CFG[kind];
  const { id } = useParams();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [, force] = useState(0);
  const p = db.getSync("project", id);
  const rows = db.findSync(c.table, { project_id: Number(id), flag: 1 }).sort((a, b) => a[c.numb] - b[c.numb]);
  const nextNumb = rows.reduce((m, r) => Math.max(m, r[c.numb]), 0) + 1;

  const schema = [
    { name: "numb", label: "ครั้งที่", type: "static", col: 3, render: () => nextNumb },
    { name: "date", label: "วันที่ดำเนินการ", type: "date", col: 4, required: true, msg: "กรุณาระบุวันที่ดำเนินการ" },
    { name: "type", label: c.selectLabel, type: "select", col: 5, required: true, msg: "กรุณาระบุการดำเนินการ", source: { table: c.typeTable } },
    { name: "remark", label: "บันทึกเพิ่มเติม", type: "textarea", col: 12 },
  ];
  const { values, setValues, errors, check } = useForm(schema);

  const save = async () => {
    if (!check()) return;
    await db.insert(c.table, { project_id: Number(id), [c.numb]: nextNumb, [c.typeField]: values.type, [c.dateField]: values.date, [c.remarkField]: values.remark || "", flag: 1, add_users: user.id });
    await db.update("project", id, { [c.projectField]: values.type });
    setOpen(false);
    setValues({});
    force((x) => x + 1);
    alertSuccess("บันทึกสำเร็จ");
  };

  const del = async (r) => {
    if (!(await confirmAction("แน่ใจนะ?", "ต้องการยกเลิกรายการ", "ใช่, ต้องการยกเลิกรายการ !", "#dc2626"))) return;
    await db.update(c.table, r.id, { flag: 0, edit_users: user.id });
    const last = db.findSync(c.table, { project_id: Number(id), flag: 1 }).sort((a, b) => b.id - a.id)[0];
    await db.update("project", id, { [c.projectField]: last ? last[c.typeField] : null });
    force((x) => x + 1);
  };

  return (
    <Page title={c.title} actions={<><StepRibbon n={c.step} tone="blue" /><BackButton to="/project" /></>}>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ProjectInfoPanel p={p} />
        <Card title={c.section} icon="pi pi-list" actions={<Btn tone="info" icon="pi pi-plus" label={c.title} onClick={() => setOpen(true)} />}>
          <SimpleTable
            head={["ลำดับ", "วันที่", "ดำเนินการ", "เพิ่มเติม", "จัดการ"]}
            rows={rows.map((r) => [r[c.numb], thDateShort(r[c.dateField]), db.getSync(c.typeTable, r[c.typeField])?.name, r[c.remarkField] || "-", <RowMenu key="m" items={[{ label: "ยกเลิกรายการ", icon: "pi pi-trash", command: () => del(r) }]} />])}
          />
        </Card>
      </div>
      <Modal visible={open} onHide={() => setOpen(false)} title={c.title} footer={<Button size="small" outlined severity="danger" icon="pi pi-times-circle" label="ปิด" onClick={() => setOpen(false)} />}>
        <FormBuilder fields={schema} values={values} setValues={setValues} errors={errors} />
        <div className="mt-4">
          <Btn tone="success" icon="pi pi-save" label="บันทึก" onClick={save} />
        </div>
      </Modal>
    </Page>
  );
};

export default History;
