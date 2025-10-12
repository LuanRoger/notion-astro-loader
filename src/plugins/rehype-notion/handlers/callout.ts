import { addTasksToAddRichTexts } from "./rich-text";
import { addTasksToAddDirectChildren } from "./children";
import {
  h,
  getColorClassName,
  getNotionFileUrlAndAttr,
  notionPrefixFactory,
  hasChildren,
} from "../utils";

import { BlockType, type Context } from "../types";

const handler = (context: Context, block: any) => {
  const data = block[BlockType.callout];

  const blockClass = notionPrefixFactory(context)(BlockType.callout);

  const calloutIcon = h("div", { className: [`${blockClass}-icon`] }, []);

  if (data.icon.type === "emoji") {
    calloutIcon.children.push(h("text", data.icon.emoji));
  } else {
    const { url, attr: fileAttr } = getNotionFileUrlAndAttr(context, data.icon);
    calloutIcon.children.push(h("img", { src: url, ...fileAttr }, []));
  }

  const calloutContent = h("div", { className: [`${blockClass}-content`] }, []);

  addTasksToAddDirectChildren(context, calloutContent, data.children);
  addTasksToAddRichTexts({
    context,
    block,
    hast: calloutContent,
    richTexts: data.rich_text,
    wrapRichTexts: hasChildren(data),
  });

  const className = [blockClass];
  const colorClassName = getColorClassName(data.color);
  colorClassName && className.push(colorClassName);

  const hast = h("section", { className }, [calloutIcon, calloutContent]);

  return hast;
};

export default handler;
