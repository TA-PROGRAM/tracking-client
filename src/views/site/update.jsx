import React, { useEffect, useMemo, useState } from "react";
import { SiteModel, ProjectModel } from "../../models";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { useHistory } from "react-router-dom";
import Swal from "sweetalert2";

const site_model = new SiteModel();
const project_model = new ProjectModel();

const Update = (props) => {
  const history = useHistory();

  const [state, setState] = useState({
    site_name: "",
    site_table_uuid: "",
    description: "",
    contact: "",
    project_table_uuid: "",
    project_data: [],
    loading: false,
    pageLoading: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { uuid } = props.match.params;

        const [site, project] = await Promise.all([
          site_model.getSiteById({ site_table_uuid: uuid }),
          project_model.getProjectBy(),
        ]);

        const siteData = site?.data?.[0] || {};

        setState((prev) => ({
          ...prev,
          site_name: siteData.site_name || "",
          description: siteData.description || "",
          contact: siteData.contact || "",
          site_table_uuid: siteData.site_table_uuid || "",
          project_table_uuid: siteData.project_table_uuid || "",
          project_data: project?.data || [],
          pageLoading: false,
        }));
      } catch (error) {
        console.error("Failed to fetch site detail:", error);
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

  const selectedProject = useMemo(() => {
    return (
      state.project_data.find(
        (item) => item.project_table_uuid === state.project_table_uuid,
      ) || null
    );
  }, [state.project_data, state.project_table_uuid]);

  const validateForm = () => {
    if (!state.project_table_uuid) {
      Swal.fire({
        title: "กรุณาเลือกโครงการ",
        icon: "warning",
      });
      return false;
    }

    if (!state.site_name?.trim()) {
      Swal.fire({
        title: "กรุณาระบุชื่อไซต์",
        icon: "warning",
      });
      return false;
    }

    if (!state.contact?.trim()) {
      Swal.fire({
        title: "กรุณาระบุผู้ติดต่อ",
        icon: "warning",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setState((prev) => ({ ...prev, loading: true }));

      const dataUpdate = {
        project_table_uuid: state.project_table_uuid,
        site_table_uuid: state.site_table_uuid,
        site_name: state.site_name,
        description: state.description,
        contact: state.contact,
      };

      const res = await site_model.updateSiteById(dataUpdate);

      if (res?.require) {
        Swal.fire({
          title: "แก้ไขข้อมูลเรียบร้อย",
          icon: "success",
          showConfirmButton: false,
          timer: 1800,
        }).then(() => history.push("/site"));
      } else {
        Swal.fire({
          title: "เกิดข้อผิดพลาด",
          text: "ไม่สามารถทำรายการได้ กรุณาติดต่อผู้ดูแลระบบ",
          icon: "error",
        });
      }
    } catch (error) {
      console.error("Update site failed:", error);
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
    return state.site_name?.trim()
      ? `กำลังแก้ไขไซต์: ${state.site_name}`
      : "แก้ไขข้อมูลไซต์";
  }, [state.site_name]);

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
          แก้ไขข้อมูลไซต์
        </div>
        <div className="mt-1 text-sm text-slate-500">
          ปรับปรุงข้อมูลไซต์และความเชื่อมโยงกับโครงการ
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <div className="text-lg font-semibold text-slate-900">
                ข้อมูลไซต์
              </div>
              <div className="mt-1 text-sm text-slate-500">{summaryText}</div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <FormField label="โครงการ" required>
                  <Dropdown
                    value={state.project_table_uuid || ""}
                    onChange={(e) =>
                      handleInput(e.value || e.target.value, "project_table_uuid")
                    }
                    options={state.project_data}
                    optionLabel="project_name"
                    optionValue="project_table_uuid"
                    placeholder="เลือกโครงการ"
                    filter
                    className="w-full"
                  />
                </FormField>

                <FormField label="ชื่อไซต์" required>
                  <InputText
                    value={state.site_name || ""}
                    className="h-12 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 shadow-none"
                    placeholder="กรุณาระบุชื่อไซต์"
                    onChange={(e) => handleInput(e.target.value, "site_name")}
                  />
                </FormField>

                <FormField label="ผู้ติดต่อ" required>
                  <InputText
                    value={state.contact || ""}
                    className="h-12 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 shadow-none"
                    placeholder="กรุณาระบุผู้ติดต่อ"
                    onChange={(e) => handleInput(e.target.value, "contact")}
                  />
                </FormField>

                <FormField label="รหัสไซต์">
                  <InputText
                    value={state.site_table_uuid || "-"}
                    disabled
                    className="h-12 w-full rounded-2xl border-slate-200 bg-slate-100 px-4 text-slate-500 shadow-none"
                  />
                </FormField>

                <div className="md:col-span-2">
                  <FormField label="รายละเอียดเพิ่มเติม">
                    <InputTextarea
                      value={state.description || ""}
                      onChange={(e) => handleInput(e.target.value, "description")}
                      placeholder="กรุณาระบุรายละเอียดของไซต์"
                      rows={5}
                      autoResize
                      className="w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 shadow-none"
                    />
                  </FormField>
                </div>
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
              <InfoRow label="รหัสไซต์" value={state.site_table_uuid || "-"} />
              <InfoRow
                label="โครงการ"
                value={selectedProject?.project_name || "-"}
              />
              <InfoRow label="ชื่อไซต์" value={state.site_name || "-"} />
              <InfoRow label="ผู้ติดต่อ" value={state.contact || "-"} />

              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  รายละเอียด
                </div>
                <div className="mt-2 text-sm text-slate-700">
                  {state.description?.trim() || "ยังไม่ได้ระบุรายละเอียดเพิ่มเติม"}
                </div>
              </div>
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
              onClick={() => history.push("/site")}
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