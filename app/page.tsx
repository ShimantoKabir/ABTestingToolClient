"use client";
import React, { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Checkbox } from "primereact/checkbox";
import { Toast } from "primereact/toast";
import { Divider } from "primereact/divider";
import { InputOtp } from "primereact/inputotp";

// Components
import OtpTimer from "@/app/(main)/components/otp/otp-timer/otp-timer";

// DI & Services
import { container } from "@/app/di";
import {
  OrganizationService,
  OrganizationServiceToken,
} from "@/app/(auth)/org/services/organization.service";
import {
  RegistrationService,
  RegistrationServiceToken,
} from "@/app/(auth)/registration/services/registration.service"; // Reuse existing service

import { ErrorResponseDto } from "@/app/network/error-response.dto";
import "./home.scss";
import { APP_NAME } from "./constants";

export default function Home() {
  const router = useRouter();
  const toast = useRef<Toast>(null);

  // 1. Inject OrganizationService for creating the org
  const orgService = container.get<OrganizationService>(
    OrganizationServiceToken
  );

  // 2. Inject RegistrationService for verifying the OTP
  const registrationService = container.get<RegistrationService>(
    RegistrationServiceToken
  );

  // --- Form State ---
  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- OTP State ---
  const [otpAppearance, setOtpAppearance] = useState(false);
  const [otp, setOtp] = useState<string | number | null | undefined>("");

  // --- Error State ---
  const [errors, setErrors] = useState({
    orgName: "",
    email: "",
    password: "",
    terms: "",
    otp: "",
  });

  // --- Password Footer & Header Logic ---
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

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

  // --- Handlers ---

  const onRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await orgService.createOrganization({
        name: orgName,
        email: email,
        password: password,
      });

      if (response instanceof ErrorResponseDto) {
        toast.current?.show({
          severity: "error",
          summary: "Registration Failed!",
          detail: response.message || "An unknown error occurred!",
        });
      } else {
        toast.current?.show({
          severity: "success",
          summary: "Success!",
          detail: "Organization created! Please verify your email.",
        });
        // Switch to OTP View
        setOtpAppearance(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const onOtpVerify = async () => {
    if (!otp) {
      setErrors((prev) => ({ ...prev, otp: "OTP is required" }));
      return;
    }

    setLoading(true);
    setErrors((prev) => ({ ...prev, otp: "" }));

    try {
      const response = await registrationService.onOtpVerify({
        email: email,
        otp: otp.toString(),
      });

      if (response instanceof ErrorResponseDto) {
        toast.current?.show({
          severity: "error",
          summary: "Verification Failed",
          detail: response.message,
        });
      } else {
        toast.current?.show({
          severity: "success",
          summary: "Verified",
          detail: response.message,
        });

        setTimeout(() => {
          router.push("/login");
        }, 1500);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      orgName: "",
      email: "",
      password: "",
      terms: "",
      otp: "",
    };

    if (!orgName.trim()) {
      newErrors.orgName = "Organization name is required!";
      isValid = false;
    }

    if (!email.trim()) {
      newErrors.email = "Work email is required!";
      isValid = false;
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Invalid email format!";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Password is required!";
      isValid = false;
    } else if (!passwordRegex.test(password)) {
      newErrors.password = "Please check password suggestions below!";
      isValid = false;
    }

    if (!acceptTerms) {
      newErrors.terms = "You must agree to the terms!";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleResendOtp = () => {
    toast.current?.show({
      severity: "info",
      summary: "Info",
      detail: "Resend logic not implemented yet.",
    });
  };

  return (
    <div className="home-container">
      <Toast ref={toast} />

      {/* LEFT SIDE - HERO */}
      <div className="hero-side">
        <div className="hero-content">
          <h1>Register for {APP_NAME} Cloud!</h1>
        </div>
        <div className="brand-logo">
          <i className="pi pi-box" style={{ fontSize: "1.5rem" }}></i>
          <span>{APP_NAME}</span>
        </div>
      </div>

      {/* RIGHT SIDE - FORM */}
      <div className="form-side">
        <div className="form-wrapper">
          {/* --- VIEW 1: REGISTRATION FORM --- */}
          {!otpAppearance && (
            <>
              <h2>Register</h2>
              <div className="sub-text">
                Already have an account? <Link href="/login">Log In</Link>
              </div>

              <div className="flex flex-column gap-3">
                {/* Organization Name */}
                <div className="flex flex-column gap-2">
                  <label
                    htmlFor="orgName"
                    className="font-semibold text-color-secondary"
                  >
                    Organization Name
                  </label>
                  <InputText
                    id="orgName"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className={errors.orgName ? "p-invalid" : ""}
                    placeholder="Your Company Ltd."
                  />
                  {errors.orgName && (
                    <small className="p-error">{errors.orgName}</small>
                  )}
                </div>

                {/* Email */}
                <div className="flex flex-column gap-2">
                  <label
                    htmlFor="email"
                    className="font-semibold text-color-secondary"
                  >
                    Work Email Address
                  </label>
                  <InputText
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={errors.email ? "p-invalid" : ""}
                    placeholder="name@company.com"
                  />
                  {errors.email && (
                    <small className="p-error">{errors.email}</small>
                  )}
                </div>

                {/* Password */}
                <div className="flex flex-column gap-2">
                  <label
                    htmlFor="password"
                    className="font-semibold text-color-secondary"
                  >
                    Password
                  </label>
                  <Password
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    toggleMask
                    header={header}
                    footer={footer}
                    className={errors.password ? "p-invalid" : ""}
                    pt={{ input: { className: "w-full" } }}
                  />
                  {errors.password && (
                    <small className="p-error">{errors.password}</small>
                  )}
                </div>

                {/* Terms Checkbox */}
                <div className="flex align-items-start gap-2 mt-2">
                  <Checkbox
                    inputId="terms"
                    onChange={(e) => setAcceptTerms(e.checked || false)}
                    checked={acceptTerms}
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm line-height-3 text-600 cursor-pointer"
                  >
                    I agree to the{" "}
                    <Link href="/terms">Website Terms of Use</Link>,{" "}
                    <Link href="/terms">End User Terms of Service</Link>, and{" "}
                    <Link href="/privacy">Privacy Policy</Link>.
                  </label>
                </div>
                {errors.terms && (
                  <small className="p-error">{errors.terms}</small>
                )}

                <Button
                  label="Sign up"
                  className="btn-primary w-full mt-2"
                  loading={loading}
                  onClick={onRegister}
                />
              </div>
            </>
          )}

          {/* --- VIEW 2: OTP VERIFICATION --- */}
          {otpAppearance && (
            <div className="flex flex-column gap-3 fadein animation-duration-500">
              <h2>Verify Email</h2>
              <div className="sub-text">
                Please enter the code sent to <strong>{email}</strong>
              </div>

              <div className="flex flex-column gap-2">
                <div className="flex justify-content-between align-items-center mb-2">
                  <label
                    htmlFor="otp"
                    className="font-semibold text-color-secondary"
                  >
                    One-Time Password
                  </label>

                  {/* Reuse existing OtpTimer component */}
                  <OtpTimer onResendOtp={handleResendOtp} email={email} />
                </div>

                <div className="flex justify-content-center">
                  <InputOtp
                    id="otp"
                    value={otp}
                    length={6}
                    onChange={(e) => setOtp(e.value)}
                  />
                </div>
                {errors.otp && (
                  <small className="p-error text-center block mt-2">
                    {errors.otp}
                  </small>
                )}
              </div>

              <Button
                label="Verify Account"
                className="btn-primary w-full mt-3"
                loading={loading}
                onClick={onOtpVerify}
              />

              <div className="text-center mt-3">
                <span
                  className="text-600 cursor-pointer hover:underline text-sm"
                  onClick={() => setOtpAppearance(false)}
                >
                  Incorrect email? Go back
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
