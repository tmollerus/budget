export const parseDate = (date: string): Date => {
  return new Date(Date.parse(date.replace('+00:00Z', '-05:00')));
};
