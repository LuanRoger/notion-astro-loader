import { addCaptionToHast } from './caption';
import { h, notionPrefixFactory } from '../utils';

import { BlockType, Context } from '../types';

const handler = (context: Context, block: any) => {
  const data = block[BlockType.bookmark];
  const { url, caption } = data;

  const blockClass = notionPrefixFactory(context)(BlockType.bookmark);

  const hast = h('div', { className: [blockClass] }, [h('a', { href: url }, [h('text', url)])]);
  addCaptionToHast(context, hast, caption);

  return hast;
};

export default handler;
