"use client";
import { TreeNode } from "primereact/treenode";
import React, { useState, useEffect, useRef } from "react";
import "@/app/(main)/components/menu/left/left-menu.scss";
import { useMenuStore } from "@/app/(main)/components/menu/menu-store";
import {
  MenuService,
  MenuServiceToken,
} from "@/app/(main)/components/menu/services/menu.service";
import {
  Tree,
  TreeCheckboxSelectionKeys,
  TreeMultipleSelectionKeys,
  TreeNodeClickEvent,
} from "primereact/tree";
import { useRouter } from "next/navigation";
import { container } from "@/app/di";
import { ProgressSpinner } from "primereact/progressspinner";
import { ErrorResponseDto } from "@/app/network/error-response.dto";
import { Toast } from "primereact/toast";

const LeftMenu = () => {
  const menuService = container.get<MenuService>(MenuServiceToken);
  const { isLeftMenuMinimized } = useMenuStore();
  const [nodes, setNodes] = useState<TreeNode[]>([]);
  const [expandedKeys, setExpandedKeys] = useState({});
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const toast = useRef<Toast>(null);

  useEffect(() => {
    setLoading(true);
    menuService
      .getMenuNodes()
      .then((data: TreeNode[] | ErrorResponseDto) => {
        if (data instanceof ErrorResponseDto) {
          toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: data.message,
          });
        } else {
          setNodes(data);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const findSelectedNode = (
    tree: TreeNode[],
    key: string | TreeMultipleSelectionKeys | TreeCheckboxSelectionKeys | null
  ): TreeNode | undefined => {
    for (const node of tree) {
      if (node.key === key) return node;

      if (node.children) {
        const found: TreeNode | undefined = findSelectedNode(
          node.children,
          key
        );

        if (found) return found;
      }
    }
    return undefined;
  };

  const onSingleExpand = (
    e: string | TreeMultipleSelectionKeys | TreeCheckboxSelectionKeys | null
  ) => {
    const selectedNode: TreeNode | undefined = findSelectedNode(nodes, e);

    if (selectedNode) {
      const expandState: boolean = !selectedNode.expanded;
      selectedNode.expanded = expandState;
      setExpandedKeys({
        e: expandState,
      });
    }
  };

  const onNodeClick = (e: TreeNodeClickEvent) => {
    e.node.data && e.node.data.href && router.push(e.node.data.href);
  };

  return (
    <div className={isLeftMenuMinimized ? "hide left-menu" : "left-menu"}>
      <Toast ref={toast} />
      <div className="logo">
        <h1>PyAdmin</h1>
      </div>
      <div className="menu-container">
        {loading ? (
          <div className="loader-container">
            <ProgressSpinner strokeWidth="4" fill="var(--surface-ground)" />
          </div>
        ) : (
          <Tree
            value={nodes}
            selectionMode="single"
            className="w-full menu-wrap"
            expandedKeys={expandedKeys}
            onToggle={(e) => setExpandedKeys(e.value)}
            onSelectionChange={(e) => onSingleExpand(e.value)}
            onNodeClick={(e) => onNodeClick(e)}
          />
        )}
      </div>
    </div>
  );
};

export default LeftMenu;
