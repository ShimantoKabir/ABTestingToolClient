"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// PrimeReact
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Toast } from "primereact/toast";
import { Divider } from "primereact/divider";

// Logic
import { container } from "@/app/di";
import {
  CookieService,
  CookieServiceToken,
} from "@/app/utils/cookie/CookieService";
import {
  ACTIVE_ORG_POSITION_COOKIE,
  ACTIVE_PROJECT_POSITION_COOKIE,
} from "@/app/constants";
import {
  JwtLoginInfoDto,
  JwtOrgDto,
  JwtProjectDto,
} from "@/app/utils/cookie/dtos/jwt-login-info.dto";

export default function SettingsPage() {
  const cookieService = container.get<CookieService>(CookieServiceToken);
  const router = useRouter();
  const toast = useRef<Toast>(null);

  // Data State
  const [loginInfo, setLoginInfo] = useState<JwtLoginInfoDto | null>(null);

  // Selection State (Storing INDEXES, not IDs, because cookies use index)
  const [selectedOrgIndex, setSelectedOrgIndex] = useState<number>(0);
  const [selectedProjectIndex, setSelectedProjectIndex] = useState<
    number | null
  >(null);

  // Derived Lists
  const [orgOptions, setOrgOptions] = useState<
    { label: string; value: number }[]
  >([]);
  const [projectOptions, setProjectOptions] = useState<
    { label: string; value: number }[]
  >([]);

  useEffect(() => {
    // 1. Get raw info to populate dropdowns
    const info = cookieService.getJwtLoginInfo();

    if (!info) {
      router.push("/login");
      return;
    }

    setLoginInfo(info);

    // 2. Map Orgs to Options (value = index)
    const orgOpts = info.orgs.map((org, index) => ({
      label: org.name,
      value: index,
    }));
    setOrgOptions(orgOpts);

    // 3. Determine current selection from cookies (to show current state initially)
    const currentOrgCookie = cookieService.getCookie(
      ACTIVE_ORG_POSITION_COOKIE
    );
    const currentProjCookie = cookieService.getCookie(
      ACTIVE_PROJECT_POSITION_COOKIE
    );

    const initOrgIndex = currentOrgCookie ? parseInt(currentOrgCookie) : 0;
    const initProjIndex = currentProjCookie ? parseInt(currentProjCookie) : 0;

    setSelectedOrgIndex(initOrgIndex);

    // Load projects for the initial org
    loadProjectsForOrg(info.orgs, initOrgIndex, initProjIndex);
  }, []);

  // Helper to refresh project dropdown based on selected org
  const loadProjectsForOrg = (
    orgs: JwtOrgDto[],
    orgIndex: number,
    projIndexToSelect: number | null = null
  ) => {
    const org = orgs[orgIndex];
    if (org && org.projects) {
      const projOpts = org.projects.map((proj, index) => ({
        label: proj.name,
        value: index,
      }));
      setProjectOptions(projOpts);

      // If we have a specific project to select (initial load), try to select it
      // Otherwise default to the first one available
      if (projIndexToSelect !== null && org.projects[projIndexToSelect]) {
        setSelectedProjectIndex(projIndexToSelect);
      } else if (projOpts.length > 0) {
        setSelectedProjectIndex(0);
      } else {
        setSelectedProjectIndex(null);
      }
    } else {
      setProjectOptions([]);
      setSelectedProjectIndex(null);
    }
  };

  const onOrgChange = (e: { value: number }) => {
    setSelectedOrgIndex(e.value);
    // Reset project to first available when org changes
    if (loginInfo) {
      loadProjectsForOrg(loginInfo.orgs, e.value, 0);
    }
  };

  const onSave = () => {
    if (selectedProjectIndex === null && projectOptions.length > 0) {
      toast.current?.show({
        severity: "warn",
        summary: "Validation",
        detail: "Please select a project.",
      });
      return;
    }

    // Set Cookies
    cookieService.setCookie(
      ACTIVE_ORG_POSITION_COOKIE,
      selectedOrgIndex.toString(),
      1
    );

    // If no projects exist, we can store 0 or -1, but usually logic handles 0 safely
    const projIndexToSave =
      selectedProjectIndex !== null ? selectedProjectIndex : 0;
    cookieService.setCookie(
      ACTIVE_PROJECT_POSITION_COOKIE,
      projIndexToSave.toString(),
      1
    );

    toast.current?.show({
      severity: "success",
      summary: "Success",
      detail: "Context updated. Redirecting...",
    });

    // Force a full reload or redirect to dashboard to ensure API headers (which read these cookies) are updated
    // and the LeftMenu re-renders with new structure.
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 500);
  };

  return (
    <div className="grid p-fluid p-4 justify-content-center">
      <Toast ref={toast} />

      <div className="col-12 md:col-6 lg:col-5">
        <Card
          title="Switch Context"
          subTitle="Select your active Organization and Project"
        >
          <div className="flex flex-column gap-4 mt-3">
            {/* Organization Select */}
            <div className="flex flex-column gap-2">
              <label htmlFor="org" className="font-bold">
                Organization
              </label>
              <Dropdown
                id="org"
                value={selectedOrgIndex}
                options={orgOptions}
                onChange={onOrgChange}
                placeholder="Select an Organization"
                className="w-full"
              />
            </div>

            {/* Project Select */}
            <div className="flex flex-column gap-2">
              <label htmlFor="project" className="font-bold">
                Project
              </label>
              <Dropdown
                id="project"
                value={selectedProjectIndex}
                options={projectOptions}
                onChange={(e) => setSelectedProjectIndex(e.value)}
                placeholder={
                  projectOptions.length > 0
                    ? "Select a Project"
                    : "No projects available"
                }
                disabled={projectOptions.length === 0}
                className="w-full"
                emptyMessage="No projects found in this organization"
              />
            </div>

            <Divider />

            <div className="flex justify-content-end gap-2">
              <Button
                label="Cancel"
                severity="secondary"
                text
                onClick={() => router.back()}
              />
              <Button
                label="Switch & Save"
                icon="pi pi-check"
                onClick={onSave}
                autoFocus
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
