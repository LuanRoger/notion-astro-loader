import { addTasksToAddDirectChildren } from './children';
import { h, notionPrefixFactory } from '../utils';

import { BlockType, Context } from '../types';

const handler = (context: Context, block: any) => {
  const data = block[BlockType.column];

  const blockClass = notionPrefixFactory(context)(BlockType.column);

  const hast = h('section', { className: [blockClass] }, []);
  addTasksToAddDirectChildren(context, hast, data.children);

  return hast;
};

export default handler;
