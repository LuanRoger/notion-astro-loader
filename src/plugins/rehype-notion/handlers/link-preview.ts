import { h, notionPrefixFactory } from '../utils';

import { BlockType, type Context } from '../types';

const handler = (context: Context, block: any) => {
  const data = block[BlockType.link_preview];
  const { url } = data;

  const blockClass = notionPrefixFactory(context)(BlockType.link_preview);

  const hast = h('div', { className: [blockClass] }, [h('a', { href: url }, [h('text', url)])]);

  return hast;
};

export default handler;
