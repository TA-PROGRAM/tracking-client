// รับเรื่องร้องเรียน (admin)
import React, { useMemo, useState } from "react";
import { Route, Switch, useHistory, useParams } from "react-router-dom";
import { Button } from "primereact/button";
import { Page, Card, DataList, Btn, FormBuilder, useForm, useTable, useFilters, alertSuccess, Info, StatusBadge, Empty } from "../../components/kit";
import { FilterBar, BackButton, SimpleTable, Modal, StepRibbon } from "../shared";
import { IconAction, name } from "../shared/workflow";
import MapView from "../shared/map";
import db from "../../mock/db";
import { useAuth } from "../../role-access/authContext";
import { lookupOptions } from "../../mock/tracking";
import { thDate, thDateShort, isoDate } from "../../utils/format";

const statusMap = () => Object.fromEntries(db.findSync("complaint_status").map((s) => [s.id, { label: s.name, color: s.color }]));

const List = () => {
  const history = useHistory();
  const { user } = useAuth();
  const { data, loading } = useTable("complaint", { flag: 1, org_id: user.org_id });
  const [f, setF] = useFilters("complaint", {});
  const rows = useMemo(
    () =>
      data
        .filter((c) => !f.complaintstatus || String(c.complaint_status) === String(f.complaintstatus))
        .filter((c) => !f.complaintdate || isoDate(c.add_date) === f.complaintdate)
        .filter((c) => !f.complaintusername || c.complaint_username.includes(f.complaintusername))
        .filter((c) => !f.search || c.complaint_title.includes(f.search))
        .sort((a, b) => b.id - a.id),
    [data, f],
  );
  const map = statusMap();
  return (
    <Page title="ข้อมูลรับเรื่องร้องเรียน" actions={<Btn tone="outline" icon="pi pi-external-link" label="แบบฟอร์มแจ้งข้อร้องเรียน (ประชาชน)" onClick={() => window.open("#/complaint-form", "_blank")} />}>
      <FilterBar
        fields={[
          { name: "complaintstatus", label: "สถานะ", type: "select", options: lookupOptions("complaint_status") },
          { name: "complaintdate", label: "วันที่ร้องเรียน", type: "date" },
          { name: "complaintusername", label: "ชื่อผู้ร้องเรียน", type: "text" },
          { name: "search", label: "เรื่องร้องเรียน", type: "text" },
        ]}
        value={f}
        onChange={setF}
      />
      <DataList
        loading={loading}
        value={rows}
        rows={20}
        title={`จำนวน ${rows.length} รายการ`}
        onRowClick={(c) => history.push(`/complaint/edit/${c.id}`)}
        columns={[
          { header: "ลำดับ", type: "index" },
          { field: "add_date", header: "วันที่แจ้ง", body: (c) => <span className="whitespace-nowrap">{thDate(c.add_date, { time: true })}</span> },
          { field: "complaint_title", header: "เรื่องที่แจ้ง", style: { minWidth: "14rem" } },
          { field: "complaint_username", header: "ผู้แจ้ง" },
          { field: "complaint_telephone", header: "โทรศัพท์" },
          { field: "latitude", header: "Latitude" },
          { field: "longitude", header: "Longitude" },
          { header: "สถานะ", body: (c) => <StatusBadge map={map} value={c.complaint_status} /> },
          { header: "จัดการ", body: (c) => <IconAction icon="pi pi-pencil" title="จัดการเรื่องร้องเรียน" onClick={() => history.push(`/complaint/edit/${c.id}`)} /> },
        ]}
      />
    </Page>
  );
};

const auditSchema = [
  { name: "audit_date", label: "วันที่ดำเนินการ", type: "date", col: 6, required: true, msg: "กรุณาระบุวันที่ดำเนินการ" },
  { name: "audit_status", label: "ดำเนินการ", type: "select", col: 6, required: true, msg: "กรุณาระบุการดำเนินการ", source: { table: "complaint_status" } },
  { name: "audit_desc", label: "รายละเอียดดำเนินการ", type: "richtext", col: 12 },
];

const Edit = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [, force] = useState(0);
  const { values, setValues, errors, check } = useForm(auditSchema);
  const c = db.getSync("complaint", id);
  if (!c) return null;
  const audits = db.findSync("complaint_audit", { complaint_id: c.id, flag: 1 }).sort((a, b) => a.id - b.id);
  const esc = (s) => String(s ?? "").replace(/[<>&]/g, (x) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[x]);

  const save = async () => {
    if (!check()) return;
    await db.insert("complaint_audit", { complaint_id: c.id, ...values, audit_desc: values.audit_desc || "", flag: 1, add_users: user.id });
    await db.update("complaint", c.id, { complaint_status: values.audit_status, edit_users: user.id });
    setOpen(false);
    setValues({});
    force((x) => x + 1);
    alertSuccess("บันทึกสำเร็จ");
  };

  return (
    <Page title="จัดการเรื่องร้องเรียน" breadcrumb={["เรื่องร้องเรียน", c.complaint_title]} actions={<><StepRibbon n={7} tone="blue" /><BackButton to="/complaint" /></>}>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="space-y-4">
          <Card title="รายละเอียดเรื่องร้องเรียน" icon="pi pi-megaphone">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Info label="เรื่องร้องเรียน" value={c.complaint_title} className="sm:col-span-2" />
              <Info label="รายละเอียด" value={c.complaint_detail} className="sm:col-span-2" />
              <Info label="ผู้ร้องเรียน" value={c.complaint_username} />
              <Info label="เลขบัตรประชาชน" value={c.complaint_cid} />
              <Info label="โทรศัพท์" value={c.complaint_telephone} />
              <Info label="วันที่ร้องเรียน" value={thDate(c.add_date, { time: true })} />
              <Info label="สถานะปัจจุบัน" value={<StatusBadge map={statusMap()} value={c.complaint_status} />} />
            </div>
          </Card>
          <Card title="พิกัดร้องเรียน" icon="pi pi-map-marker">
            <MapView
              height={400}
              zoom={10}
              markers={c.latitude > 0 && c.longitude > 0 ? [{ lat: c.latitude, lng: c.longitude, title: `เรื่องร้องเรียน : ${c.complaint_title}`, popup: `<b>เรื่องร้องเรียน : ${esc(c.complaint_title)}</b><br/>ผู้ร้องเรียน :${esc(c.complaint_username)}<br/>โทรศัพท์ :${esc(c.complaint_telephone)}` }] : []}
            />
          </Card>
        </div>
        <div className="space-y-4">
          <Card title="รายละเอียดรับเรื่องร้องเรียน" icon="pi pi-list" actions={<Btn icon="pi pi-plus" label="บันทึกรับเรื่องร้องเรียน" onClick={() => setOpen(true)} />}>
            <SimpleTable head={["ครั้งที่", "วันที่", "ดำเนินการ", "รายละเอียด"]} rows={audits.map((a, i) => [i + 1, thDateShort(a.audit_date), name("complaint_status", a.audit_status), <div key="d" dangerouslySetInnerHTML={{ __html: a.audit_desc || "-" }} />])} />
          </Card>
          <Card title="รูปสถานที่เกิดเรื่องร้องเรียน" icon="pi pi-images">
            {c.images?.length ? (
              <div className="grid grid-cols-2 gap-3">
                {c.images.map((img, i) => (
                  <a key={i} href={img} target="_blank" title="ดูรูปภาพ">
                    <img src={img} alt="" className="h-40 w-full rounded-xl object-cover" />
                  </a>
                ))}
              </div>
            ) : (
              <Empty text="ไม่มีรูปภาพ" />
            )}
          </Card>
        </div>
      </div>
      <Modal visible={open} onHide={() => setOpen(false)} title="บันทึกรับเรื่องร้องเรียน" footer={<Button size="small" outlined severity="danger" icon="pi pi-times-circle" label="ปิด" onClick={() => setOpen(false)} />}>
        <FormBuilder fields={auditSchema} values={values} setValues={setValues} errors={errors} />
        <div className="mt-4">
          <Btn tone="success" icon="pi pi-save" label="บันทึก" onClick={save} />
        </div>
      </Modal>
    </Page>
  );
};

const ComplaintModule = () => (
  <Switch>
    <Route path="/complaint/edit/:id" component={Edit} />
    <Route path="/complaint" component={List} />
  </Switch>
);

export default ComplaintModule;
