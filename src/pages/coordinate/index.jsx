// ประสานงานขอความช่วยเหลือ
import React, { useEffect, useState } from "react";
import { Route, Switch, useHistory, useParams } from "react-router-dom";
import { Button } from "primereact/button";
import { Page, Card, DataList, Btn, FormBuilder, useForm, useTable, alertSuccess, alertError, confirmAction, RowMenu, Info } from "../../components/kit";
import { BackButton, SimpleTable, Modal } from "../shared";
import { name } from "../shared/workflow";
import db from "../../mock/db";
import { useAuth } from "../../role-access/authContext";
import { userName } from "../../mock/tracking";
import { thDate, thDateShort } from "../../utils/format";

const List = () => {
  const history = useHistory();
  const { user } = useAuth();
  const { data, loading, reload } = useTable("coordinate_main", { flag: 1 });
  const rows = data.filter((r) => Number(user.role_id) === 1 || String(r.org_id) === String(user.org_id)).sort((a, b) => b.id - a.id);
  const del = async (r) => {
    if (!(await confirmAction("แน่ใจนะ?", "ต้องการยกเลิกรายการ", "ใช่, ต้องการยกเลิกรายการ !", "#dc2626"))) return;
    await db.update("coordinate_main", r.id, { flag: 0, edit_users: user.id });
    reload();
  };
  return (
    <Page title="ข้อมูลประสานงานขอความช่วยเหลือ" actions={<Btn tone="success" icon="pi pi-plus-circle" label="เพิ่มข้อมูล" onClick={() => history.push("/coordinate/add")} />}>
      <DataList
        loading={loading}
        value={rows}
        onRowClick={(r) => history.push(`/coordinate/data/${r.id}`)}
        columns={[
          { header: "ลำดับ", type: "index" },
          { field: "service_date", header: "วันที่รับเรื่อง", body: (r) => thDateShort(r.service_date) },
          { field: "service_title", header: "เรื่อง", style: { minWidth: "14rem" } },
          { field: "fname", header: "ผู้ขอความช่วยเหลือ", body: (r) => <div>{name("prename", r.prename).replace("-", "")}{r.fname} {r.lname}<div className="text-xs text-slate-400">โทรศัพท์: {r.telephone}</div></div> },
          { header: "หน่วยงาน", body: (r) => db.getSync("org", r.org_id)?.shortname },
          { header: "บันทึกโดย", body: (r) => <div>{userName(r.add_users)}<div className="text-xs text-slate-400">วันที่บันทึก: {thDate(r.add_date, { time: true })}</div></div> },
          {
            header: "จัดการ",
            body: (r) => (
              <RowMenu
                items={[
                  { label: "รายละเอียด", icon: "pi pi-print", command: () => history.push(`/coordinate/data/${r.id}`) },
                  { label: "แก้ไข", icon: "pi pi-pencil", command: () => history.push(`/coordinate/edit/${r.id}`) },
                  { label: "บันทึกผลการประสาน", icon: "pi pi-list", command: () => history.push(`/coordinate/data/${r.id}`) },
                  { separator: true },
                  { label: "ยกเลิกรายการ", icon: "pi pi-trash", command: () => del(r) },
                ]}
              />
            ),
          },
        ]}
      />
    </Page>
  );
};

const villageOpts = [{ label: "0", value: "" }, ...Array.from({ length: 99 }, (_, i) => ({ label: String(i + 1), value: String(i + 1).padStart(2, "0") }))];
const schema = (user) => [
  {
    fields: [
      { name: "service_date", label: "วันที่รับเรื่อง", type: "date", col: 6, required: true, msg: "กรุณาระบุวันที่รับเรื่อง" },
      { name: "org_id", label: "หน่วยงาน", type: "select", col: 6, required: true, msg: "กรุณาระบุหน่วยงาน", options: () => db.findSync("org", { flag: 1 }).filter((o) => Number(user.role_id) === 1 || o.id === user.org_id).map((o) => ({ label: o.shortname, value: o.id })) },
    ],
  },
  {
    title: "ข้อมูลผู้ขอความช่วยเหลือ :",
    icon: "pi pi-user",
    fields: [
      { name: "prename", label: "คำนำหน้า", type: "select", col: 2, source: { table: "prename" } },
      { name: "fname", label: "ชื่อ", type: "text", col: 4, required: true, msg: "กรุณาระบุชื่อ" },
      { name: "lname", label: "สกุล", type: "text", col: 3, required: true, msg: "กรุณาระบุนามสกุล" },
      { name: "telephone", label: "โทรศัพท์", type: "text", col: 3, maxLength: 10, required: true, msg: "กรุณาระบุโทรศัพท์", help: "หมายเลขโทรศัพท์ 10 หลัก" },
    ],
  },
  {
    title: "ที่อยู่ :",
    icon: "pi pi-home",
    fields: [
      { name: "house", label: "บ้านเลขที่", type: "text", col: 3 },
      { name: "community", label: "หมู่บ้าน/ชุมชน", type: "text", col: 6 },
      { name: "village", label: "หมู่ที่", type: "select", col: 3, options: villageOpts },
      { name: "road", label: "ถนน", type: "text", col: 3 },
      { name: "changwat", label: "จังหวัด", type: "select", col: 3, source: { table: "changwat" }, onChange: (v, vals, set) => set((x) => ({ ...x, ampur: null, tambon: null })) },
      { name: "ampur", label: "อำเภอ", type: "select", col: 3, options: (v) => db.findSync("ampur", { changwat: v.changwat }).map((a) => ({ label: a.name, value: a.id })), onChange: (v, vals, set) => set((x) => ({ ...x, tambon: null })) },
      { name: "tambon", label: "ตำบล", type: "select", col: 3, options: (v) => db.findSync("tambon", { ampur: v.ampur }).map((t) => ({ label: t.name, value: t.id })) },
    ],
  },
  {
    title: "ข้อมูลขอความช่วยเหลือ :",
    icon: "pi pi-comments",
    fields: [
      { name: "service_title", label: "เรื่องที่ขอความช่วยเหลือ", type: "text", col: 12, required: true, msg: "กรุณาระบุเรื่องที่ต้องการความช่วยเหลือ" },
      { name: "service_desc", label: "รายละเอียด", type: "richtext", col: 12, height: 220 },
    ],
  },
];

const Form = () => {
  const { id } = useParams();
  const history = useHistory();
  const { user } = useAuth();
  const s = schema(user);
  const { values, setValues, errors, check } = useForm(s, { org_id: user.org_id, changwat: "30" });
  useEffect(() => {
    if (id) setValues(db.getSync("coordinate_main", id) || {});
  }, [id, setValues]);
  const save = async () => {
    if (!check()) return;
    if (id) await db.update("coordinate_main", id, { ...values, edit_users: user.id });
    else await db.insert("coordinate_main", { ...values, service_code: "", flag: 1, add_users: user.id, add_date: new Date().toISOString() });
    await alertSuccess("บันทึกสำเร็จ");
    history.push("/coordinate");
  };
  return (
    <Page title={`${id ? "แก้ไข" : "เพิ่ม"}ข้อมูลประสานงานขอความช่วยเหลือ`} actions={<BackButton to="/coordinate" />}>
      <Card>
        <FormBuilder sections={s} values={values} setValues={setValues} errors={errors} />
        <div className="mt-5 flex gap-2">
          <Btn icon="pi pi-save" label="บันทึก" onClick={save} />
          <BackButton />
        </div>
      </Card>
    </Page>
  );
};

const Data = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [desc, setDesc] = useState({});
  const [, force] = useState(0);
  const r = db.getSync("coordinate_main", id);
  if (!r) return null;
  const logs = db.findSync("coordinate_data", { service_id: r.id }).filter((x) => String(x.flag) !== "0").sort((a, b) => a.id - b.id);
  const save = async () => {
    if (!desc.service_desc || desc.service_desc === "<p><br></p>") return alertError("กรุณาระบุรายละเอียด", "");
    await db.insert("coordinate_data", { service_id: r.id, service_status: 1, service_desc: desc.service_desc, flag: 1, add_users: user.id, add_date: new Date().toISOString() });
    setOpen(false);
    setDesc({});
    force((x) => x + 1);
    alertSuccess("บันทึกสำเร็จ");
  };
  const del = async (x) => {
    if (!(await confirmAction("แน่ใจนะ?", "ต้องการยกเลิกรายการ", "ใช่, ต้องการยกเลิกรายการ !", "#dc2626"))) return;
    await db.update("coordinate_data", x.id, { flag: 0, edit_users: user.id });
    force((v) => v + 1);
  };
  const addr = [r.house && `บ้านเลขที่ ${r.house}`, r.village && `หมู่ ${Number(r.village)}`, r.community, r.road && `ถ.${r.road}`, r.tambon && `ต.${name("tambon", r.tambon)}`, r.ampur && `อ.${name("ampur", r.ampur)}`, r.changwat && `จ.${name("changwat", r.changwat)}`].filter(Boolean).join(" ");
  return (
    <Page title="บันทึกผลการประสาน" subtitle="แก้ไขข้อมูลประสานงานขอความช่วยเหลือ" actions={<BackButton to="/coordinate" />}>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <Card title="ข้อมูลผู้ขอความช่วยเหลือ" icon="pi pi-user" className="xl:col-span-2">
          <div className="space-y-3">
            <Info label="วันที่รับเรื่อง" value={thDateShort(r.service_date)} />
            <Info label="ชื่อ-สกุล" value={`${name("prename", r.prename)}${r.fname} ${r.lname}`} />
            <Info label="โทรศัพท์" value={r.telephone} />
            <Info label="ที่อยู่" value={addr || "-"} />
            <Info label="เรื่องที่ขอความช่วยเหลือ" value={r.service_title} />
            <div>
              <div className="text-xs text-slate-400">รายละเอียด</div>
              <div className="mt-1 rounded-xl bg-slate-50 p-3 text-sm" dangerouslySetInnerHTML={{ __html: r.service_desc || "-" }} />
            </div>
          </div>
        </Card>
        <Card title="ข้อมูลบันทึกให้ความช่วยเหลือ" icon="pi pi-list" className="xl:col-span-3" actions={<Btn icon="pi pi-plus" label="เพิ่มข้อมูลให้การช่วยเหลือ" onClick={() => setOpen(true)} />}>
          <SimpleTable
            head={["ลำดับ", "รายละเอียด", "บันทึกโดย", "จัดการ"]}
            rows={logs.map((x, i) => [
              i + 1,
              <div key="d" dangerouslySetInnerHTML={{ __html: x.service_desc }} />,
              <div key="u" className="whitespace-nowrap">
                {userName(x.add_users)}
                <div className="text-xs text-slate-400">{thDate(x.add_date, { time: true })}</div>
              </div>,
              <RowMenu key="m" items={[{ label: "ยกเลิก", icon: "pi pi-trash", command: () => del(x) }]} />,
            ])}
          />
        </Card>
      </div>
      <Modal visible={open} onHide={() => setOpen(false)} title="เพิ่มบันทึกให้ความช่วยเหลือ" footer={<div className="flex justify-end gap-2"><Btn icon="pi pi-save" label="บันทึก" onClick={save} /><Button size="small" outlined severity="danger" icon="pi pi-times-circle" label="ปิด" onClick={() => setOpen(false)} /></div>}>
        <FormBuilder fields={[{ name: "service_desc", label: "รายละเอียด", type: "richtext", col: 12, required: true, height: 220 }]} values={desc} setValues={setDesc} />
      </Modal>
    </Page>
  );
};

const CoordinateModule = () => (
  <Switch>
    <Route path="/coordinate/add" component={Form} />
    <Route path="/coordinate/edit/:id" component={Form} />
    <Route path="/coordinate/data/:id" component={Data} />
    <Route path="/coordinate" component={List} />
  </Switch>
);

export default CoordinateModule;
