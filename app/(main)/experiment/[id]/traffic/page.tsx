"use client";
import "./traffic.scss";
import React, { useEffect, useRef, useState, use } from "react";
import { container } from "@/app/di";
// UPDATED IMPORTS
import {
  TrafficService,
  TrafficServiceToken,
} from "./services/traffic.service";
import {
  VariationService,
  VariationServiceToken,
} from "../variation/services/variation.service";
import { TrafficAllocationRequestDto } from "./dtos/traffic.dto";
import { VariationResponseDto } from "../variation/dtos/variation.dto";
import { ErrorResponseDto } from "@/app/network/error-response.dto";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { ProgressBar } from "primereact/progressbar";

interface Props {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function TrafficPage(props: Props) {
  const params = use(props.params);
  const expId = parseInt(params.id);
  const trafficService = container.get<TrafficService>(TrafficServiceToken);
  const variationService = container.get<VariationService>(
    VariationServiceToken,
  );
  const toast = useRef<Toast>(null);

  const [variations, setVariations] = useState<VariationResponseDto[]>([]);
  const [totalTraffic, setTotalTraffic] = useState(0);

  useEffect(() => {
    loadVariations();
  }, [expId]);

  useEffect(() => {
    const total = variations.reduce((sum, v) => sum + (v.traffic || 0), 0);
    setTotalTraffic(total);
  }, [variations]);

  const loadVariations = async () => {
    // We use VariationService to get the list
    const res = await variationService.getVariations(expId);
    if (!(res instanceof ErrorResponseDto)) {
      setVariations(res);
    }
  };

  const onTrafficChange = (id: number, val: number | null) => {
    const newValue = val === null ? 0 : val;
    setVariations((prev) =>
      prev.map((v) => (v.id === id ? { ...v, traffic: newValue } : v)),
    );
  };

  const handleSave = async () => {
    if (totalTraffic > 100) {
      toast.current?.show({
        severity: "error",
        summary: "Invalid Allocation",
        detail: "Total traffic cannot exceed 100%",
      });
      return;
    }

    const req = new TrafficAllocationRequestDto();
    req.allocations = variations.map((v) => ({
      variationId: v.id,
      traffic: v.traffic,
    }));

    // We use TrafficService to save
    const res = await trafficService.updateTraffic(expId, req);
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
        detail: "Traffic allocation saved",
      });
    }
  };

  const trafficEditor = (rowData: VariationResponseDto) => {
    return (
      <InputNumber
        value={rowData.traffic}
        onValueChange={(e) => onTrafficChange(rowData.id, e.value ?? null)}
        suffix="%"
        min={0}
        max={100}
        className={rowData.traffic > 100 ? "p-invalid" : ""}
      />
    );
  };

  return (
    <div className="card shadow-2 p-4 surface-card border-round h-full">
      <Toast ref={toast} />

      <div className="flex justify-content-between align-items-center mb-4">
        <h3 className="m-0">Traffic Allocation</h3>
        <div className="flex align-items-center gap-3">
          <span
            className={`font-bold ${
              totalTraffic > 100 ? "text-red-500" : "text-green-500"
            }`}
          >
            Total: {totalTraffic}%
          </span>
          <Button
            label="Save Allocation"
            icon="pi pi-check"
            onClick={handleSave}
            disabled={totalTraffic > 100}
          />
        </div>
      </div>

      <div className="mb-4">
        <ProgressBar
          value={totalTraffic}
          color={totalTraffic > 100 ? "#ef4444" : "#22c55e"}
        />
      </div>

      <DataTable
        value={variations}
        editMode="cell"
        tableStyle={{ minWidth: "50rem" }}
      >
        <Column field="title" header="Variation Name" />
        <Column field="id" header="ID" style={{ width: "10%" }} />
        <Column
          field="traffic"
          header="Traffic (%)"
          body={trafficEditor}
          style={{ width: "20%" }}
        />
      </DataTable>
    </div>
  );
}
