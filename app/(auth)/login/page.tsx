"use client";
import React from "react";
import Link from "next/link";
import "@/app/(auth)/login/login.scss";
import { Button } from "primereact/button";
import { Password } from "primereact/password";
import { InputText } from "primereact/inputtext";
import { useRef, useState } from "react";
import { Divider } from "primereact/divider";
import { useRouter } from "next/navigation";
import { Toast } from "primereact/toast";
import { Message } from "primereact/message";
import { LoginResponseDto } from "@/app/(auth)/login/dtos/login-response.dto";
import { container } from "@/app/di";
import {
  LoginService,
  LoginServiceToken,
} from "@/app/(auth)/login/services/login.service";
import { ErrorResponseDto } from "@/app/network/error-response.dto";
import { APP_NAME } from "@/app/constants";

const login: React.FC = () => {
  const loginService = container.get<LoginService>(LoginServiceToken);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [emailErrorMessage, setEmailErrorMessage] = useState("");
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
  const router = useRouter();
  const emailMessageRef = useRef<Message>(null);
  const passwordMessageRef = useRef<Message>(null);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
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
  const [loading, setLoading] = useState<boolean>(false);
  const toast = useRef<Toast>(null);

  const onLoginClick = () => {
    const isInputVerified = onInputVerify();
    if (!isInputVerified) {
      return;
    }

    setLoading(true);
    loginService
      .onLogin({
        email: email,
        password: password,
      })
      .then((value: LoginResponseDto | ErrorResponseDto) => {
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
            detail: "Login successful!",
          });

          setTimeout(() => {
            router.push("/dashboard");
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
    <div className="login-page">
      <Toast ref={toast} />
      <div className="page-wrap">
        <div className="flex flex-column justify-content-center align-item-center w-full mb-4">
          <h2 className="text-center">{APP_NAME}</h2>
        </div>
        <div className="flex flex-column gap-1 mb-2">
          <label htmlFor="email">Email</label>
          <InputText
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            id="email"
            type="email"
            disabled={loading}
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
            inputClassName="pr-5"
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
            label="Login"
            className="w-full"
            onClick={() => onLoginClick()}
            loading={loading}
          ></Button>
        </div>
        <Divider layout="horizontal" className="hidden md:flex">
          <b>OR</b>
        </Divider>
        <div className="flex flex-column justify-content-center align-item-center w-full">
          <p className="text-center">Don't have account?</p>
          <Link className="text-center" href="/registration">
            Register now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default login;
