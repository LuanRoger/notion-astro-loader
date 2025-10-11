import { addTasksToAddRichTexts } from './rich-text';
import { addTasksToAddDirectChildren } from './children';
import { h, getColorClassName, hasChildren } from '../utils';

import { BlockType, Context } from '../types';

const handler = (context: Context, block: any) => {
  const data = block[BlockType.quote];

  const colorClassName = getColorClassName(data.color);
  const className = colorClassName ? [colorClassName] : undefined;

  const hast = h('blockquote', { className }, []);

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
