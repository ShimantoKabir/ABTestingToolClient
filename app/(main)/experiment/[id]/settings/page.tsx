"use client";
import React, { useEffect, useRef, useState } from "react";
import { container } from "@/app/di";
import {
  ExperimentService,
  ExperimentServiceToken,
} from "../../services/experiment.service";
import {
  ExperimentResponseDto,
  ExperimentUpdateRequestDto,
} from "../../dtos/experiment.dto";
import { ErrorResponseDto } from "@/app/network/error-response.dto";

import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Panel } from "primereact/panel";

export default function ExperimentSettingsPage({
  params,
}: {
  params: { id: string };
}) {
  const expId = parseInt(params.id);
  const service = container.get<ExperimentService>(ExperimentServiceToken);
  const toast = useRef<Toast>(null);

  const [experiment, setExperiment] = useState<ExperimentResponseDto | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  // Form State initialized empty
  const [formData, setFormData] = useState<ExperimentUpdateRequestDto>({});

  const statusOptions = ["Draft", "Active", "Paused", "Archived", "Ended"];
  const typeOptions = ["AB Test", "Personalization", "Split URL", "Redirect"];
  const triggerOptions = ["Immediately", "DOM Ready", "URL Changes"];
  const conditionTypeOptions = ["ALL", "ANY"];

  useEffect(() => {
    loadExperiment();
  }, [expId]);

  const loadExperiment = async () => {
    const res = await service.getExperimentById(expId);
    if (!(res instanceof ErrorResponseDto)) {
      setExperiment(res);
      // Populate Form
      setFormData({
        title: res.title,
        description: res.description,
        url: res.url,
        status: res.status,
        type: res.type,
        triggerType: res.triggerType,
        conditionType: res.conditionType,
        js: res.js,
        css: res.css,
      });
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    const res = await service.updateExperiment(expId, formData);

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
        detail: "Experiment updated",
      });
      setExperiment(res); // Update local state to reflect changes immediately
    }
    setLoading(false);
  };

  if (!experiment) return <div>Loading...</div>;

  return (
    <div className="grid justify-content-center">
      <Toast ref={toast} />
      <div className="col-12 md:col-10 lg:col-8">
        <Panel header="Experiment Settings" className="shadow-2">
          <div className="flex flex-column gap-4">
            {/* General Info */}
            <div className="grid">
              <div className="col-12 md:col-6">
                <label className="block font-bold mb-2">Title</label>
                <InputText
                  value={formData.title || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full"
                />
              </div>
              <div className="col-12 md:col-6">
                <label className="block font-bold mb-2">Target URL</label>
                <InputText
                  value={formData.url || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, url: e.target.value })
                  }
                  className="w-full"
                />
              </div>
              <div className="col-12">
                <label className="block font-bold mb-2">Description</label>
                <InputTextarea
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full"
                  autoResize
                />
              </div>
            </div>

            {/* Configuration */}
            <div className="grid">
              <div className="col-12 md:col-6">
                <label className="block font-bold mb-2">Status</label>
                <Dropdown
                  value={formData.status}
                  options={statusOptions}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.value })
                  }
                  className="w-full"
                />
              </div>
              <div className="col-12 md:col-6">
                <label className="block font-bold mb-2">Type</label>
                <Dropdown
                  value={formData.type}
                  options={typeOptions}
                  onChange={(e) => setFormData({ ...formData, type: e.value })}
                  className="w-full"
                />
              </div>
              <div className="col-12 md:col-6">
                <label className="block font-bold mb-2">Trigger</label>
                <Dropdown
                  value={formData.triggerType}
                  options={triggerOptions}
                  onChange={(e) =>
                    setFormData({ ...formData, triggerType: e.value })
                  }
                  className="w-full"
                />
              </div>
              <div className="col-12 md:col-6">
                <label className="block font-bold mb-2">Condition Logic</label>
                <Dropdown
                  value={formData.conditionType}
                  options={conditionTypeOptions}
                  onChange={(e) =>
                    setFormData({ ...formData, conditionType: e.value })
                  }
                  className="w-full"
                />
              </div>
            </div>

            {/* Global Code */}
            <div className="grid">
              <div className="col-12">
                <label className="block font-bold mb-2">
                  Global JavaScript
                </label>
                <InputTextarea
                  value={formData.js || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, js: e.target.value })
                  }
                  rows={5}
                  className="w-full font-monospace"
                  placeholder="// JS to run for all variations"
                />
              </div>
              <div className="col-12">
                <label className="block font-bold mb-2">Global CSS</label>
                <InputTextarea
                  value={formData.css || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, css: e.target.value })
                  }
                  rows={5}
                  className="w-full font-monospace"
                  placeholder="/* CSS to apply for all variations */"
                />
              </div>
            </div>

            <div className="flex justify-content-end mt-3">
              <Button
                label="Save Changes"
                icon="pi pi-check"
                loading={loading}
                onClick={handleUpdate}
              />
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
