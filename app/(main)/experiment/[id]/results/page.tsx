"use client";
import "./results.scss";
import React, { useEffect, useRef, useState, use } from "react";
import { container } from "@/app/di";
import { ErrorResponseDto } from "@/app/network/error-response.dto";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Skeleton } from "primereact/skeleton";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Card } from "primereact/card";
import { ResultsResponseDto } from "./dtos/results.dto";
import {
  ResultsService,
  ResultsServiceToken,
} from "./services/results.service";
import { Tag } from "primereact/tag";

interface Props {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function ResultsPage(props: Props) {
  const resultsService = container.get<ResultsService>(ResultsServiceToken);
  const toast = useRef<Toast>(null);

  const [expId, setExpId] = useState<number>(0);
  const [results, setResults] = useState<ResultsResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const params = use(props.params);
  const propExpId = parseInt(params.id);

  useEffect(() => {
    const initParams = async () => {
      setExpId(propExpId);
      loadData(propExpId);
    };
    initParams();
  }, [propExpId]);

  const loadData = async (experimentId: number) => {
    setLoading(true);

    try {
      const resultsRes = await resultsService.getResults(experimentId);
      if (!(resultsRes instanceof ErrorResponseDto)) {
        setResults(resultsRes);
      }
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load results data!",
      });
    } finally {
      setLoading(false);
    }
  };

  const isPrimaryBody = (result: ResultsResponseDto) => (
    <Tag
      severity={result.isPrimary ? "success" : "info"}
      value={result.isPrimary ? "YES" : "NO"}
    />
  );

  if (loading && results.length === 0)
    return (
      <div className="p-4">
        <Skeleton height="400px" />
      </div>
    );

  return (
    <div className="results-page card shadow-2 p-4 surface-card border-round">
      <Toast ref={toast} />

      <div className="flex justify-content-between align-items-center mb-4">
        <h3 className="m-0">Results</h3>
        <Button
          icon="pi pi-refresh"
          label="Refresh"
          onClick={() => expId > 0 && loadData(expId)}
          loading={loading}
        />
      </div>

      <DataTable
        value={results}
        loading={loading}
        paginator
        rows={10}
        rowsPerPageOptions={[10, 25, 50]}
        stripedRows
        showGridlines
        emptyMessage="No results available!"
      >
        <Column
          field="metricName"
          header="Name"
          style={{ width: "20%" }}
          sortable
        />
        <Column
          field="isPrimary"
          header="Primary"
          body={isPrimaryBody}
          style={{ width: "20%" }}
          sortable
        />
        <Column
          field="variationName"
          header="Variation"
          style={{ width: "20%" }}
          sortable
        />
        <Column
          field="triggeredOnQA"
          header="Triggered on QA"
          style={{ width: "20%" }}
          sortable
        />
        <Column
          field="triggeredOnLIVE"
          header="Triggered on LIVE"
          style={{ width: "20%" }}
          sortable
        />
      </DataTable>
    </div>
  );
}
