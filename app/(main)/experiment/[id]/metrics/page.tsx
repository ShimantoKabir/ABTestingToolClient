"use client";
import React, { useEffect, useRef, useState } from "react";
import { container } from "@/app/di";
import {
  MetricsService,
  MetricsServiceToken,
} from "./services/metrics.service";
import {
  MetricsResponseDto,
  MetricsCreateRequestDto,
  MetricsPrimaryUpdateRequestDto,
} from "./dtos/metrics.dto";
import { ErrorResponseDto } from "@/app/network/error-response.dto";
import {
  CookieService,
  CookieServiceToken,
} from "@/app/utils/cookie/CookieService";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea"; // Added Import
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { ConfirmPopup, confirmPopup } from "primereact/confirmpopup";

import "./metrics.scss";

export default function MetricsPage({ params }: { params: { id: string } }) {
  const expId = parseInt(params.id);
  const service = container.get<MetricsService>(MetricsServiceToken);
  const cookieService = container.get<CookieService>(CookieServiceToken);
  const toast = useRef<Toast>(null);

  const [metrics, setMetrics] = useState<MetricsResponseDto[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [selector, setSelector] = useState("");
  const [description, setDescription] = useState(""); // Added Description State
  const [type, setType] = useState<"click" | "custom">("click");

  const metricTypes = [
    { label: "Click Event", value: "click" },
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
    // 1. Validation
    if (!title.trim() || !selector.trim()) {
      toast.current?.show({
        severity: "warn",
        summary: "Validation",
        detail: "Title and Selector are required",
      });
      return;
    }

    if (type === "custom") {
      const customEventRegex = /^[a-z0-9-]+$/;
      if (!customEventRegex.test(selector)) {
        toast.current?.show({
          severity: "error",
          summary: "Invalid Format",
          detail:
            "Event name must contain only lowercase letters, numbers, and hyphens (no spaces).",
        });
        return;
      }
    }

    setLoading(true);

    // 2. Construct DTO
    const req = new MetricsCreateRequestDto();
    req.title = title;
    req.selector = selector;
    req.custom = type === "custom";
    req.description = description; // Map Description

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

      // Reset Form
      setTitle("");
      setSelector("");
      setDescription("");
      setType("click");
      loadMetrics();
    }
    setLoading(false);
  };

  const handleDelete = (event: React.MouseEvent, id: number) => {
    confirmPopup({
      target: event.currentTarget as HTMLElement,
      message: "Are you sure you want to delete this metric?",
      icon: "pi pi-info-circle",
      acceptClassName: "p-button-danger",
      accept: async () => {
        const res = await service.deleteMetric(id);
        if (res instanceof ErrorResponseDto) {
          toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: res.message,
          });
        } else {
          toast.current?.show({
            severity: "success",
            summary: "Deleted",
            detail: "Metric removed",
          });
          setMetrics((prev) => prev.filter((m) => m.id !== id));
        }
      },
    });
  };

  const typeBody = (rowData: MetricsResponseDto) => {
    const typeLabel = rowData.custom ? "custom" : "click";
    return (
      <span className={`metric-type-badge type-${typeLabel}`}>{typeLabel}</span>
    );
  };

  const ToggleSwitch = ({ isOn, onToggle }: { isOn: boolean; onToggle: () => void }) => {
    return (
      <button
        className={`toggle-switch ${isOn ? 'active' : ''}`}
        onClick={onToggle}
        aria-label="Toggle primary metric"
      >
        <div className="toggle-slider"></div>
      </button>
    );
  };

  const primaryMetricBody = (rowData: MetricsResponseDto) => {
    const handleToggle = async () => {
      // Only call API if we're setting this metric as primary (not unsetting)
      if (!rowData.isPrimary) {
        // Get user email from JWT login info
        const loginInfo = cookieService.getJwtLoginInfo();
        const userEmail = loginInfo?.sub;

        if (!userEmail) {
          toast.current?.show({
            severity: "error",
            summary: "Authentication Error",
            detail: "User email not found. Please log in again.",
          });
          return;
        }

        const req = new MetricsPrimaryUpdateRequestDto();
        req.email = userEmail;

        const res = await service.updatePrimaryMetric(rowData.id, req);
        if (res instanceof ErrorResponseDto) {
          toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: res.message,
          });
        } else {
          toast.current?.show({
            severity: "success",
            summary: "Updated",
            detail: "Primary metric updated successfully",
          });
          // Reload metrics to get the updated state
          loadMetrics();
        }
      }
    };

    return <ToggleSwitch isOn={rowData.isPrimary} onToggle={handleToggle} />;
  };

  const actionBody = (rowData: MetricsResponseDto) => {
    return (
      <Button
        icon="pi pi-trash"
        rounded
        text
        severity="danger"
        aria-label="Delete"
        onClick={(e) => handleDelete(e, rowData.id)}
      />
    );
  };

  return (
    <div className="metrics-page card shadow-2 p-4 surface-card border-round">
      <Toast ref={toast} />
      <ConfirmPopup />

      <div className="flex justify-content-between align-items-center mb-4">
        <h3 className="m-0">Goals & Metrics</h3>
        <Button
          label="New Metric"
          icon="pi pi-plus"
          onClick={() => setShowDialog(true)}
        />
      </div>

      <DataTable value={metrics}>
        <Column field="title" header="Metric Name" style={{ width: "30%" }} />
        <Column header="Type" body={typeBody} style={{ width: "15%" }} />
        <Column
          field="selector"
          header="Selector / Event Name"
          style={{ width: "30%" }}
        />
        <Column
          field="isPrimary"
          header="Primary Metrics"
          body={primaryMetricBody}
          style={{ width: "15%", textAlign: "center" }}
        /> 

        <Column
          body={actionBody}
          style={{ width: "10%", textAlign: "center" }}
        />
      </DataTable>

      <Dialog
        header="Add Metric"
        visible={showDialog}
        style={{ width: "500px" }}
        onHide={() => setShowDialog(false)}
      >
        <div className="flex flex-column gap-4 pt-3">
          {/* Name */}
          <div className="flex flex-column gap-2">
            <label htmlFor="mTitle" className="font-bold">
              Metric Name
            </label>
            <InputText
              id="mTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full"
              autoFocus
            />
          </div>

          {/* Description - Added Input */}
          <div className="flex flex-column gap-2">
            <label htmlFor="mDesc" className="font-bold">
              Description
            </label>
            <InputTextarea
              id="mDesc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full"
              rows={2}
              autoResize
              placeholder="Optional description..."
            />
          </div>

          {/* Type */}
          <div className="flex flex-column gap-2">
            <label htmlFor="mType" className="font-bold">
              Event Type
            </label>
            <Dropdown
              id="mType"
              value={type}
              options={metricTypes}
              onChange={(e) => setType(e.value)}
              className="w-full"
            />
          </div>

          {/* Selector */}
          <div className="flex flex-column gap-2">
            <label htmlFor="mSelector" className="font-bold">
              {type === "click" ? "CSS Selector" : "Event Name"}
            </label>
            <InputText
              id="mSelector"
              value={selector}
              onChange={(e) => setSelector(e.target.value)}
              placeholder={
                type === "click" ? ".btn-signup, #submit-id" : "user-signed-up"
              }
              className="w-full"
            />

            {type === "custom" && (
              <small className="text-orange-500 ml-1">
                Format: lowercase, hyphens only, no spaces (e.g.,{" "}
                <code>user-click-btn</code>).
              </small>
            )}
            {type === "click" && (
              <small className="text-500 ml-1">
                Enter the CSS selector of the element you want to track.
              </small>
            )}
          </div>

          <div className="flex justify-content-end mt-2">
            <Button
              label="Save Metric"
              icon="pi pi-check"
              onClick={handleCreate}
              loading={loading}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
