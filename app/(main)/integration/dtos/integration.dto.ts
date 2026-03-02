export class GtmToggleResponseDto {
  projectId: number = 0;
  enabled: boolean = false;
  message: string = "";
}

export class GtmToggleRequestDto {
  enabled?: boolean;
}
