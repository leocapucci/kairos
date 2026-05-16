import { ApiError, NetworkError, TimeoutError } from '../services/api/http';

// ─── App-level error type ────────────────────────────────────────────────────

export type AppErrorCode =
  | 'NETWORK_ERROR'   // no connectivity
  | 'TIMEOUT'         // request exceeded 20s
  | 'NOT_FOUND'       // 404
  | 'UNAUTHORIZED'    // 401
  | 'SERVER_ERROR'    // 5xx
  | 'PARSE_ERROR'     // JSON decode failed
  | 'UNKNOWN';        // anything else

export class AppError extends Error {
  readonly name = 'AppError';
  readonly code: AppErrorCode;
  readonly statusCode?: number;
  readonly isRetryable: boolean;

  constructor(
    code: AppErrorCode,
    message: string,
    options?: { statusCode?: number; cause?: unknown },
  ) {
    super(message);
    this.code = code;
    this.statusCode = options?.statusCode;
    this.isRetryable = (
      code === 'NETWORK_ERROR' ||
      code === 'TIMEOUT' ||
      code === 'SERVER_ERROR'
    );
    if (options?.cause) (this as any).cause = options.cause;
  }
}

// ─── User-facing messages ────────────────────────────────────────────────────

const USER_MESSAGES: Record<AppErrorCode, string> = {
  NETWORK_ERROR: 'Sem conexão. Verifique sua internet.',
  TIMEOUT: 'Tempo de conexão esgotado. Tente novamente.',
  NOT_FOUND: 'Conteúdo não encontrado.',
  UNAUTHORIZED: 'Sessão expirada. Reinicie o app.',
  SERVER_ERROR: 'Erro no servidor. Tente novamente em breve.',
  PARSE_ERROR: 'Resposta inesperada do servidor.',
  UNKNOWN: 'Algo deu errado. Tente novamente.',
};

export function userMessage(err: unknown): string {
  if (err instanceof AppError) return USER_MESSAGES[err.code];
  return USER_MESSAGES.UNKNOWN;
}

// ─── Parsers ─────────────────────────────────────────────────────────────────

export function parseApiError(err: unknown): AppError {
  if (err instanceof AppError) return err;

  if (err instanceof TimeoutError) {
    return new AppError('TIMEOUT', USER_MESSAGES.TIMEOUT, { cause: err });
  }

  if (err instanceof NetworkError) {
    return new AppError('NETWORK_ERROR', USER_MESSAGES.NETWORK_ERROR, { cause: err });
  }

  if (err instanceof ApiError) {
    if (err.status === 404)
      return new AppError('NOT_FOUND', USER_MESSAGES.NOT_FOUND, { statusCode: 404, cause: err });
    if (err.status === 401)
      return new AppError('UNAUTHORIZED', USER_MESSAGES.UNAUTHORIZED, { statusCode: 401, cause: err });
    if (err.status >= 500)
      return new AppError('SERVER_ERROR', USER_MESSAGES.SERVER_ERROR, { statusCode: err.status, cause: err });
    return new AppError('SERVER_ERROR', USER_MESSAGES.SERVER_ERROR, { statusCode: err.status, cause: err });
  }

  if (err instanceof SyntaxError) {
    return new AppError('PARSE_ERROR', USER_MESSAGES.PARSE_ERROR, { cause: err });
  }

  return new AppError('UNKNOWN', USER_MESSAGES.UNKNOWN, { cause: err });
}

export function parseUnknownError(err: unknown): string {
  return userMessage(parseApiError(err));
}
