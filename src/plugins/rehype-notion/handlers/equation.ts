import { h } from '../utils';

import { BlockType, type Context } from '../types';

const handler = (_context: Context, block: any) => {
  const data = block[BlockType.equation];

  const hast = h('section', { className: ['math', 'math-display'] }, [h('text', data.expression)]);

  return hast;
};

export default handler;
