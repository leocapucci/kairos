function serialize(data: unknown): string {
  if (data === null || data === undefined) return '';
  if (data instanceof Error) {
    return `${data.message}${data.stack ? ` | ${data.stack.split('\n')[1]?.trim()}` : ''}`;
  }
  if (typeof data === 'string') return data;
  try { return JSON.stringify(data); } catch { return String(data); }
}

export const logger = {
  error: (msg: string, data?: unknown) => {
    console.error(`[kairos][ERROR] ${msg}`, data !== undefined ? serialize(data) : '');
  },
  warn: (msg: string, data?: unknown) => {
    console.warn(`[kairos][WARN] ${msg}`, data !== undefined ? serialize(data) : '');
  },
  info: (msg: string, data?: unknown) => {
    if (__DEV__) {
      console.log(`[kairos][INFO] ${msg}`, data !== undefined ? serialize(data) : '');
    }
  },
};
