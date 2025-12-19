// FIX-008: Unified API response format
// Minden API endpoint ezt a formátumot használja

export type ApiSuccessResponse<T = unknown> = {
  success: true;
  data: T;
};

export type ApiErrorResponse = {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
};

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

// Standard error codes
export const ErrorCodes = {
  // Client errors (4xx)
  BAD_REQUEST: 'BAD_REQUEST',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  PAYLOAD_TOO_LARGE: 'PAYLOAD_TOO_LARGE',
  MISSING_PARAMETER: 'MISSING_PARAMETER',
  INVALID_POSTCODE: 'INVALID_POSTCODE',
  HONEYPOT_TRIGGERED: 'HONEYPOT_TRIGGERED',
  SUBMISSION_TOO_FAST: 'SUBMISSION_TOO_FAST',
  INVALID_ORIGIN: 'INVALID_ORIGIN',
  INVALID_CONTENT_TYPE: 'INVALID_CONTENT_TYPE',

  // Server errors (5xx)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  EMAIL_SEND_FAILED: 'EMAIL_SEND_FAILED',
  KV_ERROR: 'KV_ERROR',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

/**
 * Create a successful API response
 */
export function success<T>(data: T, headers?: Record<string, string>): Response {
  const body: ApiSuccessResponse<T> = {
    success: true,
    data,
  };

  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}

/**
 * Create an error API response
 */
export function error(
  code: ErrorCode,
  message: string,
  status: number = 400,
  details?: Record<string, unknown>,
  headers?: Record<string, string>
): Response {
  const body: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
  };

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}
