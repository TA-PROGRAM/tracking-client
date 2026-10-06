// Step 4 — ดำเนินการ/ตรวจรับ และอนุมัติจ่ายเงิน
import React, { useMemo, useState } from "react";
import { Route, Switch, useHistory, useParams } from "react-router-dom";
import { Button } from "primereact/button";
import { InputTextarea } from "primereact/inputtextarea";
import { Page, Card, DataList, Btn, FormBuilder, useForm, useTable, useFilters, alertSuccess, alertError, ExcelButton, Info, FieldLabel } from "../../components/kit";
import { FilterBar, ProjectInfoPanel, StepRibbon, BackButton, FilesTable, BoardSection, Letter, approveLetter, Modal } from "../shared";
import { baseColumns, baseExcel, FILTERS_STD, FILTERS_TAIL, IconAction, ApprovalCard, name } from "../shared/workflow";
import { QrBlock } from "../shared/qr";
import { DeliverPrint } from "./deliver-print";
import db from "../../mock/db";
import { useAuth } from "../../role-access/authContext";
import { filterProjects, addLog, saveProjectFiles, fineCalc, notifyLine, lineHeader, deliverInfo } from "../../mock/tracking";
import { daysBetween, money, thDateShort, thDate } from "../../utils/format";

const APPROVE_FILTER = {
  name: "contractapprove",
  label: "อนุมัติจ่ายเงิน",
  type: "select",
  options: [
    { label: "-ทั้งหมด-", value: "all" },
    { label: "W-รอดำเนินการ", value: "" },
    { label: "A-อนุมัติจ่ายเงิน", value: "1" },
  ],
};
const useContractRows = (key, extra) => {
  const { user, byear } = useAuth();
  const { data, loading } = useTable("project", { flag: 1, project_purchase: "1", purchase_approve: "1", supplies_approve: "1" });
  const [f, setF] = useFilters(key, { contractapprove: "" });
  const rows = useMemo(() => {
    let r = filterProjects(data, f, { user, byear });
    if (f.contractapprove !== "all") r = r.filter((p) => String(p.contract_approve || "0") === (f.contractapprove || "0"));
    return extra ? extra(r, f) : r.sort((a, b) => b.id - a.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, f, user, byear]);
  return { rows, loading, f, setF };
};

const List = () => {
  const history = useHistory();
  const { rows, loading, f, setF } = useContractRows("contract");
  const dateCols = [
    { field: "contract_number", header: "เลขที่สัญญา" },
    { header: "วันที่เริ่ม", body: (p) => <span className="whitespace-nowrap">{thDateShort(p.contract_startdate)}</span> },
    { header: "วันจบสัญญา", body: (p) => <span className="whitespace-nowrap">{thDateShort(p.contract_enddate)}</span> },
    { field: "contract_numdate", header: "ระยะ(วัน)" },
    { header: "วันส่งมอบงาน", body: (p) => <span className="whitespace-nowrap">{thDateShort(p.contract_receivedate)}</span> },
    { header: "วันตรวจรับ", body: (p) => <span className="whitespace-nowrap">{thDateShort(p.contract_boarddate)}</span> },
    { header: "สถานะจ่ายเงิน", body: (p) => <Letter v={approveLetter(p.contract_approve)} /> },
  ];
  const cols = [
    ...baseColumns(),
    ...dateCols,
    {
      header: "จัดการ",
      body: (p) => (
        <div className="whitespace-nowrap">
          <IconAction icon="pi pi-pencil" title="บันทึกดำเนินการ/รับงาน" onClick={() => history.push(`/contract/edit/${p.id}`)} />
          <IconAction icon="pi pi-th-large" color="text-cyan-600" title="อนุมัติชำระเงิน" onClick={() => history.push(`/contract/approve/${p.id}`)} />
        </div>
      ),
    },
  ];
  const excel = [
    ...baseExcel(),
    { header: "ชื่อถนน", field: "road" },
    { header: "สถานที่", field: "project_place", width: 30 },
    { header: "วันที่เริ่ม", value: (p) => thDateShort(p.contract_startdate) },
    { header: "วันจบสัญญา", value: (p) => thDateShort(p.contract_enddate) },
    { header: "ระยะ(วัน)", field: "contract_numdate" },
    { header: "วันส่งมอบงาน", value: (p) => thDateShort(p.contract_receivedate) },
    { header: "วันตรวจรับ", value: (p) => thDateShort(p.contract_boarddate) },
    { header: "สถานะจ่ายเงิน", value: (p) => approveLetter(p.contract_approve) },
  ];
  return (
    <Page title="ข้อมูลดำเนินการ/ตรวจรับ" subtitle="ขั้นตอนที่ 4 · บันทึกการตรวจรับ ค่าปรับ และอนุมัติจ่ายเงิน" actions={<ExcelButton filename="4-rpt-contract-all" columns={excel} rows={rows} title="ข้อมูลดำเนินการ/ตรวจรับ" />}>
      <FilterBar fields={[...FILTERS_STD, APPROVE_FILTER, ...FILTERS_TAIL]} value={f} onChange={setF} />
      <DataList loading={loading} value={rows} columns={cols} title={`จำนวน ${rows.length} รายการ`} onRowClick={(p) => history.push(`/contract/edit/${p.id}`)} />
    </Page>
  );
};

// ---------------------------------------------------------------- deliver monitor
const Deliver = () => {
  const history = useHistory();
  const [print, setPrint] = useState(false);
  const { rows, loading, f, setF } = useContractRows("deliver", (r, flt) => {
    let out = r;
    if (flt.startdate && flt.enddate) out = out.filter((p) => p.contract_enddate >= flt.startdate && p.contract_enddate <= flt.enddate);
    else if (flt.startdate) out = out.filter((p) => p.contract_enddate >= flt.startdate);
    return out.sort((a, b) => (deliverInfo(b).countdate ?? -1e9) - (deliverInfo(a).countdate ?? -1e9));
  });
  const cols = [
    { header: "ลำดับ", type: "index" },
    { header: "หน่วยงาน", body: (p) => name("bureau", p.bureau_id) },
    { field: "project_code", header: "รหัสโครงการ", body: (p) => <span className="whitespace-nowrap">{p.project_code}</span> },
    { header: "ปีงบ", body: (p) => p.project_byear + 543 },
    { field: "project_name", header: "ชื่อโครงการ", style: { minWidth: "16rem" } },
    { field: "contract_number", header: "เลขที่สัญญา" },
    { header: "สถานะจ่ายเงิน", body: (p) => <Letter v={approveLetter(p.contract_approve)} /> },
    {
      header: "ก่อนวันครบกำหนด 3 วัน",
      body: (p) => {
        const d = deliverInfo(p);
        return (
          <div className="whitespace-nowrap text-center">
            {d.warn && <i className="pi pi-exclamation-triangle block text-amber-500" />}
            {thDateShort(d.deliver)}
          </div>
        );
      },
    },
    { header: "กำหนดส่งมอบงาน", body: (p) => <span className="whitespace-nowrap">{thDateShort(p.contract_enddate)}</span> },
    { header: <span className="text-rose-600">เกินกำหนดส่งมอบงาน (วัน)</span>, body: (p) => <span className="font-bold text-rose-600">{deliverInfo(p).overdue ?? ""}</span> },
    { field: "comment_parcel", header: "หมายเหตุของ จนท.พัสดุ", style: { minWidth: "10rem" } },
    { field: "comment_head", header: "หมายเหตุของ ผู้คุมงาน", style: { minWidth: "10rem" } },
    { field: "comment_inspector", header: "หมายเหตุของ คกก.ตรวจรับงาน", style: { minWidth: "10rem" } },
    { header: "จัดการ", body: (p) => <IconAction icon="pi pi-pencil" title="บันทึกหมายเหตุ" onClick={() => history.push(`/contract/comment/${p.id}`)} /> },
  ];
  const excel = [
    { header: "ลำดับ", type: "index" },
    { header: "หน่วยงาน", value: (p) => name("bureau", p.bureau_id), width: 24 },
    { header: "รหัสโครงการ", field: "project_code", width: 16 },
    { header: "ปีงบ", value: (p) => p.project_byear + 543 },
    { header: "ชื่อโครงการ", field: "project_name", width: 60 },
    { header: "เลขที่สัญญา", field: "contract_number" },
    { header: "สถานะจ่ายเงิน", value: (p) => approveLetter(p.contract_approve) },
    { header: "ก่อนวันครบกำหนด 3 วัน", value: (p) => thDateShort(deliverInfo(p).deliver) },
    { header: "กำหนดส่งมอบงาน", value: (p) => thDateShort(p.contract_enddate) },
    { header: "เกินกำหนดส่งมอบงาน (วัน)", value: (p) => deliverInfo(p).overdue ?? "" },
    { header: "หมายเหตุของ จนท.พัสดุ", field: "comment_parcel", width: 24 },
    { header: "หมายเหตุของ ผู้คุมงาน", field: "comment_head", width: 24 },
    { header: "หมายเหตุของ คกก.ตรวจรับงาน", field: "comment_inspector", width: 24 },
  ];
  return (
    <Page
      title="ข้อมูลดำเนินการ/ตรวจรับ"
      subtitle="ติดตามกำหนดส่งมอบงาน (แจ้งเตือนก่อนครบกำหนด 3 วัน และจำนวนวันที่เกินกำหนด)"
      breadcrumb={["ดำเนินการ/ตรวจรับ", "ส่งมอบงาน/ตรวจรับ"]}
      actions={
        <>
          <ExcelButton filename="4-rpt-contract-deliver" columns={excel} rows={rows} title="ข้อมูลดำเนินการ/ตรวจรับ" />
          <Btn tone="info" icon="pi pi-print" label="ปริ้น PDF" onClick={() => setPrint(true)} />
        </>
      }
    >
      <FilterBar
        fields={[
          ...FILTERS_STD,
          APPROVE_FILTER,
          ...FILTERS_TAIL,
          { name: "startdate", label: "วันส่งมอบงาน ตั้งแต่วันที่", type: "date" },
          { name: "enddate", label: "ถึง", type: "date" },
        ]}
        value={f}
        onChange={setF}
      />
      <DataList loading={loading} value={rows} columns={cols} title={`จำนวน ${rows.length} รายการ`} />
      <DeliverPrint visible={print} onHide={() => setPrint(false)} rows={rows} start={f.startdate} end={f.enddate} />
    </Page>
  );
};

// ---------------------------------------------------------------- comments (3 roles)
const COMMENTS = [
  { key: "parcel", btn: "เจ้าหน้าที่พัสดุ", title: "หมายเหตุเจ้าหน้าที่พัสดุ", label: "หมายเหตุของเจ้าหน้าที่พัสดุ" },
  { key: "head", btn: "ผู้คุมงาน", title: "หมายเหตุผู้คุมงาน", label: "หมายเหตุของผู้คุมงาน" },
  { key: "inspector", btn: "คณะกรรมการตรวจรับ", title: "หมายเหตุคณะกรรมการตรวจรับ", label: "หมายเหตุของคณะกรรมการตรวจรับ" },
];

const Comment = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const p = db.getSync("project", id);
  const [open, setOpen] = useState(null);
  const [text, setText] = useState("");
  const [, force] = useState(0);
  if (!p) return null;
  const save = async () => {
    if (!text.trim()) return alertError("กรุณาทำรายการ");
    await db.update("project", id, { [`comment_${open.key}`]: text, [`comment_${open.key}_date`]: new Date().toISOString(), edit_users: user.id });
    setOpen(null);
    force((x) => x + 1);
    alertSuccess("บันทึกสำเร็จ");
  };
  return (
    <Page title="บันทึกหมายเหตุ" breadcrumb={["ดำเนินการ/ตรวจรับ", p.project_code]} actions={<><StepRibbon n={4} tone="blue" /><BackButton to="/contract/deliver" /></>}>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ProjectInfoPanel p={p} />
        <Card
          title="หมายเหตุ"
          icon="pi pi-comment"
          actions={COMMENTS.map((c) => (
            <Btn key={c.key} tone="info" icon="pi pi-plus" label={c.btn} onClick={() => { setText(p[`comment_${c.key}`] || ""); setOpen(c); }} />
          ))}
        >
          <div className="space-y-4 divide-y divide-slate-100">
            {COMMENTS.map((c) => (
              <div key={c.key} className="pt-3 first:pt-0">
                <Info label="วันที่" value={thDate(p[`comment_${c.key}_date`], { time: true })} />
                <div className="mt-2">
                  <FieldLabel label={c.label} />
                  <InputTextarea className="w-full" rows={4} value={p[`comment_${c.key}`] || ""} disabled />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Modal visible={!!open} onHide={() => setOpen(null)} title={open?.title} width="44rem" footer={<Button size="small" outlined severity="danger" icon="pi pi-times-circle" label="ปิด" onClick={() => setOpen(null)} />}>
        <FieldLabel label="หมายเหตุ" />
        <InputTextarea className="w-full" rows={6} value={text} onChange={(e) => setText(e.target.value)} />
        <div className="mt-3">
          <Btn tone="success" icon="pi pi-save" label="บันทึก" onClick={save} />
        </div>
      </Modal>
    </Page>
  );
};

// ---------------------------------------------------------------- contract-add (inspection + fines)
const warrantyLabel = (w) => (w ? `${w} ปี` : "ไม่มีการรับประกัน");

const Edit = () => {
  const { id } = useParams();
  const history = useHistory();
  const { user } = useAuth();
  const [ver, setVer] = useState(0);
  const p = db.getSync("project", id);
  const recalc = (vals, patch) => ({ ...vals, ...patch, fine_pay: fineCalc(p.purchase_winprice, patch.fine_rate ?? vals.fine_rate, patch.fine_day ?? vals.fine_day) });
  const schema = [
    { name: "contract_receivedate", label: "วันกำหนดส่งมอบงานตามสัญญา", type: "date", col: 4, disabled: true },
    { name: "contract_boarddate", label: "วันกรรมการตรวจรับ", type: "date", col: 4 },
    {
      name: "contract_realdate",
      label: "วันส่งมอบงานจริง",
      type: "date",
      col: 4,
      onChange: (v, vals, set) => {
        const d = daysBetween(vals.contract_receivedate, v);
        set((x) => recalc(x, { contract_realdate: v, fine_day: d > 0 ? d : 0 }));
        return v;
      },
    },
    { name: "purchase_winprice_view", label: "ราคาชนะ(บาท)", type: "static", col: 3, render: () => money(p.purchase_winprice) },
    { name: "fine_rate", label: "อัตราค่าปรับ(%)", type: "number", decimals: 2, col: 3, onChange: (v, vals, set) => { set((x) => recalc(x, { fine_rate: v })); return v; } },
    { name: "fine_day", label: "จำนวน(วัน)", type: "number", col: 3, onChange: (v, vals, set) => { set((x) => recalc(x, { fine_day: v })); return v; } },
    { name: "fine_pay_view", label: "เงินค่าปรับ(บาท)", type: "static", col: 3, render: (v) => <span className="font-semibold text-rose-600">{money(v.fine_pay)}</span> },
    { name: "fine_status", label: "สถานะปรับ", type: "select", col: 3, required: true, options: [{ label: "สงวนสิทธิ์ค่าปรับ", value: "0" }, { label: "ไม่สงวนสิทธิ์ค่าปรับ", value: "1" }] },
    { name: "fine_desc", label: "หมายเหตุ", type: "text", col: 9 },
    { name: "files_receive", label: "เลือกเอกสารแนบ : เอกสารตรวจรับงาน", type: "files", col: 12, accept: ".pdf,.doc,.docx,.xls,.xlsx", help: ".pdf .doc .docx .xls .xlsx เท่านั้น" },
  ];
  const keys = ["contract_receivedate", "contract_boarddate", "contract_realdate", "fine_rate", "fine_day", "fine_pay", "fine_status", "fine_desc"];
  const { values, setValues, errors, check } = useForm(schema, p ? Object.fromEntries(keys.map((k) => [k, p[k]])) : {});
  if (!p) return null;

  const save = async () => {
    if (!check()) return;
    await db.update("project", id, {
      contract_boarddate: values.contract_boarddate,
      contract_realdate: values.contract_realdate,
      fine_rate: values.fine_rate || 0,
      fine_day: values.fine_day || 0,
      fine_pay: values.fine_pay || 0,
      fine_status: values.fine_status || "0",
      fine_desc: values.fine_desc || "",
      edit_users: user.id,
    });
    await addLog(p.id, "บันทึกข้อมูลสัญญา/ตรวจรับ", user);
    await saveProjectFiles(p.id, "receive", values.files_receive, user);
    setValues((v) => ({ ...v, files_receive: [] }));
    setVer((x) => x + 1);
    alertSuccess("บันทึกสำเร็จ");
  };

  return (
    <Page
      title="บันทึกสัญญา/ตรวจรับพัสดุ"
      breadcrumb={["ดำเนินการ/ตรวจรับ", p.project_code]}
      actions={
        <>
          <StepRibbon n={4} />
          <Btn tone="info" icon="pi pi-angle-double-left" label="ขั้นตอนก่อนหน้า" onClick={() => history.push(`/supplies/edit/${id}`)} />
          <BackButton to="/contract" />
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ProjectInfoPanel p={p} />
        <div className="space-y-4">
          <Card title="ข้อมูลสัญญา" icon="pi pi-file">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              <Info label="เลขที่สัญญา" value={p.contract_number || "-"} />
              <Info label="วันที่เริ่มสัญญา" value={thDateShort(p.contract_startdate)} />
              <Info label="วันที่จบสัญญา" value={thDateShort(p.contract_enddate)} />
              <Info label="ระยะเวลา(วัน)" value={p.contract_numdate ?? "-"} />
              <Info label="ระยะเวลารับประกัน(ปี)" value={warrantyLabel(p.warranty)} />
              <Info label="วันที่หมดประกัน" value={thDateShort(p.warranty_expire)} />
              <Info label="ผู้ชนะ" value={name("company", p.purchase_winname)} className="col-span-2 md:col-span-3" />
            </div>
          </Card>
          <Card title="ข้อมูลการตรวจรับพัสดุ" icon="pi pi-check-square">
            <FormBuilder fields={schema} values={values} setValues={setValues} errors={errors} />
            <div className="mt-2 text-xs text-slate-400">อัตราค่าปรับคิดจากราคาชนะ × อัตรา(%) ต่อวัน ขั้นต่ำวันละ 100 บาท</div>
            <div className="mt-5 mb-2 text-sm font-semibold text-slate-700">เอกสารตรวจรับงานทั้งหมด</div>
            <FilesTable key={ver} projectId={p.id} types={["receive"]} showUser={false} />
            <div className="mt-5 flex gap-2">
              <Btn icon="pi pi-save" label="บันทึก" onClick={save} />
              <BackButton />
            </div>
          </Card>
          <BoardSection projectId={p.id} user={user} readOnly />
        </div>
      </div>
    </Page>
  );
};

// ---------------------------------------------------------------- approve payment + qrcode
const Approve = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [, force] = useState(0);
  const p = db.getSync("project", id);
  if (!p) return null;
  const incomplete = !p.contract_startdate || !p.contract_enddate || !p.contract_receivedate;
  const genQr = async () => {
    await db.update("project", id, { qrcode_gen: "1", qrcode_date: new Date().toISOString(), qrcode_users: user.id });
    await addLog(p.id, "บันทึกสร้าง qrcode", user);
    force((x) => x + 1);
    alertSuccess("สร้าง qrcode เรียบร้อย");
  };
  return (
    <Page title="บันทึกอนุมัติจ่ายเงิน" breadcrumb={["ดำเนินการ/ตรวจรับ", p.project_code]} actions={<><StepRibbon n={4} tone="blue" /><BackButton to="/contract" /></>}>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ProjectInfoPanel p={p} />
        <ApprovalCard
          p={p}
          user={user}
          onChange={() => force((x) => x + 1)}
          cfg={{
            title: "อนุมัติจ่ายเงิน",
            modalTitle: "อนุมัติชำระเงิน",
            dateLabel: "วันที่อนุมัติ",
            field: "contract_approve",
            dateField: "contract_approvedate",
            userField: "contract_approveusers",
            statusLabel: "สถานะอนุมัติจ่ายเงิน",
            options: [
              { label: "W-รอดำเนินการ", value: "0" },
              { label: "A-อนุมัติจ่ายเงิน", value: "1" },
            ],
            successText: "อนุมัติชำระเงินสำเร็จ",
            warnText: incomplete ? "ไม่สามารถอนุมัติชำระเงินได้" : null,
            extraActions: <Btn tone="warning" icon="pi pi-qrcode" label="สร้าง qrcode" onClick={genQr} />,
            children: <QrBlock p={p} />,
            onSaved: async (v) => {
              await addLog(p.id, "บันทึกอนุมัติชำระเงิน", user);
              if (v.status === "1") {
                const h = lineHeader(p);
                notifyLine(4, p, [`อนุมัติจ่ายเงิน(4) เลขที่สัญญา ${p.contract_number}`, `โครงการ: ${p.project_name}`, `งบประมาณ ${h.budget} บาท`, `ประเภทประมาณ ${h.bg}`, `ปีงบ ${h.year}`, `วันที่เริ่มสัญญา ${h.start}`, `วันที่จบสัญญา ${h.end}`, `ผู้ชนะ ${h.win}`, `วันอนุมัติจ่ายเงิน ${thDateShort(v.date)}`, `วันส่งมอบงานจริง ${thDateShort(p.contract_realdate)}`]);
              }
            },
          }}
        />
      </div>
    </Page>
  );
};

const ContractModule = () => (
  <Switch>
    <Route path="/contract/edit/:id" component={Edit} />
    <Route path="/contract/approve/:id" component={Approve} />
    <Route path="/contract/comment/:id" component={Comment} />
    <Route path="/contract/deliver" component={Deliver} />
    <Route path="/contract" component={List} />
  </Switch>
);

export default ContractModule;
