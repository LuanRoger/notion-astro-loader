import { getBlockHast } from './index';
import { h, notionPrefixFactory } from '../utils';

import { BlockType, type Context } from '../types';

const handler = (context: Context, block: any) => {
  const data = block[BlockType.column_list];
  const children = data.children || [];

  const blockClass = notionPrefixFactory(context)(BlockType.column_list);

  const hast = h('section', { className: [blockClass, `${blockClass}-${children.length}`] }, []);
  context.addTasks(children, (child) => (ctx) => {
    const childHast = getBlockHast(ctx, child);
    childHast && hast.children.push(childHast);
  });

  return hast;
};

export default handler;
