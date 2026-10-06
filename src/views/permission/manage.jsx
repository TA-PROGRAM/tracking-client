import React, { useEffect, useState, useRef } from "react";
import { InputText, Checkbox, Button, Toast, Card } from "primereact";
import { PermissionModel, RoleModel } from "../../models";
import { useHistory } from "react-router-dom";
import Swal from "sweetalert2";

const permission_model = new PermissionModel();
const role_model = new RoleModel();

const Manage = ({ match, USER, PERMISSION }) => {
  const [state, setState] = useState({
    permission: [],
    filteredPermissions: [],
    role_id: null,
    role_name: "",
  });
  const route = useHistory();
  const toast = useRef();

  useEffect(() => {
    const fetchData = async () => {
      let params = match.params.id;
      let role = await role_model.getRoleById({ role_id: params });
      let { role_id, role_name } = role.data[0] || {};
      let permission = await permission_model.getPermissionBy({
        role_id: params,
      });

      permission.data = permission.data.map((item) => ({
        ...item,
        permission_view: item.permission_view === 1 ? true : false,
        permission_manage: item.permission_manage === 1 ? true : false,
      }));

      setState((prevState) => ({
        ...prevState,
        permission: permission.data,
        filteredPermissions: permission.data,
        header: params === "insert" ? "เพิ่มข้อมูล" : "แก้ไขข้อมูล",
        check_ins: params === "insert" ? 0 : 1,
        role_id,
        role_name,
        search_menu: prevState.search_menu || "",
      }));
    };
    fetchData();
  }, [match.params.id]);

  const handleSearch = (e) => {
    const { value } = e.target;
    const filteredPermissions = state.permission.filter((item) =>
      item.menu_name.toLowerCase().includes(value.toLowerCase())
    );
    setState({ ...state, search_menu: value, filteredPermissions });
  };

  const _checkedAll = (e, permissionType) => {
    const { checked } = e;
    let { permission } = state;
    permission.forEach((item) => {
      if (permissionType === "view") {
        item.permission_view = checked;
        if (!checked) {
          item.permission_manage = false;
        }
      } else {
        if (checked) item.permission_view = checked;
        if (permissionType === "manage") {
          item.permission_manage = checked;
        }
      }
    });
    setState({ ...state, permission, filteredPermissions: permission });
  };

  const _checkedItem = (e, idx, permissionType) => {
    const { checked } = e;
    let { permission } = state;
    if (permissionType === "view") {
      permission[idx].permission_view = checked;
      if (!checked) {
        permission[idx].permission_manage = false;
      }
    } else {
      if (checked) permission[idx].permission_view = checked;
      if (permissionType === "manage") {
        permission[idx].permission_manage = checked;
      }
    }
    setState({ ...state, permission, filteredPermissions: permission });
  };

  const checkSubmit = () => {
    if (!state.role_name) {
      toast.current.show({
        severity: "warn",
        summary: "ข้อมูลไม่ครบถ้วน",
        detail: "กรุณากรอกข้อมูล ชื่อประเภทการใช้งาน",
        life: 3000,
      });
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (checkSubmit()) {
      Swal.fire({
        title: "คุณแน่ใจหรือไม่ ?",
        icon: "warning",
        showCancelButton: true,
      }).then(async ({ value }) => {
        const dataInsert = {
          role_id: state.role_id,
          role_name: state.role_name,
          permissions: state.permission.map((item) => ({
            role_id: state.role_id,
            menu_id: item.menu_id,
            permission_view: item.permission_view ? 1 : 0,
            permission_manage: item.permission_manage ? 1 : 0,
          })),
        };
        const res = await permission_model.insertPermission(dataInsert);
        if (res.require) {
          Swal.fire({
            title: state.check_ins === 0 ? "เพิ่มข้อมูล" : "แก้ไขข้อมูล",
            text: "",
            icon: "success",
            showConfirmButton: false,
            timer: 2000,
          }).then(() => route.push("/permission"));
        } else {
          setState({ ...state, loading: false });
          Swal.fire({
            title: "เกิดข้อผิดพลาด !",
            text: "ไม่สามารถดำเนินการได้ !",
            icon: "error",
          });
        }
      });
    }
  };

  return (
    <div>
      <Card className="opacity-90 rounded-2xl shadow-2xl pl-10">
        <Toast ref={toast} />
        <div className="flex items-center">
          <label className="text-2xl pl-6 text-white">
            เพิ่มสิทธิ์การใช้งาน
          </label>
        </div>
        <div className="bg-slate-50 rounded-md h-full relative md:min-h-[70vh] mt-6 p-4">
          <div className="flex justify-between">
            <div>
              <InputText
                value={state.role_name || ""}
                className="w-48 h-8 text-sm"
                placeholder="ชื่อสิทธิ์"
                onChange={(e) =>
                  setState({ ...state, role_name: e.target.value })
                }
              />
            </div>
            <div>
              <i className="pi pi-search absolute text-gray-400 mt-3 ml-2"></i>
              <InputText
                value={state.search_menu || ""}
                className="pl-8 w-64 h-10 text-sm"
                placeholder="ค้นหา"
                onChange={handleSearch}
              />
            </div>
          </div>

          <style>
            {`
              td, th {
                text-align: center;
                padding: 8px;
              }         
            `}
          </style>
          <table
            className="mt-5 p-datatable-table table-bordered font-bold w-full text-black"
            style={{ borderCollapse: "collapse" }}
          >
            <thead>
              <tr>
                <td
                  className="border-t-[1px] border-slate-400"
                  width={10}
                  rowSpan={2}
                >
                  ลำดับ
                </td>
                <td
                  className="border-t-[1px] border-slate-400"
                  width={800}
                  rowSpan={2}
                >
                  ชื่อเมนู
                </td>
                <td className="border-t-[1px] border-slate-400" width={10}>
                  เรียกดู
                </td>
                <td className="border-t-[1px] border-slate-400" width={10}>
                  จัดการ
                </td>
              </tr>
              <tr>
                <td className="" width={90}>
                  <Checkbox
                    checked={state.view}
                    onChange={(e) => {
                      _checkedAll(e, "view");
                      setState({ ...state, view: e.checked });
                    }}
                  />
                </td>
                <td className="" width={90}>
                  <Checkbox
                    checked={state.manage}
                    onChange={(e) => {
                      _checkedAll(e, "manage");
                      setState({ ...state, manage: e.checked });
                    }}
                  />
                </td>
              </tr>
            </thead>
            <tbody>
              {state.filteredPermissions?.map((item, idx) => (
                <tr
                  key={idx}
                  className="border-t-[1px] border-b-[1px] border-slate-400"
                >
                  <td>{idx + 1}</td>
                  <td className="font-medium text-lg">{item.menu_name}</td>
                  <td>
                    <Checkbox
                      checked={item.permission_view}
                      onChange={(e) => _checkedItem(e, idx, "view")}
                    />
                  </td>
                  <td>
                    <Checkbox
                      checked={item.permission_manage}
                      onChange={(e) => _checkedItem(e, idx, "manage")}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="sm:absolute sm:bottom-0 sm:right-0 mt-4 flex justify-end *:m-1">
            <Button
              severity="primary"
              className={"h-8"}
              label="บันทึก"
              onClick={handleSubmit}
            />
            <Button
              type=""
              severity="secondary"
              outlined
              className={" h-8"}
              label="ยกเลิก"
              onClick={() => route.push("/permission")}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Manage;
