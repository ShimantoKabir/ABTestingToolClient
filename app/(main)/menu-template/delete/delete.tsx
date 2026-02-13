"use client";
import React from "react";
import { MenuTemplateResponseDto } from "../dtos/menu-template.dto";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";

interface DeleteMenuTemplateProps {
  visible: boolean;
  onHide: () => void;
  onDelete: (id: number) => Promise<void>;
  menuTemplate: MenuTemplateResponseDto | null;
}

export default function DeleteMenuTemplate({
  visible,
  onHide,
  onDelete,
  menuTemplate,
}: DeleteMenuTemplateProps) {
  const handleConfirm = async () => {
    if (menuTemplate) {
      await onDelete(menuTemplate.id);
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
        {menuTemplate && (
          <span>
            Are you sure you want to delete <b>{menuTemplate.name}</b>?
          </span>
        )}
      </div>
    </Dialog>
  );
}