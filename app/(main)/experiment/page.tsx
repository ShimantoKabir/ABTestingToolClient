"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { container } from "@/app/di";
import {
  ExperimentService,
  ExperimentServiceToken,
} from "./services/experiment.service";
import {
  CookieService,
  CookieServiceToken,
} from "@/app/utils/cookie/CookieService";
import {
  ExperimentResponseDto,
  ExperimentCreateRequestDto,
} from "./dtos/experiment.dto";
import { ErrorResponseDto } from "@/app/network/error-response.dto";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea"; // Added Import
import { Toast } from "primereact/toast";
import { Tag } from "primereact/tag";

export default function ExperimentList() {
  const router = useRouter();
  const toast = useRef<Toast>(null);
  const experimentService = container.get<ExperimentService>(
    ExperimentServiceToken
  );
  const cookieService = container.get<CookieService>(CookieServiceToken);

  const [experiments, setExperiments] = useState<ExperimentResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [lazyParams, setLazyParams] = useState({ first: 0, rows: 10, page: 1 });

  // Create Dialog State
  const [showDialog, setShowDialog] = useState(false);
  const [newExpTitle, setNewExpTitle] = useState("");
  const [newExpDesc, setNewExpDesc] = useState(""); // Added State
  const [newExpUrl, setNewExpUrl] = useState("");

  const loadExperiments = async () => {
    setLoading(true);
    const loginInfo = cookieService.getJwtLoginInfo();
    const orgId = loginInfo?.activeOrg?.id || 0;

    const res = await experimentService.getExperiments(
      orgId,
      lazyParams.page,
      lazyParams.rows
    );
    if (!(res instanceof ErrorResponseDto)) {
      setExperiments(res.items);
      setTotalRecords(res.total);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadExperiments();
  }, [lazyParams]);

  const enterExperiment = (id: number) => {
    router.push(`/experiment/${id}/condition`);
  };

  const handleCreate = async () => {
    const loginInfo = cookieService.getJwtLoginInfo();
    const projectId = loginInfo?.activeProject?.id || 0;

    if (projectId === 0) {
      toast.current?.show({
        severity: "warn",
        summary: "No Project",
        detail: "Please select a project first.",
      });
      return;
    }

    if (!newExpTitle.trim()) {
      toast.current?.show({
        severity: "error",
        summary: "Validation",
        detail: "Title is required",
      });
      return;
    }

    const req = new ExperimentCreateRequestDto();
    req.title = newExpTitle;
    req.description = newExpDesc; // Added to Request
    req.url = newExpUrl;
    req.projectId = projectId;

    const res = await experimentService.createExperiment(req);
    if (res instanceof ErrorResponseDto) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: res.message,
      });
    } else {
      toast.current?.show({
        severity: "success",
        summary: "Created",
        detail: "Experiment created",
      });
      setShowDialog(false);
      // Reset form
      setNewExpTitle("");
      setNewExpDesc("");
      setNewExpUrl("");
      loadExperiments();
    }
  };

  // --- Column Templates ---

  const statusBody = (rowData: ExperimentResponseDto) => {
    const severity =
      rowData.status === "Active"
        ? "success"
        : rowData.status === "Draft"
        ? "warning"
        : "danger";
    return <Tag value={rowData.status} severity={severity} />;
  };

  const typeBody = (rowData: ExperimentResponseDto) => {
    return <span className="font-semibold text-500">{rowData.type}</span>;
  };

  const actionBody = (rowData: ExperimentResponseDto) => {
    return (
      <Button
        icon="pi pi-arrow-right"
        rounded
        text
        severity="info"
        tooltip="Enter Experiment"
        tooltipOptions={{ position: "top" }}
        onClick={() => enterExperiment(rowData.id)}
      />
    );
  };

  const dialogFooter = (
    <div className="flex justify-content-end mt-2">
      <Button
        label="Cancel"
        icon="pi pi-times"
        text
        onClick={() => setShowDialog(false)}
      />
      <Button label="Create" icon="pi pi-check" onClick={handleCreate} />
    </div>
  );

  return (
    <div className="grid p-fluid p-4 experiments-list-page">
      <Toast ref={toast} />
      <div className="col-12">
        <div className="card shadow-2 border-round p-4 surface-card">
          <div className="flex justify-content-between align-items-center mb-4">
            <h2 className="m-0">Experiments</h2>
            <Button
              label="New Experiment"
              icon="pi pi-plus"
              className="w-auto"
              onClick={() => setShowDialog(true)}
            />
          </div>

          <DataTable
            value={experiments}
            lazy
            paginator
            first={lazyParams.first}
            rows={lazyParams.rows}
            totalRecords={totalRecords}
            onPage={(e) =>
              setLazyParams({
                first: e.first,
                rows: e.rows,
                page: (e.page || 0) + 1,
              })
            }
            loading={loading}
            rowClassName={() => "vertical-align-middle"}
          >
            <Column field="title" header="Title" style={{ width: "25%" }} />
            <Column field="description" header="Description" />
            <Column
              field="status"
              header="Status"
              body={statusBody}
              style={{ width: "10%" }}
            />
            <Column
              field="type"
              header="Type"
              body={typeBody}
              style={{ width: "15%" }}
            />
            <Column
              body={actionBody}
              header="Action"
              style={{ width: "5%", textAlign: "center" }}
            />
          </DataTable>
        </div>
      </div>

      <Dialog
        header="Create Experiment"
        visible={showDialog}
        style={{ width: "500px" }}
        onHide={() => setShowDialog(false)}
        footer={dialogFooter}
      >
        <div className="flex flex-column gap-4 pt-2">
          {/* Title Input */}
          <div className="flex flex-column gap-2">
            <label htmlFor="title" className="font-bold">
              Title
            </label>
            <InputText
              id="title"
              value={newExpTitle}
              onChange={(e) => setNewExpTitle(e.target.value)}
              autoFocus
              placeholder="e.g. Homepage Redesign"
            />
          </div>

          {/* Description Input */}
          <div className="flex flex-column gap-2">
            <label htmlFor="description" className="font-bold">
              Description
            </label>
            <InputTextarea
              id="description"
              value={newExpDesc}
              onChange={(e) => setNewExpDesc(e.target.value)}
              rows={3}
              autoResize
              placeholder="Optional description of the test..."
            />
          </div>

          {/* URL Input */}
          <div className="flex flex-column gap-2">
            <label htmlFor="url" className="font-bold">
              Target URL
            </label>
            <InputText
              id="url"
              value={newExpUrl}
              onChange={(e) => setNewExpUrl(e.target.value)}
              placeholder="https://example.com"
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
