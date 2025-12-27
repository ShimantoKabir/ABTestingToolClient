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
import { Button } from "primereact/button"; // Import Button

// Import Cookie Service
import {
  CookieService,
  CookieServiceToken,
} from "@/app/utils/cookie/CookieService";
import { JwtLoginInfoDto } from "@/app/utils/cookie/dtos/jwt-login-info.dto";

const LeftMenu = () => {
  const menuService = container.get<MenuService>(MenuServiceToken);
  const cookieService = container.get<CookieService>(CookieServiceToken); // Inject CookieService
  const { isLeftMenuMinimized } = useMenuStore();

  const [nodes, setNodes] = useState<TreeNode[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<any>({});
  const [selectedKey, setSelectedKey] = useState<
    string | TreeMultipleSelectionKeys | TreeCheckboxSelectionKeys | null
  >(null);
  const [loading, setLoading] = useState<boolean>(true);

  // State for Active Context
  const [activeInfo, setActiveInfo] = useState<JwtLoginInfoDto | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const toast = useRef<Toast>(null);

  // ... (keep findNodeKeyByHref helper) ...
  const findNodeKeyByHref = (
    nodes: TreeNode[],
    href: string
  ): string | null => {
    for (const node of nodes) {
      if (node.data?.href === href) return node.key as string;
      if (node.children) {
        const found = findNodeKeyByHref(node.children, href);
        if (found) return found;
      }
    }
    return null;
  };

  useEffect(() => {
    // 1. Load Menu Tree
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

    // 2. Load Active Context Info
    const info = cookieService.getJwtLoginInfo();
    setActiveInfo(info);
  }, []);

  // ... (keep useEffect for pathname syncing) ...
  useEffect(() => {
    if (nodes.length > 0 && pathname) {
      const activeKey = findNodeKeyByHref(nodes, pathname);
      if (activeKey) setSelectedKey(activeKey);
    }
  }, [pathname, nodes]);

  // ... (keep findSelectedNode & onSelectionChange) ...
  const findSelectedNode = (
    tree: TreeNode[],
    key: any
  ): TreeNode | undefined => {
    // (Keep existing logic)
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

  const onSelectionChange = (e: TreeSelectionEvent) => {
    setSelectedKey(e.value);
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

  const onSettingsClick = () => {
    router.push("/settings");
  };

  return (
    <div className={isLeftMenuMinimized ? "hide left-menu" : "left-menu"}>
      <Toast ref={toast} />

      {/* Header */}
      <div className="logo">
        <i className="pi pi-box" style={{ fontSize: "1.5rem" }}></i>
        <h4 className="text-900 font-bold">{APP_NAME}</h4>
      </div>

      {/* Menu Body */}
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
            expandedKeys={expandedKeys}
            selectionKeys={selectedKey}
            onToggle={(e) => setExpandedKeys(e.value)}
            onSelectionChange={onSelectionChange}
            onNodeClick={onNodeClick}
          />
        )}
      </div>

      {/* NEW Footer */}
      {activeInfo && (
        <div className="menu-footer">
          <div className="info-box">
            <span className="org-name" title={activeInfo.activeOrg?.name}>
              {activeInfo.activeOrg?.name || "No Organization"}
            </span>
            <span
              className="project-name"
              title={activeInfo.activeProject?.name}
            >
              {activeInfo.activeProject?.name || "No Project Selected"}
            </span>
          </div>
          <Button
            icon="pi pi-cog"
            text
            rounded
            severity="secondary"
            aria-label="Settings"
            onClick={onSettingsClick}
            tooltip="Switch Context"
            tooltipOptions={{ position: "top" }}
          />
        </div>
      )}
    </div>
  );
};

export default LeftMenu;
