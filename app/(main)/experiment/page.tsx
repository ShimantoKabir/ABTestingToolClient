"use client";
import React from "react";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { useExperiments } from "./hooks/useExperiments";
import { ExperimentTable } from "./components/ExperimentTable";
import { CreateExperimentDialog } from "./components/CreateExperimentDialog";

export default function ExperimentList() {
  const {
    experiments,
    loading,
    totalRecords,
    lazyParams,
    showDialog,
    newExpTitle,
    newExpDesc,
    newExpUrl,
    toast,
    setLazyParams,
    setShowDialog,
    setNewExpTitle,
    setNewExpDesc,
    setNewExpUrl,
    enterExperiment,
    handleCreate,
  } = useExperiments();

  const handlePageChange = (e: any) => {
    setLazyParams({
      first: e.first,
      rows: e.rows,
      page: (e.page || 0) + 1,
    });
  };

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

          <ExperimentTable
            experiments={experiments}
            loading={loading}
            totalRecords={totalRecords}
            lazyParams={lazyParams}
            onPageChange={handlePageChange}
            onEnterExperiment={enterExperiment}
          />
        </div>
      </div>

      <CreateExperimentDialog
        visible={showDialog}
        onHide={() => setShowDialog(false)}
        title={newExpTitle}
        description={newExpDesc}
        url={newExpUrl}
        onTitleChange={setNewExpTitle}
        onDescriptionChange={setNewExpDesc}
        onUrlChange={setNewExpUrl}
        onCreate={handleCreate}
      />
    </div>
  );
}
