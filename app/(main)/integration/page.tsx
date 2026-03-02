"use client";
import React, { useEffect, useRef, useState } from "react";
import { container } from "@/app/di";
import {
  IntegrationService,
  IntegrationServiceToken,
} from "./services/integration.service";
import { ErrorResponseDto } from "@/app/network/error-response.dto";
import { GtmToggleResponseDto } from "./dtos/integration.dto";

// PrimeReact
import { InputSwitch } from "primereact/inputswitch";
import { Card } from "primereact/card";
import { Toast } from "primereact/toast";
import { Skeleton } from "primereact/skeleton";

export default function IntegrationPage() {
  const service = container.get<IntegrationService>(IntegrationServiceToken);
  const toast = useRef<Toast>(null);

  const [loading, setLoading] = useState(false);
  const [gtm, setGtm] = useState<GtmToggleResponseDto | null>(null);

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    setLoading(true);
    const res = await service.getGtm();
    if (res instanceof ErrorResponseDto) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: res.message,
      });
    } else {
      setGtm(res);
    }
    setLoading(false);
  };

  const toggleGTM = async (enabled: boolean) => {
    if (!gtm) return;

    const previousState = gtm.enabled;
    setGtm({ ...gtm, enabled: enabled });

    const res = await service.updateGtm({
      enabled: enabled,
    });

    if (res instanceof ErrorResponseDto) {
      toast.current?.show({
        severity: "error",
        summary: "Update Failed",
        detail: res.message,
      });
      setGtm({ ...gtm, enabled: previousState });
    } else {
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: `Google Tag Manager ${enabled ? "enabled" : "disabled"}`,
      });
    }
  };

  if (loading && !gtm) {
    return (
      <div className="grid p-fluid p-4 justify-content-center">
        <div className="col-12 md:col-6 lg:col-5">
          <Card
            title="Integrations"
            subTitle="Manage third-party tool connections"
          >
            <Skeleton height="150px" />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="grid p-fluid p-4 justify-content-center">
      <Toast ref={toast} />
      <div className="col-12 md:col-6 lg:col-5">
        <Card
          title="Integrations"
          subTitle="Manage your third-party tool connections"
        >
          <div className="flex flex-column gap-4 mt-3">
            <div className="flex align-items-center justify-content-between p-3 surface-border border-round">
              <div className="flex align-items-center gap-3">
                <i className="pi pi-google text-2xl text-blue-500"></i>
                <div>
                  <span className="font-bold block">Google Tag Manager</span>
                  <small className="text-500">
                    Enable or disable GTM tracking for your projects.
                  </small>
                </div>
              </div>
              <InputSwitch
                checked={gtm?.enabled || false}
                onChange={(e) => toggleGTM(e.value)}
              />
            </div>

            {/* Placeholder for future integrations */}
            <div className="text-center p-5 border-2 border-dashed surface-border border-round mt-4">
              <i className="pi pi-plus-circle text-3xl text-300 mb-2"></i>
              <p className="text-500 m-0">More integrations coming soon...</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
