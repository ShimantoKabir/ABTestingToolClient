export class VariationResponseDto {
  id: number = 0;
  experimentId: number = 0;
  title: string = "";
  traffic: number = 0;
  js: string | null = "";
  css: string | null = "";
  isControl: boolean = false;
}

export class VariationCreateRequestDto {
  title: string = "";
  js: string = "";
  css: string = "";
}

export class VariationUpdateRequestDto {
  title: string | null = null;
  js: string | null = null;
  css: string | null = null;
}

export class TrafficAllocationRequestDto {
  allocations: VariationTrafficDto[] = [];
}

export class VariationTrafficDto {
  variationId: number = 0;
  traffic: number = 0;
}
