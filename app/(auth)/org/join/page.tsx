"use client";
import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// PrimeReact
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { Message } from "primereact/message";
import {
  AutoComplete,
  AutoCompleteCompleteEvent,
} from "primereact/autocomplete";

// DI & Services
import { container } from "@/app/di";
import { APP_NAME } from "@/app/constants";
import { ErrorResponseDto } from "@/app/network/error-response.dto";

import {
  OrganizationService,
  OrganizationServiceToken,
} from "@/app/(auth)/org/services/organization.service";
import { OrgSearchResDto } from "@/app/(auth)/org/dtos/org-search-res.dto";

// Reuse registration styles or create new ones
import "./join.scss";
import {
  UserService,
  UserServiceToken,
} from "@/app/(main)/user/services/user.service";

export default function JoinOrganizationPage() {
  const router = useRouter();
  const toast = useRef<Toast>(null);

  // Inject Services
  const registrationService = container.get<UserService>(UserServiceToken);
  const orgService = container.get<OrganizationService>(
    OrganizationServiceToken
  );

  // State
  const [email, setEmail] = useState("");
  const [selectedOrg, setSelectedOrg] = useState<OrgSearchResDto | null>(null);
  const [filteredOrgs, setFilteredOrgs] = useState<OrgSearchResDto[]>([]);
  const [loading, setLoading] = useState(false);

  // Validation State
  const [emailError, setEmailError] = useState("");
  const [orgError, setOrgError] = useState("");
  const emailMessageRef = useRef<Message>(null);
  const orgMessageRef = useRef<Message>(null);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // --- Handlers ---

  /**
   * Reused from registration/page.tsx
   */
  const searchOrgs = (event: AutoCompleteCompleteEvent) => {
    if (event.query.length > 1) {
      orgService.searchOrganizations(event.query).then((data) => {
        if (!(data instanceof ErrorResponseDto)) {
          setFilteredOrgs(data);
        }
      });
    }
  };

  const onJoinClick = () => {
    if (!validate()) return;

    setLoading(true);

    registrationService
      .joinOrganization({
        email: email,
        orgId: selectedOrg?.id || 0,
      })
      .then((res) => {
        if (res instanceof ErrorResponseDto) {
          toast.current?.show({
            severity: "error",
            summary: "Request Failed",
            detail: res.message,
          });
        } else {
          toast.current?.show({
            severity: "success",
            summary: "Request Sent",
            detail: "Your request to join has been sent to the admin.",
          });
          // Redirect to login after a brief delay
          setTimeout(() => {
            router.push("/login");
          }, 2000);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const validate = (): boolean => {
    let isValid = true;

    // Email Validation
    if (!email) {
      setEmailError("Email is required!");
      emailMessageRef.current?.getElement()?.classList.remove("hide");
      isValid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError("Invalid email format!");
      emailMessageRef.current?.getElement()?.classList.remove("hide");
      isValid = false;
    } else {
      setEmailError("");
      emailMessageRef.current?.getElement()?.classList.add("hide");
    }

    // Org Validation
    if (!selectedOrg || !selectedOrg.id) {
      setOrgError("Please select an organization!");
      orgMessageRef.current?.getElement()?.classList.remove("hide");
      isValid = false;
    } else {
      setOrgError("");
      orgMessageRef.current?.getElement()?.classList.add("hide");
    }

    return isValid;
  };

  return (
    <div className="org-join-page">
      <Toast ref={toast} />
      <div className="page-wrap">
        <div className="flex flex-column justify-content-center align-item-center w-full mb-4">
          <h2 className="text-center">{APP_NAME}</h2>
          <p className="text-center text-500 m-0 mt-2">Join an Organization</p>
        </div>

        {/* Email Input */}
        <div className="flex flex-column gap-1 mb-3 w-full">
          <label htmlFor="email">Email</label>
          <InputText
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="w-full"
            placeholder=""
          />
          <Message
            ref={emailMessageRef}
            severity="error"
            text={emailError}
            className="hide"
          />
        </div>

        {/* Organization AutoComplete */}
        <div className="flex flex-column gap-1 mb-4 w-full">
          <label htmlFor="org">Organization</label>
          <AutoComplete
            id="org"
            value={selectedOrg}
            suggestions={filteredOrgs}
            completeMethod={searchOrgs}
            field="name"
            onChange={(e) => setSelectedOrg(e.value)}
            disabled={loading}
            placeholder="Search..."
            className="w-full"
            inputClassName="w-full"
          />
          <Message
            ref={orgMessageRef}
            severity="error"
            text={orgError}
            className="hide"
          />
        </div>

        {/* Action Button */}
        <div className="flex flex-column justify-content-center align-item-center w-full">
          <Button
            label="Send Request"
            className="w-full"
            loading={loading}
            onClick={onJoinClick}
          />
        </div>

        {/* Navigation Links */}
        <div className="flex flex-column justify-content-center align-items-center w-full mt-4 gap-2">
          <Link href="/login" className="text-sm">
            Back to Login
          </Link>
          <Link href="/registration" className="text-sm">
            Create new account
          </Link>
        </div>
      </div>
    </div>
  );
}
