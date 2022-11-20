import { Region, Regions } from "@blueprintjs/table";
import { LedgerDataItem } from "../types";

export const getRegions = (ledgerData: Array<LedgerDataItem>): Array<Region> => {
  const regions: Array<Region> = [];
  let lowerBoundary: number | undefined;
  let upperBoundary: number | undefined;
  let currentMonth = 0;

  ledgerData.forEach((item: LedgerDataItem, index: number) => {
    const month = Number(item.settledDate.split('T')[0].split('-')[1]);

    if (month >= currentMonth) {
      if (index > 0) {
        upperBoundary = index - 1;
      }

      if (lowerBoundary && upperBoundary) {
        regions.push(Regions.row(lowerBoundary, upperBoundary));
        lowerBoundary = undefined;
        upperBoundary = undefined;
      }

      lowerBoundary = index;
      currentMonth++;
    }

    return 
  });

  regions.push(Regions.row(regions[regions.length - 1].rows?.[1]! + 1, ledgerData.length - 1));

  return regions;
}