import path from "path";
import fs from "fs";

export class logger {
  static write(filename: string, content: string) {
    const logFilePath = path.join(__dirname, "../logs/" + filename + ".log");
    fs.appendFileSync(logFilePath, content, { encoding: "utf8" });
  }

  static getContentErrorMessage(error: any) {
    const detailedError = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: (error as any).code || "UNKNOWN_ERROR",
    };

    return (
      "------------------------------------" +
      detailedError.name +
      "------------------------------------\n" +
      detailedError.message +
      "\n" +
      detailedError.stack +
      "\n------------------------------------------------------------------------"
    );
  }
}
