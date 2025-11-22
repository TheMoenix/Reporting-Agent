export const roundToTwo = (num: number): number => {
  return Math.round(num * 100) / 100;
};

export function groupBy(arr: any[], key: string): { [key: string]: any[] } {
  return arr.reduce((rv, x) => {
    try {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    } catch (error) {
      return [];
    }
  }, {});
}
