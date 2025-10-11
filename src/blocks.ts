import {
  isFullBlock,
  iteratePaginatedAPI,
  type Client,
} from "@notionhq/client";
import { awaitAll } from "./utils/promise";
import type { FileObject } from "./types";

/**
 * Return a generator that yields all blocks in a Notion page, recursively.
 * @param blockId ID of block to get children for.
 * @param fetchImage Function that fetches an image and returns a local path.
 */
export async function* listBlocks(
  client: Client,
  blockId: string,
  fetchImage: (file: FileObject) => Promise<string>
) {
  for await (const block of iteratePaginatedAPI(client.blocks.children.list, {
    block_id: blockId,
  })) {
    if (!isFullBlock(block)) {
      continue;
    }

    if (block.has_children) {
      const children = await awaitAll(listBlocks(client, block.id, fetchImage));

      // Use type assertion or add children to the block safely
      // biome-ignore lint/suspicious/noExplicitAny: It can be any block type
      (block as any)[block.type].children = children;
    }

    if (block.type === "image") {
      const url = await fetchImage(block.image);
      yield {
        ...block,
        image: {
          type: block.image.type,
          [block.image.type]: url,
          caption: block.image.caption,
        },
      };
    } else {
      yield block;
    }
  }
}
