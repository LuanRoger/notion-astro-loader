import type { Element, Text } from 'hast';

import handleParagraph from './paragraph';
import handleHeading from './heading';
import handleCallout from './callout';
import handleQuote from './quote';
import handleNormalList from './normal-list';
import handleTodoList from './to-do-list';
import handleToggle from './toggle';
import handleCode from './code';
import handleEmbed from './embed';
import handleImage from './image';
import handleVideo from './video';
import handleFile from './file';
import handleBookmark from './bookmark';
import handleEquation from './equation';
import handleDivider from './divider';
import handleColumnList from './column-list';
import handleColumn from './column';
import handleLinkPreview from './link-preview';
import handleLinkToPage from './link-to-page';
import handleSyncedBlock from './synced-block';
import handleTable from './table';

import { BlockType, type Context } from '../types';
import { addBlockIdToHast } from '../utils';

import handleFootnotes from './footnotes';
import { addTasksToAddDirectChildren } from './children';
export { handleFootnotes, addTasksToAddDirectChildren as addTasksToAddHastChildren };

const isHeadingBlock = (block: any) => block.type.startsWith('heading_');

const handlerByBlockType = {
  [BlockType.paragraph]: handleParagraph,
  [BlockType.heading]: handleHeading,
  [BlockType.callout]: handleCallout,
  [BlockType.quote]: handleQuote,
  [BlockType.bulleted_list]: handleNormalList,
  [BlockType.numbered_list]: handleNormalList,
  [BlockType.to_do_list]: handleTodoList,
  [BlockType.toggle]: handleToggle,
  [BlockType.code]: handleCode,
  [BlockType.embed]: handleEmbed,
  [BlockType.image]: handleImage,
  [BlockType.video]: handleVideo,
  [BlockType.file]: handleFile,
  [BlockType.bookmark]: handleBookmark,
  [BlockType.equation]: handleEquation,
  [BlockType.divider]: handleDivider,
  [BlockType.column_list]: handleColumnList,
  [BlockType.column]: handleColumn,
  [BlockType.link_preview]: handleLinkPreview,
  [BlockType.link_to_page]: handleLinkToPage,
  [BlockType.synced_block]: handleSyncedBlock,
  [BlockType.table]: handleTable,
};

export const getBlockHast = (context: Context, block: any): Element | Text | null => {
  const blockType: BlockType = isHeadingBlock(block) ? BlockType.heading : block.type;
  const handler = handlerByBlockType[blockType];

  if (!handler) {
    return null;
  }

  const hast = handler(context, block);
  addBlockIdToHast(context, block, hast);

  return hast;
};
