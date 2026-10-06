// ตั้งค่าระบบ — settings + master data
import React, { useEffect } from "react";
import { Route, Switch, useHistory, useParams } from "react-router-dom";
import { Page, Card, DataList, Btn, FormBuilder, useForm, useTable, alertSuccess, alertError, Badge } from "../../components/kit";
import { BackButton } from "../shared";
import { IconAction, name } from "../shared/workflow";
import db from "../../mock/db";
import { useAuth } from "../../role-access/authContext";

const flagOpts = (off = "ปิดใช้งาน") => [
  { label: "เปิดใช้งาน", value: 1 },
  { label: off, value: 0 },
];
const FlagBadge = ({ v, off = "ปิดใช้งาน" }) => (String(v) === "1" ? <Badge color="green">เปิดใช้งาน</Badge> : <Badge color="red">{off}</Badge>);

// ---------------------------------------------------------------- generic master CRUD
// cfg: { table, base, title, icon, addLabel, columns, fields, where, beforeSave, listFilter, formTitle }
const MasterList = ({ cfg }) => {
  const history = useHistory();
  const { data, loading } = useTable(cfg.table);
  const rows = (cfg.listFilter ? data.filter(cfg.listFilter) : data).slice().sort(cfg.sort || ((a, b) => a.id - b.id));
  return (
    <Page title={cfg.title} breadcrumb={["ตั้งค่าระบบ", cfg.title]} actions={<Btn tone="success" icon="pi pi-plus-circle" label={cfg.addLabel} onClick={() => history.push(`${cfg.base}/add`)} />}>
      <DataList
        loading={loading}
        value={rows}
        onRowClick={(r) => history.push(`${cfg.base}/edit/${r.id}`)}
        columns={[
          { header: "ลำดับ", type: "index" },
          ...cfg.columns,
          { header: "จัดการ", body: (r) => <IconAction icon="pi pi-pencil" title="แก้ไข" onClick={() => history.push(`${cfg.base}/edit/${r.id}`)} /> },
        ]}
      />
    </Page>
  );
};

const MasterForm = ({ cfg }) => {
  const { id } = useParams();
  const history = useHistory();
  const { user } = useAuth();
  const fields = typeof cfg.fields === "function" ? cfg.fields(!!id) : cfg.fields;
  const { values, setValues, errors, check } = useForm(fields, { flag: 1, ...(cfg.defaults || {}) });
  useEffect(() => {
    if (id) {
      const r = db.getSync(cfg.table, id);
      if (r) setValues(cfg.toForm ? cfg.toForm(r) : r);
    }
  }, [id, setValues, cfg]);
  const save = async () => {
    if (!check()) return;
    let data = { ...values };
    if (cfg.beforeSave) {
      data = cfg.beforeSave(data, id);
      if (!data) return;
    }
    if (id) await db.update(cfg.table, id, { ...data, edit_users: user.id });
    else await db.insert(cfg.table, { ...data, add_users: user.id });
    cfg.afterSave?.(data);
    await alertSuccess("บันทึกสำเร็จ");
    if (cfg.stay) return;
    history.push(cfg.base);
  };
  const title = `${id ? "แก้ไข" : "เพิ่ม"}${cfg.formTitle}`;
  return (
    <Page title={title} breadcrumb={["ตั้งค่าระบบ", cfg.title]} actions={<BackButton to={cfg.base} />}>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className={cfg.side ? "xl:col-span-2" : "xl:col-span-3"}>
          <FormBuilder fields={fields} values={values} setValues={setValues} errors={errors} />
          <div className="mt-5 flex gap-2">
            <Btn icon="pi pi-save" label="บันทึก" onClick={save} />
            <BackButton />
          </div>
        </Card>
        {cfg.side?.(values)}
      </div>
    </Page>
  );
};

const crud = (cfg) => [
  <Route key={`${cfg.base}a`} path={`${cfg.base}/add`} render={() => <MasterForm cfg={cfg} />} />,
  <Route key={`${cfg.base}e`} path={`${cfg.base}/edit/:id`} render={() => <MasterForm cfg={cfg} />} />,
  <Route key={`${cfg.base}l`} path={cfg.base} render={() => <MasterList cfg={cfg} />} />,
];

// ---------------------------------------------------------------- configs
const ORG = {
  table: "org",
  base: "/systems/org",
  title: "ข้อมูลหน่วยงาน",
  addLabel: "เพิ่มหน่วยงาน",
  formTitle: "หน่วยงาน",
  sort: (a, b) => b.id - a.id,
  columns: [
    { header: "โลโก้", body: (r) => (r.logo?.url ? <img src={r.logo.url} alt="" className="h-10 w-10 rounded-lg object-contain" /> : <img src="/img/logo-korat-secare.png" alt="" className="h-10 w-10 object-contain" />) },
    { field: "name", header: "ชื่อหน่วยงาน" },
    { field: "shortname", header: "ชื่อย่อ" },
    { header: "ที่อยู่", body: (r) => `${r.address || ""} ต.${name("tambon", `${r.changwat}${r.ampur}${r.tambon}`)} อ.${name("ampur", `${r.changwat}${r.ampur}`)} จ.${name("changwat", r.changwat)}` },
    { header: "สถานะ", body: (r) => <FlagBadge v={r.flag} /> },
  ],
  toForm: (r) => ({ ...r, ampur: r.ampur ? `${r.changwat}${r.ampur}` : null, tambon: r.tambon ? `${r.changwat}${r.ampur}${r.tambon}` : null }),
  beforeSave: (d) => ({ ...d, ampur: d.ampur ? String(d.ampur).slice(2, 4) : "", tambon: d.tambon ? String(d.tambon).slice(4, 6) : "" }),
  defaults: { changwat: "30", latitude: "0.00000", longitude: "0.00000" },
  fields: [
    { name: "name", label: "ชื่อหน่วยงาน", type: "text", col: 8, required: true, msg: "กรุณาระบุชื่อหน่วยงาน" },
    { name: "shortname", label: "ชื่อย่อ", type: "text", col: 4 },
    { name: "flag", label: "สถานะใช้งาน", type: "select", col: 4, required: true, options: flagOpts() },
    { name: "telephone", label: "โทรศัพท์", type: "text", col: 4 },
    { name: "latitude", label: "Latitude", type: "text", col: 2 },
    { name: "longitude", label: "Longitude", type: "text", col: 2 },
    { name: "address", label: "ที่อยู่", type: "text", col: 12 },
    { name: "changwat", label: "จังหวัด", type: "select", col: 4, source: { table: "changwat" }, onChange: (v, vals, set) => set((x) => ({ ...x, ampur: null, tambon: null })) },
    { name: "ampur", label: "อำเภอ", type: "select", col: 4, options: (v) => db.findSync("ampur", { changwat: v.changwat }).map((a) => ({ label: a.name, value: a.id })), onChange: (v, vals, set) => set((x) => ({ ...x, tambon: null })) },
    { name: "tambon", label: "ตำบล", type: "select", col: 4, options: (v) => db.findSync("tambon", { ampur: v.ampur }).map((t) => ({ label: t.name, value: t.id })) },
    { name: "logo", label: "โลโก้", type: "image", col: 4 },
    { name: "org_img", label: "รูปถ่ายหน่วยงาน", type: "image", col: 4 },
    { name: "org_worktime", label: "ตารางปฏิบัติงาน", type: "image", col: 4 },
  ],
};

const BUREAU = {
  table: "bureau",
  base: "/systems/bureau",
  title: "ข้อมูลหน่วยงานย่อย",
  addLabel: "เพิ่มหน่วยงานย่อย",
  formTitle: "หน่วยงานย่อย",
  listFilter: (r) => String(r.flag) === "1",
  defaults: { org_id: 1 },
  columns: [
    { field: "name", header: "ชื่อหน่วยงาน" },
    { field: "line_key2", header: "Line Key 2" },
    { field: "line_key3", header: "Line Key 3" },
    { field: "line_key4", header: "Line Key 4" },
    { field: "line_key5", header: "Line Key 5" },
  ],
  fields: [
    { name: "name", label: "ชื่อหน่วยงานย่อย", type: "text", col: 8, required: true, msg: "กรุณาระบุชื่อหน่วยงานย่อย" },
    { name: "flag", label: "สถานะใช้งาน", type: "select", col: 4, required: true, options: flagOpts() },
    { name: "line_key2", label: "Line Key Step 2", type: "text", col: 6, help: "แจ้งเตือนเมื่ออนุมัติจัดหาพัสดุ" },
    { name: "line_key3", label: "Line Key Step 3", type: "text", col: 6, help: "แจ้งเตือนเมื่ออนุมัติตรวจรับ" },
    { name: "line_key4", label: "Line Key Step 4", type: "text", col: 6, help: "แจ้งเตือนเมื่ออนุมัติจ่ายเงิน" },
    { name: "line_key5", label: "Line Key Step 5", type: "text", col: 6, help: "แจ้งเตือนเมื่อบันทึกจ่ายเงิน" },
  ],
};

const BYEAR = {
  table: "project_byear",
  base: "/systems/byear",
  title: "ข้อมูลปีงบประมาณ",
  addLabel: "เพิ่มปีงบ",
  formTitle: "ปีงบประมาณ",
  sort: (a, b) => a.byear - b.byear,
  columns: [
    { field: "byear", header: "ปีงบ", body: (r) => r.byear + 543 },
    { header: "กำลังใช้งาน", body: (r) => (String(r.byear_active) === "1" ? <span className="font-semibold text-emerald-600"><i className="pi pi-check mr-1" />เปิดใช้งาน</span> : <span className="text-rose-600"><i className="pi pi-times mr-1" />ปิดใช้งาน</span>) },
  ],
  toForm: (r) => ({ ...r, byear_be: r.byear + 543 }),
  fields: (isEdit) => [
    { name: "byear_be", label: "ปีงบประมาณ", type: "number", col: 6, required: true, msg: "กรุณาปีงบ", placeholder: "ปีงบ", disabled: isEdit, help: "ระบุเป็นปี พ.ศ." },
    { name: "byear_active", label: "สถานะใช้งาน", type: "select", col: 6, required: true, options: flagOpts(), default: 0 },
  ],
  beforeSave: (d, id) => {
    const byear = Number(d.byear_be) - 543;
    if (!id && db.findSync("project_byear", { byear }).length) {
      alertError("ไม่สามารถบันทึกข้อมูลได้", "มีปีงบนี้แล้ว");
      return null;
    }
    return { byear, byear_active: d.byear_active, flag: 1 };
  },
  // keep a single active year (the system reads the first active row)
  afterSave: (d) => {
    if (String(d.byear_active) === "1") db.findSync("project_byear").forEach((r) => r.byear !== d.byear && String(r.byear_active) === "1" && db.update("project_byear", r.id, { byear_active: 0 }));
  },
};

const simpleMaster = (table, base, title, formTitle, label, off = "ยกเลิกใช้งาน", extra = {}) => ({
  table,
  base,
  title,
  addLabel: `เพิ่ม${formTitle}`,
  formTitle,
  columns: [
    { field: "name", header: label },
    { header: "สถานะ", body: (r) => <FlagBadge v={r.flag} off={off} /> },
  ],
  fields: [
    { name: "name", label, type: "text", col: 8, required: true, msg: `กรุณาระบุ${label}` },
    { name: "flag", label: "สถานะใช้งาน", type: "select", col: 4, required: true, options: flagOpts(off) },
  ],
  ...extra,
});

const EXP_GROUP = simpleMaster("expenses_group", "/systems/expenses-group", "ข้อมูลหมวดรายจ่าย", "หมวดรายจ่าย", "ชื่อหมวดรายจ่าย");
const EXP_TYPE = simpleMaster("expenses_type", "/systems/expenses-type", "ข้อมูลประเภทค่าใช้จ่าย", "ประเภทค่าใช้จ่าย", "ชื่อประเภทค่าใช้จ่าย");
const EQ_TYPE = simpleMaster("equipment_type", "/systems/equipment-type", "ประเภทอุปกรณ์", "ประเภทอุปกรณ์", "ประเภท", "ปิดใช้งาน");
const WORK_TYPE = simpleMaster("work_type", "/systems/work-type", "ข้อมูลงาน", "งาน", "ชื่องาน");
const BUDGET_TYPE = simpleMaster("budget_type", "/systems/budget-type", "ข้อมูลประเภทงบประมาณ", "ประเภทงบประมาณ", "ชื่อประเภทงบประมาณ");

// ---------------------------------------------------------------- site settings (key/value)
const SETTING_FIELDS = [
  { name: "cfg_site_title", label: "Site Title", type: "text", col: 12, required: true, msg: "กรุณาระบุชื่อระบบ" },
  { name: "cfg_app_name", label: "Application name", type: "text", col: 6 },
  { name: "cfg_app_nickname", label: "Application nickname", type: "text", col: 6 },
  { name: "cfg_site_meta_title", label: "SEO meta title", type: "text", col: 12 },
  { name: "cfg_site_meta_description", label: "SEO meta description", type: "text", col: 12 },
  { name: "cfg_site_meta_keywords", label: "SEO meta keywords", type: "text", col: 6 },
  { name: "cfg_site_meta_author", label: "SEO meta author", type: "text", col: 6 },
  { name: "cfg_homepage_content", label: "Homepage content", type: "richtext", col: 12 },
  { name: "cfg_footer_content", label: "Footer HTML content", type: "richtext", col: 12, height: 120 },
  { name: "cfg_line_notify_key", label: "Line Notify KEY", type: "text", col: 12 },
  { name: "cfg_logo_image", label: "Change logo image", type: "image", col: 6 },
];

const Settings = () => {
  const initial = Object.fromEntries(db.findSync("settings").map((s) => [s.name, s.value]));
  const { values, setValues, errors, check } = useForm(SETTING_FIELDS, initial);
  const save = async () => {
    if (!check()) return;
    for (const f of SETTING_FIELDS) {
      const row = db.findSync("settings", { name: f.name })[0];
      if (row) await db.update("settings", row.id, { value: values[f.name] ?? "" });
      else await db.insert("settings", { name: f.name, value: values[f.name] ?? "" });
    }
    alertSuccess("บันทึกสำเร็จ");
  };
  return (
    <Page title="ตั้งค่าระบบ" breadcrumb={["ตั้งค่าระบบ"]}>
      <Card>
        <FormBuilder fields={SETTING_FIELDS} values={values} setValues={setValues} errors={errors} />
        <div className="mt-5">
          <Btn icon="pi pi-save" label="บันทึก" onClick={save} />
        </div>
      </Card>
    </Page>
  );
};

const Landing = () => {
  const history = useHistory();
  const items = [
    ["ตั้งค่าระบบ", "pi pi-cog", "/systems/system"],
    ["ข้อมูลหน่วยงาน", "pi pi-building", "/systems/org"],
    ["ข้อมูลหน่วยงานย่อย", "pi pi-sitemap", "/systems/bureau"],
    ["ข้อมูลปีงบประมาณ", "pi pi-calendar", "/systems/byear"],
    ["ข้อมูลหมวดรายจ่าย", "pi pi-th-large", "/systems/expenses-group"],
    ["ข้อมูลประเภทค่าใช้จ่าย", "pi pi-tags", "/systems/expenses-type"],
    ["ข้อมูลงาน", "pi pi-briefcase", "/systems/work-type"],
    ["ข้อมูลประเภทงบประมาณ", "pi pi-money-bill", "/systems/budget-type"],
    ["ประเภทอุปกรณ์", "pi pi-box", "/systems/equipment-type"],
    ["ประวัติแจ้งเตือน LINE (mock)", "pi pi-send", "/systems/notify-log"],
  ];
  return (
    <Page title="ตั้งค่าระบบ">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {items.map(([t, i, to]) => (
          <button key={to} type="button" onClick={() => history.push(to)} className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-pink-200 hover:shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-50 text-pink-600">
              <i className={`${i} text-xl`} />
            </div>
            <div className="font-semibold text-slate-800">{t}</div>
          </button>
        ))}
      </div>
    </Page>
  );
};

const NotifyLog = () => {
  const { data, loading } = useTable("notify_log");
  return (
    <Page title="ประวัติแจ้งเตือน LINE (mock)" subtitle="ระบบจำลองไม่ได้ส่ง LINE จริง ข้อความที่จะส่งถูกบันทึกไว้ที่นี่" breadcrumb={["ตั้งค่าระบบ"]}>
      <DataList
        loading={loading}
        value={[...data].reverse()}
        columns={[
          { header: "ลำดับ", type: "index" },
          { field: "created_at", header: "วันที่", type: "date" },
          { field: "step", header: "ขั้นตอน" },
          { header: "หน่วยงาน (token)", body: (r) => (r.token ? <Badge color="green">มี token</Badge> : <Badge>ไม่มี token</Badge>) },
          { field: "message", header: "ข้อความ", body: (r) => <pre className="whitespace-pre-wrap font-sans text-xs">{r.message}</pre> },
        ]}
      />
    </Page>
  );
};

const SystemsModule = () => (
  <Switch>
    <Route path="/systems/system" component={Settings} />
    <Route path="/systems/notify-log" component={NotifyLog} />
    {crud(ORG)}
    {crud(BUREAU)}
    {crud(BYEAR)}
    {crud(EXP_GROUP)}
    {crud(EXP_TYPE)}
    {crud(WORK_TYPE)}
    {crud(BUDGET_TYPE)}
    {crud(EQ_TYPE)}
    <Route path="/systems" component={Landing} />
  </Switch>
);

export default SystemsModule;
