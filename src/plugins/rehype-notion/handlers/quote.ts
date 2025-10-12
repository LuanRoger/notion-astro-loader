import { BlockType, type Context } from "../types";
import { getColorClassName, h, hasChildren } from "../utils";
import { addTasksToAddDirectChildren } from "./children";
import { addTasksToAddRichTexts } from "./rich-text";

const handler = (context: Context, block: any) => {
  const data = block[BlockType.quote];

  const colorClassName = getColorClassName(data.color);
  const className = colorClassName ? [colorClassName] : undefined;

  const hast = h("blockquote", { className }, []);

  addTasksToAddDirectChildren(context, hast, data.children);
  addTasksToAddRichTexts({
    context,
    block,
    hast,
    richTexts: data.rich_text,
    wrapRichTexts: hasChildren(data),
  });

  return hast;
};

export default handler;
