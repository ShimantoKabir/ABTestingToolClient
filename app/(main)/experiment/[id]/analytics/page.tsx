"use client";
import React, { useEffect, useState, use, useRef } from "react";
import { container } from "@/app/di";
import {
  AnalyticsService,
  AnalyticsServiceToken,
} from "./services/analytics.service";
import { AnalyticsResponseDto } from "./dtos/analytics.dto";
import { ErrorResponseDto } from "@/app/network/error-response.dto";

// PrimeReact
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Card } from "primereact/card";
import { Toast } from "primereact/toast";
import { Skeleton } from "primereact/skeleton";
import { Tag } from "primereact/tag";
import { Tooltip } from "primereact/tooltip";

export default function AnalyticsPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = use(props.params);
  const expId = parseInt(params.id);
  const service = container.get<AnalyticsService>(AnalyticsServiceToken);
  const toast = useRef<Toast>(null);

  const [analytics, setAnalytics] = useState<AnalyticsResponseDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [expId]);

  const loadAnalytics = async () => {
    setLoading(true);
    const res = await service.getFullStatsAnalytics(expId);
    if (res instanceof ErrorResponseDto) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: res.message,
      });
    } else {
      setAnalytics(res);
    }
    setLoading(false);
  };

  const percentageBody = (val: number | null) => {
    if (val === null || val === undefined) return "N/A";
    return `${(val * 100).toFixed(2)}%`;
  };

  const liftBody = (rowData: any) => {
    if (rowData.isControl)
      return <span className="text-500 italic">Baseline</span>;
    if (rowData.lift === null) return "N/A";
    const color = rowData.lift > 0 ? "text-green-500" : "text-red-500";
    return (
      <span className={`font-bold ${color}`}>
        {rowData.lift > 0 ? "+" : ""}
        {(rowData.lift * 100).toFixed(2)}%
      </span>
    );
  };

  const significanceBody = (rowData: any) => {
    if (rowData.isControl) return null;
    return (
      <Tag
        severity={rowData.isSignificant ? "success" : "secondary"}
        value={rowData.isSignificant ? "Significant" : "Inconclusive"}
        icon={
          rowData.isSignificant ? "pi pi-check-circle" : "pi pi-info-circle"
        }
      />
    );
  };

  if (loading && analytics.length === 0) {
    return (
      <div className="flex flex-column gap-4 p-4">
        <Skeleton height="300px" />
        <Skeleton height="300px" />
      </div>
    );
  }

  return (
    <div className="analytics-page shadow-2 p-4 surface-card border-round h-full">
      <Toast ref={toast} />
      <Tooltip target=".stat-help" />

      <div className="flex justify-content-center align-items-center mb-4">
        <h2 className="m-0">Experiment Stats</h2>
      </div>

      {analytics.map((metricGroup, idx) => (
        <Card
          key={idx}
          title={metricGroup.targetMetricTitle}
          subTitle={`Detailed performance breakdown`}
          className="shadow-2 border-round surface-card mt-5"
        >
          <DataTable
            value={metricGroup.stats}
            responsiveLayout="scroll"
            stripedRows
            className="p-datatable-sm"
            rowClassName={(data) =>
              data.isControl ? "surface-ground font-medium" : ""
            }
          >
            <Column
              field="variationTitle"
              header="Variation"
              style={{ width: "20%" }}
              body={(rowData) => (
                <div className="flex align-items-center gap-2">
                  {rowData.variationTitle}
                  {rowData.isControl && <Tag value="Control" severity="info" />}
                </div>
              )}
            />
            <Column field="sampleSize" header="Visitors" />
            <Column field="conversions" header="Conversions" />
            <Column
              field="conversionRate"
              header="Conversion Rate"
              body={(rowData) => percentageBody(rowData.conversionRate)}
            />
            <Column
              header={() => (
                <span>
                  Lift{" "}
                  <i
                    className="pi pi-question-circle stat-help text-xs"
                    data-pr-tooltip="Difference from Control"
                  />
                </span>
              )}
              body={liftBody}
            />
            <Column
              header={() => (
                <span>
                  Winner Prob.{" "}
                  <i
                    className="pi pi-question-circle stat-help text-xs"
                    data-pr-tooltip="Probability of beating Control"
                  />
                </span>
              )}
              body={(rowData) =>
                rowData.isControl ? "-" : percentageBody(rowData.probWinning)
              }
            />
            <Column
              header="Status"
              body={significanceBody}
              style={{ width: "15%" }}
            />
          </DataTable>
        </Card>
      ))}

      {analytics.length === 0 && !loading && (
        <div className="text-center p-8 surface-card border-round shadow-1">
          <i className="pi pi-chart-bar text-4xl text-300 mb-3"></i>
          <p className="text-500 m-0">
            No metrics linked or data collected yet.
          </p>
        </div>
      )}
    </div>
  );
}
