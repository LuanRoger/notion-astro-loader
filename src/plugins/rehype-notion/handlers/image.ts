import { addCaptionToHast } from './caption';
import { h, getNotionFileUrlAndAttr, notionPrefixFactory } from '../utils';

import { BlockType, type Context } from '../types';

const handler = (context: Context, block: any) => {
  const data = block[BlockType.image];
  const { url, attr: fileAttr } = getNotionFileUrlAndAttr(context, data);

  const blockClass = notionPrefixFactory(context)(BlockType.image);

  const hast = h('div', { className: [blockClass] }, [h('img', { src: url, ...fileAttr }, [])]);
  addCaptionToHast(context, hast, data.caption);

  return hast;
};

export default handler;
