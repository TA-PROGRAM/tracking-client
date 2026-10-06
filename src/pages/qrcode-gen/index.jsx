// จัดการข้อมูล qrcode โครงการ
import React, { useMemo, useState } from "react";
import { Route, Switch, useHistory, useParams } from "react-router-dom";
import { Page, Card, DataList, Btn, useTable, useFilters, alertSuccess } from "../../components/kit";
import { FilterBar, ProjectInfoPanel, BackButton, Letter, approveLetter } from "../shared";
import { baseColumns, FILTERS_STD, FILTERS_TAIL, IconAction } from "../shared/workflow";
import { QrBlock } from "../shared/qr";
import db from "../../mock/db";
import { useAuth } from "../../role-access/authContext";
import { filterProjects, addLog, certUrl, QR_ADMIN_ROLES } from "../../mock/tracking";
import { thDateShort } from "../../utils/format";

const List = () => {
  const history = useHistory();
  const { user, byear } = useAuth();
  const { data, loading } = useTable("project", { flag: 1 });
  const [f, setF] = useFilters("qrcode", { contractapprove: "0" });
  const rows = useMemo(() => {
    let r = filterProjects(data, f, { user, byear, roles: QR_ADMIN_ROLES });
    if (f.contractapprove !== "all") r = r.filter((p) => String(p.contract_approve || "0") === (f.contractapprove || "0"));
    return r.sort((a, b) => b.id - a.id);
  }, [data, f, user, byear]);
  const cols = [
    ...baseColumns(),
    { field: "contract_number", header: "เลขที่สัญญา" },
    { header: "วันที่เริ่ม", body: (p) => thDateShort(p.contract_startdate) },
    { header: "วันจบสัญญา", body: (p) => thDateShort(p.contract_enddate) },
    { field: "contract_numdate", header: "ระยะ(วัน)" },
    { header: "วันส่งมอบงาน", body: (p) => thDateShort(p.contract_receivedate) },
    { header: "วันตรวจรับ", body: (p) => thDateShort(p.contract_boarddate) },
    { header: "สถานะจ่ายเงิน", body: (p) => <Letter v={approveLetter(p.contract_approve)} /> },
    {
      header: "qrcode",
      body: (p) =>
        String(p.qrcode_gen) === "1" ? (
          <a href={certUrl(p.id)} target="_blank" onClick={(e) => e.stopPropagation()} className="text-emerald-600">
            <i className="pi pi-qrcode" />
          </a>
        ) : null,
    },
    { header: "จัดการ", body: (p) => <IconAction icon="pi pi-pencil" title="สร้าง QRCODE" onClick={() => history.push(`/qrcode-gen/edit/${p.id}`)} /> },
  ];
  return (
    <Page title="จัดการข้อมูล qrcode โครงการ">
      <FilterBar
        roles={QR_ADMIN_ROLES}
        fields={[
          ...FILTERS_STD,
          { name: "contractapprove", label: "อนุมัติจ่ายเงิน", type: "select", options: [{ label: "-ทั้งหมด-", value: "all" }, { label: "W-รอดำเนินการ", value: "0" }, { label: "A-อนุมัติจ่ายเงิน", value: "1" }] },
          ...FILTERS_TAIL,
        ]}
        value={f}
        onChange={setF}
      />
      <DataList loading={loading} value={rows} columns={cols} title={`จำนวน ${rows.length} รายการ`} onRowClick={(p) => history.push(`/qrcode-gen/edit/${p.id}`)} />
    </Page>
  );
};

const Edit = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [, force] = useState(0);
  const p = db.getSync("project", id);
  if (!p) return null;
  const gen = async () => {
    await db.update("project", id, { qrcode_gen: "1", qrcode_date: new Date().toISOString(), qrcode_users: user.id });
    await addLog(p.id, "บันทึกสร้าง qrcode", user);
    force((x) => x + 1);
    alertSuccess("สร้าง qrcode เรียบร้อย");
  };
  return (
    <Page title="สร้าง QRCODE" breadcrumb={["QR Code โครงการ", p.project_code]} actions={<BackButton to="/qrcode-gen" />}>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ProjectInfoPanel p={p} />
        <Card title="qrcode โครงการ" icon="pi pi-qrcode" actions={<Btn tone="warning" icon="pi pi-qrcode" label="สร้าง qrcode" onClick={gen} />}>
          <QrBlock p={p} />
        </Card>
      </div>
    </Page>
  );
};

const QrModule = () => (
  <Switch>
    <Route path="/qrcode-gen/edit/:id" component={Edit} />
    <Route path="/qrcode-gen" component={List} />
  </Switch>
);

export default QrModule;
