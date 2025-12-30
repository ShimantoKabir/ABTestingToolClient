"use client";
import "./variation.scss";
import React, { useEffect, useRef, useState } from "react";
import { container } from "@/app/di";
// UPDATED IMPORTS
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

export default function VariationsPage({ params }: { params: { id: string } }) {
  const expId = parseInt(params.id);
  const service = container.get<VariationService>(VariationServiceToken);
  const toast = useRef<Toast>(null);

  const [variations, setVariations] = useState<VariationResponseDto[]>([]);
  const [selectedVar, setSelectedVar] = useState<VariationResponseDto | null>(
    null
  );

  const [jsCode, setJsCode] = useState("");
  const [cssCode, setCssCode] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showEditors, setShowEditors] = useState(true);
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

  return (
    <div className="h-full flex flex-column">
      <Toast ref={toast} />

      <Splitter
        style={{ height: "100%" }}
        className="border-none bg-transparent"
      >
        <SplitterPanel
          size={20}
          minSize={15}
          className="surface-card border-round shadow-1 mr-2 flex flex-column overflow-hidden"
        >
          <div className="p-3 border-bottom-1 surface-border flex justify-content-between align-items-center">
            <span className="font-bold">Variations</span>
            <Button
              icon="pi pi-plus"
              rounded
              text
              size="small"
              onClick={() => setShowDialog(true)}
            />
          </div>
          <div className="flex-1 overflow-auto p-2">
            <ul className="list-none p-0 m-0">
              {variations.map((v) => (
                <li
                  key={v.id}
                  className={`p-3 mb-2 border-round cursor-pointer transition-colors transition-duration-200 ${
                    selectedVar?.id === v.id
                      ? "bg-primary text-white"
                      : "hover:surface-hover surface-ground"
                  }`}
                  onClick={() => selectVariation(v)}
                >
                  <div className="font-bold">{v.title}</div>
                  <small
                    className={
                      selectedVar?.id === v.id
                        ? "text-white-alpha-70"
                        : "text-500"
                    }
                  >
                    ID: {v.id}
                  </small>
                </li>
              ))}
            </ul>
          </div>
        </SplitterPanel>

        <SplitterPanel size={80} className="flex flex-column gap-3 pl-2">
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

          {showEditors && (
            <div className="grid h-15rem flex-shrink-0">
              <div className="col-6 h-full">
                <Panel
                  header="JavaScript"
                  className="h-full shadow-1"
                  pt={{ content: { className: "p-0 h-full" } }}
                >
                  <InputTextarea
                    value={jsCode}
                    onChange={(e) => setJsCode(e.target.value)}
                    className="w-full h-full border-none font-monospace"
                    style={{ resize: "none" }}
                    placeholder="// Custom JS here..."
                  />
                </Panel>
              </div>
              <div className="col-6 h-full">
                <Panel
                  header="CSS"
                  className="h-full shadow-1"
                  pt={{ content: { className: "p-0 h-full" } }}
                >
                  <InputTextarea
                    value={cssCode}
                    onChange={(e) => setCssCode(e.target.value)}
                    className="w-full h-full border-none font-monospace"
                    style={{ resize: "none" }}
                    placeholder="/* Custom CSS here */"
                  />
                </Panel>
              </div>
            </div>
          )}

          <div className="flex-1 surface-card border-round shadow-1 p-3 flex align-items-center justify-content-center bg-gray-100">
            <div className="text-500">
              <i className="pi pi-desktop text-3xl mb-2 block text-center"></i>
              Preview Mode (Implementation Pending)
            </div>
          </div>
        </SplitterPanel>
      </Splitter>

      <Dialog
        header="New Variation"
        visible={showDialog}
        style={{ width: "400px" }}
        onHide={() => setShowDialog(false)}
      >
        <div className="pt-4">
          <span className="p-float-label">
            <InputText
              id="vtitle"
              value={newVarTitle}
              onChange={(e) => setNewVarTitle(e.target.value)}
              className="w-full"
            />
            <label htmlFor="vtitle">Variation Name</label>
          </span>
          <div className="mt-4 flex justify-content-end">
            <Button label="Create" icon="pi pi-check" onClick={handleCreate} />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
