/**
 * Base class for all HTTP errors thrown in route handlers and middleware.
 * The global `errorHandler` catches these and maps them directly to the
 * corresponding HTTP response — no need to pass `res` through helpers.
 *
 * @example
 *   throw new HttpNotFoundError("Student not found");
 *   throw new HttpBadRequestError(z.treeifyError(parsed.error)); // structured body
 */
export class HttpCodeError extends Error {
  constructor(
    public readonly statusCode: number,
    /**
     * Value sent as the `error` field in the JSON response body.
     * May be a plain string or a structured object (e.g., Zod validation errors).
     */
    public readonly responseBody: unknown
  ) {
    super(typeof responseBody === "string" ? responseBody : "HTTP Error");
    this.name = "HttpCodeError";
  }
}

export class HttpBadRequestError extends HttpCodeError {
  constructor(responseBody: unknown = "Bad Request") {
    super(400, responseBody);
  }
}

export class HttpUnauthorizedError extends HttpCodeError {
  constructor(message = "Unauthorized") {
    super(401, message);
  }
}

export class HttpForbiddenError extends HttpCodeError {
  constructor(message = "Forbidden") {
    super(403, message);
  }
}

export class HttpNotFoundError extends HttpCodeError {
  constructor(message = "Not Found") {
    super(404, message);
  }
}

export class HttpConflictError extends HttpCodeError {
  constructor(message = "Conflict") {
    super(409, message);
  }
}

export class HttpPayloadTooLargeError extends HttpCodeError {
  constructor(message = "Payload Too Large") {
    super(413, message);
  }
}

export class HttpUnprocessableError extends HttpCodeError {
  constructor(message = "Unprocessable Entity") {
    super(422, message);
  }
}
