/**
 * Base class for all HTTP errors thrown in route handlers and middleware.
 * The global `errorHandler` catches these and maps them directly to the
 * corresponding HTTP response — no need to pass `res` through helpers.
 *
 * @example
 *   throw new HttpNotFoundError("Student not found");
 *   throw new HttpBadRequestError(z.treeifyError(parsed.error)); // structured body
 */
export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    /**
     * Value sent as the `error` field in the JSON response body.
     * May be a plain string or a structured object (e.g., Zod validation errors).
     */
    public readonly responseBody: unknown
  ) {
    super(typeof responseBody === "string" ? responseBody : "HTTP Error");
    this.name = "HttpError";
  }
}

export class HttpBadRequestError extends HttpError {
  constructor(responseBody: unknown = "Bad Request") {
    super(400, responseBody);
  }
}

export class HttpUnauthorizedError extends HttpError {
  constructor(message = "Unauthorized") {
    super(401, message);
  }
}

export class HttpForbiddenError extends HttpError {
  constructor(message = "Forbidden") {
    super(403, message);
  }
}

export class HttpNotFoundError extends HttpError {
  constructor(message = "Not Found") {
    super(404, message);
  }
}

export class HttpConflictError extends HttpError {
  constructor(message = "Conflict") {
    super(409, message);
  }
}

export class HttpPayloadTooLargeError extends HttpError {
  constructor(message = "Payload Too Large") {
    super(413, message);
  }
}

export class HttpUnprocessableError extends HttpError {
  constructor(message = "Unprocessable Entity") {
    super(422, message);
  }
}
