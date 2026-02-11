"use client";
import React, { useEffect, useState, use } from "react";
import { usePathname, useRouter } from "next/navigation";
import { TabMenu } from "primereact/tabmenu";
import { container } from "@/app/di";
import {
  ExperimentService,
  ExperimentServiceToken,
} from "../services/experiment.service";
import { ExperimentResponseDto } from "../dtos/experiment.dto";
import { ErrorResponseDto } from "@/app/network/error-response.dto";

export default function ExperimentDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const service = container.get<ExperimentService>(ExperimentServiceToken);

  const [experiment, setExperiment] = useState<ExperimentResponseDto | null>(
    null,
  );

  const { id } = use(params);
  const expId = parseInt(id);

  useEffect(() => {
    if (expId) {
      service.getExperimentById(expId).then((res) => {
        if (!(res instanceof ErrorResponseDto)) {
          setExperiment(res);
        }
      });
    }
  }, [expId]);

  const items = [
    {
      label: "Conditions",
      icon: "pi pi-cog",
      command: () => router.push(`/experiment/${expId}/condition`),
    },
    {
      label: "Variations",
      icon: "pi pi-palette",
      command: () => router.push(`/experiment/${expId}/variation`),
    },
    {
      label: "Traffic",
      icon: "pi pi-sliders-h",
      command: () => router.push(`/experiment/${expId}/traffic`),
    },
    {
      label: "Metrics",
      icon: "pi pi-chart-bar",
      command: () => router.push(`/experiment/${expId}/metrics`),
    },
    {
      label: "Results",
      icon: "pi pi-filter-slash",
      command: () => router.push(`/experiment/${expId}/results`),
    },
    {
      label: "Settings",
      icon: "pi pi-file-edit",
      command: () => router.push(`/experiment/${expId}/settings`),
    },
  ];

  const activeIndex = items.findIndex((item) =>
    pathname.includes(item.label.toLowerCase()),
  );

  return (
    <div className="flex flex-column h-full">
      <div
        className="surface-card shadow-2 px-4 py-2 flex justify-content-between align-items-center mb-3"
        style={{ borderRadius: "0 0 6px 6px" }}
      >
        <div className="flex align-items-center gap-3">
          <i
            className="pi pi-arrow-left cursor-pointer"
            onClick={() => router.push("/experiment")}
            style={{ fontSize: "1.2rem" }}
          ></i>
          <div>
            <h2 className="m-0 text-900">
              {experiment?.title || "Loading..."}
            </h2>
            <span className="text-500 text-sm">ID: {expId}</span>
          </div>
        </div>
        <div>
          <TabMenu
            model={items}
            activeIndex={activeIndex}
            style={{ border: "none" }}
          />
        </div>
      </div>
      {/* FIX: Removed 'overflow-auto' to prevent double scrollbars. 
          The parent '.play-ground' already handles scrolling. */}
      <div className="flex-1 p-4">{children}</div>
    </div>
  );
}
