import React, { useState, useEffect, useRef } from "react";
import { UserModel } from "../../models";
import { useHistory } from "react-router-dom";
import { Card, DataTable, InputText, Column, Button } from "primereact";
import { Menu } from "primereact/menu";
import Swal from "sweetalert2";

const user_model = new UserModel();
const View = () => {
  const [state, setState] = useState({
    loading: "",
    user: [],
    globalFilter: "",
  });

  const history = useHistory();
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const user = await user_model.getUserBy();
    setState((prev) => ({ ...prev, user: user.data }));
  };

  const header = () => (
    <div className="flex justify-between">
      <div>
        <InputText
          className="h-8 w-52 rounded-2xl  "
          placeholder="Search..."
          onInput={(e) =>
            setState({
              ...state,
              globalFilter: e.target.value,
            })
          }
        />
        <i className="absolute pi pi-search -translate-x-8 translate-y-2 text-slate-500 opacity-50 "></i>
      </div>
      <Button
        className="h-8 "
        label="เพิ่มผู้ใช้งาน"
        onClick={() => history.push(`/user/insert`)}
      />
    </div>
  );

  const formatStatus = (status) => {
    if (status != 1) {
      return <div className="text-red-500 text-sm"> ไม่ใช้งาน</div>;
    }
    return <div className="text-green-500 text-sm"> ใช้งาน</div>;
  };

  let items = [];
  items.push({
    label: "แก้ไขข้อมูล",
    icon: "pi pi-file-edit",
    command: () => {
      console.log("uuid now:", state.user_table_uuid);
      history.push(`/device/update/${state.user_table_uuid}`);
    },
  });

  items.push({
    label: "ลบข้อมูล",
    icon: "pi pi-times-circle",
    showCancelButton: true,
    command: () => {
      _onDelete(state.user_table_uuid);
    },
  });

  const _onDelete = (code) => {
    Swal.fire({
      title: `ลบข้อมูล !!`,
      text: `ยืนยันการลบข้อมูล !!`,
      icon: "warning",
      showCancelButton: true,
    }).then(async ({ value }) => {
      if (value) {
        const res = await user_model.deleteUserById({
          user_table_uuid: code,
        });
        if (res.require) {
          Swal.fire({
            title: `ยืนยันการลบข้อมูล `,
            text: "",
            icon: "success",
            showConfirmButton: false,
            timer: 2000,
          }).then(() => {
            fetchData();
          });
        } else {
          Swal.fire({
            title: `ข้อมูลผิดพลาด`,
            text: `โปรดแจ้งผู้ดูแลระบบ กรุณารอสักครู่และลองใหม่อีกครั้ง`,
            icon: "error",
          });
        }
      }
    });
  };

  const onRowSelect = (e) => {
    const rowData = e.data;
    setState((prevState) => ({
      ...prevState,
      user_table_uuid: rowData.user_table_uuid,
    }));
    history.push(`/user/update/${rowData.user_table_uuid}`);
  };

  const RowActions = ({ row, onEdit, onDelete }) => {
    const menuRef = React.useRef(null);

    const items = [
      {
        label: "แก้ไขข้อมูล",
        icon: "pi pi-file-edit",
        command: () => onEdit(row),
      },
      {
        label: "ลบข้อมูล",
        icon: "pi pi-times-circle",
        command: () => onDelete(row),
      },
    ];

    return (
      <div className="flex gap-2">
        <Button
          className="text-black h-4 border-none"
          outlined
          icon="pi pi-ellipsis-v"
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
  return (
    <div className="text-xl ">
      <label>ข้อมูลผู้ใช้งาน</label>
      <div>
        <Card className="min-h-[75vh] bg-slate-200/25 ">
          <div className="flex justify-end gap-4 py-2"></div>

          <DataTable
            value={state?.user}
            header={header}
            size="small"
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25]}
            globalFilter={state.globalFilter}
            tableStyle={{ minWidth: "50rem" }}
            selectionMode="single"
            onRowSelect={onRowSelect}
          >
            <Column header="ลำดับ" body={(row, idx) => idx.rowIndex + 1} />
            <Column
              field="username"
              header="Username"
              sortable
              style={{ width: "15%" }}
            ></Column>
            <Column
              field="firstname"
              header="ชื่อ"
              sortable
              style={{ width: "20%" }}
            ></Column>
            <Column
              field="lastname"
              header="สกุล"
              sortable
              style={{ width: "20%" }}
            ></Column>
            <Column
              field="role_name"
              header="สิทธิ์"
              sortable
              style={{ width: "15%" }}
            ></Column>
            <Column
              field="is_active"
              header="สถานะ"
              body={(rowData) => formatStatus(rowData.is_active)}
              sortable
              style={{ width: "10%" }}
            ></Column>
            <Column
              header="การจัดการ"
              body={(row) => (
                <RowActions
                  row={row}
                  onEdit={(data) =>
                    history.push(`/user/update/${data.user_table_uuid}`)
                  }
                  onDelete={(data) => _onDelete(data.user_table_uuid)}
                />
              )}
            />
          </DataTable>
        </Card>
      </div>
    </div>
  );
};

export default View;
