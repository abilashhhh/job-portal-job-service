import DataUriParser from "datauri/parser.js";
import path from "path";
const getBuffer = (flle: any) => {
  const parser = new DataUriParser();
  const extName = path.extname(flle.originalname).toString();
  return parser.format(extName, flle.buffer);
};

export default getBuffer;
