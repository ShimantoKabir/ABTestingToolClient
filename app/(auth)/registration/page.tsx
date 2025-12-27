"use client";
import "./registration.scss";
import Link from "next/link";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

// PrimeReact Imports
import { Button } from "primereact/button";
import { Password } from "primereact/password";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { Divider } from "primereact/divider";
import { InputOtp } from "primereact/inputotp";
import { Message } from "primereact/message";
import {
  AutoComplete,
  AutoCompleteCompleteEvent,
} from "primereact/autocomplete";

// Architecture Imports
import { container } from "@/app/di";
import { APP_NAME } from "@/app/constants";
import { ErrorResponseDto } from "@/app/network/error-response.dto";

// Registration Service & DTOs
import {
  RegistrationService,
  RegistrationServiceToken,
} from "./services/registration.service";
import { UserRegistrationResponseDto } from "./dtos/registration-response.dto";
import { OtpResponseDto } from "./dtos/otp-response.dto";

// Organization Service & DTOs
import {
  OrganizationService,
  OrganizationServiceToken,
} from "@/app/(auth)/org/services/organization.service";
import { OrgSearchResDto } from "@/app/(auth)/org/dtos/org-search-res.dto";

// Components
import OtpTimer from "@/app/(main)/components/otp/otp-timer/otp-timer";

export default function Registration() {
  const router = useRouter();
  const toast = useRef<Toast>(null);

  // 1. Inject Services
  const registrationService = container.get<RegistrationService>(
    RegistrationServiceToken
  );
  const orgService = container.get<OrganizationService>(
    OrganizationServiceToken
  );

  // --- State Management ---

  // Form Data
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [selectedOrg, setSelectedOrg] = useState<OrgSearchResDto | null>(null);

  // Search State
  const [filteredOrgs, setFilteredOrgs] = useState<OrgSearchResDto[]>([]);

  // OTP State
  const [otpAppearance, setOtpAppearance] = useState<boolean>(false);
  const [otp, setOtp] = useState<string | number | null | undefined>("");

  // Loading State
  const [loading, setLoading] = useState<boolean>(false);

  // Validation / Error Messages
  const [emailErrorMessage, setEmailErrorMessage] = useState("");
  const [otpErrorMessage, setOtpErrorMessage] = useState("");
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
  const [orgErrorMessage, setOrgErrorMessage] = useState("");

  // Refs for UI feedback
  const emailMessageRef = useRef<Message>(null);
  const passwordMessageRef = useRef<Message>(null);
  const otpMessageRef = useRef<Message>(null);
  const orgMessageRef = useRef<Message>(null);

  // Validation Regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

  // Password Footer UI
  const header = <div className="font-bold mb-3">Pick a password</div>;
  const footer = (
    <>
      <Divider />
      <p className="mt-2">Suggestions</p>
      <ul className="pl-2 ml-2 mt-0 line-height-3">
        <li>At least one lowercase</li>
        <li>At least one uppercase</li>
        <li>At least one numeric</li>
        <li>Minimum 8 characters</li>
      </ul>
    </>
  );

  // --- Handlers ---

  /**
   * Handles searching for organizations via the AutoComplete input
   */
  const searchOrgs = (event: AutoCompleteCompleteEvent) => {
    // Basic debounce check (only search if query > 1 char)
    console.log("Searching Orgs for:", event.query);
    if (event.query.length > 1) {
      orgService.searchOrganizations(event.query).then((data) => {
        if (!(data instanceof ErrorResponseDto)) {
          setFilteredOrgs(data);
        }
      });
    }
  };

  /**
   * Handles the OTP verification submission
   */
  const onOtpVerifyClick = () => {
    if (!otp) {
      setOtpErrorMessage("Otp required!");
      otpMessageRef.current?.getElement()?.classList.remove("hide");
      return;
    }

    setOtpErrorMessage("");
    otpMessageRef.current?.getElement()?.classList.add("hide");

    setLoading(true);
    registrationService
      .onOtpVerify({
        email: email,
        otp: otp.toString(),
      })
      .then((value: OtpResponseDto | ErrorResponseDto) => {
        if (value instanceof ErrorResponseDto) {
          toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: value.message,
          });
        } else {
          toast.current?.show({
            severity: "success",
            summary: "Success",
            detail: value.message,
          });

          // Redirect to login after successful verification
          setTimeout(() => {
            router.replace("/login");
          }, 1500);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  /**
   * Handles the initial registration form submission
   */
  const onRegistrationClick = () => {
    const isInputVerified = onInputVerify();
    if (!isInputVerified) {
      return;
    }

    setLoading(true);

    registrationService
      .onRegistration({
        email: email,
        password: password,
        orgId: selectedOrg?.id || 0, // Pass the selected Organization ID
      })
      .then((value: UserRegistrationResponseDto | ErrorResponseDto) => {
        if (value instanceof ErrorResponseDto) {
          toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: value.message,
          });
        } else {
          toast.current?.show({
            severity: "success",
            summary: "Success",
            detail: value.message,
          });

          // Switch UI to OTP mode
          setTimeout(() => {
            setOtpAppearance(true);
          }, 250);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  /**
   * Validates form inputs before submission
   */
  const onInputVerify = (): boolean => {
    let isValid = true;

    // 1. Organization Validation
    if (!selectedOrg || !selectedOrg.id) {
      setOrgErrorMessage("Organization required!");
      orgMessageRef.current?.getElement()?.classList.remove("hide");
      isValid = false;
    } else {
      setOrgErrorMessage("");
      orgMessageRef.current?.getElement()?.classList.add("hide");
    }

    // 2. Email Validation
    if (!email) {
      setEmailErrorMessage("Email required!");
      emailMessageRef.current?.getElement()?.classList.remove("hide");
      isValid = false;
    } else if (!emailRegex.test(email)) {
      setEmailErrorMessage("Email not in correct format!");
      emailMessageRef.current?.getElement()?.classList.remove("hide");
      isValid = false;
    } else {
      setEmailErrorMessage("");
      emailMessageRef.current?.getElement()?.classList.add("hide");
    }

    // 3. Password Validation
    if (!password) {
      setPasswordErrorMessage("Password required!");
      passwordMessageRef.current?.getElement()?.classList.remove("hide");
      isValid = false;
    } else if (!passwordRegex.test(password)) {
      setPasswordErrorMessage("Complete password requirements!");
      passwordMessageRef.current?.getElement()?.classList.remove("hide");
      isValid = false;
    } else {
      setPasswordErrorMessage("");
      passwordMessageRef.current?.getElement()?.classList.add("hide");
    }

    return isValid;
  };

  return (
    <div className="registration-page">
      <Toast ref={toast} />

      {/* ---------------- REGISTRATION FORM ---------------- */}
      <div className={otpAppearance ? "page-wrap hide" : "page-wrap"}>
        <div className="flex flex-column justify-content-center align-item-center w-full mb-4">
          <h2 className="text-center">{APP_NAME}</h2>
        </div>

        {/* Email Input */}
        <div className="flex flex-column gap-1 mb-2">
          <label htmlFor="email">Email</label>
          <InputText
            value={email}
            id="email"
            type="email"
            disabled={loading}
            onChange={(e) => setEmail(e.target.value)}
            className="pr-5"
          />
          <Message
            ref={emailMessageRef}
            severity="error"
            text={emailErrorMessage}
            className="hide"
          />
        </div>

        {/* Password Input */}
        <div className="flex flex-column gap-1 mb-2">
          <label htmlFor="password">Password</label>
          <Password
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            toggleMask
            disabled={loading}
            header={header}
            footer={footer}
            inputClassName="pr-5"
          />
          <Message
            ref={passwordMessageRef}
            severity="error"
            text={passwordErrorMessage}
            className="hide"
          />
        </div>

        {/* Organization Search Input */}
        <div className="flex flex-column gap-1 mb-4">
          <label htmlFor="org">Organization</label>
          <AutoComplete
            id="org"
            value={selectedOrg}
            suggestions={filteredOrgs}
            completeMethod={searchOrgs}
            field="name"
            onChange={(e) => setSelectedOrg(e.value)}
            disabled={loading}
            placeholder="Search...."
            className="w-full"
            inputClassName="w-full pr-5"
          />
          <Message
            ref={orgMessageRef}
            severity="error"
            text={orgErrorMessage}
            className="hide"
          />
        </div>

        {/* Submit Button */}
        <div className="flex flex-column justify-content-center align-item-center w-full">
          <Button
            label="Registration"
            className="w-full"
            loading={loading}
            onClick={() => onRegistrationClick()}
          ></Button>
        </div>

        <Divider layout="horizontal" className="hidden md:flex">
          <b>OR</b>
        </Divider>

        {/* Login Link */}
        <div className="flex flex-column justify-content-center align-item-center w-full">
          <p className="text-center">Already have account?</p>
          <Link className="text-center" href="/login">
            Please Login
          </Link>
        </div>
      </div>

      {/* ---------------- OTP FORM ---------------- */}
      <div className={otpAppearance ? "page-wrap" : "page-wrap hide"}>
        <div className="flex flex-column gap-1 mb-2">
          <label
            className="w-full flex justify-content-between align-items-center"
            htmlFor="otp"
          >
            <p className="m-0">OTP</p>
            {/* Reuse OtpTimer Component */}
            <OtpTimer onResendOtp={() => {}} email={email} />
          </label>
          <Divider />

          <InputOtp
            id="otp"
            value={otp}
            length={6}
            onChange={(e) => setOtp(e.value)}
          />
          <Message
            ref={otpMessageRef}
            severity="error"
            text={otpErrorMessage}
            className="hide"
          />
        </div>

        <div className="flex flex-column justify-content-center align-item-center w-full mt-2">
          <Button
            label="Verify"
            className="w-full"
            loading={loading}
            onClick={() => onOtpVerifyClick()}
          ></Button>
        </div>
      </div>
    </div>
  );
}
