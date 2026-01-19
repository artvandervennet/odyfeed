export interface ResourceIdentifier {
  id: string
}

export interface Timestamped {
  createdAt: string
  updatedAt?: string
}

export interface Published {
  published: string
}

export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type WithRequired<T, K extends keyof T> = T & Required<Pick<T, K>>

export type CreatePayload<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>

export type UpdatePayload<T> = Partial<CreatePayload<T>> & ResourceIdentifier

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page?: number
  pageSize?: number
}

export interface ApiResponse<T> {
  data: T
  error?: string
  timestamp?: string
}

export interface ApiError {
  message: string
  statusCode?: number
  details?: unknown
}
