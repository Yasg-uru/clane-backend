export const toParam = (val: string | string[] | undefined): string | undefined => {
  if (typeof val === "string") return val;
  if (Array.isArray(val)) return val[0];
  return undefined;
};
