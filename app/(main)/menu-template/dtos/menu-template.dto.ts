// 1. For Listing (GET /all)
export class MenuTemplateResponseDto {
  id: number = 0;
  name: string = "";
  orgId: number = 0;
  tree: string = ""; // JSON string
}

// 2. For Request Payload (POST /)
export class MenuTemplateCreateRequestDto {
  name: string = "";
  orgId: number = 0;
  tree: string = ""; // JSON string
}

// 3. For Create Response (POST / response)
export class MenuTemplateCreateResponseDto {
  id: number = 0;
  name: string = "";
  orgId: number = 0;
  tree: string = "";
}
