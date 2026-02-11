"use client";
import React, { useState } from "react";
import { RoleResponseDto } from "../dtos/role-response.dto";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { classNames } from "primereact/utils";

interface EditRoleProps {
  visible: boolean;
  onHide: () => void;
  onUpdate: (id: number, name: string) => Promise<void>;
  role: RoleResponseDto | null;
}

export default function EditRole({
  visible,
  onHide,
  onUpdate,
  role,
}: EditRoleProps) {
  const [roleName, setRoleName] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false);

  React.useEffect(() => {
    if (role) {
      setRoleName(role.name);
      setSubmitted(false);
    }
  }, [role]);

  const handleSubmit = async () => {
    setSubmitted(true);

    if (roleName.trim() && role) {
      await onUpdate(role.id, roleName);
      setRoleName("");
      setSubmitted(false);
      onHide();
    }
  };

  const handleHide = () => {
    setRoleName("");
    setSubmitted(false);
    onHide();
  };

  const dialogFooter = (
    <React.Fragment>
      <Button
        label="Cancel"
        icon="pi pi-times"
        outlined
        onClick={handleHide}
      />
      <Button
        label="Update"
        icon="pi pi-check"
        onClick={handleSubmit}
      />
    </React.Fragment>
  );

  return (
    <Dialog
      visible={visible}
      style={{ width: "32rem" }}
      breakpoints={{ "960px": "75vw", "641px": "90vw" }}
      header="Edit Role"
      modal
      className="p-fluid"
      footer={dialogFooter}
      onHide={handleHide}
    >
      <div className="field">
        <label htmlFor="editName" className="font-bold">
          Name
        </label>
        <InputText
          id="editName"
          value={roleName}
          onChange={(e) => setRoleName(e.target.value)}
          required
          autoFocus
          className={classNames({ "p-invalid": submitted && !roleName })}
        />
        {submitted && !roleName && (
          <small className="p-error">Name is required.</small>
        )}
      </div>
    </Dialog>
  );
}