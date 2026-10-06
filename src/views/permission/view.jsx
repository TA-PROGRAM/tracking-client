import React, { useState, useEffect, useRef } from "react";
import {
  Dropdown,
  Button,
  DataTable,
  Column,
  InputText,
  Card,
} from "primereact";
import { RoleModel } from "../../models";
import { useHistory } from "react-router-dom";
import Swal from "sweetalert2";
import { Loading } from "../../components/customComponent/";

const role_model = new RoleModel();
const View = () => {
  const [state, setState] = useState({
    role: [],
    role_id: "",
    loading: true,
    globalFilter: "",
  });
  const dt = useRef(null);
  const router = useHistory();
  const fetchData = async () => {
    const role = await role_model.getRoleBy();
    setState((prev) => ({
      ...prev,
      role: role.data,
      total: role.total,
      loading: false,
    }));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const _onDelete = (code) => {
    Swal.fire({
      title: "คุณแน่ใจหรือไม่",
      text: "ยืนยันการลบรายการ",
      icon: "warning",
      showCancelButton: true,
    }).then(async ({ value }) => {
      if (value) {
        const res = await role_model.deleteRoleById({ role_id: code });
        if (res.require) {
          Swal.fire({
            title: "คุณแน่ใจหรือไม่",
            text: "ยืนยันการลบรายการ",
            icon: "success",
            showConfirmButton: false,
            timer: 2000,
          }).then((v) => {
            setState({ ...state, role_id: "" });
            fetchData();
          });
        } else {
          Swal.fire({
            title: "เกิดข้อผิดพลาด !",
            text: "ไม่สามารถดำเนินการได้ !",
            icon: "error",
          });
        }
      }
    });
  };
  const header = (
    <div className="flex flex-wrap gap-2 items-center justify-between">
      <h4 className="m-0">ข้อมูลสิทธิ์</h4>
      <span className="p-input-icon-left">
        {/* <InputText
          type="search"
          onInput={(e) => setState({...state, globalFilter: e.target.value})}
          className="h-8 w-52"
          placeholder="ค้นหา..."
        /> */}
      </span>
    </div>
  );

  return (
    <>
      {/* <Loading shows={state.loading} /> */}
      <div className=" pr-3">
        <div className="grid grid-cols-1 pb-1">
          <Card className="opacity-90 rounded-2xl shadow-2xl pl-10 min-h-[96vh]">
            <div className="flex justify-between">
              <div className="flex items-center">
                <Button
                  className="h-6 text-sm"
                  label="เพิ่มสิทธิ์"
                  icon="pi pi-plus"
                  severity="success"
                  onClick={() => router.push("/permission/insert")}
                />
              </div>
            </div>
            <div className="border-4 rounded-xl mt-4 p-0">
              <DataTable
                ref={dt}
                value={state.role}
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25]}
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                globalFilter={state.globalFilter}
                header={header}
                responsiveLayout="stack"
              >
                <Column
                  header="ลำดับ"
                  headerStyle={{ background: "#E2E8F0", color: "black" }}
                  body={(row, idx) => idx.rowIndex + 1}
                />
                <Column
                  header="ประเภทสิทธิ์"
                  headerStyle={{ background: "#E2E8F0", color: "black" }}
                  field="role_name"
                />
                <Column
                  header="จัดการ"
                  headerStyle={{ background: "#E2E8F0", color: "black" }}
                  body={(row) => (
                    <div className="flex gap-2">
                      <Button
                        className="text-yellow-400 w-6 h-6"
                        severity="warning"
                        icon="pi pi-pencil"
                        rounded
                        text
                        onClick={() =>
                          router.push(`/permission/${row.role_id}`)
                        }
                      />
                      <Button
                        className="w-6 h-6"
                        severity="danger"
                        icon="pi pi-trash"
                        rounded
                        text
                        onClick={() => {
                          _onDelete(row.role_id);
                        }}
                      />
                    </div>
                  )}
                />
              </DataTable>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default View;
