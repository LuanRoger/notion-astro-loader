import type { Element } from "hast";
import type { Context } from "../types";
import { addClassToHast, h, notionPrefixFactory } from "../utils";
import handleRichText from "./rich-text";

const handler = (context: Context, captionObjs: any[]) => {
  const captionClass = notionPrefixFactory(context)("caption");

  const hast = h("div", { className: [captionClass] }, []);

  context.addTasks(captionObjs, (richTextObj: any) => (ctx) => {
    hast.children.push(handleRichText(ctx, null, richTextObj));
  });

  return hast;
};

export const addCaptionToHast = (
  context: Context,
  hast: Element,
  captionObjs: any[] | undefined,
) => {
  if (!captionObjs || captionObjs.length < 1) {
    return;
  }

  const caption = handler(context, captionObjs);
  hast.children.push(caption);

  const CLS_WITH_CAPTION = "with-caption";
  addClassToHast(hast, CLS_WITH_CAPTION);
};

export default handler;
