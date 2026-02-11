export class TrafficAllocationRequestDto {
  allocations: VariationTrafficDto[] = [];
}

export class VariationTrafficDto {
  variationId: number = 0;
  traffic: number = 0;
}
