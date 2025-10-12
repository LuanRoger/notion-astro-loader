import { h, notionPrefixFactory } from '../utils';

import { BlockType, type Context } from '../types';

const handler = (context: Context, block: any) => {
  const data = block[BlockType.link_to_page];
  const id = data[data.type];

  const referredPage = (context.options.pageReference || {})[id];
  const linkName = referredPage?.title || id;
  const url = referredPage?.url;

  const blockClass = notionPrefixFactory(context)(BlockType.link_to_page);

  const hast = h('div', { className: [blockClass] }, [h('a', { href: url }, [h('text', linkName)])]);

  return hast;
};

export default handler;
