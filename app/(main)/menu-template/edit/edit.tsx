"use client";
import React, { useState, useEffect } from "react";
import { MenuTemplateResponseDto } from "../dtos/menu-template.dto";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { classNames } from "primereact/utils";
import { Tree } from "primereact/tree";
import { TreeNode } from "primereact/treenode";
import { recoverTreeFromSelection } from "../utils/menu-tree.utils";

interface EditMenuTemplateProps {
  visible: boolean;
  onHide: () => void;
  onUpdate: (id: number, name: string, tree: string) => Promise<void>;
  template: MenuTemplateResponseDto | null;
  availableMenuNodes: TreeNode[];
}

export default function EditMenuTemplate({
  visible,
  onHide,
  onUpdate,
  template,
  availableMenuNodes,
}: EditMenuTemplateProps) {
  const [templateName, setTemplateName] = useState<string>("");
  const [selectedKeys, setSelectedKeys] = useState<any>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (template && visible) {
      setTemplateName(template.name);
      // Parse the existing tree and set selected keys
      try {
        const parsedTree = JSON.parse(template.tree);
        // Convert the saved tree back to selection keys
        const selectionKeys = convertTreeToSelectionKeys(
          parsedTree,
          availableMenuNodes,
        );
        setSelectedKeys(selectionKeys);
      } catch (error) {
        console.error("Error parsing template tree:", error);
        setSelectedKeys(null);
      }
      setSubmitted(false);
    }
  }, [template, visible, availableMenuNodes]);

  // Helper function to convert saved tree back to selection keys
  const convertTreeToSelectionKeys = (
    savedTree: any[],
    availableNodes: TreeNode[],
  ): any => {
    const selectionKeys: any = {};

    // Recursive helper to traverse the saved tree and match against available visual nodes
    const traverseAndMark = (savedNodes: any[], visualNodes: TreeNode[]) => {
      savedNodes.forEach((savedNode) => {
        // 1. Find the corresponding node in the current level of availableNodes
        const correspondingNode = visualNodes.find(
          (avail) => avail.key === savedNode.key,
        );

        if (correspondingNode) {
          // Mark the current node as checked
          selectionKeys[correspondingNode.key as string] = { checked: true };

          // 2. Handle Actions (Leaf nodes in the visual availableNodes)
          // These are stored in savedNode.data.actions but exist as children in availableNodes
          if (savedNode.data?.actions && correspondingNode.children) {
            savedNode.data.actions.forEach((actionName: string) => {
              const actionNode = correspondingNode.children?.find(
                (child) =>
                  child.data?.isAction && child.data?.actionName === actionName,
              );

              if (actionNode && actionNode.key) {
                selectionKeys[actionNode.key as string] = { checked: true };
              }
            });
          }

          // 3. Mark parent hierarchy as partially checked
          let parent = findParentNode(
            correspondingNode.key as string,
            availableMenuNodes,
          );
          while (parent) {
            const parentKey = parent.key as string;
            // Only set to partial if not already fully checked
            if (!selectionKeys[parentKey]?.checked) {
              selectionKeys[parentKey] = { partialChecked: true };
            }
            parent = findParentNode(parentKey, availableMenuNodes);
          }

          // 4. Unlimited Depth Recursion
          // If the saved node has children, recurse into them.
          // We filter correspondingNode.children to only look at sub-menus (non-actions)
          if (
            savedNode.children &&
            savedNode.children.length > 0 &&
            correspondingNode.children
          ) {
            const subMenuAvailableNodes = correspondingNode.children.filter(
              (c) => !c.data?.isAction,
            );
            traverseAndMark(savedNode.children, subMenuAvailableNodes);
          }
        }
      });
    };

    traverseAndMark(savedTree, availableNodes);
    return selectionKeys;
  };

  // Helper function to find parent node
  const findParentNode = (
    nodeKey: string,
    nodes: TreeNode[],
  ): TreeNode | null => {
    for (const node of nodes) {
      if (node.children) {
        if (node.children.some((child) => child.key === nodeKey)) {
          return node;
        }
        const found = findParentNode(nodeKey, node.children);
        if (found) return found;
      }
    }
    return null;
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    setLoading(true);

    if (templateName.trim() && selectedKeys && template) {
      const cleanTree = recoverTreeFromSelection(
        availableMenuNodes,
        selectedKeys,
      );
      await onUpdate(template.id, templateName, JSON.stringify(cleanTree));
      setTemplateName("");
      setSelectedKeys(null);
      setSubmitted(false);
      setLoading(false);
      onHide();
    } else {
      setLoading(false);
    }
  };

  const handleHide = () => {
    setTemplateName("");
    setSelectedKeys(null);
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
        disabled={loading}
      />
      <Button
        label="Update"
        icon="pi pi-check"
        onClick={handleSubmit}
        loading={loading}
      />
    </React.Fragment>
  );

  return (
    <Dialog
      visible={visible}
      style={{ width: "50vw" }}
      breakpoints={{ "960px": "75vw", "641px": "90vw" }}
      header="Edit Menu Template"
      modal
      draggable={false}
      className="p-fluid"
      footer={dialogFooter}
      onHide={handleHide}
    >
      <div className="flex flex-column gap-3">
        <div className="field">
          <label htmlFor="editName" className="font-bold">
            Template Name
          </label>
          <InputText
            id="editName"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            required
            autoFocus
            className={classNames({
              "p-invalid": submitted && !templateName.trim(),
            })}
          />
          {submitted && !templateName.trim() && (
            <small className="p-error">Template name is required.</small>
          )}
        </div>

        <div className="field">
          <label className="font-bold">Select Menus & Actions</label>
          <div
            className="card border-none p-0"
            style={{ maxHeight: "400px", overflowY: "auto" }}
          >
            <Tree
              value={availableMenuNodes}
              selectionMode="checkbox"
              selectionKeys={selectedKeys}
              onSelectionChange={(e) => setSelectedKeys(e.value)}
              filter
              filterMode="lenient"
              filterPlaceholder="Search menu items..."
              className="w-full border-none p-0"
            />
          </div>
          {submitted && !selectedKeys && (
            <small className="p-error">
              Please select at least one menu item.
            </small>
          )}
        </div>
      </div>
    </Dialog>
  );
}
