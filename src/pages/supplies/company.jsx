// company_main — เจ้าหนี้/ผู้ชนะ
import React, { useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import { Page, Card, DataList, Btn, FormBuilder, useForm, useTable, alertSuccess, Badge } from "../../components/kit";
import { BackButton } from "../shared";
import { IconAction, name } from "../shared/workflow";
import db from "../../mock/db";
import { useAuth } from "../../role-access/authContext";

export const COMPANY_SCHEMA = [
  { name: "type", label: "ประเภท", type: "select", col: 3, required: true, msg: "กรุณาระบุประเภทบุคคล", source: { table: "company_type" }, default: 1 },
  { name: "name", label: "ชื่อ-สกุล / ชื่อบริษัท", type: "text", col: 9, required: true, msg: "กรุณาระบุชื่อ" },
  { name: "code", label: "เลขบัตรประชาชน/เลขผู้เสียภาษี", type: "text", col: 4, maxLength: 13 },
  { name: "contact", label: "ผู้ติดต่อ", type: "text", col: 4 },
  { name: "telephone", label: "โทรศัพท์", type: "text", col: 4 },
  { name: "address", label: "ที่อยู่", type: "textarea", col: 12 },
];

export const CompanyList = () => {
  const history = useHistory();
  const { user } = useAuth();
  const { data, loading } = useTable("company", { flag: 1, org_id: user.org_id });
  return (
    <Page title="เจ้าหนี้/ผู้ชนะ" actions={<Btn tone="success" icon="pi pi-plus-circle" label="เจ้าหนี้/ผู้ชนะ" onClick={() => history.push("/supplies/company/add")} />}>
      <DataList
        loading={loading}
        value={[...data].sort((a, b) => b.id - a.id)}
        onRowClick={(c) => history.push(`/supplies/company/edit/${c.id}`)}
        columns={[
          { header: "ลำดับ", type: "index" },
          { header: "ประเภท", body: (c) => name("company_type", c.type) },
          { field: "name", header: "ชื่อสกุล/ชื่อหน่วยงาน" },
          { field: "code", header: "เลขบัตร/เลขผู้เสียภาษี" },
          { field: "contact", header: "ผู้ติดต่อ" },
          { field: "telephone", header: "โทรศัพท์" },
          { field: "address", header: "ที่อยู่", style: { minWidth: "14rem" } },
          { header: "สถานะ", body: (c) => (String(c.flag) === "1" ? <Badge color="green">เปิดใช้งาน</Badge> : <Badge color="red">ปิดใช้งาน</Badge>) },
          { header: "จัดการ", body: (c) => <IconAction icon="pi pi-pencil" title="แก้ไข" onClick={() => history.push(`/supplies/company/edit/${c.id}`)} /> },
        ]}
      />
    </Page>
  );
};

export const CompanyForm = ({ embedded, onSaved }) => {
  const { cid } = useParams();
  const editId = embedded ? null : cid;
  const history = useHistory();
  const { user } = useAuth();
  const { values, setValues, errors, check } = useForm(COMPANY_SCHEMA);
  useEffect(() => {
    if (editId) setValues(db.getSync("company", editId) || {});
  }, [editId, setValues]);

  const save = async () => {
    if (!check()) return;
    let row;
    if (editId) row = (await db.update("company", editId, { ...values, edit_users: user.id })).data;
    else row = (await db.insert("company", { ...values, org_id: user.org_id, flag: 1, add_users: user.id })).data;
    await alertSuccess("บันทึกสำเร็จ");
    if (onSaved) onSaved(row);
    else history.replace("/supplies/company");
  };

  const form = (
    <>
      <FormBuilder fields={COMPANY_SCHEMA} values={values} setValues={setValues} errors={errors} />
      <div className="mt-5 flex gap-2">
        <Btn icon="pi pi-save" label="บันทึก" onClick={save} />
        {!embedded && <Btn tone="warning" icon="pi pi-chevron-left" label="ย้อนกลับ" onClick={() => history.goBack()} />}
      </div>
    </>
  );
  if (embedded) return form;
  return (
    <Page title={`${editId ? "แก้ไข" : "เพิ่ม"}ผู้ชนะ`} breadcrumb={["จัดหาพัสดุ", "เจ้าหนี้/ผู้ชนะ"]} actions={<BackButton to="/supplies/company" />}>
      <Card>{form}</Card>
    </Page>
  );
};
