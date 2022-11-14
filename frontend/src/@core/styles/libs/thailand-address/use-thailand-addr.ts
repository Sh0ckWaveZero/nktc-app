import { useCallback } from "react";
import staticAddrSource from "./static-addr-source";

type CompressedDataSourceItem = [string, [string, [string, number[]][]][]];
type CompressedDataSource = CompressedDataSourceItem[];
export type DataSourceItem = {
  /**
   * subdistrict
   */
  s: string;

  /**
   * district
   */
  d: string;
  /**
   * province
   */
  p: string;
  /**
   * postcode
   */
  po: string;
};
export const extractDataSource = (cds: CompressedDataSource): DataSourceItem[] => {
  const ds: DataSourceItem[] = [];
  cds.forEach((province) => {
    const provinceName = province[0];
    const districtList = province[1];
    districtList.forEach((district) => {
      const districtName = district[0];
      const subdistrictList = district[1];
      subdistrictList.forEach((subdistrict) => {
        const subdistrictName = subdistrict[0];
        const postcodeList = subdistrict[1];
        postcodeList.forEach((postcode) => {
          ds.push({
            d: districtName,
            p: provinceName,
            po: postcode + "",
            s: subdistrictName,
          });
        });
      });
    });
  });
  return ds;
};

export const searchDataSourceByField = (ds: DataSourceItem[], field: "po" | "p" | "d" | "s", input: string, max = 10) => {
  const result: DataSourceItem[] = [];
  for (const item of ds) {
    if (item[field].toLowerCase().includes(input.toLocaleLowerCase())) {
      result.push(item);
    }
    if (result.length >= max) {
      break;
    }
  }
  return result;
};

export function useThailandAddressDataSource(ds = extractDataSource(staticAddrSource)) {
  const searchByField = useCallback(
    (field: "po" | "p" | "d" | "s", input: string) => {
      return searchDataSourceByField(ds, field, input);
    },
    [ds]
  );
  return {
    searchByField,
  };
}
