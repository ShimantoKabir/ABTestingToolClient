"use client";
import React, { useEffect, useRef, useState } from "react";
import { container } from "@/app/di";

import {
  MenuService,
  MenuServiceToken,
} from "../components/menu/services/menu.service";
import {
  MenuTemplateService,
  MenuTemplateServiceToken,
} from "../menu-template/services/menu-template.service";

// IMPORT ALL 3 DTOs
import {
  MenuTemplateCreateRequestDto,
  MenuTemplateCreateResponseDto, // Imported for type checking if needed
  MenuTemplateResponseDto,
} from "../menu-template/dtos/menu-template.dto";

import { ErrorResponseDto } from "@/app/network/error-response.dto";
import {
  addActionsAsChildren,
  recoverTreeFromSelection,
} from "./utils/menu-tree.utils";

import { DataTable, DataTableStateEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Tree } from "primereact/tree";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { TreeNode } from "primereact/treenode";

export default function MenuPage() {
  const menuService = container.get<MenuService>(MenuServiceToken);
  const menuTemplateService = container.get<MenuTemplateService>(
    MenuTemplateServiceToken
  );

  const toast = useRef<Toast>(null);

  // Use ResponseDto for the table
  const [templates, setTemplates] = useState<MenuTemplateResponseDto[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lazyParams, setLazyParams] = useState({ first: 0, rows: 10, page: 1 });

  // ... (Dialog State) ...
  const [showDialog, setShowDialog] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [treeNodes, setTreeNodes] = useState<TreeNode[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<any>(null);

  useEffect(() => {
    loadTemplates();
  }, [lazyParams]);

  const loadTemplates = async () => {
    setLoading(true);
    const res = await menuTemplateService.getMenuTemplates(
      lazyParams.page,
      lazyParams.rows
    );

    if (res instanceof ErrorResponseDto) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: res.message,
      });
    } else {
      setTemplates(res.items);
      setTotalRecords(res.total);
    }
    setLoading(false);
  };

  const onPage = (event: DataTableStateEvent) => {
    setLazyParams({
      first: event.first,
      rows: event.rows,
      page: (event.page || 0) + 1,
    });
  };

  const openNew = async () => {
    setTemplateName("");
    setSelectedKeys(null);
    setShowDialog(true);

    const rawNodes = await menuService.getMenuJson();
    if (rawNodes instanceof ErrorResponseDto) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: rawNodes.message,
      });
      return;
    }
    const visualNodes = addActionsAsChildren(rawNodes as any[]);
    setTreeNodes(visualNodes);
  };

  const saveTemplate = async () => {
    if (!templateName.trim()) {
      toast.current?.show({
        severity: "warn",
        summary: "Warning",
        detail: "Name is required",
      });
      return;
    }
    if (!selectedKeys) {
      toast.current?.show({
        severity: "warn",
        summary: "Warning",
        detail: "Select at least one item",
      });
      return;
    }

    const cleanTree = recoverTreeFromSelection(treeNodes, selectedKeys);

    // Use RequestDto for creation
    const request = new MenuTemplateCreateRequestDto();
    request.name = templateName;
    request.tree = JSON.stringify(cleanTree);

    const res = await menuTemplateService.createMenuTemplate(request);

    if (res instanceof ErrorResponseDto) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: res.message,
      });
    } else {
      // res is now explicitly MenuTemplateCreateResponseDto
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Menu Template Created",
      });
      setShowDialog(false);
      loadTemplates();
    }
  };

  // ... (Renderers match previous code) ...

  const indexBodyTemplate = (rowData: MenuTemplateResponseDto, props: any) => {
    return props.rowIndex + 1;
  };

  const actionBodyTemplate = (rowData: MenuTemplateResponseDto) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-pencil"
          rounded
          text
          severity="info"
          aria-label="Update"
        />
        <Button
          icon="pi pi-trash"
          rounded
          text
          severity="danger"
          aria-label="Delete"
        />
      </div>
    );
  };

  const dialogFooter = (
    <div>
      <Button
        label="Cancel"
        icon="pi pi-times"
        onClick={() => setShowDialog(false)}
        className="p-button-text"
      />
      <Button
        label="Save"
        icon="pi pi-check"
        onClick={saveTemplate}
        autoFocus
      />
    </div>
  );

  return (
    <div className="grid p-fluid p-4">
      <Toast ref={toast} />
      <div className="col-12">
        <div className="card shadow-2 border-round p-4 surface-card">
          <div className="flex justify-content-between align-items-center mb-4">
            <h5 className="m-0">Menu Templates</h5>
            <Button
              label="New"
              icon="pi pi-plus"
              severity="success"
              className="w-auto"
              onClick={openNew}
            />
          </div>

          <DataTable
            value={templates}
            lazy
            paginator
            first={lazyParams.first}
            rows={lazyParams.rows}
            totalRecords={totalRecords}
            onPage={onPage}
            loading={loading}
            tableStyle={{ minWidth: "50rem" }}
            paginatorClassName="border-none"
          >
            <Column
              header="SL"
              body={indexBodyTemplate}
              style={{ width: "5%" }}
            />
            <Column field="name" header="Name" style={{ width: "25%" }} />
            <Column
              field="tree"
              header="Tree (Raw)"
              style={{ width: "50%" }}
              body={(rowData: MenuTemplateResponseDto) => (
                <div
                  className="white-space-nowrap overflow-hidden text-overflow-ellipsis"
                  style={{ maxWidth: "300px" }}
                >
                  {rowData.tree}
                </div>
              )}
            />
            <Column
              header="Action"
              body={actionBodyTemplate}
              style={{ width: "20%" }}
            />
          </DataTable>
        </div>
      </div>

      <Dialog
        header="Create Menu Template"
        visible={showDialog}
        style={{ width: "50vw" }}
        footer={dialogFooter}
        onHide={() => setShowDialog(false)}
      >
        <div className="flex flex-column gap-3">
          <div className="flex flex-column gap-2">
            <label htmlFor="tplName" className="font-bold">
              Template Name
            </label>
            <InputText
              id="tplName"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g., Admin Default"
            />
          </div>

          <div className="flex flex-column gap-2">
            <label className="font-bold">Select Menus & Actions</label>
            <div
              className="card border-1 surface-border border-round p-3"
              style={{ maxHeight: "400px", overflowY: "auto" }}
            >
              <Tree
                value={treeNodes}
                selectionMode="checkbox"
                selectionKeys={selectedKeys}
                onSelectionChange={(e) => setSelectedKeys(e.value)}
                filter
                filterMode="lenient"
                filterPlaceholder="Search menu items..."
              />
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
