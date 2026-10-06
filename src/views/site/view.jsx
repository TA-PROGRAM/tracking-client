import React, { useEffect, useMemo, useRef, useState } from "react";
import { SiteModel } from "../../models";
import { useHistory } from "react-router-dom";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Menu } from "primereact/menu";
import { FilterMatchMode } from "primereact/api";
import Swal from "sweetalert2";

const site_model = new SiteModel();

const View = () => {
  const history = useHistory();

  const [state, setState] = useState({
    loading: false,
    site: [],
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

        const site = await site_model.getSiteBy();

        setState((prev) => ({
          ...prev,
          site: site?.data || [],
          total: site?.total || site?.data?.length || 0,
          loading: false,
        }));
      } catch (error) {
        console.error("Failed to fetch site data:", error);
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
      title: "ลบข้อมูล",
      text: "ยืนยันการลบข้อมูลไซต์นี้",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ใช่, ลบเลย",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      try {
        const res = await site_model.deleteSiteById({ site_table_uuid: code });

        if (res?.require) {
          Swal.fire({
            title: "ลบข้อมูลเรียบร้อย",
            icon: "success",
            showConfirmButton: false,
            timer: 1800,
          });

          setState((prev) => ({
            ...prev,
            site: prev.site.filter((item) => item.site_table_uuid !== code),
            total: Math.max((prev.total || 1) - 1, 0),
          }));
        } else {
          Swal.fire({
            title: "ข้อมูลผิดพลาด",
            text: "โปรดแจ้งผู้ดูแลระบบ และลองใหม่อีกครั้ง",
            icon: "error",
          });
        }
      } catch (error) {
        console.error("Delete site failed:", error);
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
    history.push(`/site/update/${rowData.site_table_uuid}`);
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

  const siteStats = useMemo(() => {
    return {
      totalSites: state.total || state.site.length,
      totalProjects: new Set(
        (state.site || []).map((item) => item.project_name).filter(Boolean),
      ).size,
      withContact: (state.site || []).filter((item) => item.contact?.trim()).length,
    };
  }, [state.site, state.total]);

  const header = useMemo(
    () => (
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="text-xl font-semibold text-slate-900">รายการไซต์</div>
          <div className="text-sm text-slate-500">
            จัดการข้อมูลไซต์ ผู้ติดต่อ และความเชื่อมโยงกับโครงการ
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <i className="pi pi-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <InputText
              value={globalFilterValue}
              className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm shadow-none sm:w-72"
              placeholder="ค้นหาโครงการ, ชื่อไซต์, ผู้ติดต่อ, รายละเอียด..."
              onChange={onGlobalFilterChange}
            />
          </div>

          <Button
            label="เพิ่มไซต์"
            icon="pi pi-plus"
            className="h-11 rounded-2xl border-none px-5"
            style={{
              background: "linear-gradient(135deg, #10b981 0%, #0f766e 100%)",
            }}
            onClick={() => history.push("/site/insert")}
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
          ข้อมูลไซต์
        </div>
        <div className="mt-1 text-sm text-slate-500">
          ดูรายการไซต์ทั้งหมดและจัดการข้อมูลได้ในหน้าเดียว
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          title="จำนวนไซต์"
          value={siteStats.totalSites}
          icon="pi pi-map-marker"
          tone="blue"
        />
        <StatCard
          title="จำนวนโครงการ"
          value={siteStats.totalProjects}
          icon="pi pi-briefcase"
          tone="emerald"
        />
        <StatCard
          title="มีข้อมูลผู้ติดต่อ"
          value={siteStats.withContact}
          icon="pi pi-user"
          tone="slate"
        />
      </div>

      <Card className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <DataTable
          value={state.site}
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
          className="modern-site-table"
          emptyMessage="ไม่พบข้อมูลไซต์"
          filters={filters}
          globalFilterFields={[
            "project_name",
            "site_name",
            "contact",
            "description",
            "des_site",
            "site_table_uuid",
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
              <div>
                <div className="font-semibold text-slate-900">
                  {row.project_name || "-"}
                </div>
              </div>
            )}
            style={{ width: "22%" }}
          />

          <Column
            field="site_name"
            header="ชื่อไซต์"
            sortable
            body={(row) => (
              <div>
                <div className="font-semibold text-slate-900">
                  {row.site_name || "-"}
                </div>
              </div>
            )}
            style={{ width: "22%" }}
          />

          <Column
            field="contact"
            header="ผู้ติดต่อ"
            body={(row) => (
              <span className="text-sm text-slate-700">
                {row.contact || "-"}
              </span>
            )}
          />

          <Column
            field="des_site"
            header="รายละเอียด"
            body={(row) => (
              <div className="max-w-[280px] truncate text-sm text-slate-600">
                {row.des_site || row.description || "-"}
              </div>
            )}
          />

          <Column
            header="การจัดการ"
            body={(row) => (
              <RowActions
                row={row}
                onEdit={(data) =>
                  history.push(`/site/update/${data.site_table_uuid}`)
                }
                onDelete={(data) => _onDelete(data.site_table_uuid)}
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