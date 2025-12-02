"use client";
import "./registration.scss";
import Link from "next/link";
import { useState, useRef } from "react";
import { container } from "@/app/di";
import { Button } from "primereact/button";
import { Password } from "primereact/password";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { Divider } from "primereact/divider";
import { useRouter } from "next/navigation";
import { InputOtp } from "primereact/inputotp";
import { Message } from "primereact/message";
import { RegistrationResponseDto } from "./dtos/registration-response.dto";
import { ErrorResponseDto } from "@/app/network/error-response.dto";
import { OtpResponseDto } from "./dtos/otp-response.dto";
import OtpTimer from "@/app/(main)/components/otp/otp-timer/otp-timer";
import {
  RegistrationService,
  RegistrationServiceToken,
} from "./services/registration.service";

export default function Registration() {
  const registrationService = container.get<RegistrationService>(
    RegistrationServiceToken
  );

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [otpAppearance, setOtpAppearance] = useState<boolean>(false);
  const [otp, setOtp] = useState<string | number | null | undefined>("");

  const [emailErrorMessage, setEmailErrorMessage] = useState("");
  const [otpErrorMessage, setOtpErrorMessage] = useState("");
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");

  const emailMessageRef = useRef<Message>(null);
  const passwordMessageRef = useRef<Message>(null);
  const otpMessageRef = useRef<Message>(null);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

  const [loading, setLoading] = useState<boolean>(false);
  const toast = useRef<Toast>(null);

  const router = useRouter();

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

          setTimeout(() => {
            router.replace("/login");
          }, 250);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

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
      })
      .then((value: RegistrationResponseDto | ErrorResponseDto) => {
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

          setTimeout(() => {
            setOtpAppearance(true);
          }, 250);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const onInputVerify = (): boolean => {
    if (!email) {
      setEmailErrorMessage("Email required!");
      emailMessageRef.current?.getElement()?.classList.remove("hide");
      return false;
    }

    if (!emailRegex.test(email)) {
      setEmailErrorMessage("Email not in correct format!");
      emailMessageRef.current?.getElement()?.classList.remove("hide");
      return false;
    }

    setEmailErrorMessage("");
    emailMessageRef.current?.getElement()?.classList.add("hide");

    if (!password) {
      setPasswordErrorMessage("Password required!");
      passwordMessageRef.current?.getElement()?.classList.remove("hide");
      return false;
    }

    if (!passwordRegex.test(password)) {
      setPasswordErrorMessage("Complete password requirements!");
      passwordMessageRef.current?.getElement()?.classList.remove("hide");
      return false;
    }

    setPasswordErrorMessage("");
    passwordMessageRef.current?.getElement()?.classList.add("hide");

    return true;
  };

  return (
    <div className="registration-page">
      <Toast ref={toast} />
      <div className={otpAppearance ? "page-wrap hide" : "page-wrap"}>
        <div className="flex flex-column justify-content-center align-item-center w-full mb-4">
          <h2 className="text-center">PYADMIN</h2>
        </div>
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
        <div className="flex flex-column gap-1 mb-4">
          <label htmlFor="password">Password</label>
          <Password
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            toggleMask
            disabled={loading}
            header={header}
            footer={footer}
          />
          <Message
            ref={passwordMessageRef}
            severity="error"
            text={passwordErrorMessage}
            className="hide"
          />
        </div>
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
        <div className="flex flex-column justify-content-center align-item-center w-full">
          <p className="text-center">Already have account?</p>
          <Link className="text-center" href="/login">
            Please Login
          </Link>
        </div>
      </div>
      <div className={otpAppearance ? "page-wrap" : "page-wrap hide"}>
        <div className="flex flex-column gap-1 mb-2">
          <label
            className="w-full flex justify-content-between align-items-center"
            htmlFor="otp"
          >
            <p className="m-0">OTP</p>
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
            onClick={() => onOtpVerifyClick()}
          ></Button>
        </div>
      </div>
    </div>
  );
}
