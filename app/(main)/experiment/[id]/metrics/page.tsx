"use client";
import "./metrics.scss";
import React, { useEffect, useRef, useState } from "react";
import { container } from "@/app/di";
// UPDATED IMPORTS
import {
  MetricsService,
  MetricsServiceToken,
} from "./services/metrics.service";
import {
  MetricsResponseDto,
  MetricsCreateRequestDto,
} from "./dtos/metrics.dto";
import { ErrorResponseDto } from "@/app/network/error-response.dto";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";

export default function MetricsPage({ params }: { params: { id: string } }) {
  const expId = parseInt(params.id);
  const service = container.get<MetricsService>(MetricsServiceToken);
  const toast = useRef<Toast>(null);

  const [metrics, setMetrics] = useState<MetricsResponseDto[]>([]);
  const [showDialog, setShowDialog] = useState(false);

  const [title, setTitle] = useState("");
  const [selector, setSelector] = useState("");
  const [type, setType] = useState("click");

  const metricTypes = [
    { label: "Click", value: "click" },
    { label: "Page View", value: "pageview" },
    { label: "Custom Event", value: "custom" },
  ];

  useEffect(() => {
    loadMetrics();
  }, [expId]);

  const loadMetrics = async () => {
    const res = await service.getMetrics(expId);
    if (!(res instanceof ErrorResponseDto)) {
      setMetrics(res);
    }
  };

  const handleCreate = async () => {
    const req = new MetricsCreateRequestDto();
    req.title = title;
    req.type = type;
    req.selector = selector;
    req.experimentId = expId;

    const res = await service.createMetric(expId, req);
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
        detail: "Metric added",
      });
      setShowDialog(false);
      loadMetrics();
    }
  };

  return (
    <div className="card shadow-2 p-4 surface-card border-round h-full">
      <Toast ref={toast} />
      <div className="flex justify-content-between align-items-center mb-4">
        <h3 className="m-0">Goals & Metrics</h3>
        <Button
          label="New Metric"
          icon="pi pi-plus"
          onClick={() => setShowDialog(true)}
        />
      </div>

      <DataTable value={metrics}>
        <Column field="title" header="Metric Name" />
        <Column field="type" header="Type" />
        <Column field="selector" header="Selector / URL" />
      </DataTable>

      <Dialog
        header="Add Metric"
        visible={showDialog}
        style={{ width: "400px" }}
        onHide={() => setShowDialog(false)}
      >
        <div className="flex flex-column gap-3 pt-3">
          <div className="field">
            <label className="font-bold">Metric Name</label>
            <InputText
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="field">
            <label className="font-bold">Type</label>
            <Dropdown
              value={type}
              options={metricTypes}
              onChange={(e) => setType(e.value)}
              className="w-full"
            />
          </div>
          <div className="field">
            <label className="font-bold">Selector (CSS) or URL</label>
            <InputText
              value={selector}
              onChange={(e) => setSelector(e.target.value)}
              placeholder=".btn-signup"
              className="w-full"
            />
          </div>
          <Button
            label="Save Metric"
            icon="pi pi-check"
            onClick={handleCreate}
          />
        </div>
      </Dialog>
    </div>
  );
}
