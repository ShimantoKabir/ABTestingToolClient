export class ErrorResponseDto {
  status: number | undefined = 200;
  message: string | undefined = "";

  constructor(message?: string, status?: number) {
    this.message = message || "";
    this.status = status || 500;
  }
}
