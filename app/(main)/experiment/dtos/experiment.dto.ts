export type ExperimentStatus =
  | "Draft"
  | "Active"
  | "Paused"
  | "Archived"
  | "Ended";
export type ExperimentType =
  | "AB Test"
  | "Personalization"
  | "Split URL"
  | "Redirect";
export type TriggerType = "Immediately" | "DOM Ready" | "URL Changes";
export type ConditionType = "ALL" | "ANY";

export class ExperimentResponseDto {
  id: number = 0;
  title: string = "";
  projectId: number = 0;
  type: ExperimentType = "AB Test";
  status: ExperimentStatus = "Draft";
  url: string | null = "";
  description: string | null = "";
  triggerType: TriggerType = "Immediately";
  conditionType: ConditionType = "ALL";
  js: string | null = "";
  css: string | null = "";
  createdAt: string | null = "";
  updatedAt: string | null = "";
}

export class ExperimentCreateRequestDto {
  title: string = "";
  projectId: number = 0;
  description: string = "";
  url: string = "";
}

export class ExperimentCreateResponseDto {
  id: number = 0;
  title: string = "";
  status: string = "";
}

export class ExperimentUpdateRequestDto {
  title?: string | null;
  js?: string | null;
  css?: string | null;
  type?: ExperimentType | null;
  status?: ExperimentStatus | null;
  url?: string | null;
  description?: string | null;
  triggerType?: TriggerType | null;
  conditionType?: ConditionType | null;
}
