import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { container } from "@/app/di";
import {
  ExperimentService,
  ExperimentServiceToken,
} from "../services/experiment.service";
import {
  CookieService,
  CookieServiceToken,
} from "@/app/utils/cookie/CookieService";
import {
  ExperimentResponseDto,
  ExperimentCreateRequestDto,
} from "../dtos/experiment.dto";
import { ErrorResponseDto } from "@/app/network/error-response.dto";

interface LazyParams {
  first: number;
  rows: number;
  page: number;
}

export const useExperiments = () => {
  const router = useRouter();
  const toast = useRef<any>(null);
  const experimentService = container.get<ExperimentService>(
    ExperimentServiceToken
  );
  const cookieService = container.get<CookieService>(CookieServiceToken);

  const [experiments, setExperiments] = useState<ExperimentResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [lazyParams, setLazyParams] = useState<LazyParams>({ 
    first: 0, 
    rows: 10, 
    page: 1 
  });

  // Create Dialog State
  const [showDialog, setShowDialog] = useState(false);
  const [newExpTitle, setNewExpTitle] = useState("");
  const [newExpDesc, setNewExpDesc] = useState("");
  const [newExpUrl, setNewExpUrl] = useState("");

  const loadExperiments = async () => {
    setLoading(true);
    const loginInfo = cookieService.getJwtLoginInfo();
    const orgId = loginInfo?.activeOrg?.id || 0;
    const projectId = loginInfo?.activeProject?.id || 0;

    const res = await experimentService.getExperimentsByProjectAndOrg(
      orgId,
      projectId,
      lazyParams.page,
      lazyParams.rows
    );
    if (!(res instanceof ErrorResponseDto)) {
      setExperiments(res.items);
      setTotalRecords(res.total);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadExperiments();
  }, [lazyParams]);

  const enterExperiment = (id: number) => {
    router.push(`/experiment/${id}/condition`);
  };

  const handleCreate = async () => {
    const loginInfo = cookieService.getJwtLoginInfo();
    const projectId = loginInfo?.activeProject?.id || 0;

    if (projectId === 0) {
      toast.current?.show({
        severity: "warn",
        summary: "No Project",
        detail: "Please select a project first.",
      });
      return;
    }

    if (!newExpTitle.trim()) {
      toast.current?.show({
        severity: "error",
        summary: "Validation",
        detail: "Title is required",
      });
      return;
    }

    const req = new ExperimentCreateRequestDto();
    req.title = newExpTitle;
    req.description = newExpDesc;
    req.url = newExpUrl;
    req.projectId = projectId;

    const res = await experimentService.createExperiment(req);
    if (res instanceof ErrorResponseDto) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: res.message,
      });
    } else {
      toast.current?.show({
        severity: "success",
        summary: "Created",
        detail: "Experiment created",
      });
      setShowDialog(false);
      // Reset form
      setNewExpTitle("");
      setNewExpDesc("");
      setNewExpUrl("");
      loadExperiments();
    }
  };

  const resetCreateForm = () => {
    setNewExpTitle("");
    setNewExpDesc("");
    setNewExpUrl("");
  };

  return {
    // State
    experiments,
    loading,
    totalRecords,
    lazyParams,
    showDialog,
    newExpTitle,
    newExpDesc,
    newExpUrl,
    toast,
    
    // Actions
    setLazyParams,
    setShowDialog,
    setNewExpTitle,
    setNewExpDesc,
    setNewExpUrl,
    loadExperiments,
    enterExperiment,
    handleCreate,
    resetCreateForm,
  };
};
