export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filter?: Record<string, any>;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export function paginateArray<T>(
  items: T[],
  params: PaginationParams,
  searchableFields: (keyof T)[] = []
): PaginatedResult<T> {
  const page = Math.max(1, params.page ? Number(params.page) : 1);
  const limit = Math.max(1, Math.min(100, params.limit ? Number(params.limit) : 20));
  const search = params.search ? params.search.toLowerCase().trim() : '';

  let filtered = [...items];

  // Search filtering
  if (search && searchableFields.length > 0) {
    filtered = filtered.filter((item) => {
      return searchableFields.some((field) => {
        const val = item[field];
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(search);
      });
    });
  }

  // Generic key-value filters
  if (params.filter && typeof params.filter === 'object') {
    Object.entries(params.filter).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        filtered = filtered.filter((item) => {
          const itemVal = (item as any)[key];
          return String(itemVal).toLowerCase() === String(val).toLowerCase();
        });
      }
    });
  }

  // Sorting
  if (params.sortBy) {
    const field = params.sortBy as keyof T;
    const order = params.sortOrder === 'desc' ? -1 : 1;
    filtered.sort((a, b) => {
      const valA = a[field];
      const valB = b[field];
      if (valA === valB) return 0;
      if (valA === undefined || valA === null) return 1 * order;
      if (valB === undefined || valB === null) return -1 * order;
      return valA > valB ? order : -order;
    });
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const startIndex = (page - 1) * limit;
  const paginatedItems = filtered.slice(startIndex, startIndex + limit);

  return {
    items: paginatedItems,
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}
