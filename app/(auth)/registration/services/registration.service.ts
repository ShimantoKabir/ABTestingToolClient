import { ErrorResponseDto } from "@/app/network/error-response.dto";
import { UserRegistrationRequestDto } from "@/app/(auth)/registration/dtos/registration-request.dto";
import { UserRegistrationResponseDto } from "@/app/(auth)/registration/dtos/registration-response.dto";
import { OtpRequestDto } from "../dtos/otp-request.dto";
import { OtpResponseDto } from "../dtos/otp-response.dto";

export interface RegistrationService {
  onRegistration: (
    registrationRequestDto: UserRegistrationRequestDto
  ) => Promise<UserRegistrationResponseDto | ErrorResponseDto>;

  onOtpVerify: (
    otpRequestDto: OtpRequestDto
  ) => Promise<OtpResponseDto | ErrorResponseDto>;
}

export const RegistrationServiceToken = Symbol("LoginService");
