// แจ้งข้อร้องเรียน (complaint-webapp/complaint.php) — citizen form with camera + GPS
import React, { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import MapView, { DEFAULT_CENTER } from "../shared/map";
import db from "../../mock/db";

const nearestAmpur = () => null; // reverse geocoding is not available offline

const ComplaintForm = () => {
  const [v, setV] = useState({ name: "", cid: "", mobile: "", subject: "", detail: "", lat: "", lng: "" });
  const [img, setImg] = useState(null);
  const [cam, setCam] = useState(false);
  const video = useRef(null);
  const stream = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (p) => setV((x) => ({ ...x, lat: +p.coords.latitude.toFixed(6), lng: +p.coords.longitude.toFixed(6) })),
      () => Swal.fire({ title: "GPS ปิดอยู่?", text: "กรุณาเปิดการใช้งาน GPS ด้วยครับ", icon: "warning" }),
    );
    return () => stream.current?.getTracks().forEach((t) => t.stop());
  }, []);

  const openCam = async () => {
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      setCam(true);
      setTimeout(() => {
        if (video.current) video.current.srcObject = stream.current;
      }, 50);
    } catch {
      fileRef.current?.click();
    }
  };
  const snap = () => {
    const c = document.createElement("canvas");
    c.width = 640;
    c.height = 480;
    c.getContext("2d").drawImage(video.current, 0, 0, 640, 480);
    setImg(c.toDataURL("image/jpeg", 0.7));
    stream.current?.getTracks().forEach((t) => t.stop());
    setCam(false);
  };
  const pickFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setImg(r.result);
    r.readAsDataURL(f);
  };

  const submit = async () => {
    const miss = [
      [!v.name, "ชื่อ สกุล"],
      [!v.cid, "หมายเลขบัตรประชาชน"],
      [!v.mobile, "หมายเลขติดต่อกลับ"],
      [!v.subject, "หัวข้อเรื่องร้องเรียน"],
      [!v.detail, "รายละเอียดเรื่องร้องเรียน"],
      [!img, "ขาดภาพถ่าย"],
      [!v.lat || !v.lng, "ขาดพิกัดตำแหน่ง"],
    ].find((x) => x[0]);
    if (miss) return Swal.fire({ title: "บันทึกข้อมูลไม่ครบถ้วน!", text: miss[1], icon: "warning" });
    await db.insert("complaint", {
      org_id: 1,
      complaint_title: v.subject,
      complaint_username: v.name,
      complaint_cid: v.cid,
      complaint_telephone: v.mobile,
      complaint_detail: v.detail,
      latitude: Number(v.lat) || 0,
      longitude: Number(v.lng) || 0,
      complaint_status: 1,
      images: [img],
      flag: 1,
      add_date: new Date().toISOString(),
    });
    Swal.fire({ title: "ส่งเรื่องข้อร้องเรียน", text: "เรียบร้อยแล้ว", icon: "success" });
  };

  const field = (k, label, ph, ta) => (
    <div className="grid grid-cols-1 gap-1 sm:grid-cols-4 sm:items-center">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className="sm:col-span-3">{ta ? <InputTextarea className="w-full" rows={3} placeholder={ph} value={v[k]} onChange={(e) => setV({ ...v, [k]: e.target.value })} /> : <InputText className="w-full" placeholder={ph} value={v[k]} onChange={(e) => setV({ ...v, [k]: e.target.value })} />}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-emerald-600 px-4 py-3 text-center text-lg font-bold text-white">แจ้งข้อร้องเรียน</div>
      <div className="mx-auto max-w-2xl space-y-4 p-4">
        {field("name", "ชื่อ-สกุล", "ชื่อ สกุล")}
        {field("cid", "เลขที่บัตรประชาชน", "เลขที่บัตรประชาชน")}
        {field("mobile", "เบอร์โทร", "เบอร์มือถือ")}
        {field("subject", "หัวข้อร้องเรียน", "หัวข้อร้องเรียน")}
        {field("detail", "รายละเอียด", "รายละเอียดข้อร้องเรียน", true)}
        <div className="grid grid-cols-1 gap-1 sm:grid-cols-4">
          <label className="text-sm font-medium text-slate-700">ภาพประกอบ</label>
          <div className="space-y-2 sm:col-span-3">
            <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={pickFile} />
            {!cam && <Button severity="success" icon="pi pi-camera" label="ถ่ายภาพ" onClick={openCam} />}
            {cam && (
              <div className="space-y-2">
                <video ref={video} autoPlay playsInline className="w-full rounded-xl bg-black" />
                <Button severity="success" icon="pi pi-camera" label="ถ่าย" onClick={snap} />
              </div>
            )}
            {img && <img src={img} alt="" className="w-full max-w-xs rounded-xl border" />}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-1 sm:grid-cols-4">
          <label className="text-sm font-medium text-slate-700">ตำแหน่งจุดแจ้งเหตุ</label>
          <div className="space-y-2 sm:col-span-3">
            <div className="grid grid-cols-2 gap-2">
              <InputText readOnly placeholder="LAT" value={v.lat} />
              <InputText readOnly placeholder="LNG" value={v.lng} />
            </div>
            <MapView height={300} zoom={15} center={DEFAULT_CENTER} draggable markers={v.lat ? [{ lat: v.lat, lng: v.lng }] : []} onPick={({ lat, lng }) => setV((x) => ({ ...x, lat, lng, a: nearestAmpur() }))} />
            <div className="text-xs text-slate-500">*สามารถเลื่อนหมุดเพื่อระบุตำแหน่งให้ถูกต้องได้</div>
          </div>
        </div>
        <Button className="w-full" severity="success" icon="pi pi-upload" label="ส่งข้อร้องเรียน" onClick={submit} />
      </div>
    </div>
  );
};

export default ComplaintForm;
