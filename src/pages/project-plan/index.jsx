// แผนดำเนินโครงการ (project_plan_main) + Gantt + แผน 5 ปี (project_plan)
import React, { useEffect, useMemo } from "react";
import { Route, Switch, useHistory, useParams } from "react-router-dom";
import { Page, Card, DataList, Btn, FormBuilder, useForm, useTable, useFilters, alertSuccess, confirmAction, ExcelButton } from "../../components/kit";
import { FilterBar, BackButton } from "../shared";
import { IconAction, name } from "../shared/workflow";
import db from "../../mock/db";
import { useAuth } from "../../role-access/authContext";
import { isAdminRole, lookupOptions, byearOptions } from "../../mock/tracking";
import { money } from "../../utils/format";

const monthName = (m) => db.getSync("month", m)?.name || "-";
const monthShort = (m) => db.getSync("month", m)?.short || "-";
const FISCAL_MONTHS = ["10", "11", "12", "01", "02", "03", "04", "05", "06", "07", "08", "09"];

const usePlanRows = (key, yearsAll) => {
  const { user, byear } = useAuth();
  const { data, loading, reload } = useTable("project_plan_main", { flag: 1 });
  const [f, setF] = useFilters(key, {});
  const rows = useMemo(() => {
    const admin = isAdminRole(user);
    return data
      .filter((p) => admin || String(p.bureau_id) === String(user.bureau_id))
      .filter((p) => (f.bureau === 99 ? !db.getSync("bureau", p.bureau_id) : !f.bureau || String(p.bureau_id) === String(f.bureau)))
      .filter((p) => !f.worktype || String(p.work_typeid) === String(f.worktype))
      .filter((p) => !f.expenses_group || String(p.expenses_group) === String(f.expenses_group))
      .filter((p) => !f.expenses_type || String(p.expenses_type) === String(f.expenses_type))
      .filter((p) => !f.plan_typeid || String(p.plan_typeid) === String(f.plan_typeid))
      .filter((p) => (f.byear ? String(p.project_byear) === String(f.byear) : !yearsAll || [byear, byear - 1, byear - 2].includes(p.project_byear)))
      .filter((p) => !f.search || p.project_name.includes(f.search))
      .sort((a, b) => b.id - a.id);
  }, [data, f, user, byear, yearsAll]);
  return { rows, loading, reload, f, setF, byear };
};

const planFilters = (byear, up = 8) => [
  "bureau99",
  "worktype",
  "expenses_group",
  "expenses_type",
  { name: "byear", label: "ปีงบ", type: "select", options: byearOptions(byear, up, 2) },
  { name: "plan_typeid", label: "แผนงาน", type: "select", options: lookupOptions("plan_type", "ระบุ") },
  "search",
];

const excelCols = [
  { header: "ลำดับ", type: "index" },
  { header: "primary key", field: "id" },
  { header: "ปีงบ", value: (p) => p.project_byear + 543 },
  { header: "ชื่อโครงการ", field: "project_name", width: 60 },
  { header: "หน่วยงาน", value: (p) => name("bureau", p.bureau_id), width: 24 },
  { header: "งาน", value: (p) => name("work_type", p.work_typeid), width: 18 },
  { header: "หมวดรายจ่าย", value: (p) => name("expenses_group", p.expenses_group) },
  { header: "ประเภทรายจ่าย", value: (p) => name("expenses_type", p.expenses_type) },
  { header: "งบอนุมัติ", field: "budget", type: "money", width: 16 },
  { header: "สัปดาห์ที่เริ่ม", field: "project_startweek" },
  { header: "เดือนที่เริ่ม", value: (p) => monthName(p.project_startmonth) },
  { header: "สัปดาห์ที่สิ้นสุด", field: "project_endweek" },
  { header: "เดือนที่สิ้นสุด", value: (p) => monthName(p.project_endmonth) },
  { header: "แผนงาน", value: (p) => name("plan_type", p.plan_typeid), width: 28 },
  { header: "พันธกิจ", value: (p) => name("plan_mission", p.mission), width: 30 },
  { header: "ประเภทโครงการ", value: (p) => name("plan_projecttype", p.project_type) },
  { header: "กลยุทธ์", field: "strategy" },
  { header: "ยุทธศาสตร์", value: (p) => name("plan_strategy", p.stag_id), width: 30 },
  { header: "ระบุกรณี", value: (p) => name("plan_condition", p.project_condition) },
  { header: "กิจกรรม", field: "project_activity", width: 30 },
  { header: "สถานที่", field: "project_place", width: 30 },
  { header: "หมายเหตุ", field: "remark", width: 20 },
];

const List = () => {
  const history = useHistory();
  const { user } = useAuth();
  const { rows, loading, reload, f, setF, byear } = usePlanRows("plan", false);
  const del = async (p) => {
    if (!(await confirmAction("แน่ใจนะ?", "ต้องการยกเลิกรายการ", "ใช่, ต้องการยกเลิกรายการ !", "#dc2626"))) return;
    await db.update("project_plan_main", p.id, { flag: 0, edit_users: user.id });
    reload();
  };
  return (
    <Page
      title="ข้อมูลแผนดำเนินโครงการทั้งหมด"
      actions={
        <>
          <Btn tone="success" icon="pi pi-plus-circle" label="เพิ่มแผนดำเนินโครงการ" onClick={() => history.push("/project-plan/add")} />
          <ExcelButton filename="1-rpt-projectplan-all" title="แผนดำเนินโครงการทั้งหมด" columns={excelCols} rows={rows} />
        </>
      }
    >
      <FilterBar fields={planFilters(byear)} value={f} onChange={setF} />
      <DataList
        loading={loading}
        value={rows}
        title={`จำนวน ${rows.length} รายการ`}
        onRowClick={(p) => history.push(`/project-plan/edit/${p.id}`)}
        columns={[
          { header: "ลำดับ", type: "index" },
          { field: "project_byear", header: "ปีงบ", body: (p) => p.project_byear + 543 },
          { field: "project_name", header: "ชื่อโครงการ", body: (p) => <span className="font-medium text-blue-700">{p.project_name}</span>, style: { minWidth: "18rem" } },
          { header: "หน่วยงาน", body: (p) => name("bureau", p.bureau_id) },
          { header: "งาน", body: (p) => name("work_type", p.work_typeid) },
          { header: "หมวดรายจ่าย", body: (p) => name("expenses_group", p.expenses_group) },
          { header: "ประเภทรายจ่าย", body: (p) => name("expenses_type", p.expenses_type) },
          { field: "budget", header: "งบอนุมัติ", type: "money" },
          { field: "project_startweek", header: "สัปดาห์ที่เริ่ม" },
          { header: "เดือนที่เริ่ม", body: (p) => monthName(p.project_startmonth) },
          { field: "project_endweek", header: "สัปดาห์ที่สิ้นสุด" },
          { header: "เดือนที่สิ้นสุด", body: (p) => monthName(p.project_endmonth) },
          { header: "แผนงาน", body: (p) => name("plan_type", p.plan_typeid) },
          { header: "พันธกิจ", body: (p) => name("plan_mission", p.mission), style: { minWidth: "12rem" } },
          { header: "ประเภทโครงการ", body: (p) => name("plan_projecttype", p.project_type) },
          {
            header: "จัดการ",
            body: (p) => (
              <div className="whitespace-nowrap">
                <IconAction icon="pi pi-pencil" title="แก้ไขโครงการ" onClick={() => history.push(`/project-plan/edit/${p.id}`)} />
                <IconAction icon="pi pi-eye" color="text-cyan-600" title="รายละเอียด" onClick={() => history.push(`/project-plan/view/${p.id}`)} />
                <IconAction icon="pi pi-trash" color="text-rose-600" title="ยกเลิกโครงการ" onClick={() => del(p)} />
              </div>
            ),
          },
        ]}
      />
    </Page>
  );
};

const weekOpts = [1, 2, 3, 4].map((w) => ({ label: String(w), value: w }));
const planSchema = (isEdit) => [
  {
    title: "ข้อมูลแผนดำเนินโครงการ",
    icon: "pi pi-calendar",
    fields: [
      { name: "project_byear", label: "ปีงบ", type: "select", col: 4, required: true, disabled: isEdit, help: isEdit ? "แก้ไขปีงบไม่ได้หลังบันทึก" : "", options: () => db.findSync("project_byear").slice().sort((a, b) => b.byear - a.byear).map((y) => ({ label: String(y.byear + 543), value: y.byear })) },
      { name: "project_startmonth", label: "เดือนที่เริ่ม", type: "select", col: 2, source: { table: "month" } },
      { name: "project_startweek", label: "สัปดาห์ที่เริ่ม", type: "select", col: 2, options: weekOpts },
      { name: "project_endmonth", label: "เดือนที่สิ้นสุด", type: "select", col: 2, source: { table: "month" } },
      { name: "project_endweek", label: "สัปดาห์ที่สิ้นสุด", type: "select", col: 2, options: weekOpts },
      { name: "project_priority", label: "ความสำคัญ", type: "select", col: 4, source: { table: "priority" } },
      { name: "strategy", label: "กลยุทธ์ (ไม่มีให้ระบุ -)", type: "textarea", rows: 2, col: 8 },
      { name: "stag_id", label: "ยุทธศาสตร์", type: "select", col: 6, source: { table: "plan_strategy" } },
      { name: "plan_typeid", label: "แผนงาน", type: "select", col: 6, source: { table: "plan_type" } },
      { name: "project_name", label: "ชื่อโครงการ", type: "textarea", rows: 4, col: 12, required: true, msg: "กรุณาระบุชื่อโครงการ" },
      { name: "project_condition", label: "ระบุกรณี", type: "select", col: 6, source: { table: "plan_condition" } },
      { name: "project_activity", label: "กิจกรรม", type: "textarea", rows: 2, col: 12 },
      { name: "project_place", label: "สถานที่", type: "textarea", rows: 2, col: 12 },
      { name: "bureau_id", label: "หน่วยงานรับผิดชอบ", type: "select", col: 6, source: { table: "bureau" } },
      { name: "work_typeid", label: "งาน", type: "select", col: 6, required: true, msg: "กรุณาระบุงาน", source: { table: "work_type" } },
      { name: "expenses_group", label: "หมวดค่าใช้จ่าย", type: "select", col: 6, required: true, msg: "กรุณาระบุหมวดรายจ่าย", source: { table: "expenses_group" } },
      { name: "expenses_type", label: "ประเภทค่าใช้จ่าย", type: "select", col: 6, required: true, msg: "กรุณาระบุประเภทรายจ่าย", source: { table: "expenses_type" } },
      { name: "budget", label: "ประมาณการโครงการ", type: "money", col: 4 },
      { name: "mission", label: "พันธกิจ", type: "select", col: 8, source: { table: "plan_mission" } },
      { name: "project_type", label: "ประเภทโครงการ", type: "select", col: 4, source: { table: "plan_projecttype" } },
      { name: "remark", label: "หมายเหตุ", type: "textarea", rows: 2, col: 12 },
    ],
  },
];

const PlanForm = ({ view }) => {
  const { id } = useParams();
  const history = useHistory();
  const { user, byear } = useAuth();
  const schema = planSchema(!!id).map((s) => (view ? { ...s, fields: s.fields.map((f) => ({ ...f, disabled: true })) } : s));
  const { values, setValues, errors, check } = useForm(schema, { project_byear: byear });
  useEffect(() => {
    if (id) setValues(db.getSync("project_plan_main", id) || {});
  }, [id, setValues]);
  const save = async () => {
    if (!check()) return;
    const data = { ...values, budget: values.budget || 0 };
    if (id) {
      delete data.project_byear;
      await db.update("project_plan_main", id, { ...data, edit_users: user.id });
    } else await db.insert("project_plan_main", { ...data, org_id: user.org_id, flag: 1, add_users: user.id });
    await alertSuccess("บันทึกสำเร็จ");
    history.push("/project-plan");
  };
  const title = view ? "รายละเอียดแผนดำเนินโครงการ" : id ? "แก้ไขแผนดำเนินโครงการ" : "เพิ่มแผนดำเนินโครงการ";
  return (
    <Page title={title} breadcrumb={["แผนดำเนินโครงการ", title]} actions={<BackButton to="/project-plan" />}>
      <Card>
        <FormBuilder sections={schema} values={values} setValues={setValues} errors={errors} />
        <div className="mt-5 flex gap-2">
          {!view && <Btn icon="pi pi-save" label="บันทึก" onClick={save} />}
          {view && <Btn tone="info" icon="pi pi-pencil" label="แก้ไข" onClick={() => history.push(`/project-plan/edit/${id}`)} />}
          <BackButton />
        </div>
      </Card>
    </Page>
  );
};

// fiscal month index (Oct=0 … Sep=11)
const fIdx = (m) => FISCAL_MONTHS.indexOf(String(m).padStart(2, "0"));

const Gantt = () => {
  const history = useHistory();
  const { rows, loading, f, setF, byear } = usePlanRows("plan-gantt", true);
  return (
    <Page
      title="ข้อมูลแผนดำเนินโครงการทั้งหมด"
      subtitle="แผนภูมิ Gantt ตามปีงบประมาณ (ต.ค. - ก.ย.) ละเอียดระดับสัปดาห์"
      breadcrumb={["แผนดำเนินโครงการ", "Gantt"]}
      actions={
        <>
          <Btn tone="success" icon="pi pi-plus-circle" label="เพิ่มแผนดำเนินโครงการ" onClick={() => history.push("/project-plan/add")} />
          <ExcelButton filename="1-rpt-projectplan-all" title="แผนดำเนินโครงการทั้งหมด" columns={excelCols} rows={rows} />
        </>
      }
    >
      <FilterBar fields={planFilters(byear, 3)} value={f} onChange={setF} />
      <Card bodyClass="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-[1500px] border-collapse text-xs">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                {["ลำดับ", "ปีงบ", "ชื่อโครงการ", "สัปดาห์ที่เริ่ม", "เดือนที่เริ่ม", "สัปดาห์ที่สิ้นสุด", "เดือนที่สิ้นสุด"].map((h) => (
                  <th key={h} rowSpan={2} className="border border-slate-200 px-2 py-2 text-left">
                    {h}
                  </th>
                ))}
                {FISCAL_MONTHS.map((m) => (
                  <th key={m} colSpan={4} className="border border-slate-200 px-1 py-1 text-center">
                    {monthShort(m)}
                  </th>
                ))}
              </tr>
              <tr>
                {FISCAL_MONTHS.flatMap((m) =>
                  [1, 2, 3, 4].map((w) => (
                    <th key={`${m}${w}`} className="w-6 border border-slate-200 px-0 py-1 text-center font-normal text-slate-400">
                      {w}
                    </th>
                  )),
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? null : rows.length ? (
                rows.map((p, i) => {
                  const s = fIdx(p.project_startmonth) * 4 + (Number(p.project_startweek) || 1) - 1;
                  let e = fIdx(p.project_endmonth) * 4 + (Number(p.project_endweek) || 4) - 1;
                  if (e < s) e = 47;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="border border-slate-200 px-2 py-1.5 text-center">{i + 1}</td>
                      <td className="border border-slate-200 px-2">{p.project_byear + 543}</td>
                      <td className="max-w-[22rem] border border-slate-200 px-2">
                        <button type="button" className="text-left text-blue-700 hover:underline" onClick={() => history.push(`/project-plan/edit/${p.id}`)}>
                          {p.project_name}
                        </button>
                      </td>
                      <td className="border border-slate-200 text-center">{p.project_startweek}</td>
                      <td className="border border-slate-200 px-1 text-center">{monthShort(p.project_startmonth)}</td>
                      <td className="border border-slate-200 text-center">{p.project_endweek}</td>
                      <td className="border border-slate-200 px-1 text-center">{monthShort(p.project_endmonth)}</td>
                      {Array.from({ length: 48 }, (_, k) => (
                        <td key={k} className={`border border-slate-100 p-0 ${k % 4 === 3 ? "border-r-slate-300" : ""}`}>
                          {k >= s && k <= e && <div className={`h-3 bg-cyan-500 ${k === s ? "ml-0.5 rounded-l-full" : ""} ${k === e ? "mr-0.5 rounded-r-full" : ""}`} />}
                        </td>
                      ))}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={55} className="py-8 text-center text-slate-400">
                    No Data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </Page>
  );
};

// legacy 5-year plan (2561–2565)
const FiveYear = () => {
  const { data, loading } = useTable("project_plan", { flag: 1 });
  const [f, setF] = useFilters("plan5", {});
  const rows = data.filter(
    (p) =>
      (!f.worktype || String(p.worktype_id) === String(f.worktype)) &&
      (!f.expenses_group || String(p.expenses_group) === String(f.expenses_group)) &&
      (!f.expenses_type || String(p.expenses_type) === String(f.expenses_type)) &&
      (!f.search || p.project_name.includes(f.search)),
  );
  const ys = ["y61", "y62", "y63", "y64", "y65"];
  return (
    <Page title="ข้อมูลแผนโครงการ 5 ปี ปีงบประมาณ 2561 - 2565" breadcrumb={["แผนดำเนินโครงการ", "แผน 5 ปี"]}>
      <FilterBar fields={["worktype", "expenses_group", "expenses_type", "search"]} value={f} onChange={setF} />
      <DataList
        loading={loading}
        value={rows}
        rows={20}
        title={`จำนวน ${rows.length} รายการ`}
        columns={[
          { header: "ลำดับ", type: "index" },
          { field: "pid", header: "รหัสโครงการ" },
          { field: "project_name", header: "ชื่อโครงการ", style: { minWidth: "18rem" } },
          { header: "งาน", body: (p) => name("work_type", p.worktype_id) },
          { header: "หมวดรายจ่าย", body: (p) => name("expenses_group", p.expenses_group) },
          { header: "ประเภทรายจ่าย", body: (p) => name("expenses_type", p.expenses_type) },
          ...ys.map((y) => ({ field: y, header: `ปี 25${y.slice(1)}`, body: (p) => <div className="text-right">{money(p[y])}</div> })),
        ]}
      />
    </Page>
  );
};

const PlanModule = () => (
  <Switch>
    <Route path="/project-plan/add" render={() => <PlanForm />} />
    <Route path="/project-plan/edit/:id" render={() => <PlanForm />} />
    <Route path="/project-plan/view/:id" render={() => <PlanForm view />} />
    <Route path="/project-plan/gantt" component={Gantt} />
    <Route path="/project-plan/five-year" component={FiveYear} />
    <Route path="/project-plan" component={List} />
  </Switch>
);

export default PlanModule;
