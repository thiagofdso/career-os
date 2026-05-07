export const parseTask = (t) => {
  if (!t) return t;
  return {
    ...t,
    needsApproval: t.needsApproval === 1,
    tags: t.tags ? JSON.parse(t.tags) : undefined,
    metadata: t.metadata ? JSON.parse(t.metadata) : undefined
  };
};
