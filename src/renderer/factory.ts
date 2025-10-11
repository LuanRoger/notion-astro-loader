import type {
  HtmlElementNode,
  ListNode,
  TextNode,
} from "@jsdevtools/rehype-toc";
import rehypeToc from "@jsdevtools/rehype-toc";
import type { MarkdownHeading } from "astro";
import notionRehype from "notion-rehype-k";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import { type Plugin, unified } from "unified";
import type { VFile } from "vfile";
import { rehypeImages } from "../plugins/rehype-images";

const baseProcessor = unified()
  .use(notionRehype, {})
  .use(rehypeSlug)
  .use(rehypeKatex)
  .use(rehypeStringify);

// biome-ignore lint/suspicious/noExplicitAny: It can be any rehype plugin
export type RehypePlugin = Plugin<any[], any>;

function extractTocHeadings(toc: HtmlElementNode): MarkdownHeading[] {
  const tocChildren = toc.children;
  if (toc.tagName !== "nav" || !tocChildren) {
    throw new Error(`Expected nav, got ${toc.tagName}`);
  }

  function listElementToTree(ol: ListNode, depth: number): MarkdownHeading[] {
    return ol.children.flatMap((li) => {
      const [_link, subList] = li.children;
      const link = _link as HtmlElementNode;
      if (
        !link.children ||
        link.children.length === 0 ||
        link.properties.href === undefined
      ) {
        return [];
      }

      const text = link.children[0] as TextNode;
      const propertiesHref = link.properties.href;

      const currentHeading: MarkdownHeading = {
        depth,
        text: text.value,
        slug: propertiesHref.slice(1),
      };

      let headings = [currentHeading];
      if (subList) {
        headings = headings.concat(
          listElementToTree(subList as ListNode, depth + 1),
        );
      }
      return headings;
    });
  }

  const [list] = tocChildren as [ListNode];
  return listElementToTree(list, 0);
}

function createProcessorWithPlugins(
  // biome-ignore lint/suspicious/noExplicitAny: It can be any rehype plugin
  rehypePlugins: ReadonlyArray<readonly [RehypePlugin, any]>,
  onTocExtracted: (headings: MarkdownHeading[]) => void,
) {
  const baseWithToc = baseProcessor.use(rehypeToc, {
    customizeTOC(toc) {
      const headings = extractTocHeadings(toc);
      onTocExtracted(headings);
      return false;
    },
  });

  return rehypePlugins.reduce(
    (processor, [plugin, options]) => processor.use(plugin, options),
    baseWithToc,
  );
}

async function processBlocks(
  // biome-ignore lint/suspicious/noExplicitAny: It can be any processor type
  processor: any,
  blocks: unknown[],
  imagePaths: string[],
) {
  const processorWithImages = processor().use(rehypeImages(), { imagePaths });

  const vFile = (await processorWithImages.process({
    data: blocks,
  } as Record<string, unknown>)) as VFile;

  return vFile;
}

export function buildProcessor(
  // biome-ignore lint/suspicious/noExplicitAny: It can be any rehype plugin
  rehypePlugins: Promise<ReadonlyArray<readonly [RehypePlugin, any]>>,
) {
  let headings: MarkdownHeading[] = [];

  const processorPromise = rehypePlugins.then((plugins) =>
    createProcessorWithPlugins(plugins, (extractedHeadings) => {
      headings = extractedHeadings;
    }),
  );

  return async function process(blocks: unknown[], imagePaths: string[]) {
    const processorFactory = await processorPromise;
    const vFile = await processBlocks(processorFactory, blocks, imagePaths);
    return { vFile, headings };
  };
}
