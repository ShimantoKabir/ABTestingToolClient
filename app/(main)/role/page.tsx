"use client";
import React, { useEffect, useRef, useState } from "react";
import { container } from "@/app/di";
import { RoleService, RoleServiceToken } from "./services/role.service";
import { ErrorResponseDto } from "@/app/network/error-response.dto";

// Updated Imports
import { RoleResponseDto } from "./dtos/role-response.dto";
import { RoleCreateRequestDto } from "./dtos/role-create-request.dto";

// PrimeReact Imports
import { DataTable, DataTableStateEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { classNames } from "primereact/utils";

export default function Role() {
  const roleService = container.get<RoleService>(RoleServiceToken);
  const toast = useRef<Toast>(null);

  // 1. Update State to use new RoleResponseDto
  const [roles, setRoles] = useState<RoleResponseDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalRecords, setTotalRecords] = useState<number>(0);

  const [lazyParams, setLazyParams] = useState({
    first: 0,
    rows: 5,
    page: 1,
  });

  const [roleDialog, setRoleDialog] = useState<boolean>(false);
  const [roleName, setRoleName] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false);

  useEffect(() => {
    loadRoles();
  }, [lazyParams]);

  const loadRoles = async () => {
    setLoading(true);
    // Call service with new signature
    const data = await roleService.getRoles(lazyParams.page, lazyParams.rows);

    if (data instanceof ErrorResponseDto) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: data.message,
      });
    } else {
      // The generic PaginationResponseDto<T> has 'items' and 'total'
      setRoles(data.items);
      setTotalRecords(data.total);
    }
    setLoading(false);
  };

  const onPage = (event: DataTableStateEvent) => {
    setLazyParams({
      first: event.first,
      rows: event.rows,
      page: (event.page || 0) + 1,
    });
  };

  const openNew = () => {
    setRoleName("");
    setSubmitted(false);
    setRoleDialog(true);
  };

  const hideDialog = () => {
    setSubmitted(false);
    setRoleDialog(false);
  };

  const saveRole = async () => {
    setSubmitted(true);

    if (roleName.trim()) {
      setLoading(true);

      // Prepare request DTO
      const req = new RoleCreateRequestDto();
      req.name = roleName;

      const response = await roleService.createRole(req);

      if (response instanceof ErrorResponseDto) {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: response.message,
        });
      } else {
        toast.current?.show({
          severity: "success",
          summary: "Successful",
          detail: "Role Created",
          life: 3000,
        });
        setRoleDialog(false);
        setRoleName("");
        loadRoles();
      }
      setLoading(false);
    }
  };

  const roleDialogFooter = (
    <React.Fragment>
      <Button label="Cancel" icon="pi pi-times" outlined onClick={hideDialog} />
      <Button label="Save" icon="pi pi-check" onClick={saveRole} />
    </React.Fragment>
  );

  const editAction = () => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-pencil"
          rounded
          text
          severity="info"
          aria-label="Update"
        />
      </div>
    );
  };

  const deleteAction = () => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-trash"
          rounded
          text
          severity="danger"
          aria-label="Delete"
        />
      </div>
    );
  };

  return (
    <div className="grid p-fluid p-4">
      <div className="col-12">
        <Toast ref={toast} />

        <div className="card shadow-2 border-round p-4 surface-card">
          <div className="flex justify-content-between align-items-center mb-4">
            <h2 className="m-0">Manage Roles</h2>
            <Button
              label="New"
              icon="pi pi-plus"
              severity="success"
              className="w-auto"
              onClick={openNew}
            />
          </div>

          <DataTable
            value={roles}
            lazy
            dataKey="id"
            paginator
            first={lazyParams.first}
            rows={lazyParams.rows}
            totalRecords={totalRecords}
            onPage={onPage}
            loading={loading}
            tableStyle={{ minWidth: "50rem" }}
            rowsPerPageOptions={[5, 10, 25]}
            paginatorClassName="border-none"
            className="border-none"
          >
            <Column field="id" header="ID" style={{ width: "10%" }}></Column>
            <Column
              field="name"
              header="Role Name"
              style={{ width: "70%" }}
            ></Column>
            <Column header="Edit" body={editAction} style={{ width: "10%" }} />
            <Column
              header="Delete"
              body={deleteAction}
              style={{ width: "10%" }}
            />
          </DataTable>
        </div>

        <Dialog
          visible={roleDialog}
          style={{ width: "32rem" }}
          breakpoints={{ "960px": "75vw", "641px": "90vw" }}
          header="New Role"
          modal
          className="p-fluid"
          footer={roleDialogFooter}
          onHide={hideDialog}
        >
          <div className="field">
            <label htmlFor="name" className="font-bold">
              Name
            </label>
            <InputText
              id="name"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              required
              autoFocus
              className={classNames({ "p-invalid": submitted && !roleName })}
            />
            {submitted && !roleName && (
              <small className="p-error">Name is required.</small>
            )}
          </div>
        </Dialog>
      </div>
    </div>
  );
}
