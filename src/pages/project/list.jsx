import React, { useMemo } from "react";
import { useHistory } from "react-router-dom";
import { Page, DataList, Btn, RowMenu, useTable, useFilters, confirmAction, alertSuccess, ExcelButton } from "../../components/kit";
import { FilterBar, StepBadge, PurchaseApproveBadge } from "../shared";
import db from "../../mock/db";
import { useAuth } from "../../role-access/authContext";
import { filterProjects, ampurNames, certUrl, lookupOptions, STEPS, stepOf } from "../../mock/tracking";
import { beYear, thDateShort } from "../../utils/format";

const List = () => {
  const history = useHistory();
  const { user, byear } = useAuth();
  const { data, loading, reload } = useTable("project", { flag: 1 });
  const [f, setF] = useFilters("project", { purchaseapprove: "pending" });

  const rows = useMemo(() => {
    let r = filterProjects(data, f, { user, byear });
    if (f.bureau === 99) r = data.filter((p) => String(p.flag) === "1" && !db.getSync("bureau", p.bureau_id));
    // default: only projects waiting for the purchase decision
    if (!f.purchaseapprove || f.purchaseapprove === "pending") r = r.filter((p) => !p.project_purchase);
    else if (f.purchaseapprove !== "all") r = r.filter((p) => String(p.project_purchase) === String(f.purchaseapprove));
    return r.sort((a, b) => b.id - a.id);
  }, [data, f, user, byear]);

  const del = async (p) => {
    if (!(await confirmAction("แน่ใจนะ?", "ต้องการยกเลิกรายการ", "ใช่, ต้องการยกเลิกรายการ !", "#dc2626"))) return;
    await db.update("project", p.id, { flag: 0, edit_users: user.id });
    alertSuccess("ยกเลิกโครงการเรียบร้อย");
    reload();
  };

  const name = (t, id) => db.getSync(t, id)?.name || "-";

  const excelCols = [
    { header: "ลำดับ", type: "index" },
    { header: "เลขที่อ้างอิง", field: "id" },
    { header: "ปีงบประมาณ", value: (p) => beYear(p.project_byear) },
    { header: "วันที่โครงการ", value: (p) => thDateShort(p.project_date) },
    { header: "รหัสโครงการ", field: "project_code", width: 16 },
    { header: "ชื่อโครงการ", field: "project_name", width: 60 },
    { header: "สถานที่", field: "project_place", width: 30 },
    { header: "ถนน", field: "road", width: 20 },
    { header: "อำเภอ", value: (p) => ampurNames(p.id), width: 20 },
    { header: "งบอนุมัติ", field: "budget_approve", type: "money", width: 16 },
    { header: "หน่วยงาน", value: (p) => name("bureau", p.bureau_id), width: 24 },
    { header: "งาน", value: (p) => name("work_type", p.worktype_id), width: 20 },
    { header: "หมวดรายจ่าย", value: (p) => name("expenses_group", p.expenses_group), width: 16 },
    { header: "ประเภทรายจ่าย", value: (p) => name("expenses_type", p.expenses_type), width: 20 },
    { header: "สถานะโครงการ", value: (p) => db.getSync("purchase_approve", p.project_purchase ?? "")?.sign },
    { header: "ขั้นตอน", value: (p) => STEPS[stepOf(p) - 1].label, width: 20 },
    { header: "longitude", value: (p) => db.findSync("project_map", { project_id: p.id, flag: 1 })[0]?.longitude ?? "" },
    { header: "latitude", value: (p) => db.findSync("project_map", { project_id: p.id, flag: 1 })[0]?.latitude ?? "" },
  ];

  return (
    <Page
      title="ข้อมูลโครงการทั้งหมด"
      subtitle="ขั้นตอนที่ 1 · บันทึกโครงการ อนุมัติจัดซื้อจัดจ้าง และติดตามขั้นตอน"
      actions={
        <>
          <Btn tone="success" icon="pi pi-plus-circle" label="เพิ่มโครงการ(1)" onClick={() => history.push("/project/add")} />
          <ExcelButton filename="1-rpt-project-all" title="ข้อมูลโครงการทั้งหมด อบจ.นครราชสีมา" columns={excelCols} rows={rows} />
        </>
      }
    >
      <FilterBar
        fields={[
          "projectdate",
          "bureau99",
          "worktype",
          "expenses_group",
          "expenses_type",
          "road",
          "place",
          "budget_type",
          { name: "purchaseapprove", label: "อนุมัติจัดซื้อ/จัดจ้าง", type: "select", options: [{ label: "ทั้งหมด", value: "all" }, { label: "รออนุมัติจัดซื้อ/จัดจ้าง", value: "pending" }, ...lookupOptions("purchase_approve", false).filter((o) => o.value !== "")] },
          "byear5",
          "projectcode",
          "contractnumber",
          "search",
        ]}
        value={f}
        onChange={setF}
      />
      <DataList
        loading={loading}
        value={rows}
        title={`จำนวน ${rows.length} รายการ`}
        onRowClick={(p) => history.push(`/project/edit/${p.id}`)}
        columns={[
          { header: "ลำดับ", type: "index" },
          { field: "project_code", header: "รหัสโครงการ", body: (p) => <span className="whitespace-nowrap">{p.project_code}</span> },
          { field: "project_byear", header: "ปีงบ", body: (p) => beYear(p.project_byear) },
          { field: "project_date", header: "วันที่รับโครงการ", body: (p) => <span className="whitespace-nowrap">{thDateShort(p.project_date)}</span> },
          { field: "project_name", header: "ชื่อโครงการ", body: (p) => <span className="font-medium text-blue-700">{p.project_name}</span>, style: { minWidth: "18rem" } },
          { header: "หน่วยงาน", body: (p) => name("bureau", p.bureau_id) },
          { header: "งาน", body: (p) => name("work_type", p.worktype_id) },
          { header: "หมวดรายจ่าย", body: (p) => name("expenses_group", p.expenses_group) },
          { header: "ประเภทรายจ่าย", body: (p) => name("expenses_type", p.expenses_type) },
          { field: "road", header: "ชื่อถนน" },
          { field: "project_place", header: "สถานที่" },
          { header: "อำเภอ", body: (p) => ampurNames(p.id) || "-" },
          { field: "budget_approve", header: "งบอนุมัติ", type: "money" },
          { header: "สถานะโครงการ", body: (p) => <PurchaseApproveBadge value={p.project_purchase} /> },
          { header: "ขั้นตอน", body: (p) => <StepBadge p={p} /> },
          {
            header: "QRCODE",
            body: (p) =>
              String(p.qrcode_gen) === "1" ? (
                <a href={certUrl(p.id)} target="_blank" onClick={(e) => e.stopPropagation()} className="text-emerald-600">
                  <i className="pi pi-qrcode" />
                </a>
              ) : null,
          },
          {
            header: "จัดการ",
            body: (p) => (
              <RowMenu
                items={[
                  { label: "แก้ไขโครงการ", icon: "pi pi-pencil", command: () => history.push(`/project/edit/${p.id}`) },
                  { label: "ประวัติการทำรายการ", icon: "pi pi-history", command: () => history.push(`/project/log/${p.id}`) },
                  { label: "ข้อมูลพิกัด GIS", icon: "pi pi-map", command: () => history.push(`/project/gis/${p.id}`) },
                  { label: "บันทึกสถานะโครงการ", icon: "pi pi-check-circle", command: () => history.push(`/project/audit/${p.id}`) },
                  { label: "บันทึกขออนุมัติโครงการ", icon: "pi pi-verified", command: () => history.push(`/project/approve/${p.id}`) },
                  { label: "บันทึกรับเอกสารโครงการ", icon: "pi pi-inbox", command: () => history.push(`/project/receive/${p.id}`) },
                  { separator: true },
                  { label: "ยกเลิกโครงการ", icon: "pi pi-trash", className: "text-rose-600", command: () => del(p) },
                ]}
              />
            ),
          },
        ]}
      />
    </Page>
  );
};

export default List;
