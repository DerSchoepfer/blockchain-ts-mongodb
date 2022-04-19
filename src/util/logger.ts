import { Logger } from "tslog";
const logger: Logger = new Logger({
  type: "pretty",
  minLevel: "info",
  exposeErrorCodeFrame: true,
  overwriteConsole: true,
  dateTimePattern: "year-month-day hour:minute:second.millisecond",
  dateTimeTimezone: "Europe/Berlin",
  displayDateTime: true,
  displayFunctionName: false,
  displayFilePath: "hidden",
});
export { logger };
