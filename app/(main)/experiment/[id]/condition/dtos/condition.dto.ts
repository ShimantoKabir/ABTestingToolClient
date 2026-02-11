export type Operator = "NOT_CONTAIN" | "CONTAIN" | "IS" | "IS_NOT";

export class ConditionResponseDto {
  id: number = 0;
  experimentId: number = 0;
  urls: string[] = [];
  operator: Operator = "CONTAIN";
}

export class ConditionCreateRequestDto {
  urls: string[] = [];
  operator: Operator = "CONTAIN";
}
