import React, { useEffect, useMemo, useState } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { InputTextarea } from "primereact/inputtextarea";
import { ProjectModel, SiteModel } from "../../models";
import { useHistory } from "react-router-dom";
import Swal from "sweetalert2";

const userData = JSON.parse(localStorage.getItem("session-user") || "{}");
const firstname = userData?.firstname || "";
const lastname = userData?.lastname || "";

const project_model = new ProjectModel();
const site_model = new SiteModel();

const Insert = () => {
  const history = useHistory();

  const [state, setState] = useState({
    project_table_uuid: "",
    project_name: "",
    contract: "",
    start_contract: new Date(),
    end_contract: new Date(),
    budget: "",
    description: "",
    create_by: `${firstname} ${lastname}`.trim(),
    is_active: 1,
    site_data: [],
    loading: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const site_data = await site_model.getSiteBy();
        setState((prev) => ({
          ...prev,
          site_data: site_data?.data || [],
        }));
      } catch (error) {
        console.error("Failed to fetch site data:", error);
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

  const formatDateToYMD = (date) => {
    if (!date) return "";
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return "";
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate(),
    ).padStart(2, "0")}`;
  };

  const validateForm = () => {
    if (!state.project_name?.trim()) {
      Swal.fire({
        title: "กรุณาระบุชื่อโครงการ",
        icon: "warning",
      });
      return false;
    }

    if (!state.contract?.trim()) {
      Swal.fire({
        title: "กรุณาระบุชื่อคู่สัญญา",
        icon: "warning",
      });
      return false;
    }

    if (!state.start_contract || !state.end_contract) {
      Swal.fire({
        title: "กรุณาเลือกวันที่สัญญาให้ครบ",
        icon: "warning",
      });
      return false;
    }

    const start = new Date(state.start_contract);
    const end = new Date(state.end_contract);

    if (start > end) {
      Swal.fire({
        title: "วันที่เริ่มสัญญาต้องไม่มากกว่าวันที่หมดสัญญา",
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

      const dataInsert = {
        project_table_uuid: state.project_table_uuid,
        project_name: state.project_name,
        contract: state.contract,
        start_contract: formatDateToYMD(state.start_contract),
        end_contract: formatDateToYMD(state.end_contract),
        budget: state.budget,
        description: state.description,
        is_active: state.is_active,
        create_by: state.create_by,
      };

      const res = await project_model.insertProject(dataInsert);

      if (res?.require) {
        Swal.fire({
          title: "เพิ่มรายการเรียบร้อย",
          icon: "success",
          showConfirmButton: false,
          timer: 1800,
        }).then(() => history.push("/project"));
      } else {
        Swal.fire({
          title: "เกิดข้อผิดพลาด",
          text: "ไม่สามารถทำรายการได้ กรุณาติดต่อผู้ดูแลระบบ",
          icon: "error",
        });
      }
    } catch (error) {
      console.error("Insert project failed:", error);
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
    return state.project_name?.trim()
      ? `กำลังสร้างโครงการ: ${state.project_name}`
      : "กรอกข้อมูลโครงการใหม่";
  }, [state.project_name]);

  return (
    <div className="space-y-4 p-10">
      <div>
        <div className="text-2xl font-bold tracking-tight text-slate-900">
          เพิ่มข้อมูลโครงการ
        </div>
        <div className="mt-1 text-sm text-slate-500">
          สร้างข้อมูลโครงการใหม่ พร้อมรายละเอียดสัญญาและงบประมาณ
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <div className="text-lg font-semibold text-slate-900">
                ข้อมูลโครงการ
              </div>
              <div className="mt-1 text-sm text-slate-500">{summaryText}</div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                <FormField label="ชื่อโครงการ" required>
                  <InputText
                    value={state.project_name || ""}
                    onChange={(e) => handleInput(e.target.value, "project_name")}
                    placeholder="กรุณาระบุชื่อโครงการ"
                    className="h-12 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 shadow-none"
                  />
                </FormField>

                <FormField label="ชื่อคู่สัญญา" required>
                  <InputText
                    value={state.contract || ""}
                    onChange={(e) => handleInput(e.target.value, "contract")}
                    placeholder="กรุณาระบุชื่อคู่สัญญา"
                    className="h-12 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 shadow-none"
                  />
                </FormField>

                <FormField label="งบประมาณ">
                  <InputText
                    value={state.budget || ""}
                    onChange={(e) => handleInput(e.target.value, "budget")}
                    placeholder="กรุณาระบุงบประมาณ"
                    className="h-12 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 shadow-none"
                  />
                </FormField>

                <FormField label="วันที่เริ่มสัญญา" required>
                  <Calendar
                    value={state.start_contract ? new Date(state.start_contract) : null}
                    onChange={(e) => handleInput(e.value, "start_contract")}
                    dateFormat="dd/mm/yy"
                    showIcon
                    className="w-full"
                    inputClassName="h-12 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 shadow-none"
                  />
                </FormField>

                <FormField label="วันที่หมดสัญญา" required>
                  <Calendar
                    value={state.end_contract ? new Date(state.end_contract) : null}
                    onChange={(e) => handleInput(e.value, "end_contract")}
                    dateFormat="dd/mm/yy"
                    showIcon
                    className="w-full"
                    inputClassName="h-12 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 shadow-none"
                  />
                </FormField>

                <FormField label="ผู้บันทึก">
                  <InputText
                    value={state.create_by || "-"}
                    disabled
                    className="h-12 w-full rounded-2xl border-slate-200 bg-slate-100 px-4 text-slate-500 shadow-none"
                  />
                </FormField>

                <div className="md:col-span-2 xl:col-span-3">
                  <FormField label="รายละเอียดเพิ่มเติม">
                    <InputTextarea
                      value={state.description || ""}
                      onChange={(e) => handleInput(e.target.value, "description")}
                      placeholder="ระบุรายละเอียดเพิ่มเติมของโครงการ"
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
                สรุปก่อนบันทึก
              </div>
              <div className="mt-1 text-sm text-slate-500">
                ตรวจสอบข้อมูลก่อนยืนยันการบันทึก
              </div>
            </div>

            <div className="space-y-4 p-6">
              <InfoRow label="ชื่อโครงการ" value={state.project_name || "-"} />
              <InfoRow label="คู่สัญญา" value={state.contract || "-"} />
              <InfoRow label="งบประมาณ" value={state.budget || "-"} />
              <InfoRow
                label="วันที่เริ่ม"
                value={formatDateToYMD(state.start_contract) || "-"}
              />
              <InfoRow
                label="วันที่สิ้นสุด"
                value={formatDateToYMD(state.end_contract) || "-"}
              />
              <InfoRow label="ผู้บันทึก" value={state.create_by || "-"} />

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
              onClick={() => history.push("/project")}
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