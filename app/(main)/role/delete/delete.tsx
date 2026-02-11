"use client";
import React from "react";
import { RoleResponseDto } from "../dtos/role-response.dto";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";

interface DeleteRoleProps {
  visible: boolean;
  onHide: () => void;
  onDelete: (id: number) => Promise<void>;
  role: RoleResponseDto | null;
}

export default function DeleteRole({
  visible,
  onHide,
  onDelete,
  role,
}: DeleteRoleProps) {
  const handleConfirm = async () => {
    if (role) {
      await onDelete(role.id);
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
        {role && (
          <span>
            Are you sure you want to delete <b>{role.name}</b>?
          </span>
        )}
      </div>
    </Dialog>
  );
}