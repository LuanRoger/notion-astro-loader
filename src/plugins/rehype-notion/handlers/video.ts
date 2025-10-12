import { addCaptionToHast } from './caption';
import { getFileDetails, h, notionPrefixFactory } from '../utils';

import type { Context } from '../types';

const YOUTUBE_URL_REGEX =
  /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(?:-nocookie)?\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|live\/|v\/)?)([\w\-]+)(\S+)?$/;

const handler = (context: Context, block: any) => {
  const data = block[block.type];
  const { url, attr: fileAttr } = getFileDetails(context, data);

  const blockClass = notionPrefixFactory(context)(block.type);

  const youtubeMatch = data.type === 'file' ? null : YOUTUBE_URL_REGEX.exec(data.external.url);

  const video =
    youtubeMatch === null
      ? h('video', { src: url, controls: true, ...fileAttr }, [])
      : h('iframe', { src: `https://youtube.com/embed/${youtubeMatch[5]}`, ...fileAttr }, []);

  const hast = h('div', { className: [blockClass] }, [video]);
  addCaptionToHast(context, hast, data.caption);

  return hast;
};

export default handler;
