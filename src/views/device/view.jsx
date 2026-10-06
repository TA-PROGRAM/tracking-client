import React, { useEffect, useMemo, useRef, useState } from "react";
import { DeviceModel } from "../../models";
import { useHistory } from "react-router-dom";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Menu } from "primereact/menu";
import { FilterMatchMode } from "primereact/api";
import Swal from "sweetalert2";

const device_model = new DeviceModel();

const View = () => {
  const history = useHistory();

  const [state, setState] = useState({
    loading: false,
    device: [],
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

        const device = await device_model.getDeviceBy();

        setState((prev) => ({
          ...prev,
          device: device?.data || [],
          total: device?.total || device?.data?.length || 0,
          loading: false,
        }));
      } catch (error) {
        console.error("Failed to fetch device data:", error);
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

  const formatStatus = (status) => {
    const isActive = Number(status) === 1;
    return (
      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold ${
          isActive
            ? "bg-emerald-100 text-emerald-700"
            : "bg-rose-100 text-rose-700"
        }`}
      >
        {isActive ? "ใช้งาน" : "ไม่ใช้งาน"}
      </span>
    );
  };

  const _onDelete = (code) => {
    Swal.fire({
      title: "ลบข้อมูล",
      text: "ยืนยันการลบข้อมูลกล้องนี้",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ใช่, ลบเลย",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      try {
        const res = await device_model.deleteDeviceById({
          device_table_uuid: code,
        });

        if (res?.require) {
          Swal.fire({
            title: "ลบข้อมูลเรียบร้อย",
            icon: "success",
            showConfirmButton: false,
            timer: 1800,
          });

          setState((prev) => ({
            ...prev,
            device: prev.device.filter(
              (item) => item.device_table_uuid !== code,
            ),
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
        console.error("Delete device failed:", error);
        Swal.fire({
          title: "เกิดข้อผิดพลาด",
          text: "ไม่สามารถลบข้อมูลได้ กรุณาลองใหม่อีกครั้ง",
          icon: "error",
        });
      }
    });
  };

  const onRowSelect = (e) => {
    const rowData = e.data;
    history.push(`/device/update/${rowData.device_table_uuid}`);
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
        />
        <Menu model={items} popup ref={menuRef} popupAlignment="right" />
      </div>
    );
  };

  const stats = useMemo(() => {
    const totalDevices = state.total || state.device.length;
    const activeDevices = state.device.filter(
      (item) => Number(item.active_device) === 1,
    ).length;
    const inactiveDevices = state.device.filter(
      (item) => Number(item.active_device) !== 1,
    ).length;

    return {
      totalDevices,
      activeDevices,
      inactiveDevices,
    };
  }, [state.device, state.total]);

  const header = useMemo(
    () => (
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="text-xl font-semibold text-slate-900">
            รายการกล้อง
          </div>
          <div className="text-sm text-slate-500">
            จัดการข้อมูลกล้อง IP, MAC Address, พิกัด และไซต์ที่เชื่อมโยง
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <i className="pi pi-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <InputText
              value={globalFilterValue}
              className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm shadow-none sm:w-72"
              placeholder="ค้นหาโครงการ, ไซต์, ชื่อกล้อง, IP, MAC..."
              onChange={onGlobalFilterChange}
            />
          </div>

          <Button
            label="เพิ่มกล้อง"
            icon="pi pi-plus"
            className="h-11 rounded-2xl border-none px-5"
            style={{
              background: "linear-gradient(135deg, #10b981 0%, #0f766e 100%)",
            }}
            onClick={() => history.push("/device/insert")}
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
          จัดการกล้อง
        </div>
        <div className="mt-1 text-sm text-slate-500">
          ดูรายการกล้องทั้งหมดและจัดการข้อมูลได้ในหน้าเดียว
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          title="จำนวนกล้อง"
          value={stats.totalDevices}
          icon="pi pi-video"
          tone="blue"
        />
        <StatCard
          title="กล้องที่ใช้งาน"
          value={stats.activeDevices}
          icon="pi pi-check-circle"
          tone="emerald"
        />
        <StatCard
          title="กล้องที่ไม่ใช้งาน"
          value={stats.inactiveDevices}
          icon="pi pi-times-circle"
          tone="rose"
        />
      </div>

      <Card className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <DataTable
          value={state.device}
          header={header}
          size="small"
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25]}
          loading={state.loading}
          tableStyle={{ minWidth: "70rem" }}
          responsiveLayout="stack"
          selectionMode="single"
          onRowSelect={onRowSelect}
          className="modern-device-table"
          emptyMessage="ไม่พบข้อมูลกล้อง"
          filters={filters}
          globalFilterFields={[
            "project_name",
            "site_name",
            "device_name",
            "ip_address",
            "mac_address",
            "device_table_uuid",
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
            header="โครงการ"
            sortable
            body={(row) => (
              <div className="font-semibold text-slate-900">
                {row.project_name || "-"}
              </div>
            )}
            style={{ width: "18%" }}
          />

          <Column
            field="site_name"
            header="ไซต์"
            sortable
            body={(row) => (
              <div className="font-medium text-slate-700">
                {row.site_name || "-"}
              </div>
            )}
            style={{ width: "16%" }}
          />

          <Column
            field="device_name"
            header="ชื่อกล้อง"
            sortable
            body={(row) => (
              <div>
                <div className="font-semibold text-slate-900">
                  {row.device_name || "-"}
                </div>
                <div className="text-xs text-slate-500">
                  ID: {row.device_table_uuid || "-"}
                </div>
              </div>
            )}
            style={{ width: "18%" }}
          />

          <Column
            field="ip_address"
            header="IP Address"
            sortable
            body={(row) => (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                {row.ip_address || "-"}
              </span>
            )}
            style={{ width: "14%" }}
          />
{/* 
          <Column
            field="mac_address"
            header="MAC Address"
            body={(row) => (
              <span className="text-sm text-slate-600">
                {row.mac_address || "-"}
              </span>
            )}
            style={{ width: "16%" }}
          /> */}

          <Column
            field="active_device"
            header="สถานะ"
            body={(row) => formatStatus(row.active_device)}
            sortable
            style={{ width: "12%" }}
          />

          <Column
            header="การจัดการ"
            body={(row) => (
              <RowActions
                row={row}
                onEdit={(data) =>
                  history.push(`/device/update/${data.device_table_uuid}`)
                }
                onDelete={(data) => _onDelete(data.device_table_uuid)}
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
    rose: "from-rose-500 to-rose-600 text-white",
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