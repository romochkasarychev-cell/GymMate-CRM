export class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export const ApiErrors = {
  notFound: (message = "Not found") => new ApiError(404, "NOT_FOUND", message),
  badRequest: (message = "Bad request") => new ApiError(400, "BAD_REQUEST", message),
  conflict: (message = "Conflict") => new ApiError(409, "CONFLICT", message),
  unauthorized: (message = "Unauthorized") =>
    new ApiError(401, "UNAUTHORIZED", message),
  internal: (message = "Internal server error") =>
    new ApiError(500, "INTERNAL_ERROR", message),
};
