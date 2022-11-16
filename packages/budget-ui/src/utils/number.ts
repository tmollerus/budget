export const netValue = (amount: number, typeId: number): number => {
  return typeId === 1 ? amount : -amount;
};
