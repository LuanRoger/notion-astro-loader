import { BlockType, type Context } from "../types";
import { getNotionFileUrlAndAttr, h, notionPrefixFactory } from "../utils";
import { addCaptionToHast } from "./caption";

const handler = (context: Context, block: any) => {
  const data = block[BlockType.image];
  const { url, attr: fileAttr } = getNotionFileUrlAndAttr(context, data);

  const blockClass = notionPrefixFactory(context)(BlockType.image);

  const hast = h("div", { className: [blockClass] }, [
    h("img", { src: url, ...fileAttr }, []),
  ]);
  addCaptionToHast(context, hast, data.caption);

  return hast;
};

export default handler;
