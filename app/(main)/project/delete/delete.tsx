"use client";
import React from "react";
import { ProjectResponseDto } from "../dtos/project.dto";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";

interface DeleteProjectProps {
  visible: boolean;
  onHide: () => void;
  onDelete: (id: number) => Promise<void>;
  project: ProjectResponseDto | null;
}

export default function DeleteProject({
  visible,
  onHide,
  onDelete,
  project,
}: DeleteProjectProps) {
  const handleConfirm = async () => {
    if (project) {
      await onDelete(project.id);
      onHide();
    }
  };

  const dialogFooter = (
    <React.Fragment>
      <Button
        label="No"
        icon="pi pi-times"
        outlined
        onClick={onHide}
      />
      <Button
        label="Yes"
        icon="pi pi-check"
        severity="danger"
        onClick={handleConfirm}
      />
    </React.Fragment>
  );

  return (
    <Dialog
      visible={visible}
      style={{ width: "32rem" }}
      breakpoints={{ "960px": "75vw", "641px": "90vw" }}
      header="Confirm"
      modal
      draggable={false}
      footer={dialogFooter}
      onHide={onHide}
    >
      <div className="confirmation-content flex items-center">
        <i
          className="pi pi-exclamation-triangle mr-3"
          style={{ fontSize: "2rem" }}
        />
        {project && (
          <span>
            Are you sure you want to delete <b>{project.name}</b>?
          </span>
        )}
      </div>
    </Dialog>
  );
}