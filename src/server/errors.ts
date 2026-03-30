export class AppError extends Error {
  statusCode: number;
  code: string;
  details?: Record<string, unknown>;

  constructor(
    message: string,
    options: {
      statusCode: number;
      code: string;
      details?: Record<string, unknown>;
      cause?: unknown;
    },
  ) {
    super(message, { cause: options.cause });
    this.name = "AppError";
    this.statusCode = options.statusCode;
    this.code = options.code;
    this.details = options.details;
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "La sesion no es valida.", details?: Record<string, unknown>) {
    super(message, {
      statusCode: 401,
      code: "AUTHENTICATION_REQUIRED",
      details,
    });
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "No tienes permisos para realizar esta accion.") {
    super(message, {
      statusCode: 403,
      code: "NOT_ALLOWED",
    });
    this.name = "AuthorizationError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, {
      statusCode: 400,
      code: "VALIDATION_ERROR",
      details,
    });
    this.name = "ValidationError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, {
      statusCode: 409,
      code: "CONFLICT",
      details,
    });
    this.name = "ConflictError";
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, {
      statusCode: 404,
      code: "NOT_FOUND",
      details,
    });
    this.name = "NotFoundError";
  }
}

export function getErrorResponse(error: unknown, fallbackMessage: string) {
  if (error instanceof AppError) {
    return {
      status: error.statusCode,
      body: {
        ok: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details ?? null,
        },
      },
    };
  }

  return {
    status: 500,
    body: {
      ok: false,
      error: {
        code: "INTERNAL_ERROR",
        message: fallbackMessage,
        details: null,
      },
    },
  };
}
