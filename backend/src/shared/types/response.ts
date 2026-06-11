export type SuccessResponse<T> = {
  success: true;
  message: string;
  data: T | null;
  statusCode: number;
  timestamp: string;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedResponse<T> = {
  success: true;
  data: T | null;
  pagination: PaginationMeta;
  timestamp: string;
};
