"use client";
import React, { useEffect, useRef, useState } from "react";
import { container } from "@/app/di";

import {
  ExperimentUpdateRequestDto,
  ConditionType,
} from "../../dtos/experiment.dto";
import { ErrorResponseDto } from "@/app/network/error-response.dto";

// PrimeReact
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { Skeleton } from "primereact/skeleton";
import { Chips } from "primereact/chips"; // Updated to Chips

import "./condition.scss";
import {
  ConditionCreateRequestDto,
  ConditionResponseDto,
  Operator,
} from "./dtos/condition.dto";
import {
  ConditionService,
  ConditionServiceToken,
} from "./services/condition.service";
import {
  ExperimentService,
  ExperimentServiceToken,
} from "../../services/experiment.service";

// Local interface for a pending condition that hasn't been saved to DB yet
interface PendingCondition {
  id: string; // Temporary ID for UI key
  operator: Operator;
  urls: string[];
}

export default function ConditionPage({ params }: { params: { id: string } }) {
  const expId = parseInt(params.id);
  const conditionService = container.get<ConditionService>(
    ConditionServiceToken
  );
  const experimentService = container.get<ExperimentService>(
    ExperimentServiceToken
  );
  const toast = useRef<Toast>(null);

  // Data State
  const [conditions, setConditions] = useState<ConditionResponseDto[]>([]);
  const [pendingConditions, setPendingConditions] = useState<
    PendingCondition[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Experiment Form State
  const [expUrl, setExpUrl] = useState("");
  const [expConditionType, setExpConditionType] =
    useState<ConditionType>("ALL");

  const operators: { label: string; value: Operator }[] = [
    { label: "contains", value: "CONTAIN" },
    { label: "does not contain", value: "NOT_CONTAIN" },
    { label: "is (case sensitive)", value: "IS" },
    { label: "is not", value: "IS_NOT" },
  ];

  const conditionTypes: { label: string; value: ConditionType }[] = [
    { label: "ALL (Match All Conditions)", value: "ALL" },
    { label: "ANY (Match Any Condition)", value: "ANY" },
  ];

  useEffect(() => {
    loadData();
  }, [expId]);

  const loadData = async () => {
    setLoading(true);

    // 1. Fetch Experiment Details
    const expRes = await experimentService.getExperimentById(expId);
    if (!(expRes instanceof ErrorResponseDto)) {
      setExpUrl(expRes.url || "");
      setExpConditionType(expRes.conditionType || "ALL");
    }

    // 2. Fetch Conditions
    const condRes = await conditionService.getConditions(expId);
    if (!(condRes instanceof ErrorResponseDto)) {
      setConditions(condRes);
    }
    setLoading(false);
  };

  const handleAddCondition = () => {
    const newCondition: PendingCondition = {
      id: Math.random().toString(36).substr(2, 9),
      operator: "CONTAIN",
      urls: [],
    };
    setPendingConditions([...pendingConditions, newCondition]);
  };

  // Renamed Function as requested
  const handleRemovePendingCondition = (tempId: string) => {
    setPendingConditions(pendingConditions.filter((r) => r.id !== tempId));
  };

  const updatePendingCondition = (
    tempId: string,
    field: keyof PendingCondition,
    value: any
  ) => {
    setPendingConditions((prev) =>
      prev.map((r) => (r.id === tempId ? { ...r, [field]: value } : r))
    );
  };

  const handleDeleteCondition = async (id: number) => {
    const res = await conditionService.deleteCondition(id);
    if (!(res instanceof ErrorResponseDto)) {
      setConditions((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleSaveAll = async () => {
    setLoading(true);
    let errorOccurred = false;

    // 1. Update Experiment Details
    const expUpdateReq = new ExperimentUpdateRequestDto();
    expUpdateReq.url = expUrl;
    expUpdateReq.conditionType = expConditionType;

    const expRes = await experimentService.updateExperiment(
      expId,
      expUpdateReq
    );
    if (expRes instanceof ErrorResponseDto) {
      toast.current?.show({
        severity: "error",
        summary: "Experiment Update Failed",
        detail: expRes.message,
      });
      errorOccurred = true;
    }

    // 2. Save All Pending Conditions
    for (const condition of pendingConditions) {
      if (condition.urls.length === 0) {
        continue;
      }

      const condReq = new ConditionCreateRequestDto();
      condReq.operator = condition.operator;
      condReq.urls = condition.urls;

      const condRes = await conditionService.createCondition(expId, condReq);
      if (condRes instanceof ErrorResponseDto) {
        toast.current?.show({
          severity: "error",
          summary: "Condition Failed",
          detail: condRes.message,
        });
        errorOccurred = true;
      }
    }

    if (!errorOccurred) {
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Changes saved successfully",
      });
      setPendingConditions([]);
      loadData();
    }
    setLoading(false);
  };

  if (loading && conditions.length === 0 && !expUrl)
    return (
      <div className="p-4">
        <Skeleton height="400px" />
      </div>
    );

  return (
    <div className="condition-page h-full flex flex-column">
      <Toast ref={toast} />

      <div className="header-bar">
        <h2 className="m-0 text-900 font-bold">Condition</h2>
      </div>

      <div className="grid formgrid p-fluid mb-4">
        <div className="col-12 mb-3">
          <label className="font-bold text-500 mb-2 block">Target URL</label>
          <div className="p-inputgroup">
            <InputText
              value={expUrl}
              onChange={(e) => setExpUrl(e.target.value)}
              placeholder="https://..."
            />
            <span className="p-inputgroup-addon bg-green-100 text-green-700">
              <i className="pi pi-check"></i>
            </span>
          </div>
        </div>
        <div className="col-12 md:col-4">
          <label className="font-bold text-500 mb-2 block">
            Condition Logic
          </label>
          <Dropdown
            value={expConditionType}
            options={conditionTypes}
            onChange={(e) => setExpConditionType(e.value)}
            className="w-full"
          />
        </div>
      </div>

      <div className="text-xl font-bold mb-3 border-bottom-2 border-900 pb-2">
        Conditions:
      </div>

      <div className="flex flex-column gap-3">
        {/* Saved Conditions (Delete Icon) */}
        {conditions.map((condition, index) => (
          <div key={condition.id}>
            {index > 0 && (
              <div className="logic-separator">
                <span className="logic-badge">{expConditionType}</span>
              </div>
            )}
            <div className="condition-row saved">
              <div
                className="flex flex-column gap-2"
                style={{ width: "220px" }}
              >
                <label className="text-xs text-500">Operator</label>
                <Dropdown
                  value={condition.operator}
                  options={operators}
                  disabled
                  className="p-inputtext-sm"
                />
              </div>
              <div className="flex flex-column gap-2 flex-1">
                <label className="text-xs text-500">URLS</label>
                <Chips
                  value={condition.urls}
                  disabled
                  className="p-inputtext-sm"
                />
              </div>
              {/* Action Column: Delete Icon for Saved */}
              <div
                className="flex flex-column justify-content-end"
                style={{ height: "56px" }}
              >
                <Button
                  icon="pi pi-trash"
                  rounded
                  text
                  severity="danger"
                  onClick={() => handleDeleteCondition(condition.id)}
                />
              </div>
            </div>
          </div>
        ))}

        {/* Separator between saved and pending */}
        {conditions.length > 0 && pendingConditions.length > 0 && (
          <div className="logic-separator">
            <span className="logic-badge">{expConditionType}</span>
          </div>
        )}

        {/* Pending Conditions (Close Icon) */}
        {pendingConditions.map((condition, index) => (
          <div key={condition.id} className="fadein animation-duration-300">
            {index > 0 && (
              <div className="logic-separator">
                <span className="logic-badge">{expConditionType}</span>
              </div>
            )}

            <div className="condition-row pending">
              <div className="flex w-full gap-3">
                <div
                  className="flex flex-column gap-2"
                  style={{ width: "220px" }}
                >
                  <label className="text-xs text-500">Operator</label>
                  <Dropdown
                    value={condition.operator}
                    options={operators}
                    onChange={(e) =>
                      updatePendingCondition(condition.id, "operator", e.value)
                    }
                    className="p-inputtext-sm w-full"
                  />
                </div>
                <div className="flex flex-column gap-2 flex-1">
                  <label className="text-xs text-500">URLS *</label>
                  <Chips
                    value={condition.urls}
                    onChange={(e) =>
                      updatePendingCondition(condition.id, "urls", e.value)
                    }
                    className="p-inputtext-sm w-full"
                    placeholder="Press enter to add URL"
                  />
                  {condition.urls.length === 0 && (
                    <small className="text-pink-500">
                      At least one URL is required
                    </small>
                  )}
                </div>
                {/* Action Column: Close Icon for Pending */}
                <div
                  className="flex flex-column justify-content-end"
                  style={{ height: "56px" }}
                >
                  <Button
                    icon="pi pi-times"
                    rounded
                    text
                    severity="secondary"
                    onClick={() => handleRemovePendingCondition(condition.id)}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-content-between align-items-center">
        <Button
          label="Add Condition"
          icon="pi pi-plus-circle"
          outlined
          onClick={handleAddCondition}
        />
        <Button
          label="Save"
          icon="pi pi-check"
          onClick={handleSaveAll}
          loading={loading}
        />
      </div>
    </div>
  );
}
