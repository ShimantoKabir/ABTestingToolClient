export class PaginationResponseDto<T> {
  items: T[] = [];
  total: number = 0;
}
