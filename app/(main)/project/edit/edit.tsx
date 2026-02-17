"use client";
import React, { useState } from "react";
import { ProjectResponseDto } from "../dtos/project.dto";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { classNames } from "primereact/utils";

interface EditProjectProps {
  visible: boolean;
  onHide: () => void;
  onUpdate: (id: number, name: string, description: string) => Promise<void>;
  project: ProjectResponseDto | null;
}

export default function EditProject({
  visible,
  onHide,
  onUpdate,
  project,
}: EditProjectProps) {
  const [projectName, setProjectName] = useState<string>("");
  const [projectDescription, setProjectDescription] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false);

  React.useEffect(() => {
    if (project) {
      setProjectName(project.name);
      setProjectDescription(project.description || "");
      setSubmitted(false);
    }
  }, [project]);

  const handleSubmit = async () => {
    setSubmitted(true);

    if (projectName.trim() && project) {
      await onUpdate(project.id, projectName, projectDescription);
      setProjectName("");
      setProjectDescription("");
      setSubmitted(false);
      onHide();
    }
  };

  const handleHide = () => {
    setProjectName("");
    setProjectDescription("");
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
      header="Edit Project"
      modal
      draggable={false}
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
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          required
          autoFocus
          className={classNames({ "p-invalid": submitted && !projectName })}
        />
        {submitted && !projectName && (
          <small className="p-error">Name is required.</small>
        )}
      </div>
      
      <div className="field">
        <label htmlFor="editDescription" className="font-bold">
          Description
        </label>
        <InputTextarea
          id="editDescription"
          value={projectDescription}
          onChange={(e) => setProjectDescription(e.target.value)}
          rows={3}
          autoResize
        />
      </div>
    </Dialog>
  );
}