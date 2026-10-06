// Step 5 — การเงิน (จ่ายเงิน / รหัสครุภัณฑ์)
import React, { useMemo, useState } from "react";
import { Route, Switch, useHistory, useParams } from "react-router-dom";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Page, Card, DataList, Btn, FormBuilder, useForm, useTable, useFilters, alertSuccess, ExcelButton, Info, confirmAction, StatusBadge } from "../../components/kit";
import { FilterBar, StepRibbon, BackButton, SimpleTable, Modal } from "../shared";
import { baseColumns, baseExcel, FILTERS_STD, FILTERS_TAIL, IconAction, name } from "../shared/workflow";
import db from "../../mock/db";
import { useAuth } from "../../role-access/authContext";
import { filterProjects, addLog, paidOf, payTotalOf, payStatusOf, PAY_STATUS, notifyLine, lineHeader } from "../../mock/tracking";
import { money, thDateShort } from "../../utils/format";

const STATUS_ICON = { W: "pi pi-hourglass text-amber-500", A: "pi pi-check-square text-emerald-600", P: "pi pi-money-bill text-cyan-600" };
const PayLetter = ({ p }) => {
  const s = payStatusOf(p);
  return (
    <span className="whitespace-nowrap font-semibold">
      <i className={`${STATUS_ICON[s]} mr-1`} />
      {s}
    </span>
  );
};

const List = () => {
  const history = useHistory();
  const { user, byear } = useAuth();
  const { data, loading } = useTable("project", { flag: 1, project_purchase: "1", purchase_approve: "1", supplies_approve: "1", contract_approve: "1" });
  const [f, setF] = useFilters("finance", { financeapprove: "0" });
  const rows = useMemo(() => {
    let r = filterProjects(data, f, { user, byear });
    const want = { 0: "W", 1: "A", 2: "P" }[f.financeapprove ?? "0"];
    if (f.financeapprove !== "all" && want) r = r.filter((p) => payStatusOf(p) === want);
    return r.sort((a, b) => b.id - a.id);
  }, [data, f, user, byear]);

  const cols = [
    ...baseColumns(),
    { field: "road", header: "ชื่อถนน" },
    { field: "project_place", header: "สถานที่", style: { minWidth: "10rem" } },
    { field: "purchase_winprice", header: "ราคาชนะ", type: "money" },
    { header: "ค่าปรับ", body: (p) => <div className="text-right">{money(String(p.fine_status) === "1" ? p.fine_pay : 0)}</div> },
    { header: "จ่ายแล้ว", body: (p) => <div className="text-right">{money(paidOf(p.id))}</div> },
    { header: "สถานะจ่ายเงิน", body: (p) => <PayLetter p={p} /> },
    { header: "จัดการ", body: (p) => <IconAction icon="pi pi-pencil" title="บันทึกจ่ายเงิน" onClick={() => history.push(`/finance/edit/${p.id}`)} /> },
  ];
  const excel = [
    ...baseExcel(),
    { header: "ชื่อถนน", field: "road" },
    { header: "สถานที่", field: "project_place", width: 30 },
    { header: "ราคาชนะ", field: "purchase_winprice", type: "money", width: 16 },
    { header: "ค่าปรับ", value: (p) => (String(p.fine_status) === "1" ? Number(p.fine_pay) : 0), width: 14 },
    { header: "จ่ายแล้ว", value: (p) => paidOf(p.id), width: 16 },
    { header: "สถานะจ่ายเงิน", value: (p) => payStatusOf(p) },
  ];
  return (
    <Page title="ข้อมูลโครงการชำระเงิน" subtitle="ขั้นตอนที่ 5 · บันทึกการจ่ายเงินและรหัสครุภัณฑ์" actions={<ExcelButton filename="5-rpt-finance-all" columns={excel} rows={rows} title="ข้อมูลโครงการชำระเงิน" />}>
      <FilterBar
        fields={[
          ...FILTERS_STD,
          {
            name: "financeapprove",
            label: "สถานะจ่ายเงิน",
            type: "select",
            options: [
              { label: "-ทั้งหมด-", value: "all" },
              { label: "W-รอดำเนินการ", value: "0" },
              { label: "A-จ่ายเงินเรียบร้อย", value: "1" },
              { label: "P-กำลังจ่ายเงิน", value: "2" },
            ],
          },
          ...FILTERS_TAIL,
        ]}
        value={f}
        onChange={setF}
      />
      <DataList loading={loading} value={rows} columns={cols} title={`จำนวน ${rows.length} รายการ`} onRowClick={(p) => history.push(`/finance/edit/${p.id}`)} />
    </Page>
  );
};

const paySchema = [
  { name: "payment_date", label: "วันที่จ่ายเงิน", type: "date", col: 4, required: true, msg: "กรุณาระบุวันที่จ่ายเงิน" },
  { name: "payment_method", label: "ประเภทการจ่ายเงิน", type: "select", col: 4, required: true, msg: "กรุณาระบุประเภทการจ่ายเงิน", source: { table: "payment_type" } },
  { name: "payment_amount", label: "จำนวนเงิน", type: "money", col: 4, required: true, msg: "กรุณาระบุจำนวนเงิน" },
  { name: "payment_remark", label: "บันทึกเพิ่มเติม", type: "textarea", col: 12 },
];

const Edit = () => {
  const { id } = useParams();
  const history = useHistory();
  const { user } = useAuth();
  const [, force] = useState(0);
  const [payOpen, setPayOpen] = useState(false);
  const [eqOpen, setEqOpen] = useState(false);
  const [eqRows, setEqRows] = useState(Array(6).fill(""));
  const { values, setValues, errors, check } = useForm(paySchema);
  const p = db.getSync("project", id);
  if (!p) return null;
  const payments = db.findSync("project_payment", { project_id: p.id, flag: 1 });
  const eqs = db.findSync("eq_code", { project_id: p.id, flag: 1 });
  const total = payTotalOf(p);
  const paid = paidOf(p.id);

  const savePay = async () => {
    if (!check()) return;
    await db.insert("project_payment", { project_id: p.id, ...values, payment_remark: values.payment_remark || "", flag: 1, add_users: user.id });
    await addLog(p.id, "บันทึกข้อมูลจ่ายเงิน", user);
    const h = lineHeader(p);
    notifyLine(5, p, [
      `จ่ายเงิน(5) เลขที่สัญญา ${p.contract_number}`,
      `โครงการ: ${p.project_name}`,
      `งบประมาณ ${h.budget} บาท`,
      `ประเภทประมาณ ${h.bg}`,
      `ปีงบ ${h.year}`,
      `วันที่เริ่มสัญญา ${h.start}`,
      `วันที่จบสัญญา ${h.end}`,
      `ผู้ชนะ ${h.win}`,
      `วันอนุมัติตรวจรับ ${thDateShort(p.supplies_approvedate)}`,
      `วันที่จ่าย ${thDateShort(values.payment_date)}`,
      `จำนวนเงิน ${values.payment_amount}`,
    ]);
    setPayOpen(false);
    setValues({});
    force((x) => x + 1);
    alertSuccess("บันทึกสำเร็จ");
  };
  const delRow = async (table, r) => {
    if (!(await confirmAction("แน่ใจนะ?", "ต้องการยกเลิกรายการ", "ใช่, ต้องการยกเลิกรายการ !", "#dc2626"))) return;
    await db.update(table, r.id, { flag: 0, edit_users: user.id });
    force((x) => x + 1);
  };
  const saveEq = async () => {
    for (const code of eqRows.filter((x) => x.trim())) await db.insert("eq_code", { project_id: p.id, eq_code: code.trim(), flag: 1, add_users: user.id });
    setEqOpen(false);
    setEqRows(Array(6).fill(""));
    force((x) => x + 1);
    alertSuccess("บันทึกสำเร็จ");
  };

  return (
    <Page
      title="บันทึกการจ่ายเงิน"
      breadcrumb={["การเงิน", p.project_code]}
      actions={
        <>
          <StepRibbon n={5} />
          <Btn tone="info" icon="pi pi-angle-double-left" label="ขั้นตอนก่อนหน้า" onClick={() => history.push(`/contract/edit/${id}`)} />
          <BackButton to="/finance" />
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card title="ข้อมูลโครงการ" icon="pi pi-list">
          <div className="space-y-4">
            <div className="rounded-2xl bg-slate-50 p-3 text-sm font-semibold leading-6">{p.project_name}</div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              <Info label="งาน" value={name("work_type", p.worktype_id)} />
              <Info label="หมวดค่าใช้จ่าย" value={name("expenses_group", p.expenses_group)} />
              <Info label="ประเภทค่าใช้จ่าย" value={name("expenses_type", p.expenses_type)} />
              <Info label="วันที่โครงการ" value={thDateShort(p.project_date)} />
              <Info label="งบประมาณอนุมัติ" value={money(p.budget_approve)} />
              <Info label="เลขที่สัญญา" value={p.contract_number} />
              <Info label="ราคาชนะ(บาท)" value={money(p.purchase_winprice)} />
              <Info label="อัตราค่าปรับ(%)" value={p.fine_rate} />
              <Info label="จำนวน(วัน)" value={p.fine_day} />
              <Info label="เงินค่าปรับ(บาท)" value={money(p.fine_pay)} />
              <Info label="สถานะปรับ" value={String(p.fine_status) === "1" ? "ไม่สงวนสิทธิ์ค่าปรับ" : "สงวนสิทธิ์ค่าปรับ"} />
              <Info label="รวมจ่ายเงินทั้งสิ้น(บาท)" value={<span className="text-lg font-bold text-rose-600">{money(total)}</span>} />
              <Info label="ถนน" value={p.road} className="col-span-2 md:col-span-3" />
              <Info label="สถานที่" value={p.project_place} className="col-span-2 md:col-span-3" />
            </div>
          </div>
        </Card>
        <div className="space-y-4">
          <Card title="สถานะจ่ายเงิน" icon="pi pi-wallet" actions={<Btn icon="pi pi-plus" label="บันทึกจ่ายเงิน" onClick={() => setPayOpen(true)} />}>
            <div className="mb-3 flex flex-wrap items-center gap-4 text-sm">
              <StatusBadge map={PAY_STATUS} value={payStatusOf(p)} />
              <span>
                จ่ายแล้ว <b>{money(paid)}</b> / {money(total)} บาท
              </span>
              <span className="text-slate-500">คงเหลือ {money(Math.max(total - paid, 0))} บาท</span>
            </div>
            <SimpleTable
              head={["ลำดับ", "วันที่", "ประเภทการจ่าย", { label: "จำนวนเงิน", className: "text-right" }, "เพิ่มเติม", "จัดการ"]}
              rows={payments.map((r, i) => [
                i + 1,
                thDateShort(r.payment_date),
                name("payment_type", r.payment_method),
                money(r.payment_amount),
                r.payment_remark || "-",
                <button key="d" type="button" title="ยกเลิกรายการ" className="text-rose-600" onClick={() => delRow("project_payment", r)}>
                  <i className="pi pi-trash" />
                </button>,
              ])}
            />
          </Card>
          <Card title="รหัสครุภัณฑ์" icon="pi pi-tag" actions={<Btn tone="info" icon="pi pi-plus" label="บันทึกรหัสครุภัณฑ์" onClick={() => setEqOpen(true)} />}>
            <SimpleTable
              head={["ลำดับ", "รหัสครุภัณฑ์", "จัดการ"]}
              rows={eqs.map((r, i) => [
                i + 1,
                r.eq_code,
                <button key="d" type="button" className="text-rose-600" onClick={() => delRow("eq_code", r)}>
                  <i className="pi pi-trash" />
                </button>,
              ])}
            />
          </Card>
        </div>
      </div>
      <div className="mt-4">
        <BackButton />
      </div>

      <Modal visible={payOpen} onHide={() => setPayOpen(false)} title="บันทึกจ่ายเงิน" footer={<Button size="small" outlined severity="danger" icon="pi pi-times-circle" label="ปิด" onClick={() => setPayOpen(false)} />}>
        <FormBuilder fields={paySchema} values={values} setValues={setValues} errors={errors} />
        <div className="mt-4">
          <Btn tone="success" icon="pi pi-save" label="บันทึก" onClick={savePay} />
        </div>
      </Modal>
      <Modal visible={eqOpen} onHide={() => setEqOpen(false)} title="บันทึกรหัสครุภัณฑ์" width="36rem" footer={<Button size="small" outlined severity="danger" icon="pi pi-times-circle" label="ปิด" onClick={() => setEqOpen(false)} />}>
        <div className="space-y-2">
          {eqRows.map((v, i) => (
            <InputText key={i} className="w-full" placeholder="รหัสครุภัณฑ์" value={v} onChange={(e) => setEqRows((r) => r.map((x, j) => (j === i ? e.target.value : x)))} />
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <Btn tone="info" icon="pi pi-plus" label="เพิ่มแถว" onClick={() => setEqRows((r) => [...r, ""])} />
          <Btn tone="success" icon="pi pi-save" label="บันทึก" onClick={saveEq} />
        </div>
      </Modal>
    </Page>
  );
};

const FinanceModule = () => (
  <Switch>
    <Route path="/finance/edit/:id" component={Edit} />
    <Route path="/finance" component={List} />
  </Switch>
);

export default FinanceModule;
