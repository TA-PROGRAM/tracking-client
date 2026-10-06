import React, { useEffect, useMemo, useState } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { DeviceModel, SiteModel } from "../../models";
import { useHistory } from "react-router-dom";
import Swal from "sweetalert2";
import { Enum } from "../../components/customComponent";

const device_model = new DeviceModel();
const site_model = new SiteModel();

const Insert = () => {
  const history = useHistory();

  const [state, setState] = useState({
    deviceName: "",
    latitude: "",
    longtitude: "",
    isActive: "",
    macAddress: "",
    ip_address: "",
    site_table_uuid: "",
    Site: [],
    loading: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const site = await site_model.getSiteBy();
        setState((prev) => ({
          ...prev,
          Site: site?.data || [],
        }));
      } catch (error) {
        console.error("Failed to fetch site list:", error);
      }
    };
    fetchData();
  }, []);

  const handleInput = (value, name) => {
    setState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const selectedSite = useMemo(() => {
    return (
      state.Site.find((item) => item.site_table_uuid === state.site_table_uuid) ||
      null
    );
  }, [state.Site, state.site_table_uuid]);

  const validateForm = () => {
    if (!state.deviceName?.trim()) {
      Swal.fire({ title: "กรุณาระบุชื่อกล้อง", icon: "warning" });
      return false;
    }

    if (!state.site_table_uuid) {
      Swal.fire({ title: "กรุณาเลือกไซต์", icon: "warning" });
      return false;
    }

    if (!state.ip_address?.trim()) {
      Swal.fire({ title: "กรุณาระบุ IP Address", icon: "warning" });
      return false;
    }

    if (!state.macAddress?.trim()) {
      Swal.fire({ title: "กรุณาระบุ MAC Address", icon: "warning" });
      return false;
    }

    if (state.isActive === "" || state.isActive === null || state.isActive === undefined) {
      Swal.fire({ title: "กรุณาเลือกสถานะ", icon: "warning" });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setState((prev) => ({ ...prev, loading: true }));

      const dataInsert = {
        device_name: state.deviceName,
        latitude: state.latitude,
        longtitude: state.longtitude,
        is_active: state.isActive,
        mac_address: state.macAddress,
        ip_address: state.ip_address,
        site_table_uuid: state.site_table_uuid,
      };

      const res = await device_model.insertDevice(dataInsert);

      if (res?.require) {
        Swal.fire({
          title: "เพิ่มรายการเรียบร้อย",
          icon: "success",
          showConfirmButton: false,
          timer: 1800,
        }).then(() => history.push("/device"));
      } else {
        Swal.fire({
          title: "เกิดข้อผิดพลาด",
          text: "ไม่สามารถทำรายการได้ กรุณาติดต่อผู้ดูแลระบบ",
          icon: "error",
        });
      }
    } catch (error) {
      console.error("Insert device failed:", error);
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง",
        icon: "error",
      });
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const summaryText = useMemo(() => {
    return state.deviceName?.trim()
      ? `กำลังสร้างกล้อง: ${state.deviceName}`
      : "กรอกข้อมูลกล้องใหม่";
  }, [state.deviceName]);

  return (
    <div className="space-y-4 p-10">
      <div>
        <div className="text-2xl font-bold tracking-tight text-slate-900">
          เพิ่มข้อมูลกล้อง
        </div>
        <div className="mt-1 text-sm text-slate-500">
          สร้างกล้องใหม่ พร้อมกำหนดไซต์ พิกัด และข้อมูลเครือข่าย
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <div className="text-lg font-semibold text-slate-900">
                ข้อมูลกล้อง
              </div>
              <div className="mt-1 text-sm text-slate-500">{summaryText}</div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                <FormField label="ชื่อกล้อง" required>
                  <InputText
                    value={state.deviceName || ""}
                    className="h-12 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 shadow-none"
                    placeholder="กรุณาระบุชื่อกล้อง"
                    onChange={(e) => handleInput(e.target.value, "deviceName")}
                  />
                </FormField>

                <FormField label="ไซต์" required>
                  <Dropdown
                    value={state.site_table_uuid}
                    options={state.Site}
                    onChange={(e) => handleInput(e.value, "site_table_uuid")}
                    optionValue="site_table_uuid"
                    optionLabel="site_name"
                    placeholder="เลือกไซต์"
                    filter
                    className="w-full"
                  />
                </FormField>

                <FormField label="สถานะ" required>
                  <Dropdown
                    value={state.isActive}
                    options={Enum.isActive}
                    onChange={(e) => handleInput(e.value, "isActive")}
                    optionValue="id"
                    optionLabel="name"
                    placeholder="เลือกสถานะ"
                    className="w-full"
                  />
                </FormField>

                <FormField label="IP Address" required>
                  <InputText
                    value={state.ip_address || ""}
                    className="h-12 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 shadow-none"
                    placeholder="เช่น 192.168.1.100"
                    onChange={(e) => handleInput(e.target.value, "ip_address")}
                  />
                </FormField>

                <FormField label="MAC Address" required>
                  <InputText
                    value={state.macAddress || ""}
                    className="h-12 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 shadow-none"
                    placeholder="กรุณาระบุ MAC Address"
                    onChange={(e) => handleInput(e.target.value, "macAddress")}
                  />
                </FormField>

                <FormField label="ละติจูด">
                  <InputText
                    value={state.latitude || ""}
                    className="h-12 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 shadow-none"
                    placeholder="เช่น 14.979816"
                    onChange={(e) => handleInput(e.target.value, "latitude")}
                  />
                </FormField>

                <FormField label="ลองจิจูด">
                  <InputText
                    value={state.longtitude || ""}
                    className="h-12 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 shadow-none"
                    placeholder="เช่น 102.090713"
                    onChange={(e) => handleInput(e.target.value, "longtitude")}
                  />
                </FormField>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 xl:col-span-4">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <div className="text-lg font-semibold text-slate-900">
                สรุปก่อนบันทึก
              </div>
              <div className="mt-1 text-sm text-slate-500">
                ตรวจสอบข้อมูลกล้องก่อนยืนยัน
              </div>
            </div>

            <div className="space-y-4 p-6">
              <InfoRow label="ชื่อกล้อง" value={state.deviceName || "-"} />
              <InfoRow label="ไซต์" value={selectedSite?.site_name || "-"} />
              <InfoRow label="IP Address" value={state.ip_address || "-"} />
              <InfoRow label="MAC Address" value={state.macAddress || "-"} />
              <InfoRow label="ละติจูด" value={state.latitude || "-"} />
              <InfoRow label="ลองจิจูด" value={state.longtitude || "-"} />
              <InfoRow
                label="สถานะ"
                value={
                  state.isActive === ""
                    ? "-"
                    : Number(state.isActive) === 1
                      ? "ใช้งาน"
                      : "ไม่ใช้งาน"
                }
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row xl:flex-col">
            <Button
              label={state.loading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
              icon="pi pi-check"
              onClick={handleSubmit}
              disabled={state.loading}
              className="h-12 flex-1 rounded-2xl border-none text-sm font-semibold"
              style={{
                background: "linear-gradient(135deg, #10b981 0%, #0f766e 100%)",
              }}
            />
            <Button
              label="ยกเลิก"
              icon="pi pi-times"
              outlined
              onClick={() => history.push("/device")}
              className="h-12 flex-1 rounded-2xl text-sm font-semibold"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const FormField = ({ label, children, required = false }) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm font-semibold text-slate-700">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    {children}
  </div>
);

const InfoRow = ({ label, value }) => (
  <div className="flex items-start justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
    <div className="text-sm text-slate-500">{label}</div>
    <div className="text-right text-sm font-semibold text-slate-800">{value}</div>
  </div>
);

export default Insert;