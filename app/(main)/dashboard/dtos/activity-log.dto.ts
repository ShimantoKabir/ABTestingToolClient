export class ActivityLogRequestDto {
  rows!: number;
  page!: number;
  userEmail?: string | null;
  entityType?: string | null;
}

export class ActivityLogResponseDto {
  id!: number;
  userEmail!: string;
  action!: string;
  entityType!: string;
  entityId!: number | null;
  description!: string;
  createdAt!: string | null;
}
