export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export function buildPaginationMeta(page: number, limit: number, totalItems: number): PaginationMeta {
  return {
    page,
    limit,
    totalItems,
    totalPages: Math.ceil(totalItems / limit) || 1,
  };
}
