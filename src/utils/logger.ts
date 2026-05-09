export const logger = {
  error: (msg: string, err?: unknown) => console.error(`[kairos] ${msg}`, err ?? ''),
  info: (msg: string) => console.log(`[kairos] ${msg}`),
};
