import React, { useEffect, useMemo, useState } from "react";
import { DeviceModel, SiteModel } from "../../models";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { useHistory } from "react-router-dom";
import Swal from "sweetalert2";
import { Enum } from "../../components/customComponent";

const device_model = new DeviceModel();
const site_model = new SiteModel();

const Update = (props) => {
  const history = useHistory();

  const [state, setState] = useState({
    device_name: "",
    latitude: "",
    longtitude: "",
    is_active: "",
    mac_address: "",
    device_table_uuid: "",
    site_table_uuid: "",
    ip_address: "",
    site: [],
    loading: false,
    pageLoading: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { uuid } = props.match.params;

        const [device, site] = await Promise.all([
          device_model.getDeviceById({
            device_table_uuid: uuid,
          }),
          site_model.getSiteBy(),
        ]);

        const deviceData = device?.data?.[0] || {};
        setState((prev) => ({
          ...prev,
          site: site?.data || [],
          device_name: deviceData.device_name || "",
          latitude: deviceData.latitude || "",
          longtitude: deviceData.longtitude || "",
          is_active: deviceData.is_active === undefined ? "" : String(deviceData.is_active),
          mac_address: deviceData.mac_address || "",
          site_table_uuid: deviceData.site_table_uuid || "",
          device_table_uuid: deviceData.device_table_uuid || "",
          ip_address: deviceData.ip_address || "",
          pageLoading: false,
        }));
      } catch (error) {
        console.error("Failed to fetch device detail:", error);
        setState((prev) => ({ ...prev, pageLoading: false }));
        Swal.fire({
          title: "โหลดข้อมูลไม่สำเร็จ",
          text: "กรุณาลองใหม่อีกครั้ง",
          icon: "error",
        });
      }
    };

    fetchData();
  }, [props.match.params]);

  const handleInput = (value, name) => {
    setState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const selectedSite = useMemo(() => {
    return (
      state.site.find((item) => item.site_table_uuid === state.site_table_uuid) ||
      null
    );
  }, [state.site, state.site_table_uuid]);

  const validateForm = () => {
    if (!state.device_name?.trim()) {
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

    if (!state.mac_address?.trim()) {
      Swal.fire({ title: "กรุณาระบุ MAC Address", icon: "warning" });
      return false;
    }

    if (state.is_active === "" || state.is_active === null || state.is_active === undefined) {
      Swal.fire({ title: "กรุณาเลือกสถานะ", icon: "warning" });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setState((prev) => ({ ...prev, loading: true }));

      const dataUpdate = {
        device_name: state.device_name,
        latitude: state.latitude,
        longtitude: state.longtitude,
        is_active: state.is_active,
        mac_address: state.mac_address,
        device_table_uuid: state.device_table_uuid,
        site_table_uuid: state.site_table_uuid,
        ip_address: state.ip_address,
      };
      const res = await device_model.updateDeviceById(dataUpdate);

      if (res?.require) {
        Swal.fire({
          title: "แก้ไขข้อมูลเรียบร้อย",
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
      console.error("Update device failed:", error);
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง",
        icon: "error",
      });
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  if (state.pageLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-slate-600 shadow-sm">
          กำลังโหลดข้อมูล...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-10">
      <div>
        <div className="text-2xl font-bold tracking-tight text-slate-900">
          แก้ไขข้อมูลกล้อง
        </div>
        <div className="mt-1 text-sm text-slate-500">
          ปรับปรุงข้อมูลกล้อง พิกัด และเครือข่าย
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <div className="text-lg font-semibold text-slate-900">
                ข้อมูลกล้อง
              </div>
              <div className="mt-1 text-sm text-slate-500">
                กำลังแก้ไขกล้อง: {state.device_name || "-"}
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                <FormField label="ชื่อกล้อง" required>
                  <InputText
                    value={state.device_name || ""}
                    className="h-12 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 shadow-none"
                    placeholder="กรุณาระบุชื่อกล้อง"
                    onChange={(e) => handleInput(e.target.value, "device_name")}
                  />
                </FormField>

                <FormField label="ไซต์" required>
                  <Dropdown
                    value={state.site_table_uuid}
                    options={state.site}
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
                    value={state.is_active}
                    options={Enum.isActive}
                    onChange={(e) => handleInput(e.value, "is_active")}
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
                    value={state.mac_address || ""}
                    className="h-12 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 shadow-none"
                    placeholder="กรุณาระบุ MAC Address"
                    onChange={(e) => handleInput(e.target.value, "mac_address")}
                  />
                </FormField>

                <FormField label="รหัสกล้อง">
                  <InputText
                    value={state.device_table_uuid || "-"}
                    disabled
                    className="h-12 w-full rounded-2xl border-slate-200 bg-slate-100 px-4 text-slate-500 shadow-none"
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
                สรุปข้อมูล
              </div>
              <div className="mt-1 text-sm text-slate-500">
                ตรวจสอบข้อมูลก่อนบันทึกการแก้ไข
              </div>
            </div>

            <div className="space-y-4 p-6">
              <InfoRow label="รหัสกล้อง" value={state.device_table_uuid || "-"} />
              <InfoRow label="ชื่อกล้อง" value={state.device_name || "-"} />
              <InfoRow label="ไซต์" value={selectedSite?.site_name || "-"} />
              <InfoRow label="IP Address" value={state.ip_address || "-"} />
              <InfoRow label="MAC Address" value={state.mac_address || "-"} />
              <InfoRow label="ละติจูด" value={state.latitude || "-"} />
              <InfoRow label="ลองจิจูด" value={state.longtitude || "-"} />
              <InfoRow
                label="สถานะ"
                value={Number(state.is_active) === 1 ? "ใช้งาน" : "ไม่ใช้งาน"}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row xl:flex-col">
            <Button
              label={state.loading ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
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

export default Update;