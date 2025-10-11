import { h } from '../utils';

import { BlockType, Context } from '../types';

const handler = (context: Context, block: any) => {
  const data = block[BlockType.equation];

  const hast = h('section', { className: ['math', 'math-display'] }, [h('text', data.expression)]);

  return hast;
};

export default handler;
