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
import { Tag } from "primereact/tag";
import { Calendar } from "primereact/calendar";
import { Divider } from "primereact/divider";
import {
  ResultDetailDto,
  ResultDetailRequestDto,
  ResultsResponseDto,
} from "./dtos/results.dto";
import {
  ResultsService,
  ResultsServiceToken,
} from "./services/results.service";

interface Props {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function ResultsPage(props: Props) {
  const resultsService = container.get<ResultsService>(ResultsServiceToken);
  const toast = useRef<Toast>(null);

  const params = use(props.params);
  const propExpId = parseInt(params.id);

  const [expId, setExpId] = useState<number>(0);
  const [results, setResults] = useState<ResultsResponseDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Details section
  const [showDetails, setShowDetails] = useState(false);
  const [details, setDetails] = useState<ResultDetailDto[]>([]);
  const [detailsTotal, setDetailsTotal] = useState(0);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [detailsLazyParams, setDetailsLazyParams] = useState({
    page: 1,
    rows: 5,
    first: 0,
  });

  useEffect(() => {
    setExpId(propExpId);
    loadData(propExpId);
  }, [propExpId]);

  const loadData = async (experimentId: number) => {
    setLoading(true);
    try {
      const resultsRes = await resultsService.getResults(experimentId);
      if (!(resultsRes instanceof ErrorResponseDto)) {
        setResults(resultsRes);
      }
    } catch {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load results data!",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadDetails = async (
    page = detailsLazyParams.page,
    rows = detailsLazyParams.rows,
  ) => {
    setDetailsLoading(true);
    const request = new ResultDetailRequestDto();
    request.page = page;
    request.rows = rows;
    request.fromDate = fromDate ? fromDate.toISOString() : null;
    request.toDate = toDate ? toDate.toISOString() : null;

    const res = await resultsService.getResultDetails(expId, request);
    if (res instanceof ErrorResponseDto) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: res.message,
      });
    } else {
      setDetails(res.items);
      setDetailsTotal(res.total);
    }
    setDetailsLoading(false);
  };

  const onShowDetails = () => {
    setShowDetails(true);
    loadDetails();
  };

  const onDetailsPageChange = (e: any) => {
    const newParams = {
      first: e.first,
      rows: e.rows,
      page: (e.page || 0) + 1,
    };
    setDetailsLazyParams(newParams);
    loadDetails(newParams.page, newParams.rows);
  };

  const onFilterApply = () => {
    const reset = { page: 1, rows: detailsLazyParams.rows, first: 0 };
    setDetailsLazyParams(reset);
    loadDetails(reset.page, reset.rows);
  };

  const isPrimaryBody = (result: ResultsResponseDto) => (
    <Tag
      severity={result.isPrimary ? "success" : "info"}
      value={result.isPrimary ? "YES" : "NO"}
    />
  );

  const formatDate = (row: ResultDetailDto) => {
    if (!row.createdAt) return "-";
    return new Date(row.createdAt).toLocaleString();
  };

  if (loading && results.length === 0)
    return (
      <div className="p-4">
        <Skeleton height="400px" />
      </div>
    );

  return (
    <div className="results-page card shadow-2 p-4 surface-card border-round">
      <Toast ref={toast} />

      {/* Summary Results */}
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

      {/* Details Section */}
      <div className="mt-5">
        <Divider layout="horizontal">
          {showDetails ? (
            <b>Result Details</b>
          ) : (
            <Button
              label="Show Details"
              icon="pi pi-table"
              text
              onClick={onShowDetails}
            />
          )}
        </Divider>

        {showDetails && (
          <>
            {/* Date Filters */}
            <div className="flex align-items-end gap-3 mb-3 flex-wrap">
              <div className="flex flex-column gap-1">
                <label className="font-medium text-sm">From Date</label>
                <Calendar
                  value={fromDate}
                  onChange={(e) => setFromDate(e.value as Date | null)}
                  showTime
                  showIcon
                  placeholder="From date"
                />
              </div>
              <div className="flex flex-column gap-1">
                <label className="font-medium text-sm">To Date</label>
                <Calendar
                  value={toDate}
                  onChange={(e) => setToDate(e.value as Date | null)}
                  showTime
                  showIcon
                  placeholder="To date"
                />
              </div>
              <Button
                label="Apply"
                icon="pi pi-filter"
                onClick={onFilterApply}
              />
              <Button
                label="Clear"
                icon="pi pi-times"
                severity="secondary"
                onClick={() => {
                  setFromDate(null);
                  setToDate(null);
                  const reset = {
                    page: 1,
                    rows: detailsLazyParams.rows,
                    first: 0,
                  };
                  setDetailsLazyParams(reset);
                  loadDetails(reset.page, reset.rows);
                }}
              />
            </div>

            <DataTable
              value={details}
              loading={detailsLoading}
              paginator
              lazy
              rows={detailsLazyParams.rows}
              first={detailsLazyParams.first}
              totalRecords={detailsTotal}
              onPage={onDetailsPageChange}
              rowsPerPageOptions={[5, 10, 25, 50]}
              stripedRows
              showGridlines
              emptyMessage="No detail records found."
            >
              <Column header="Date" body={formatDate} />
              <Column field="metricName" header="Metric" />
              <Column field="variationName" header="Variation" />
              <Column field="visitorId" header="VID" />
              <Column field="mode" header="Mode" />
              <Column field="revenue" header="Revenue" />
              <Column field="device" header="Device" />
              <Column field="browser" header="Browser" />
              <Column field="urlPathname" header="Path" />
              <Column field="sessionId" header="SID" />
            </DataTable>
          </>
        )}
      </div>
    </div>
  );
}
