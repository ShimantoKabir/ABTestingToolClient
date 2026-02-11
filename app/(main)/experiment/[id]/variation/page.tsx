"use client";
import React, { useEffect, useRef, useState, use } from "react";
import { container } from "@/app/di";
import {
  VariationService,
  VariationServiceToken,
} from "./services/variation.service";
import {
  VariationResponseDto,
  VariationCreateRequestDto,
  VariationUpdateRequestDto,
} from "./dtos/variation.dto";
import { ErrorResponseDto } from "@/app/network/error-response.dto";

import { Splitter, SplitterPanel } from "primereact/splitter";
import { Button } from "primereact/button";
import { InputTextarea } from "primereact/inputtextarea";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { Panel } from "primereact/panel";
import { ConfirmPopup, confirmPopup } from "primereact/confirmpopup";

import "./variation.scss";

interface Props {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function VariationsPage(props: Props) {
  const params = use(props.params);
  const expId = parseInt(params.id);
  const service = container.get<VariationService>(VariationServiceToken);
  const toast = useRef<Toast>(null);

  const [variations, setVariations] = useState<VariationResponseDto[]>([]);
  const [selectedVar, setSelectedVar] = useState<VariationResponseDto | null>(
    null,
  );

  // Editor State
  const [jsCode, setJsCode] = useState("");
  const [cssCode, setCssCode] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Layout State
  const [showEditors, setShowEditors] = useState(true);

  // Full Screen State
  const [expandedEditor, setExpandedEditor] = useState<"js" | "css" | null>(
    null,
  );

  // New Variation Dialog
  const [showDialog, setShowDialog] = useState(false);
  const [newVarTitle, setNewVarTitle] = useState("");

  useEffect(() => {
    loadVariations();
  }, [expId]);

  const loadVariations = async () => {
    const res = await service.getVariations(expId);
    if (!(res instanceof ErrorResponseDto)) {
      setVariations(res);
      if (res.length > 0 && !selectedVar) {
        selectVariation(res[0]);
      }
    }
  };

  const selectVariation = (v: VariationResponseDto) => {
    setSelectedVar(v);
    setJsCode(v.js || "");
    setCssCode(v.css || "");
  };

  const openCreateDialog = () => {
    const nextNum = variations.length;
    setNewVarTitle(`Variation #${nextNum}`);
    setShowDialog(true);
  };

  const handleCreate = async () => {
    const req = new VariationCreateRequestDto();
    req.title = newVarTitle;

    const res = await service.createVariation(expId, req);
    if (res instanceof ErrorResponseDto) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: res.message,
      });
    } else {
      toast.current?.show({
        severity: "success",
        summary: "Created",
        detail: "Variation added",
      });
      setShowDialog(false);
      loadVariations();
    }
  };

  const handleDelete = async (event: React.MouseEvent, id: number) => {
    event.stopPropagation();
    confirmPopup({
      target: event.currentTarget as HTMLElement,
      message: "Do you want to delete this variation?",
      icon: "pi pi-info-circle",
      acceptClassName: "p-button-danger",
      accept: async () => {
        const res = await service.deleteVariation(id);
        if (res instanceof ErrorResponseDto) {
          toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: res.message,
          });
        } else {
          toast.current?.show({
            severity: "success",
            summary: "Deleted",
            detail: "Variation removed",
          });
          if (selectedVar?.id === id) {
            const remaining = variations.filter((v) => v.id !== id);
            if (remaining.length > 0) selectVariation(remaining[0]);
            else setSelectedVar(null);
          }
          setVariations((prev) => prev.filter((v) => v.id !== id));
        }
      },
    });
  };

  const handleSaveCode = async () => {
    if (!selectedVar) return;
    setIsSaving(true);

    const req = new VariationUpdateRequestDto();
    req.js = jsCode;
    req.css = cssCode;

    const res = await service.updateVariation(selectedVar.id, req);
    if (res instanceof ErrorResponseDto) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: res.message,
      });
    } else {
      toast.current?.show({
        severity: "success",
        summary: "Saved",
        detail: "Code updated",
      });
      setVariations((prev) => prev.map((v) => (v.id === res.id ? res : v)));
      setSelectedVar(res);
    }
    setIsSaving(false);
  };

  // HEADER RENDER: Title Left <----> Icon Right
  const renderHeader = (title: string, type: "js" | "css") => (
    <div className="flex justify-content-between align-items-center w-full px-1">
      <span className="font-bold text-lg w-full">{title}</span>
      <Button
        icon={`pi ${
          expandedEditor === type ? "pi-window-minimize" : "pi-window-maximize"
        }`}
        rounded
        text
        severity="secondary"
        aria-label={expandedEditor === type ? "Unexpand" : "Expand"}
        onClick={() => setExpandedEditor(expandedEditor === type ? null : type)}
        tooltip={expandedEditor === type ? "Exit Full Screen" : "Full Screen"}
        tooltipOptions={{ position: "left" }}
      />
    </div>
  );

  return (
    <div className="variations-page h-full flex flex-column">
      <Toast ref={toast} />
      <ConfirmPopup />

      <Splitter
        style={{ height: "100%" }}
        className="border-none bg-transparent"
      >
        {/* SIDEBAR */}
        <SplitterPanel
          size={20}
          minSize={15}
          className="surface-card border-round shadow-1 mr-2 flex flex-column overflow-hidden"
        >
          <div className="p-3 surface-border border-bottom-1 flex justify-content-between align-items-center">
            <span className="font-bold">Variations</span>
            <Button
              icon="pi pi-plus"
              rounded
              text
              size="large"
              onClick={openCreateDialog}
            />
          </div>
          <div className="flex-1 overflow-auto p-2 variation-list">
            <ul className="list-none p-0 m-0">
              {variations.map((v) => (
                <li
                  key={v.id}
                  className={`variation-item ${
                    selectedVar?.id === v.id ? "active" : ""
                  }`}
                  onClick={() => selectVariation(v)}
                >
                  <div className="flex align-items-center justify-content-between w-full">
                    <div>
                      <div className="font-bold">{v.title}</div>
                      <small>ID: {v.id}</small>
                    </div>
                    {!v.isControl && (
                      <Button
                        icon="pi pi-trash"
                        rounded
                        text
                        severity="contrast"
                        size="large"
                        onClick={(e) => handleDelete(e, v.id)}
                        aria-label="Delete"
                      />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </SplitterPanel>

        {/* MAIN EDITORS */}
        <SplitterPanel
          size={80}
          className="flex flex-column gap-3 pl-2 relative"
        >
          {/* Top Bar */}
          <div className="flex justify-content-between align-items-center surface-card p-2 border-round shadow-1">
            <div>
              <Button
                icon={showEditors ? "pi pi-angle-down" : "pi pi-angle-up"}
                label={showEditors ? "Hide Editors" : "Show Editors"}
                text
                onClick={() => setShowEditors(!showEditors)}
              />
            </div>
            <div className="font-bold text-lg">{selectedVar?.title}</div>
            <Button
              label="Save Changes"
              icon="pi pi-save"
              loading={isSaving}
              onClick={handleSaveCode}
            />
          </div>

          {/* Editors Area */}
          {showEditors && (
            <div
              className="grid h-full flex-grow-1 overflow-hidden pb-1"
              style={{ minHeight: "300px" }}
            >
              {/* JS Editor Panel */}
              <div
                className={`col-6 h-full flex flex-column transition-all transition-duration-300 ${
                  expandedEditor === "js"
                    ? "fixed top-0 left-0 w-screen h-screen z-5 p-0"
                    : ""
                } ${expandedEditor === "css" ? "hidden" : ""}`}
              >
                <Panel
                  header={renderHeader("JavaScript", "js")}
                  className="h-full shadow-1 flex flex-column"
                  pt={{
                    title: { className: "w-full" },
                    header: { className: "p-1 w-full" },
                    content: { className: "h-full p-1" },
                    toggleableContent: { className: "h-full" },
                  }}
                >
                  <InputTextarea
                    value={jsCode}
                    onChange={(e) => setJsCode(e.target.value)}
                    className="w-full h-full border-none font-monospace p-3"
                    placeholder="// Custom JS here..."
                  />
                </Panel>
              </div>

              {/* CSS Editor Panel */}
              <div
                className={`col-6 h-full flex flex-column transition-all transition-duration-300 ${
                  expandedEditor === "css"
                    ? "fixed top-0 left-0 w-screen h-screen z-5 p-0"
                    : ""
                } ${expandedEditor === "js" ? "hidden" : ""}`}
              >
                <Panel
                  header={renderHeader("CSS", "css")}
                  className="h-full shadow-1 flex flex-column"
                  pt={{
                    title: { className: "w-full" },
                    header: { className: "p-1 w-full" },
                    content: { className: "h-full p-1" },
                    toggleableContent: { className: "h-full" },
                  }}
                >
                  <InputTextarea
                    value={cssCode}
                    onChange={(e) => setCssCode(e.target.value)}
                    className="w-full h-full border-none font-monospace p-3"
                    placeholder="/* Custom CSS here */"
                  />
                </Panel>
              </div>
            </div>
          )}

          {!expandedEditor && (
            <div className="flex-1 surface-card border-round shadow-1 p-3 flex align-items-center justify-content-center bg-gray-100">
              <div className="text-500">
                <i className="pi pi-desktop text-3xl mb-2 block text-center"></i>
                Preview Mode [Not Implemented!]
              </div>
            </div>
          )}
        </SplitterPanel>
      </Splitter>

      <Dialog
        header="New Variation"
        visible={showDialog}
        style={{ width: "400px" }}
        onHide={() => setShowDialog(false)}
      >
        <div className="pt-4">
          <div className="flex flex-column gap-2">
            <label htmlFor="vtitle" className="font-bold">
              Variation Name
            </label>
            <InputText
              id="vtitle"
              value={newVarTitle}
              onChange={(e) => setNewVarTitle(e.target.value)}
              className="w-full"
              autoFocus
            />
          </div>
          <div className="mt-4 flex justify-content-end">
            <Button label="Create" icon="pi pi-check" onClick={handleCreate} />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
