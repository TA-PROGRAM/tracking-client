import React, { useEffect, useMemo, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { SelectButton } from "primereact/selectbutton";
import { Calendar } from "primereact/calendar";
import { ThaiCalendar } from "../../components/customComponent";
import { ExportExcel } from "./components";
import { HistoryOfflineModel } from "../../models";

const history_model = new HistoryOfflineModel();

const History = () => {
  ThaiCalendar();

  const options = ["รายวัน", "รายเดือน"];

  const [state, setState] = useState({
    data: [],
    loading: false,
    globalFilter: "",
    export_type: "รายวัน",
    select_date: null,
    hasDateFilter: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      const data = await history_model.getHistoryOfflineBy();

      setState((prev) => ({
        ...prev,
        data: data?.data || [],
        loading: false,
      }));
    } catch (error) {
      console.error("Failed to fetch offline history:", error);
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";

    const date = new Date(dateValue);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString();

    if (state.export_type === "รายวัน") {
      return `${year}-${month}-${day}`;
    }
    return `${year}-${month}`;
  };

  const formatThaiDate = (dateValue) => {
    if (!dateValue) return "-";

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "-";

    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = (date.getFullYear() + 543).toString();

    const time = date.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return `${day}/${month}/${year} ${time}`;
  };

  const getDurationText = (offlineDate, onlineDate) => {
    if (!offlineDate || !onlineDate) return "-";

    const start = new Date(offlineDate).getTime();
    const end = new Date(onlineDate).getTime();

    if (Number.isNaN(start) || Number.isNaN(end) || end < start) return "-";

    const diffMinutes = Math.floor((end - start) / 60000);
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    if (hours <= 0) return `${minutes} นาที`;
    return `${hours} ชม. ${minutes} นาที`;
  };
  const searchFilteredData = useMemo(() => {
    const keyword = state.globalFilter.trim().toLowerCase();

    return (state.data || []).filter((item) => {
      const matchKeyword =
        !keyword ||
        item.site_name?.toLowerCase().includes(keyword) ||
        item.device_name?.toLowerCase().includes(keyword);

      return matchKeyword;
    });
  }, [state.data, state.globalFilter]);
  const displayData = useMemo(() => {
    if (!state.hasDateFilter || !state.select_date) {
      return searchFilteredData;
    }

    const selectedDate = formatDate(state.select_date);

    return searchFilteredData.filter((item) => {
      return state.export_type === "รายวัน"
        ? item.offline_format === selectedDate
        : item.offline_month === selectedDate;
    });
  }, [
    searchFilteredData,
    state.hasDateFilter,
    state.select_date,
    state.export_type,
  ]);

  const selectedExportData = useMemo(() => displayData, [displayData]);

  const handleExport = () => {
    ExportExcel(displayData, state.select_date, state.export_type);
  };

  const stats = useMemo(() => {
    const total = displayData.length;
    const recovered = displayData.filter((item) => item.online_date).length;
    const stillOffline = displayData.filter((item) => !item.online_date).length;

    return {
      total,
      recovered,
      stillOffline,
    };
  }, [displayData]);

  const header = (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <div className="text-xl font-semibold text-slate-900">
          รายการประวัติออฟไลน์
        </div>
        <div className="text-sm text-slate-500">
          ค้นหา ตรวจสอบ และดาวน์โหลดประวัติกล้องที่เคยออฟไลน์
        </div>
      </div>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="relative">
          <i className="pi pi-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <InputText
            value={state.globalFilter}
            onChange={(e) =>
              setState((prev) => ({ ...prev, globalFilter: e.target.value }))
            }
            placeholder="ค้นหาไซต์หรือชื่อกล้อง..."
            className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm shadow-none xl:w-72"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SelectButton
            value={state.export_type}
            onChange={(e) =>
              setState((prev) => ({
                ...prev,
                export_type: e.value,
                select_date: null,
                hasDateFilter: false,
              }))
            }
            options={options}
            className="text-sm"
          />

          {state.export_type === "รายวัน" && (
            <Calendar
              locale="th"
              value={state.select_date}
              onChange={(e) =>
                setState((prev) => ({
                  ...prev,
                  select_date: e.value,
                  hasDateFilter: true,
                }))
              }
              dateFormat="d MM yy"
              className="h-11"
              readOnlyInput
              showIcon
            />
          )}

          {state.export_type === "รายเดือน" && (
            <Calendar
              locale="th"
              value={state.select_date}
              onChange={(e) =>
                setState((prev) => ({
                  ...prev,
                  select_date: e.value,
                  hasDateFilter: true,
                }))
              }
              dateFormat="d MM yy"
              className="h-11"
              readOnlyInput
              showIcon
            />
          )}

          <Button
            label="ล้างตัวกรอง"
            icon="pi pi-filter-slash"
            outlined
            className="h-11 rounded-2xl"
            onClick={() =>
              setState((prev) => ({
                ...prev,
                select_date: null,
                hasDateFilter: false,
              }))
            }
          />

          <Button
            className="h-11 rounded-2xl border-none px-5"
            label="ดาวน์โหลด"
            icon="pi pi-file-excel"
            onClick={handleExport}
            style={{
              background: "linear-gradient(135deg, #10b981 0%, #0f766e 100%)",
            }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 p-10">
      <div>
        <div className="text-2xl font-bold tracking-tight text-slate-900">
          ประวัติกล้องออฟไลน์
        </div>
        <div className="mt-1 text-sm text-slate-500">
          ดูรายการย้อนหลังของกล้องที่ออฟไลน์ และติดตามการกลับมาออนไลน์
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          title="เหตุการณ์ทั้งหมด"
          value={stats.total}
          icon="pi pi-history"
          tone="blue"
        />
        <StatCard
          title="กลับมาออนไลน์แล้ว"
          value={stats.recovered}
          icon="pi pi-check-circle"
          tone="emerald"
        />
        <StatCard
          title="ยังออฟไลน์อยู่"
          value={stats.stillOffline}
          icon="pi pi-times-circle"
          tone="rose"
        />
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <DataTable
          value={displayData}
          dataKey="history_offline_table_uuid"
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25]}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="แสดง {first} ถึง {last} ของ {totalRecords} รายการ"
          header={header}
          loading={state.loading}
          responsiveLayout="stack"
          className="modern-offline-table"
          emptyMessage="ไม่พบประวัติกล้องออฟไลน์"
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
            header="ไซต์"
            field="site_name"
            body={(row) => (
              <div className="font-semibold text-slate-900">
                {row.site_name || "-"}
              </div>
            )}
            style={{ width: "18%" }}
          />

          <Column
            header="กล้อง"
            field="device_name"
            body={(row) => (
              <div>
                <div className="font-semibold text-slate-900">
                  {row.device_name || "-"}
                </div>
              </div>
            )}
            style={{ width: "22%" }}
          />

          <Column
            header="เวลาออฟไลน์"
            body={(row) => (
              <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                {formatThaiDate(row.offline_date)}
              </span>
            )}
            style={{ width: "18%" }}
          />

          <Column
            header="เวลากลับมาออนไลน์"
            body={(row) =>
              row.online_date ? (
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {formatThaiDate(row.online_date)}
                </span>
              ) : (
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                  ยังไม่ออนไลน์
                </span>
              )
            }
            style={{ width: "18%" }}
          />

          <Column
            header="ระยะเวลา"
            body={(row) => (
              <span className="text-sm font-medium text-slate-700">
                {getDurationText(row.offline_date, row.online_date)}
              </span>
            )}
            style={{ width: "12%" }}
          />

          <Column
            header="สถานะ"
            body={(row) =>
              row.online_date ? (
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  กลับมาแล้ว
                </span>
              ) : (
                <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
                  ออฟไลน์อยู่
                </span>
              )
            }
            style={{ width: "12%" }}
          />
        </DataTable>
      </div>
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

export default History;
