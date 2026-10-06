// Step 2 — จัดซื้อ/จัดจ้าง
import React, { useMemo, useState } from "react";
import { Route, Switch, useHistory, useParams } from "react-router-dom";
import { Page, Card, DataList, Btn, FormBuilder, useForm, useTable, useFilters, alertSuccess, ExcelButton } from "../../components/kit";
import { FilterBar, ProjectInfoPanel, StepRibbon, BackButton, FilesTable, Letter, approveLetter } from "../shared";
import { baseColumns, baseExcel, FILTERS_STD, FILTERS_TAIL, IconAction, ApprovalCard } from "../shared/workflow";
import db from "../../mock/db";
import { useAuth } from "../../role-access/authContext";
import { filterProjects, addLog, saveProjectFiles, notifyLine, lineHeader } from "../../mock/tracking";
import { thDateShort } from "../../utils/format";

const APPROVE_OPTS = [
  { label: "W-รอดำเนินการ", value: "0" },
  { label: "A-อนุมัติจัดหาพัสดุ", value: "1" },
];

const List = () => {
  const history = useHistory();
  const { user, byear } = useAuth();
  const { data, loading } = useTable("project", { flag: 1, project_purchase: "1" });
  const [f, setF] = useFilters("purchase", { purchaseapprove: "" });
  const rows = useMemo(() => {
    let r = filterProjects(data, f, { user, byear });
    if (f.purchaseapprove !== "all") r = r.filter((p) => String(p.purchase_approve || "0") === (f.purchaseapprove || "0"));
    return r.sort((a, b) => b.id - a.id);
  }, [data, f, user, byear]);

  const cols = [
    ...baseColumns(),
    { field: "road", header: "ชื่อถนน" },
    { field: "project_place", header: "สถานที่", style: { minWidth: "10rem" } },
    { field: "purchase_pricecenter", header: "ราคากลาง", type: "money" },
    { header: "สถานะจัดหาพัสดุ", body: (p) => <Letter v={approveLetter(p.purchase_approve)} /> },
    {
      header: "จัดการ",
      body: (p) => (
        <div className="whitespace-nowrap">
          <IconAction icon="pi pi-pencil" title="บันทึกจัดซื้อ/จัดจ้าง" onClick={() => history.push(`/purchase/edit/${p.id}`)} />
          <IconAction icon="pi pi-th-large" color="text-cyan-600" title="อนุมัติจัดหาพัสดุ" onClick={() => history.push(`/purchase/approve/${p.id}`)} />
        </div>
      ),
    },
  ];
  const excel = [...baseExcel(), { header: "ชื่อถนน", field: "road" }, { header: "สถานที่", field: "project_place", width: 30 }, { header: "ราคากลาง", field: "purchase_pricecenter", type: "money", width: 16 }, { header: "สถานะจัดหาพัสดุ", value: (p) => approveLetter(p.purchase_approve) }];

  return (
    <Page title="ข้อมูลโครงการจัดซื้อ/จัดจ้าง" subtitle="ขั้นตอนที่ 2 · บันทึกราคากลาง TOR และอนุมัติจัดหาพัสดุ" actions={<ExcelButton filename="2-rpt-purchase-all" columns={excel} rows={rows} title="ข้อมูลโครงการจัดซื้อ/จัดจ้าง" />}>
      <FilterBar
        fields={[...FILTERS_STD, { name: "purchaseapprove", label: "อนุมัติจัดหาพัสดุ", type: "select", options: [{ label: "-ทั้งหมด-", value: "all" }, { label: "W-รอดำเนินการ", value: "" }, { label: "A-อนุมัติจัดหาพัสดุ", value: "1" }] }, ...FILTERS_TAIL]}
        value={f}
        onChange={setF}
      />
      <DataList loading={loading} value={rows} columns={cols} title={`จำนวน ${rows.length} รายการ`} onRowClick={(p) => history.push(`/purchase/edit/${p.id}`)} />
    </Page>
  );
};

const schema = [
  { name: "purchase_pricecenter", label: "ราคากลาง", type: "money", col: 6, required: true, msg: "กรุณาระบุราคากลาง" },
  { name: "files_pricecenter", label: "เลือกเอกสารแนบ : ราคากลาง", type: "files", col: 12, help: ".pdf .doc .docx .xls .xlsx เท่านั้น", accept: ".pdf,.doc,.docx,.xls,.xlsx" },
  { name: "files_tor", label: "เลือกเอกสารแนบ : TOR", type: "files", col: 12, help: ".pdf .doc .docx .xls .xlsx เท่านั้น", accept: ".pdf,.doc,.docx,.xls,.xlsx" },
];

const Edit = () => {
  const { id } = useParams();
  const history = useHistory();
  const { user } = useAuth();
  const [ver, setVer] = useState(0);
  const p = db.getSync("project", id);
  const { values, setValues, errors, check } = useForm(schema, { purchase_pricecenter: p?.purchase_pricecenter, purchase_detail: p?.purchase_detail });

  const save = async () => {
    if (!check()) return;
    await db.update("project", id, { purchase_pricecenter: values.purchase_pricecenter || 0, purchase_detail: values.purchase_detail || "", edit_users: user.id });
    await addLog(p.id, "บันทึกข้อมูลจัดซื้อจัดจ้าง", user);
    await saveProjectFiles(p.id, "pricecenter", values.files_pricecenter, user);
    await saveProjectFiles(p.id, "tor", values.files_tor, user);
    setValues((v) => ({ ...v, files_pricecenter: [], files_tor: [] }));
    setVer((x) => x + 1);
    alertSuccess("บันทึกสำเร็จ");
  };
  if (!p) return null;
  return (
    <Page
      title="บันทึกจัดซื้อ/จัดจ้าง"
      breadcrumb={["จัดซื้อ/จัดจ้าง", p.project_code]}
      actions={
        <>
          <StepRibbon n={2} />
          <Btn tone="info" icon="pi pi-angle-double-left" label="ขั้นตอนก่อนหน้า" onClick={() => history.push(`/project/edit/${id}`)} />
          <BackButton to="/purchase" />
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ProjectInfoPanel p={p} />
        <Card title="ข้อมูลจัดซื้อจัดจ้าง" icon="pi pi-shopping-cart">
          <FormBuilder fields={schema} values={values} setValues={setValues} errors={errors} />
          <div className="mt-5 mb-2 text-sm font-semibold text-slate-700">เอกสารแนบทั้งหมด</div>
          <FilesTable key={ver} projectId={p.id} types={["pricecenter", "tor"]} />
          <div className="mt-5">
            <FormBuilder fields={[{ name: "purchase_detail", label: "หมายเหตุ (ถ้ามี)", type: "richtext", col: 12 }]} values={values} setValues={setValues} />
          </div>
          <div className="mt-5 flex gap-2">
            <Btn icon="pi pi-save" label="บันทึก" onClick={save} />
            <BackButton />
          </div>
        </Card>
      </div>
    </Page>
  );
};

const Approve = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [, force] = useState(0);
  const p = db.getSync("project", id);
  if (!p) return null;
  return (
    <Page title="บันทึกอนุมัติจัดหาพัสดุ" breadcrumb={["จัดซื้อ/จัดจ้าง", p.project_code]} actions={<><StepRibbon n={2} tone="blue" /><BackButton to="/purchase" /></>}>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ProjectInfoPanel p={p} />
        <ApprovalCard
          p={p}
          user={user}
          onChange={() => force((x) => x + 1)}
          cfg={{
            title: "อนุมัติจัดหาพัสดุ",
            field: "purchase_approve",
            dateField: "purchase_approvedate",
            userField: "purchase_approveusers",
            statusLabel: "สถานะอนุมัติจัดหาพัสดุ",
            options: APPROVE_OPTS,
            successText: "อนุมัติจัดหาพัสดุสำเร็จ",
            onSaved: async (v) => {
              await addLog(p.id, "บันทึกอนุมัติจัดหาพัสดุ", user);
              if (v.status === "1") {
                const h = lineHeader(p);
                notifyLine(2, p, [`อนุมัติจัดหาพัสดุ(2) โครงการ: ${p.project_name}`, `งบประมาณ ${h.budget} บาท`, `ประเภทประมาณ ${h.bg}`, `ปีงบ ${h.year}`, `วันที่อนุมัติ ${thDateShort(v.date)}`, `ตรวจสอบที่ ${window.location.origin}`]);
              }
            },
          }}
        />
      </div>
    </Page>
  );
};

const PurchaseModule = () => (
  <Switch>
    <Route path="/purchase/edit/:id" component={Edit} />
    <Route path="/purchase/approve/:id" component={Approve} />
    <Route path="/purchase" component={List} />
  </Switch>
);

export default PurchaseModule;
