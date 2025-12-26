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

import {
  MenuTemplateCreateRequestDto,
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
import { Tooltip } from "primereact/tooltip";

export default function MenuPage() {
  const menuService = container.get<MenuService>(MenuServiceToken);
  const menuTemplateService = container.get<MenuTemplateService>(
    MenuTemplateServiceToken
  );

  const toast = useRef<Toast>(null);

  const [templates, setTemplates] = useState<MenuTemplateResponseDto[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lazyParams, setLazyParams] = useState({ first: 0, rows: 5, page: 1 });

  const [showDialog, setShowDialog] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [treeNodes, setTreeNodes] = useState<TreeNode[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<any>(null);

  const [viewDialog, setViewDialog] = useState(false);
  const [viewNodes, setViewNodes] = useState<TreeNode[]>([]);

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
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Menu Template Created",
      });
      setShowDialog(false);
      loadTemplates();
    }
  };

  const openViewTree = (rowData: MenuTemplateResponseDto) => {
    try {
      const parsedTree = JSON.parse(rowData.tree);
      const visualNodes = addActionsAsChildren(parsedTree);

      setViewNodes(visualNodes);
      setViewDialog(true);
    } catch (e) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to parse tree data",
      });
    }
  };

  const indexBodyTemplate = (rowData: MenuTemplateResponseDto, props: any) => {
    return props.rowIndex + 1;
  };

  const treeBodyTemplate = (rowData: MenuTemplateResponseDto) => {
    return (
      <div className="flex align-items-center">
        <Button
          icon="pi pi-sitemap"
          rounded
          text
          severity="secondary"
          aria-label="View Tree"
          onClick={() => openViewTree(rowData)}
          tooltip="Visualize Structure"
          tooltipOptions={{ position: "top" }}
        />
      </div>
    );
  };

  const editActionBodyTemplate = (rowData: MenuTemplateResponseDto) => {
    return (
      <div className="flex gap-2">
        <Button
          icon="pi pi-pencil"
          rounded
          text
          severity="info"
          aria-label="Update"
        />
      </div>
    );
  };

  const deleteActionBodyTemplate = (rowData: MenuTemplateResponseDto) => {
    return (
      <div className="flex gap-2">
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
      <Tooltip target=".custom-target-icon" />

      <div className="col-12">
        <div className="card shadow-2 border-round p-4 surface-card">
          <div className="flex justify-content-between align-items-center mb-4">
            <h2 className="m-0">Menu Templates</h2>
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
            rowsPerPageOptions={[5, 10, 25]}
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
              header="Tree"
              style={{ width: "50%" }}
              body={treeBodyTemplate}
            />
            <Column
              header="Edit"
              body={editActionBodyTemplate}
              style={{ width: "10%" }}
            />
            <Column
              header="Delete"
              body={deleteActionBodyTemplate}
              style={{ width: "10%" }}
            />
          </DataTable>
        </div>
      </div>

      {/* CREATE DIALOG */}
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
            {/* FIX 1: Removed 'border-1 surface-border' classes */}
            <div
              className="card border-none p-0"
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
                className="w-full border-none p-0"
              />
            </div>
          </div>
        </div>
      </Dialog>

      {/* VIEW TREE DIALOG */}
      <Dialog
        header="Assigned Menu Structure"
        visible={viewDialog}
        style={{ width: "40vw" }}
        onHide={() => setViewDialog(false)}
        draggable={false}
      >
        <div
          className="card border-none p-0"
          style={{ maxHeight: "60vh", overflowY: "auto" }}
        >
          <Tree value={viewNodes} className="w-full border-none p-0" />
        </div>
        <div className="flex justify-content-end mt-3">
          <Button
            label="Close"
            icon="pi pi-times"
            text
            onClick={() => setViewDialog(false)}
          />
        </div>
      </Dialog>
    </div>
  );
}
