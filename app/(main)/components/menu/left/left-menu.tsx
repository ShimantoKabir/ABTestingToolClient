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
  TreeSelectionEvent,
} from "primereact/tree";
import { usePathname, useRouter } from "next/navigation";
import { container } from "@/app/di";
import { ProgressSpinner } from "primereact/progressspinner";
import { ErrorResponseDto } from "@/app/network/error-response.dto";
import { Toast } from "primereact/toast";
import { APP_NAME } from "@/app/constants";

const LeftMenu = () => {
  const menuService = container.get<MenuService>(MenuServiceToken);
  const { isLeftMenuMinimized } = useMenuStore();

  const [nodes, setNodes] = useState<TreeNode[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<any>({});
  // 1. New State to control selection persistence
  const [selectedKey, setSelectedKey] = useState<
    string | TreeMultipleSelectionKeys | TreeCheckboxSelectionKeys | null
  >(null);
  const [loading, setLoading] = useState<boolean>(true);

  const router = useRouter();
  const pathname = usePathname(); // Get current URL path
  const toast = useRef<Toast>(null);

  // Helper: Find node key by href (recursively)
  const findNodeKeyByHref = (
    nodes: TreeNode[],
    href: string
  ): string | null => {
    for (const node of nodes) {
      if (node.data?.href === href) {
        return node.key as string;
      }
      if (node.children) {
        const found = findNodeKeyByHref(node.children, href);
        if (found) return found;
      }
    }
    return null;
  };

  useEffect(() => {
    setLoading(true);
    menuService
      .getMenuTree()
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

  // 2. Effect: Sync selection with URL pathname whenever nodes load or URL changes
  useEffect(() => {
    if (nodes.length > 0 && pathname) {
      const activeKey = findNodeKeyByHref(nodes, pathname);
      if (activeKey) {
        setSelectedKey(activeKey);
      }
    }
  }, [pathname, nodes]);

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

  // Handle Expanding/Collapsing AND Selecting
  const onSelectionChange = (e: TreeSelectionEvent) => {
    // Update the selection state immediately
    setSelectedKey(e.value);

    // Existing expansion logic
    const selectedNode: TreeNode | undefined = findSelectedNode(nodes, e.value);
    if (selectedNode) {
      const expandState: boolean = !selectedNode.expanded;
      selectedNode.expanded = expandState;
      setExpandedKeys({
        ...expandedKeys,
        [selectedNode.key as string]: expandState,
      });
    }
  };

  const onNodeClick = (e: TreeNodeClickEvent) => {
    if (e.node.data && e.node.data.href) {
      router.push(e.node.data.href);
    }
  };

  return (
    <div className={isLeftMenuMinimized ? "hide left-menu" : "left-menu"}>
      <Toast ref={toast} />
      <div className="logo">
        <i className="pi pi-box" style={{ fontSize: "1.5rem" }}></i>
        <h4 className="text-900 font-bold">{APP_NAME}</h4>
      </div>
      <div className="menu-container">
        {loading ? (
          <div className="loader-container">
            <ProgressSpinner strokeWidth="4" fill="transparent" />
          </div>
        ) : (
          <Tree
            value={nodes}
            selectionMode="single"
            className="w-full menu-wrap"
            // 3. Controlled Props
            expandedKeys={expandedKeys}
            selectionKeys={selectedKey}
            onToggle={(e) => setExpandedKeys(e.value)}
            onSelectionChange={onSelectionChange}
            onNodeClick={onNodeClick}
          />
        )}
      </div>
    </div>
  );
};

export default LeftMenu;
