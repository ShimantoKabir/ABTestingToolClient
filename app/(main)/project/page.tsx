"use client";
import React, { useEffect, useRef, useState } from "react";
import { container } from "@/app/di";

// Services
import {
  ProjectService,
  ProjectServiceToken,
} from "./services/project.service";

// DTOs
import {
  ProjectCreateRequestDto,
  ProjectResponseDto,
} from "./dtos/project.dto";
import { ErrorResponseDto } from "@/app/network/error-response.dto";

// PrimeReact
import { DataTable, DataTableStateEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Toast } from "primereact/toast";

export default function ProjectPage() {
  const projectService = container.get<ProjectService>(ProjectServiceToken);
  const toast = useRef<Toast>(null);

  // --- Table Data State ---
  const [projects, setProjects] = useState<ProjectResponseDto[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lazyParams, setLazyParams] = useState({ first: 0, rows: 5, page: 1 });

  // --- Create Dialog State ---
  const [showDialog, setShowDialog] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    loadProjects();
  }, [lazyParams]);

  const loadProjects = async () => {
    setLoading(true);
    const res = await projectService.getProjects(
      lazyParams.page,
      lazyParams.rows
    );
    if (res instanceof ErrorResponseDto) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: res.message,
      });
    } else {
      setProjects(res.items);
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

  const openNew = () => {
    setName("");
    setDescription("");
    setShowDialog(true);
  };

  const saveProject = async () => {
    if (!name.trim()) {
      toast.current?.show({
        severity: "warn",
        summary: "Warning",
        detail: "Project Name is required",
      });
      return;
    }

    const request = new ProjectCreateRequestDto();
    request.name = name;
    request.description = description;

    const res = await projectService.createProject(request);

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
        detail: "Project created successfully",
      });
      setShowDialog(false);
      loadProjects(); // Refresh table
    }
  };

  // --- Renderers ---
  const indexBody = (rowData: any, props: any) => props.rowIndex + 1;

  const editBody = (rowData: ProjectResponseDto) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-pencil"
          rounded
          text
          severity="info"
          aria-label="Edit"
        />
      </div>
    );
  };

  const deleteBody = (rowData: ProjectResponseDto) => {
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

  const dialogFooter = (
    <div>
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={() => setShowDialog(false)}
        className="p-button-text"
      />
      <Button label="Save" icon="pi pi-check" onClick={saveProject} autoFocus />
    </div>
  );

  return (
    <div className="grid p-fluid p-4">
      <Toast ref={toast} />
      <div className="col-12">
        <div className="card shadow-2 border-round p-4 surface-card">
          <div className="flex justify-content-between align-items-center mb-4">
            <h2 className="m-0">Projects</h2>
            <Button
              label="New"
              icon="pi pi-plus"
              severity="success"
              className="w-auto"
              onClick={openNew}
            />
          </div>

          <DataTable
            value={projects}
            lazy
            paginator
            first={lazyParams.first}
            rows={lazyParams.rows}
            totalRecords={totalRecords}
            onPage={onPage}
            loading={loading}
            tableStyle={{ minWidth: "50rem" }}
            paginatorClassName="border-none"
            rowsPerPageOptions={[5, 10, 25]}
          >
            <Column header="SL" body={indexBody} style={{ width: "5%" }} />
            <Column
              field="name"
              header="Project Name"
              style={{ width: "15%" }}
            />
            <Column
              field="description"
              header="Description"
              style={{ width: "60%" }}
            />
            <Column header="Edit" body={editBody} style={{ width: "10%" }} />
            <Column
              header="Delete"
              body={deleteBody}
              style={{ width: "10%" }}
            />
          </DataTable>
        </div>
      </div>

      <Dialog
        header="Create Project"
        visible={showDialog}
        style={{ width: "450px" }}
        footer={dialogFooter}
        onHide={() => setShowDialog(false)}
      >
        <div className="flex flex-column gap-3 pt-2">
          <div className="flex flex-column gap-2">
            <label htmlFor="name" className="font-bold">
              Name
            </label>
            <InputText
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter Project Name"
              autoFocus
            />
          </div>

          <div className="flex flex-column gap-2">
            <label htmlFor="description" className="font-bold">
              Description
            </label>
            <InputTextarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter Description"
              rows={3}
              autoResize
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
