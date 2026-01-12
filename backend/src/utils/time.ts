export const nowIso = () => new Date().toISOString();

export const durationMs = (start?: string, end?: string) => {
  if (!start) return 0;
  const startTs = Date.parse(start);
  const endTs = end ? Date.parse(end) : Date.now();
  return Math.max(endTs - startTs, 0);
};

