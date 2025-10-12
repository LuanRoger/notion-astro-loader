import { BlockType, type Context } from "../types";
import { h, notionPrefixFactory } from "../utils";
import { addTasksToAddDirectChildren } from "./children";

const handler = (context: Context, block: any) => {
  const data = block[BlockType.column];

  const blockClass = notionPrefixFactory(context)(BlockType.column);

  const hast = h("section", { className: [blockClass] }, []);
  addTasksToAddDirectChildren(context, hast, data.children);

  return hast;
};

export default handler;
