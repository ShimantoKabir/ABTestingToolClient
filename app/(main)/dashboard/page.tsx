"use client";
import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { container } from "@/app/di";
import {
  ActivityLogService,
  ActivityLogServiceToken,
} from "./services/activity-log.service";
import {
  DashboardSummaryService,
  DashboardSummaryServiceToken,
} from "./services/dashboard-summary.service";
import { ActivityLogResponseDto } from "./dtos/activity-log.dto";
import { DashboardSummaryDto } from "./dtos/dashboard-summary.dto";
import { ErrorResponseDto } from "@/app/network/error-response.dto";

export default function Dashboard() {
  const activityLogService = container.get<ActivityLogService>(
    ActivityLogServiceToken,
  );
  const dashboardSummaryService = container.get<DashboardSummaryService>(
    DashboardSummaryServiceToken,
  );

  const [summary, setSummary] = useState<DashboardSummaryDto | null>(null);

  const [activityLogs, setActivityLogs] = useState<ActivityLogResponseDto[]>(
    [],
  );
  const [activityTotal, setActivityTotal] = useState<number>(0);
  const [activityLoading, setActivityLoading] = useState<boolean>(false);
  const [lazyParams, setLazyParams] = useState({ page: 1, rows: 5, first: 0 });

  const toast = useRef<Toast>(null);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    const result = await dashboardSummaryService.getDashboardSummary();
    if (result instanceof ErrorResponseDto) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: result.message,
      });
    } else {
      setSummary(result);
    }
  };

  useEffect(() => {
    loadActivityLogs();
  }, [lazyParams.page, lazyParams.rows]);

  const loadActivityLogs = async () => {
    setActivityLoading(true);
    const result = await activityLogService.getActivityLogs(
      lazyParams.page,
      lazyParams.rows,
    );
    if (result instanceof ErrorResponseDto) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: result.message,
      });
    } else {
      setActivityLogs(result.items);
      setActivityTotal(result.total);
    }
    setActivityLoading(false);
  };

  const onPageChange = (e: any) => {
    setLazyParams({
      first: e.first,
      rows: e.rows,
      page: (e.page || 0) + 1,
    });
  };

  const formatDate = (row: ActivityLogResponseDto) => {
    if (!row.createdAt) return "-";
    return new Date(row.createdAt).toLocaleString();
  };

  return (
    <div className="w-full p-3 overflow-x-hidden">
      <Toast ref={toast} />
      <div className="grid p-fluid">
        {/* ----------------- TOP STATS CARDS ----------------- */}
        <div className="col-12 md:col-6 lg:col-3 border-round-lg">
          <div className="surface-card shadow-2 p-3 border-1 border-50 border-round-lg h-full">
            <div className="flex justify-content-between mb-3">
              <div>
                <span className="block text-500 font-medium mb-3">
                  Active Experiments
                </span>
                <div className="text-900 font-medium text-xl">
                  {summary?.activeExperiments ?? 0}
                </div>
              </div>
              <div
                className="flex align-items-center justify-content-center bg-blue-100 border-round-lg"
                style={{ width: "2.5rem", height: "2.5rem" }}
              >
                <i className="pi pi-chart-line text-blue-500 text-xl" />
              </div>
            </div>
            <span className="text-green-500 font-medium">
              {summary?.activeExperimentsSinceLastWeek ?? 0}
            </span>
            <span className="text-500"> since last week</span>
          </div>
        </div>

        <div className="col-12 md:col-6 lg:col-3">
          <div className="surface-card shadow-2 p-3 border-1 border-50 border-round-lg h-full">
            <div className="flex justify-content-between mb-3">
              <div>
                <span className="block text-500 font-medium mb-3">
                  Total Users
                </span>
                <div className="text-900 font-medium text-xl">
                  {summary?.totalUsers ?? 0}
                </div>
              </div>
              <div
                className="flex align-items-center justify-content-center bg-orange-100 border-round-lg"
                style={{ width: "2.5rem", height: "2.5rem" }}
              >
                <i className="pi pi-users text-orange-500 text-xl" />
              </div>
            </div>
            <span className="text-green-500 font-medium">
              {summary?.userGrowthPercent?.toFixed(1) ?? "0.0"}%
            </span>
            <span className="text-500"> increase</span>
          </div>
        </div>

        <div className="col-12 md:col-6 lg:col-3">
          <div className="surface-card shadow-2 p-3 border-1 border-50 border-round-lg h-full">
            <div className="flex justify-content-between mb-3">
              <div>
                <span className="block text-500 font-medium mb-3">
                  Conversion Rate
                </span>
                <div className="text-900 font-medium text-xl">
                  {summary?.conversionRate?.toFixed(1) ?? "0.0"}%
                </div>
              </div>
              <div
                className="flex align-items-center justify-content-center bg-cyan-100 border-round-lg"
                style={{ width: "2.5rem", height: "2.5rem" }}
              >
                <i className="pi pi-percentage text-cyan-500 text-xl" />
              </div>
            </div>
            <span className="text-green-500 font-medium">
              {summary?.conversionUpliftToday?.toFixed(1) ?? "0.0"}%
            </span>
            <span className="text-500"> uplift today</span>
          </div>
        </div>

        <div className="col-12 md:col-6 lg:col-3">
          <div className="surface-card shadow-2 p-3 border-1 border-50 border-round-lg h-full">
            <div className="flex justify-content-between mb-3">
              <div>
                <span className="block text-500 font-medium mb-3">
                  Pending Drafts
                </span>
                <div className="text-900 font-medium text-xl">
                  {summary?.pendingDrafts ?? 0}
                </div>
              </div>
              <div
                className="flex align-items-center justify-content-center bg-purple-100 border-round-lg"
                style={{ width: "2.5rem", height: "2.5rem" }}
              >
                <i className="pi pi-file-edit text-purple-500 text-xl" />
              </div>
            </div>
            <span className="text-500">Waiting for approval</span>
          </div>
        </div>

        {/* ----------------- ACTIVITY LOG ----------------- */}
        <div className="col-12">
          <div className="surface-card shadow-2 border-round-lg p-4">
            <h5 className="mb-4">Activity Log</h5>
            <DataTable
              value={activityLogs}
              loading={activityLoading}
              paginator
              lazy
              rows={lazyParams.rows}
              first={lazyParams.first}
              totalRecords={activityTotal}
              onPage={onPageChange}
              rowsPerPageOptions={[5, 10, 25, 50]}
              emptyMessage="No activity logs found."
            >
              <Column header="Date" body={formatDate} />
              <Column field="userEmail" header="User" />
              <Column field="action" header="Action" />
              <Column field="entityType" header="Entity Type" />
              <Column field="description" header="Description" />
            </DataTable>
          </div>
        </div>
      </div>
    </div>
  );
}
