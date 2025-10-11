import { handleFootnotes, addTasksToAddHastChildren } from './handlers/index';
import { h } from './utils';

import { Context, Options, Task } from './types';

export const notionToHast = (blocks: any[], options: Options) => {
  const tasks: Task[] = [];
  const footnotes: any[] = [];

  const { footnoteReference } = options;
  if (footnoteReference) {
    // shallow clone `footnoteReference`, to avoid problems when manipulating `footnoteReference` in place.
    const newReference: Options['footnoteReference'] = {};
    for (const key in footnoteReference) {
      newReference[key] = [...footnoteReference[key]];
    }
    options.footnoteReference = newReference;
  }

  const context: Context = {
    options,
    // @ts-ignore TS doesn't understand such an overload.
    addTasks: (taskOrArray, iterItem) => {
      if (typeof taskOrArray === 'function') {
        tasks.push(taskOrArray as Task);
        return;
      }
      if (!taskOrArray) {
        return;
      }
      for (let i = taskOrArray.length - 1; i > -1; i -= 1) {
        tasks.push(iterItem(taskOrArray[i], i));
      }
    },
    addFootnote: (footnote: any) => {
      return footnotes.push(footnote);
    },
  };

  const root = h(null, []);

  addTasksToAddHastChildren(context, root, blocks);

  while (tasks.length) {
    const curTask = tasks.pop()!;
    curTask(context);
  }

  if (footnotes.length > 0) {
    const footnoteHast = handleFootnotes(context, footnotes);
    root.children.push(footnoteHast);
  }

  return root;
};
