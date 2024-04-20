import "dayjs/locale/th";
import Dayjs from "dayjs";
import buddhistEra from "dayjs/plugin/buddhistEra";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

Dayjs.extend(buddhistEra);

export default class newAdapter extends AdapterDayjs {
  constructor({ locale, formats, instance }: any) {
    super({ locale, formats, instance });
  }
  formatByString = (date: any, format: string) => {
    let newFormat = format.replace(/\bYYYY\b/g, "BBBB");

    return this.dayjs(date).format(newFormat);
  };
}
