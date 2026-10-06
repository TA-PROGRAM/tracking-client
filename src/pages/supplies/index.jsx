// Step 3 — จัดหาพัสดุ (ผู้ชนะ / สัญญา / กรรมการ / เอกสาร)
import React, { useMemo, useState } from "react";
import { Route, Switch, useHistory, useParams } from "react-router-dom";
import { Button } from "primereact/button";
import { Page, Card, DataList, Btn, FormBuilder, useForm, useTable, useFilters, alertSuccess, ExcelButton, Info } from "../../components/kit";
import { FilterBar, ProjectInfoPanel, StepRibbon, BackButton, FilesTable, BoardSection, Letter, suppliesLetter, Modal } from "../shared";
import { baseColumns, baseExcel, FILTERS_STD, FILTERS_TAIL, IconAction, ApprovalCard, name } from "../shared/workflow";
import { CompanyList, CompanyForm, COMPANY_SCHEMA } from "./company";
import db from "../../mock/db";
import { useAuth } from "../../role-access/authContext";
import { filterProjects, addLog, saveProjectFiles, projectFiles, notifyLine, lineHeader } from "../../mock/tracking";
import { daysBetween, isoDate, thDateShort } from "../../utils/format";

const FILE_ACCEPT = ".pdf,.doc,.docx,.xls,.xlsx";
const FILE_HELP = ".pdf .doc .docx .xls .xlsx เท่านั้น";
const UPLOADS = [
  ["pricecenter", "ราคากลาง"],
  ["tor", "TOR"],
  ["supplies", "ประกาศรายชื่อผู้เสนอราคา"],
  ["win", "ประกาศรายชื่อผู้ชนะ"],
  ["contract", "สัญญาลงนามแล้ว"],
  ["sendto", "หนังสือส่งมอบงาน"],
];
const REQUIRED_DOCS = ["pricecenter", "tor", "supplies", "win", "contract"];

const List = () => {
  const history = useHistory();
  const { user, byear } = useAuth();
  const { data, loading } = useTable("project", { flag: 1, project_purchase: "1", purchase_approve: "1" });
  const [f, setF] = useFilters("supplies", { suppliesapprove: "" });
  const rows = useMemo(() => {
    let r = filterProjects(data, f, { user, byear });
    if (f.suppliesapprove !== "all") r = r.filter((p) => String(p.supplies_approve || "0") === (f.suppliesapprove || "0"));
    return r.sort((a, b) => b.id - a.id);
  }, [data, f, user, byear]);

  const cols = [
    ...baseColumns(),
    { field: "road", header: "ชื่อถนน" },
    { field: "project_place", header: "สถานที่", style: { minWidth: "10rem" } },
    { header: "ประเภทจัดซื้อ", body: (p) => name("purchase_type", p.purchase_type), style: { minWidth: "9rem" } },
    { field: "purchase_winprice", header: "ราคาชนะ", type: "money" },
    { header: "ผู้ชนะ", body: (p) => name("company", p.purchase_winname), style: { minWidth: "10rem" } },
    { header: "สถานะตรวจรับ", body: (p) => <Letter v={suppliesLetter(p.supplies_approve)} /> },
    {
      header: "จัดการ",
      body: (p) => (
        <div className="whitespace-nowrap">
          <IconAction icon="pi pi-pencil" title="บันทึกจัดหาพัสดุ" onClick={() => history.push(`/supplies/edit/${p.id}`)} />
          <IconAction icon="pi pi-th-large" color="text-cyan-600" title="อนุมัติให้ตรวจรับ" onClick={() => history.push(`/supplies/approve/${p.id}`)} />
        </div>
      ),
    },
  ];
  const excel = [
    ...baseExcel(),
    { header: "ชื่อถนน", field: "road" },
    { header: "สถานที่", field: "project_place", width: 30 },
    { header: "ประเภทจัดซื้อ", value: (p) => name("purchase_type", p.purchase_type), width: 24 },
    { header: "ราคาชนะ", field: "purchase_winprice", type: "money", width: 16 },
    { header: "ผู้ชนะ", value: (p) => name("company", p.purchase_winname), width: 28 },
    { header: "สถานะตรวจรับ", value: (p) => suppliesLetter(p.supplies_approve) },
  ];

  return (
    <Page title="ข้อมูลโครงการจัดหาพัสดุ(จัดซื้อจัดจ้าง)" subtitle="ขั้นตอนที่ 3 · ผู้ชนะ สัญญา กรรมการ และเอกสารประกอบ" actions={<ExcelButton filename="3-rpt-supplies-all" columns={excel} rows={rows} title="ข้อมูลโครงการจัดหาพัสดุ" />}>
      <FilterBar
        fields={[
          ...FILTERS_STD,
          {
            name: "suppliesapprove",
            label: "อนุมัติตรวจรับ",
            type: "select",
            options: [
              { label: "-ทั้งหมด-", value: "all" },
              { label: "W-รอดำเนินการ", value: "" },
              { label: "A-อนุมัติตรวจรับ", value: "1" },
              { label: "C-รออนุมัติ", value: "2" },
            ],
          },
          ...FILTERS_TAIL,
        ]}
        value={f}
        onChange={setF}
      />
      <DataList loading={loading} value={rows} columns={cols} title={`จำนวน ${rows.length} รายการ`} onRowClick={(p) => history.push(`/supplies/edit/${p.id}`)} />
    </Page>
  );
};

const warrantyOpts = [{ label: "ไม่มีการรับประกัน", value: "" }, ...Array.from({ length: 20 }, (_, i) => ({ label: String(i + 1), value: i + 1 }))];
const addYears = (d, n) => {
  if (!d || !n) return null;
  const x = new Date(d);
  x.setFullYear(x.getFullYear() + Number(n));
  return isoDate(x);
};

const editSchema = (p) => [
  {
    title: "ข้อมูลจัดหาพัสดุ",
    icon: "pi pi-box",
    fields: [
      { name: "purchase_type", label: "ประเภทการจัดหา", type: "select", col: 12, required: true, msg: "กรุณาระบุประเภทการจัดหา", source: { table: "purchase_type" } },
      { name: "egp_code", label: "เลขที่ e-GP", type: "text", col: 6 },
      { name: "contract_number", label: "เลขที่สัญญา", type: "text", col: 6 },
    ],
  },
  {
    title: "ข้อมูลสัญญา",
    icon: "pi pi-file",
    fields: [
      { name: "contract_startdate", label: "วันที่เริ่มสัญญา", type: "date", col: 4, onChange: (v, vals, set) => { const n = daysBetween(v, vals.contract_enddate); if (n !== null) set((x) => ({ ...x, contract_numdate: n + 1 })); } },
      { name: "contract_enddate", label: "วันที่จบสัญญา", type: "date", col: 4, onChange: (v, vals, set) => { const n = daysBetween(vals.contract_startdate, v); if (n !== null) set((x) => ({ ...x, contract_numdate: n + 1 })); } },
      { name: "contract_numdate", label: "ระยะเวลา(วัน)", type: "number", col: 4, help: "คำนวณอัตโนมัติ (นับวันเริ่มด้วย)" },
      { name: "warranty", label: "ระยะเวลารับประกัน(ปี)", type: "select", col: 6, options: warrantyOpts, onChange: (v, vals, set) => set((x) => ({ ...x, warranty_expire: addYears(p.supplies_approvedate, v) })) },
      { name: "warranty_expire", label: "วันที่หมดประกัน", type: "date", col: 6, help: "คำนวณจากวันอนุมัติตรวจรับ + ปีรับประกัน" },
    ],
  },
];

const Edit = () => {
  const { id } = useParams();
  const history = useHistory();
  const { user } = useAuth();
  const [ver, setVer] = useState(0);
  const [selOpen, setSelOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const p = db.getSync("project", id);
  const schema = editSchema(p || {});
  const pick = (o, keys) => Object.fromEntries(keys.map((k) => [k, o?.[k]]));
  const { values, setValues, errors, check } = useForm(schema, pick(p, ["purchase_type", "egp_code", "contract_number", "contract_startdate", "contract_enddate", "contract_numdate", "warranty", "warranty_expire", "purchase_winprice"]));
  const companies = db.findSync("company", { flag: 1, org_id: user.org_id }).sort((a, b) => b.id - a.id);
  const log = (act) => addLog(p.id, act, user);

  const save = async () => {
    if (!check()) return;
    const { purchase_type, egp_code, contract_number, contract_startdate, contract_enddate, contract_numdate, warranty, warranty_expire, purchase_winprice } = values;
    await db.update("project", id, {
      purchase_type,
      egp_code: egp_code || "",
      contract_number: contract_number || "",
      contract_startdate,
      contract_enddate,
      contract_numdate,
      warranty: warranty || null,
      warranty_expire,
      purchase_winprice: purchase_winprice || 0,
      contract_checkdate: null,
      // legacy: no visible input for the contracted delivery date; follow the contract end date
      contract_receivedate: p.contract_receivedate || contract_enddate,
      edit_users: user.id,
    });
    await log("บันทึกข้อมูลจัดหาพัสดุ");
    for (const [t] of UPLOADS) await saveProjectFiles(p.id, t, values[`files_${t}`], user);
    setValues((v) => ({ ...v, ...Object.fromEntries(UPLOADS.map(([t]) => [`files_${t}`, []])) }));
    setVer((x) => x + 1);
    alertSuccess("บันทึกสำเร็จ");
  };

  const selectWin = async (c) => {
    const cur = String(p.supplies_approve || "0");
    await db.update("project", id, { purchase_winname: c.id, supplies_approve: cur === "0" ? "2" : cur, edit_users: user.id });
    await log("บันทึกข้อมูลผู้ชนะ");
    setSelOpen(false);
    setVer((x) => x + 1);
    alertSuccess("บันทึกสำเร็จ");
  };

  if (!p) return null;
  return (
    <Page
      title="บันทึกจัดหาพัสดุ"
      breadcrumb={["จัดหาพัสดุ", p.project_code]}
      actions={
        <>
          <StepRibbon n={3} />
          <Btn tone="info" icon="pi pi-angle-double-left" label="ขั้นตอนก่อนหน้า" onClick={() => history.push(`/purchase/edit/${id}`)} />
          <BackButton to="/supplies" />
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="space-y-4">
          <ProjectInfoPanel p={p} />
          <BoardSection projectId={p.id} user={user} onLog={log} />
        </div>
        <Card title="ข้อมูลจัดหาพัสดุ" icon="pi pi-box">
          <FormBuilder sections={schema} values={values} setValues={setValues} errors={errors} />

          <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50/40 p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-pink-700">
                <i className="pi pi-users" /> ผู้ชนะ
              </div>
              <div className="flex gap-2">
                <Btn tone="info" icon="pi pi-list" label="เลือกผู้ชนะ" onClick={() => setSelOpen(true)} />
                <Btn tone="success" icon="pi pi-plus" label="เพิ่มผู้ชนะ" onClick={() => setAddOpen(true)} />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2" key={ver}>
              <Info label="ผู้ชนะ" value={name("company", db.getSync("project", id)?.purchase_winname)} />
              <FormBuilder fields={[{ name: "purchase_winprice", label: "ราคาชนะ", type: "money", col: 12 }]} values={values} setValues={setValues} />
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50/40 p-4">
            <FormBuilder fields={UPLOADS.map(([t, l]) => ({ name: `files_${t}`, label: `เลือกเอกสารแนบ : ${l}`, type: "files", col: 6, accept: FILE_ACCEPT, help: FILE_HELP }))} values={values} setValues={setValues} />
          </div>
          <div className="mt-5 mb-2 text-sm font-semibold text-slate-700">เอกสารแนบทั้งหมด</div>
          <FilesTable key={`f${ver}`} projectId={p.id} types={UPLOADS.map(([t]) => t)} />

          <div className="mt-5 flex gap-2">
            <Btn icon="pi pi-save" label="บันทึก" onClick={save} />
            <BackButton />
          </div>
        </Card>
      </div>

      <Modal visible={selOpen} onHide={() => setSelOpen(false)} title="ผู้ชนะ" width="72rem">
        <DataList
          value={companies}
          rows={10}
          columns={[
            { header: "ลำดับ", type: "index" },
            { header: "ประเภท", body: (c) => name("company_type", c.type) },
            { field: "name", header: "ชื่อสกุล/ชื่อหน่วยงาน", body: (c) => <div>{c.name}<div className="text-xs text-slate-400">เลขบัตร : {c.code}</div></div> },
            { field: "contact", header: "ผู้ติดต่อ" },
            { field: "telephone", header: "โทรศัพท์" },
            { field: "address", header: "ที่อยู่" },
            { header: "เลือก", body: (c) => <Button size="small" outlined severity="success" icon="pi pi-check-square" label="เลือก" onClick={() => selectWin(c)} /> },
          ]}
        />
      </Modal>
      <Modal visible={addOpen} onHide={() => setAddOpen(false)} title="เพิ่มผู้ชนะ" width="60rem">
        <CompanyForm
          embedded
          onSaved={async (c) => {
            await db.update("project", id, { purchase_winname: c.id, edit_users: user.id });
            setAddOpen(false);
            setVer((x) => x + 1);
          }}
        />
      </Modal>
    </Page>
  );
};

const Approve = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [, force] = useState(0);
  const p = db.getSync("project", id);
  if (!p) return null;
  const complete = REQUIRED_DOCS.every((t) => projectFiles(p.id, [t]).length > 0);
  const missing = REQUIRED_DOCS.filter((t) => !projectFiles(p.id, [t]).length).map((t) => name("files_type", t));
  return (
    <Page title="บันทึกอนุมัติดำเนินการตรวจรับ" breadcrumb={["จัดหาพัสดุ", p.project_code]} actions={<><StepRibbon n={3} tone="blue" /><BackButton to="/supplies" /></>}>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ProjectInfoPanel p={p} />
        <ApprovalCard
          p={p}
          user={user}
          onChange={() => force((x) => x + 1)}
          cfg={{
            title: "อนุมัติให้ตรวจรับ",
            buttonLabel: "อนุมัติตรวจรับ",
            modalTitle: "อนุมัติตรวจรับงาน",
            field: "supplies_approve",
            dateField: "supplies_approvedate",
            userField: "supplies_approveusers",
            statusLabel: "สถานะอนุมัติ",
            options: [
              { label: "W-รอดำเนินการ", value: "0" },
              { label: "A-อนุมัติให้ตรวจรับ", value: "1" },
              { label: "C-รออนุมัติ", value: "2" },
            ],
            viewOptions: [
              { label: "W-รอดำเนินการ", value: "0" },
              { label: "X-อนุมัติให้ตรวจรับ", value: "1" },
              { label: "C-รออนุมัติ", value: "2" },
            ],
            successText: "อนุมัติตรวจรับสำเร็จ",
            blocked: !complete,
            blockText: `ไม่สามารถอนุมัติตรวจรับงานได้ เนื่องจากไฟล์เอกสารไม่ครบ (ขาด: ${missing.join(", ")})`,
            onSaved: async (v) => {
              await addLog(p.id, "บันทึกอนุมัติตรวจรับงาน", user);
              if (v.status === "1") {
                if (p.warranty && !p.warranty_expire) await db.update("project", p.id, { warranty_expire: addYears(v.date, p.warranty) });
                const h = lineHeader(p);
                notifyLine(3, p, [`อนุมัติการตรวจรับงาน(3) เลขที่สัญญา ${p.contract_number}`, `โครงการ: ${p.project_name}`, `งบประมาณ ${h.budget} บาท`, `ประเภทประมาณ ${h.bg}`, `ปีงบ ${h.year}`, `วันที่เริ่มสัญญา ${h.start}`, `วันที่จบสัญญา ${h.end}`, `ผู้ชนะ ${h.win}`, `วันอนุมัติตรวจรับ ${thDateShort(v.date)}`]);
              }
            },
          }}
        />
      </div>
    </Page>
  );
};

const SuppliesModule = () => (
  <Switch>
    <Route path="/supplies/edit/:id" component={Edit} />
    <Route path="/supplies/approve/:id" component={Approve} />
    <Route path="/supplies/company/add" component={CompanyForm} />
    <Route path="/supplies/company/edit/:cid" component={CompanyForm} />
    <Route path="/supplies/company" component={CompanyList} />
    <Route path="/supplies" component={List} />
  </Switch>
);

export { COMPANY_SCHEMA };
export default SuppliesModule;
