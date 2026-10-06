import React, { useEffect, useMemo, useRef, useState } from "react";
import { ProjectModel } from "../../models";
import { useHistory } from "react-router-dom";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Menu } from "primereact/menu";
import { FilterMatchMode } from "primereact/api";
import Swal from "sweetalert2";

const project_model = new ProjectModel();

const View = () => {
  const history = useHistory();

  const [state, setState] = useState({
    loading: false,
    project: [],
    total: 0,
  });

  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  const [globalFilterValue, setGlobalFilterValue] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setState((prev) => ({ ...prev, loading: true }));

        const project = await project_model.getProjectBy();

        setState((prev) => ({
          ...prev,
          project: project?.data || [],
          total: project?.total || project?.data?.length || 0,
          loading: false,
        }));
      } catch (error) {
        console.error("Failed to fetch project data:", error);
        setState((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchData();
  }, []);

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    const nextFilters = { ...filters };
    nextFilters.global.value = value;

    setFilters(nextFilters);
    setGlobalFilterValue(value);
  };

  const _onDelete = (code) => {
    Swal.fire({
      title: "ลบข้อมูล !!",
      text: "ยืนยันการลบข้อมูล !!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ใช่, ลบเลย",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      try {
        const res = await project_model.deleteProjectById({
          project_table_uuid: code,
        });

        if (res?.require) {
          Swal.fire({
            title: "ลบข้อมูลเรียบร้อย",
            icon: "success",
            timer: 1800,
            showConfirmButton: false,
          });

          setState((prev) => ({
            ...prev,
            project: prev.project.filter((p) => p.project_table_uuid !== code),
            total: Math.max((prev.total || 1) - 1, 0),
          }));
        } else {
          Swal.fire({
            title: "ข้อมูลผิดพลาด",
            text: "โปรดแจ้งผู้ดูแลระบบ กรุณาลองใหม่อีกครั้ง",
            icon: "error",
          });
        }
      } catch (error) {
        console.error("Delete project failed:", error);
        Swal.fire({
          title: "เกิดข้อผิดพลาด",
          text: "ไม่สามารถลบข้อมูลได้ กรุณาลองใหม่อีกครั้ง",
          icon: "error",
        });
      }
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const dateObj = new Date(dateStr);
    if (Number.isNaN(dateObj.getTime())) return "-";
    return dateObj.toLocaleDateString("th-TH", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getContractStatus = (endDate) => {
    if (!endDate) {
      return { label: "ไม่ระบุ", className: "bg-slate-100 text-slate-600" };
    }

    const today = new Date();
    const end = new Date(endDate);

    if (Number.isNaN(end.getTime())) {
      return { label: "ไม่ระบุ", className: "bg-slate-100 text-slate-600" };
    }

    const diffDays = Math.ceil((end - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: "หมดสัญญา", className: "bg-rose-100 text-rose-700" };
    }

    if (diffDays <= 30) {
      return {
        label: "ใกล้หมดสัญญา",
        className: "bg-amber-100 text-amber-700",
      };
    }

    return {
      label: "ใช้งานปกติ",
      className: "bg-emerald-100 text-emerald-700",
    };
  };

  const onRowSelect = (e) => {
    const rowData = e.data;
    history.push(`/project/update/${rowData.project_table_uuid}`);
  };

  const RowActions = ({ row, onEdit, onDelete }) => {
    const menuRef = useRef(null);

    const items = [
      {
        label: "แก้ไขข้อมูล",
        icon: "pi pi-file-edit",
        command: () => onEdit(row),
      },
      {
        label: "ลบข้อมูล",
        icon: "pi pi-trash",
        command: () => onDelete(row),
      },
    ];

    return (
      <div className="flex justify-center">
        <Button
          icon="pi pi-ellipsis-h"
          rounded
          text
          severity="secondary"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            menuRef.current?.toggle(e);
          }}
          aria-haspopup
        />
        <Menu model={items} popup ref={menuRef} popupAlignment="right" />
      </div>
    );
  };

  const header = useMemo(
    () => (
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="text-xl font-semibold text-slate-900">
            รายการโครงการ
          </div>
          <div className="text-sm text-slate-500">
            จัดการข้อมูลโครงการ สัญญา และรายละเอียดที่เกี่ยวข้อง
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <i className="pi pi-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <InputText
              value={globalFilterValue}
              className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm shadow-none sm:w-72"
              placeholder="ค้นหาชื่อโครงการ, คู่สัญญา, วันที่..."
              onChange={onGlobalFilterChange}
            />
          </div>

          <Button
            label="เพิ่มโครงการ"
            icon="pi pi-plus"
            className="h-11 rounded-2xl border-none px-5"
            style={{
              background: "linear-gradient(135deg, #10b981 0%, #0f766e 100%)",
            }}
            onClick={() => history.push("/project/insert")}
          />
        </div>
      </div>
    ),
    [globalFilterValue, history],
  );

  return (
    <div className="space-y-4 p-10">
      <div>
        <div className="text-2xl font-bold tracking-tight text-slate-900">
          ข้อมูลโครงการ
        </div>
        <div className="mt-1 text-sm text-slate-500">
          ดูรายการโครงการทั้งหมดและจัดการข้อมูลได้ในหน้าเดียว
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          title="จำนวนโครงการ"
          value={state.total || state.project.length}
          icon="pi pi-briefcase"
          tone="blue"
        />
        <StatCard
          title="แสดงในหน้านี้"
          value={state.project.length}
          icon="pi pi-list"
          tone="emerald"
        />
        <StatCard
          title="พร้อมจัดการ"
          value="100%"
          icon="pi pi-check-circle"
          tone="slate"
        />
      </div>

      <Card className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <DataTable
          value={state.project}
          header={header}
          size="small"
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25]}
          loading={state.loading}
          tableStyle={{ minWidth: "60rem" }}
          responsiveLayout="stack"
          selectionMode="single"
          onRowSelect={onRowSelect}
          className="modern-project-table"
          emptyMessage="ไม่พบข้อมูลโครงการ"
          filters={filters}
          globalFilterFields={[
            "project_name",
            "contract",
            "start_contract",
            "end_contract",
            "project_table_uuid",
          ]}
        >
          <Column
            header="ลำดับ"
            body={(row, idx) => (
              <div className="font-medium text-slate-600">
                {idx.rowIndex + 1}
              </div>
            )}
            style={{ width: "6rem" }}
          />

          <Column
            field="project_name"
            header="ชื่อโครงการ"
            sortable
            body={(row) => (
              <div>
                <div className="font-semibold text-slate-900">
                  {row.project_name || "-"}
                </div>
              </div>
            )}
            style={{ width: "24%" }}
          />

          <Column
            field="contract"
            header="ชื่อคู่สัญญา"
            sortable
            body={(row) => (
              <div className="text-sm text-slate-700">
                {row.contract || "-"}
              </div>
            )}
            style={{ width: "20%" }}
          />

          <Column
            field="start_contract"
            header="วันที่เริ่มสัญญา"
            body={(row) => (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                {formatDate(row?.start_contract)}
              </span>
            )}
          />

          <Column
            field="end_contract"
            header="วันที่สิ้นสุดสัญญา"
            body={(row) => (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                {formatDate(row?.end_contract)}
              </span>
            )}
          />

          <Column
            header="สถานะ"
            body={(row) => {
              const status = getContractStatus(row?.end_contract);
              return (
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
                >
                  {status.label}
                </span>
              );
            }}
          />

          <Column
            header="การจัดการ"
            body={(row) => (
              <RowActions
                row={row}
                onEdit={(data) =>
                  history.push(`/project/update/${data.project_table_uuid}`)
                }
                onDelete={(data) => _onDelete(data.project_table_uuid)}
              />
            )}
            style={{ width: "7rem" }}
          />
        </DataTable>
      </Card>
    </div>
  );
};

const StatCard = ({ title, value, icon, tone = "slate" }) => {
  const toneMap = {
    slate: "from-slate-900 to-slate-700 text-white",
    blue: "from-blue-600 to-indigo-600 text-white",
    emerald: "from-emerald-500 to-emerald-600 text-white",
  };

  return (
    <div
      className={`rounded-3xl bg-gradient-to-br p-5 shadow-sm ${toneMap[tone]}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm opacity-90">{title}</div>
          <div className="mt-2 text-3xl font-bold tracking-tight">{value}</div>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
          <i className={`${icon} text-lg`} />
        </div>
      </div>
    </div>
  );
};

export default View;