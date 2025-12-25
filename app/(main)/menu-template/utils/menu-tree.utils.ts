import { TreeNode } from "primereact/treenode";

// --- TRANSFORM 1: API Data -> UI Tree (Actions become Children) ---
export const addActionsAsChildren = (nodes: any[]): TreeNode[] => {
  return nodes.map((node) => {
    const newNode: TreeNode = { ...node }; // Clone
    const actionChildren: TreeNode[] = [];

    // 1. Convert string actions to visual child nodes
    if (newNode.data && Array.isArray(newNode.data.actions)) {
      newNode.data.actions.forEach((action: string, index: number) => {
        actionChildren.push({
          key: `${newNode.key}-act-${index}`, // Unique Key
          label: action,
          icon: "pi pi-cog",
          data: { isAction: true, actionName: action }, // Flag to identify later
          children: [],
        });
      });
    }

    // 2. Process existing children recursively
    const realChildren = newNode.children
      ? addActionsAsChildren(newNode.children)
      : [];

    // 3. Combine Action Children + Real Children
    newNode.children = [...actionChildren, ...realChildren];

    // 4. Clear the actions from data (so they don't duplicate visually if the tree renders data)
    // We will put them back during save.
    if (newNode.data) {
      newNode.data = { ...newNode.data, originalActions: newNode.data.actions };
      delete newNode.data.actions;
    }

    return newNode;
  });
};

// --- TRANSFORM 2: UI Selection -> API Payload (Reconstruct Tree) ---
export const recoverTreeFromSelection = (
  allUiNodes: TreeNode[],
  selectedKeys: any
): any[] => {
  const result: any[] = [];

  allUiNodes.forEach((uiNode) => {
    // FIX: Guard clause to ensure key exists
    const nodeKey = uiNode.key;
    if (!nodeKey) return;

    // Now safe to use nodeKey as index
    const isChecked = selectedKeys[nodeKey]?.checked === true;
    const isPartial = selectedKeys[nodeKey]?.partialChecked === true;

    // Only process if node is relevant (Checked or Partial)
    if (isChecked || isPartial) {
      // 1. Clone the node structure
      const apiNode: any = {
        key: nodeKey,
        label: uiNode.label,
        icon: uiNode.icon,
        data: { ...uiNode.data },
      };

      // Remove internal flags
      delete apiNode.data.isAction;
      delete apiNode.data.originalActions;

      // 2. Re-assemble Actions
      const authorizedActions: string[] = [];
      const realApiChildren: any[] = [];

      if (uiNode.children) {
        uiNode.children.forEach((child) => {
          // FIX: Ensure child key exists too
          if (child.key) {
            const childStatus = selectedKeys[child.key];
            if (childStatus?.checked === true) {
              if (child.data?.isAction) {
                authorizedActions.push(child.data.actionName);
              }
            }
          }
        });

        // Recurse for real children (non-actions)
        const realUiChildren = uiNode.children.filter((c) => !c.data?.isAction);
        if (realUiChildren.length > 0) {
          const recursedChildren = recoverTreeFromSelection(
            realUiChildren,
            selectedKeys
          );
          realApiChildren.push(...recursedChildren);
        }
      }

      // 3. Assign back to API Node
      if (authorizedActions.length > 0) {
        apiNode.data.actions = authorizedActions;
      }

      if (realApiChildren.length > 0) {
        apiNode.children = realApiChildren;
      }

      result.push(apiNode);
    }
  });

  return result;
};
