import React from "react";
import { useHistory, useParams } from "react-router-dom";
import { Page, Card, Btn } from "../../components/kit";
import { BackButton, ProjectInfoPanel, StepRibbon, SimpleTable } from "../shared";
import MapView from "../shared/map";
import db from "../../mock/db";

const Gis = () => {
  const { id } = useParams();
  const history = useHistory();
  const p = db.getSync("project", id);
  const points = db.findSync("project_map", { project_id: Number(id), flag: 1 });
  const esc = (s) => String(s ?? "").replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" })[c]);
  const markers = points.map((m) => ({
    lat: m.latitude,
    lng: m.longitude,
    popup: `<div style="font-family:Sarabun"><b>ชื่อโครงการ :</b> ${esc(p?.project_name)}<br/><b>Note :</b> ${esc(m.remark)}<br/><b>เส้นทาง :</b> <a target="_blank" href="https://maps.google.com?saddr=Current+Location&daddr=${m.latitude},${m.longitude}">แสดงเส้นทาง</a><br/><b>แก้ไข :</b> <a href="#/project/gis/${id}/edit/${m.id}">แก้ไขพิกัด</a></div>`,
  }));

  return (
    <Page
      title="ข้อมูลพิกัด GIS"
      breadcrumb={["ข้อมูลโครงการ", "ข้อมูลพิกัด GIS"]}
      actions={
        <>
          <StepRibbon n={1} />
          <Btn icon="pi pi-plus" label="เพิ่มพิกัด" onClick={() => history.push(`/project/gis/${id}/add`)} />
          <BackButton to="/project" />
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ProjectInfoPanel p={p} />
        <Card title="ข้อมูลพิกัด" icon="pi pi-map">
          <MapView markers={markers} height={460} zoom={14} />
          <div className="mt-4">
            <SimpleTable
              head={["ลำดับ", "Latitude", "Longitude", "บันทึกเพิ่มเติม", "จัดการ"]}
              rows={points.map((m, i) => [
                i + 1,
                m.latitude,
                m.longitude,
                m.remark || "-",
                <button key="e" type="button" className="text-blue-600" onClick={() => history.push(`/project/gis/${id}/edit/${m.id}`)}>
                  <i className="pi pi-pencil" />
                </button>,
              ])}
            />
          </div>
        </Card>
      </div>
    </Page>
  );
};

export default Gis;
