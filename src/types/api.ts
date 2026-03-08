export interface ApiResponse<T> {
  data: T
}

export interface ApiError {
  error: {
    message: string
    code?: string
  }
}
