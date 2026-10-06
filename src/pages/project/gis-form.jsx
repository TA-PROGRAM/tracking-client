import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Page, Card, Btn, FieldLabel, alertSuccess, alertError } from "../../components/kit";
import { BackButton, ProjectInfoPanel, StepRibbon } from "../shared";
import MapView, { DEFAULT_CENTER } from "../shared/map";
import db from "../../mock/db";
import { useAuth } from "../../role-access/authContext";
import { addLog } from "../../mock/tracking";

const GisForm = () => {
  const { id, oid } = useParams();
  const history = useHistory();
  const { user } = useAuth();
  const p = db.getSync("project", id);
  const [v, setV] = useState({ remark: "", lat: "", lng: "" });

  useEffect(() => {
    if (oid) {
      const m = db.getSync("project_map", oid);
      if (m) setV({ remark: m.remark || "", lat: m.latitude, lng: m.longitude });
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setV((x) => ({ ...x, lat: +pos.coords.latitude.toFixed(6), lng: +pos.coords.longitude.toFixed(6) })),
        () => setV((x) => ({ ...x, lat: DEFAULT_CENTER[0], lng: DEFAULT_CENTER[1] })),
      );
    } else setV((x) => ({ ...x, lat: DEFAULT_CENTER[0], lng: DEFAULT_CENTER[1] }));
  }, [oid]);

  const save = async () => {
    if (!v.lat || !v.lng) return alertError("กรุณาระบุพิกัด");
    const data = { latitude: Number(v.lat), longitude: Number(v.lng), remark: v.remark };
    if (oid) {
      await db.update("project_map", oid, { ...data, edit_users: user.id });
      await addLog(Number(id), "แก้ไขพิกัดโครงการ", user);
    } else {
      await db.insert("project_map", { ...data, project_id: Number(id), flag: 1, add_users: user.id });
      await addLog(Number(id), "เพิ่มพิกัดโครงการ", user);
    }
    await alertSuccess("บันทึกสำเร็จ");
    history.push(`/project/gis/${id}`);
  };

  return (
    <Page title={oid ? "แก้ไขพิกัด" : "บันทึกพิกัด"} breadcrumb={["ข้อมูลโครงการ", "ข้อมูลพิกัด GIS"]} actions={<><StepRibbon n={1} /><BackButton to={`/project/gis/${id}`} /></>}>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ProjectInfoPanel p={p} />
        <Card title={oid ? "แก้ไขพิกัด" : "บันทึกพิกัด"} icon="pi pi-map">
          <div className="space-y-4">
            <div>
              <FieldLabel label="บันทึกเพิ่มเติม" />
              <InputTextarea className="w-full" rows={3} value={v.remark} onChange={(e) => setV({ ...v, remark: e.target.value })} />
            </div>
            <div>
              <FieldLabel label="เลือกพิกัดบนแผนที่" />
              <MapView markers={v.lat ? [{ lat: v.lat, lng: v.lng }] : []} draggable zoom={14} height={380} onPick={({ lat, lng }) => setV((x) => ({ ...x, lat, lng }))} />
              <div className="mt-1 text-xs text-slate-400">คลิกบนแผนที่หรือลากหมุดเพื่อระบุตำแหน่ง</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel label="Latitude" required />
                <InputText className="w-full" value={v.lat} onChange={(e) => setV({ ...v, lat: e.target.value })} />
              </div>
              <div>
                <FieldLabel label="Logitude" required />
                <InputText className="w-full" value={v.lng} onChange={(e) => setV({ ...v, lng: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2">
              <Btn icon="pi pi-save" label="บันทึก" onClick={save} />
              <BackButton />
            </div>
          </div>
        </Card>
      </div>
    </Page>
  );
};

export default GisForm;
