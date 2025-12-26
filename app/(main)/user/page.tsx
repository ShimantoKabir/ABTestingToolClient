"use client";
import React, { useEffect, useRef, useState } from "react";
import { container } from "@/app/di";

// Services
import { UserService, UserServiceToken } from "./services/user.service";
import { RoleService, RoleServiceToken } from "../role/services/role.service";
import {
  MenuTemplateService,
  MenuTemplateServiceToken,
} from "../menu-template/services/menu-template.service";
import {
  ProjectService,
  ProjectServiceToken,
} from "../project/services/project.service";

// DTOs
import { UpdateUserRequestDto, UserResponseDto } from "./dtos/user.dto";
import { ErrorResponseDto } from "@/app/network/error-response.dto";
import { RoleResponseDto } from "../role/dtos/role-response.dto";
import { MenuTemplateResponseDto } from "../menu-template/dtos/menu-template.dto";
import { PaginationResponseDto } from "@/app/utils/dtos/pagination-response.dto";

// UPDATED: Import PermissionType
import {
  ProjectResponseDto,
  ProjectAssignUserRequestDto,
} from "../project/dtos/project.dto";

// PrimeReact
import { DataTable, DataTableStateEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputSwitch } from "primereact/inputswitch";
import { Toast } from "primereact/toast";
import { Tag } from "primereact/tag";

export default function UserPage() {
  const userService = container.get<UserService>(UserServiceToken);
  const roleService = container.get<RoleService>(RoleServiceToken);
  const menuTemplateService = container.get<MenuTemplateService>(
    MenuTemplateServiceToken
  );
  const projectService = container.get<ProjectService>(ProjectServiceToken);

  const toast = useRef<Toast>(null);

  // --- Table Data State ---
  const [users, setUsers] = useState<UserResponseDto[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lazyParams, setLazyParams] = useState({ first: 0, rows: 5, page: 1 });

  // --- Dropdown Source Data ---
  const [roleOptions, setRoleOptions] = useState<
    PaginationResponseDto<RoleResponseDto>
  >(new PaginationResponseDto<RoleResponseDto>());
  const [menuTemplateOptions, setMenuTemplateOptions] = useState<
    PaginationResponseDto<MenuTemplateResponseDto>
  >(new PaginationResponseDto<MenuTemplateResponseDto>());
  const [allProjects, setAllProjects] = useState<ProjectResponseDto[]>([]);

  // --- Edit Dialog State ---
  const [showEditDialog, setEditShowDialog] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number>(0);
  const [roleDropdown, setRoleDropdown] = useState<RoleResponseDto>(
    new RoleResponseDto()
  );
  const [menuTemplateDropdown, setMenuTemplateDropdown] =
    useState<MenuTemplateResponseDto>(new MenuTemplateResponseDto());
  const [disabled, setDisabled] = useState(false);

  // --- Project Assignment Dialog State ---
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [projectUser, setProjectUser] = useState<UserResponseDto | null>(null);
  const [userProjects, setUserProjects] = useState<ProjectResponseDto[]>([]);

  // Selection States
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null
  );

  useEffect(() => {
    loadDropdownData();
  }, []);

  useEffect(() => {
    loadUsers();
  }, [lazyParams]);

  const loadDropdownData = async () => {
    const rolesRes = await roleService.getRoles(1, 100);
    if (!(rolesRes instanceof ErrorResponseDto)) setRoleOptions(rolesRes);

    const menuRes = await menuTemplateService.getMenuTemplates(1, 100);
    if (!(menuRes instanceof ErrorResponseDto)) setMenuTemplateOptions(menuRes);

    const projRes = await projectService.getProjects(1, 100);
    if (!(projRes instanceof ErrorResponseDto)) setAllProjects(projRes.items);
  };

  const loadUsers = async () => {
    setLoading(true);
    const res = await userService.getUsers(lazyParams.page, lazyParams.rows);
    if (res instanceof ErrorResponseDto) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: res.message,
      });
    } else {
      setUsers(res.items);
      setTotalRecords(res.total);
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

  // --- Edit User Logic ---
  const openEditDialog = (user: UserResponseDto) => {
    if (user.super) {
      toast.current?.show({
        severity: "warn",
        summary: "Warning",
        detail: "Cannot edit super user",
      });
      return;
    }
    setEditingUserId(user.id);
    setRoleDropdown({ id: user.roleId || 0, name: user.roleName || "" });
    setMenuTemplateDropdown({
      id: user.menuTemplateId || 0,
      name: user.menuTemplateName || "",
      orgId: 0,
      tree: "",
    });
    setDisabled(user.disabled);
    setEditShowDialog(true);
  };

  const saveUser = async () => {
    const updateRequest = new UpdateUserRequestDto();
    updateRequest.roleId = roleDropdown.id;
    updateRequest.menuTemplateId = menuTemplateDropdown.id;
    updateRequest.disabled = disabled;

    const res = await userService.updateUser(editingUserId, updateRequest);

    if (res instanceof ErrorResponseDto) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: res.message,
      });
    } else {
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "User updated successfully",
      });
      setEditShowDialog(false);
      loadUsers();
    }
  };

  // --- Project Management Logic ---

  const openProjectDialog = async (user: UserResponseDto) => {
    if (user.super) {
      toast.current?.show({
        severity: "warn",
        summary: "Warning",
        detail: "Cannot modify super user projects!",
      });
      return;
    }

    setProjectUser(user);
    setShowProjectDialog(true);
    setSelectedProjectId(null);
    setUserProjects([]);

    const res = await projectService.getUserProjects(user.id);
    if (res instanceof ErrorResponseDto) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: res.message,
      });
    } else {
      setUserProjects(res);
    }
  };

  const handleAssignProject = async () => {
    if (!selectedProjectId || !projectUser) return;

    // UPDATED: Include permissionType
    const request = new ProjectAssignUserRequestDto();
    request.userId = projectUser.id;

    const res = await projectService.assignUserToProject(
      selectedProjectId,
      request
    );

    if (res instanceof ErrorResponseDto) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: res.message,
      });
    } else {
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Project assigned",
      });
      const updatedList = await projectService.getUserProjects(projectUser.id);
      if (!(updatedList instanceof ErrorResponseDto)) {
        setUserProjects(updatedList);
      }
      setSelectedProjectId(null);
    }
  };

  const handleRemoveProject = async (project: ProjectResponseDto) => {
    if (!projectUser) return;

    const res = await projectService.removeUserFromProject(
      project.id,
      projectUser.id
    );

    if (res instanceof ErrorResponseDto) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: res.message,
      });
    } else {
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "User removed from project",
      });
      setUserProjects((prev) => prev.filter((p) => p.id !== project.id));
    }
  };

  // --- Renderers ---
  const indexBody = (rowData: any, props: any) => props.rowIndex + 1;
  const roleBody = (rowData: UserResponseDto) => rowData.roleName || "N/A";
  const mtBody = (rowData: UserResponseDto) =>
    rowData.menuTemplateName || "N/A";
  const disabledBody = (rowData: UserResponseDto) => (
    <Tag
      severity={rowData.disabled ? "danger" : "success"}
      value={rowData.disabled ? "Inactive" : "Active"}
    />
  );
  const verifiedBody = (rowData: UserResponseDto) => (
    <Tag
      severity={rowData.verified ? "success" : "danger"}
      value={rowData.verified ? "Verified" : "Unverified"}
    />
  );
  const superBody = (rowData: UserResponseDto) => (
    <Tag
      severity={rowData.super ? "danger" : "info"}
      value={rowData.super ? "Super" : "Regular"}
    />
  );

  const editBody = (rowData: UserResponseDto) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-user-edit"
          rounded
          text
          severity="info"
          aria-label="Edit"
          onClick={() => openEditDialog(rowData)}
        />
      </div>
    );
  };

  const projectBody = (rowData: UserResponseDto) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-briefcase"
          rounded
          text
          severity="warning"
          aria-label="Projects"
          onClick={() => openProjectDialog(rowData)}
        />
      </div>
    );
  };

  const dialogFooter = (
    <div>
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={() => setEditShowDialog(false)}
        className="p-button-text"
      />
      <Button label="Update" icon="pi pi-check" onClick={saveUser} autoFocus />
    </div>
  );

  return (
    <div className="grid p-fluid p-4">
      <Toast ref={toast} />
      <div className="col-12">
        <div className="card shadow-2 border-round p-4 surface-card">
          <h2 className="mb-4">User Management</h2>

          <DataTable
            value={users}
            lazy
            paginator
            first={lazyParams.first}
            rows={lazyParams.rows}
            totalRecords={totalRecords}
            onPage={onPage}
            loading={loading}
            rowsPerPageOptions={[5, 10, 25]}
            tableStyle={{ minWidth: "60rem" }}
            paginatorClassName="border-none"
          >
            <Column header="SL" body={indexBody} style={{ width: "5%" }} />
            <Column field="email" header="Email" style={{ width: "15%" }} />
            <Column
              field="roleName"
              header="Role"
              body={roleBody}
              style={{ width: "10%" }}
            />
            <Column
              field="menuTemplateName"
              header="Menu Template"
              body={mtBody}
              style={{ width: "20%" }}
            />
            <Column
              field="disabled"
              header="Status"
              body={disabledBody}
              style={{ width: "10%" }}
            />
            <Column
              field="verified"
              header="Verified"
              body={verifiedBody}
              style={{ width: "10%" }}
            />
            <Column
              field="super"
              header="Type"
              body={superBody}
              style={{ width: "10%" }}
            />
            <Column
              header="Projects"
              body={projectBody}
              style={{ width: "5%" }}
            />
            <Column header="Edit" body={editBody} style={{ width: "5%" }} />
          </DataTable>
        </div>
      </div>

      {/* --- Dialog 1: Edit User --- */}
      <Dialog
        header="Edit User"
        visible={showEditDialog}
        style={{ width: "400px" }}
        footer={dialogFooter}
        onHide={() => setEditShowDialog(false)}
      >
        <div className="flex flex-column gap-4 pt-2">
          <div className="flex flex-column gap-2">
            <label htmlFor="role" className="font-bold">
              Assign Role
            </label>
            <Dropdown
              id="role"
              value={roleDropdown.id}
              onChange={(e) =>
                setRoleDropdown({ ...roleDropdown, id: e.value })
              }
              options={roleOptions.items}
              optionLabel="name"
              optionValue="id"
              placeholder="Select a Role"
              className="w-full"
            />
          </div>
          <div className="flex flex-column gap-2">
            <label htmlFor="menu" className="font-bold">
              Assign Menu Template
            </label>
            <Dropdown
              id="menu"
              value={menuTemplateDropdown.id}
              onChange={(e) =>
                setMenuTemplateDropdown({
                  ...menuTemplateDropdown,
                  id: e.value,
                })
              }
              options={menuTemplateOptions.items}
              optionLabel="name"
              optionValue="id"
              placeholder="Select a Menu Template"
              className="w-full"
            />
          </div>
          <div className="flex align-items-center gap-3">
            <InputSwitch
              inputId="status"
              checked={disabled}
              onChange={(e) => setDisabled(e.value)}
            />
            <label htmlFor="status" className="font-bold">
              {disabled ? "Disabled" : "Active"}
            </label>
          </div>
        </div>
      </Dialog>

      {/* --- Dialog 2: Manage Projects (UPDATED) --- */}
      <Dialog
        header={`Projects for ${projectUser?.firstName || "User"}`}
        visible={showProjectDialog}
        style={{ width: "600px" }} // Widened slightly for new dropdown
        onHide={() => setShowProjectDialog(false)}
      >
        <div className="flex flex-column gap-4">
          {/* Add New Project Section */}
          <div className="p-inputgroup">
            <Dropdown
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.value)}
              options={allProjects}
              optionLabel="name"
              optionValue="id"
              placeholder="Select Project"
              className="w-full"
            />
            <Button
              label="Add"
              icon="pi pi-plus"
              onClick={handleAssignProject}
              disabled={!selectedProjectId}
            />
          </div>

          {/* List Assigned Projects */}
          <div className="border-top-1 surface-border pt-3">
            <span className="font-bold block mb-2">Assigned Projects</span>
            {userProjects.length === 0 ? (
              <div className="text-center p-3 text-500">
                No projects assigned yet.
              </div>
            ) : (
              <ul className="list-none p-0 m-0">
                {userProjects.map((proj) => (
                  <li
                    key={proj.id}
                    className="flex align-items-center justify-content-between p-2 hover:surface-hover border-round"
                  >
                    <span>{proj.name}</span>
                    <Button
                      icon="pi pi-trash"
                      text
                      rounded
                      severity="danger"
                      onClick={() => handleRemoveProject(proj)}
                      tooltip="Remove Access"
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Dialog>
    </div>
  );
}
