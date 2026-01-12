"use client";
import React, { useEffect, useRef, useState } from "react";
import { container } from "@/app/di";

import { ErrorResponseDto } from "@/app/network/error-response.dto";

// PrimeReact
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Skeleton } from "primereact/skeleton";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { Card } from "primereact/card";

import "./results.scss";
import {
  ResultsResponseDto,
  ResultsStatsDto,
  VariationStatsDto,
} from "./dtos/results.dto";
import {
  ResultsService,
  ResultsServiceToken,
} from "./services/results.service";
import {
  ExperimentService,
  ExperimentServiceToken,
} from "../../services/experiment.service";

interface ResultsPageProps {
  params: Promise<{ id: string }>;
}

export default function ResultsPage({ params }: ResultsPageProps) {
  const [expId, setExpId] = useState<number>(0);
  const resultsService = container.get<ResultsService>(ResultsServiceToken);
  const experimentService = container.get<ExperimentService>(
    ExperimentServiceToken
  );
  const toast = useRef<Toast>(null);

  // Data State
  const [results, setResults] = useState<ResultsResponseDto[]>([]);
  const [stats, setStats] = useState<ResultsStatsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [experimentName, setExperimentName] = useState("");

  useEffect(() => {
    const initParams = async () => {
      const resolvedParams = await params;
      const id = parseInt(resolvedParams.id);
      setExpId(id);
      loadData(id);
    };
    initParams();
  }, [params]);

  const loadData = async (experimentId: number) => {
    setLoading(true);

    try {
      // 1. Fetch Experiment Details
      const expRes = await experimentService.getExperimentById(experimentId);
      if (!(expRes instanceof ErrorResponseDto)) {
        setExperimentName(expRes.title || "");
      }
      
      // 2. Fetch Results Data
      const resultsRes = await resultsService.getResults(experimentId);
      if (!(resultsRes instanceof ErrorResponseDto)) {
        setResults(resultsRes);
      }
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load results data",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && results.length === 0 && !stats)
    return (
      <div className="p-4">
        <Skeleton height="400px" />
      </div>
    );

  return (
    <div className="results-page h-full flex flex-column">
      <Toast ref={toast} />

      <div className="header-bar">
        <h2 className="m-0 text-900 font-bold">Results</h2>
        {experimentName && (
          <span className="text-500">{experimentName}</span>
        )}
      </div>

      <div className="flex-1 flex flex-column gap-4">
        {/* Results Table */}
        <Card>
          <div className="flex justify-content-between align-items-center mb-4">
            <h3 className="m-0">Individual Results</h3>
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
            responsiveLayout="scroll"
            emptyMessage="No results available"
          >
            <Column
              field="id"
              header="ID"
              style={{ width: "5%" }}
              sortable
            />
          </DataTable>
        </Card>
      </div>
    </div>
  );
}
