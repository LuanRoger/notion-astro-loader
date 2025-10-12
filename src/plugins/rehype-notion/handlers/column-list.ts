import { BlockType, type Context } from "../types";
import { h, notionPrefixFactory } from "../utils";
import { getBlockHast } from "./index";

const handler = (context: Context, block: any) => {
  const data = block[BlockType.column_list];
  const children = data.children || [];

  const blockClass = notionPrefixFactory(context)(BlockType.column_list);

  const hast = h(
    "section",
    { className: [blockClass, `${blockClass}-${children.length}`] },
    [],
  );
  context.addTasks(children, (child) => (ctx) => {
    const childHast = getBlockHast(ctx, child);
    childHast && hast.children.push(childHast);
  });

  return hast;
};

export default handler;
