import type { Client } from "@notionhq/client";
import type { AstroIntegrationLogger } from "astro";
import type { ParseDataOptions } from "astro/loaders";
import * as fse from "fs-extra";
import { dim } from "kleur/colors";

import { fileToUrl } from "../format";
import { saveImageFromAWS, transformImagePathForCover } from "../image";
import type {
  FileObject,
  NotionPageData,
  PageObjectResponse,
  RenderedNotionEntry,
} from "../types/index";
import { awaitAll } from "../utils/promise";
import type { buildProcessor } from "./factory";
import { listBlocks } from "../blocks";

export class NotionPageRenderer {
  private readonly imagePaths: string[] = [];
  private readonly imageAnalytics: Record<"download" | "cached", number> = {
    download: 0,
    cached: 0,
  };
  private readonly logger: AstroIntegrationLogger;
  private readonly client: Client;
  private readonly page: PageObjectResponse;
  public readonly imageSavePath: string;

  /**
   * @param client Notion API client.
   * @param page Notion page object including page ID and properties. Does not include blocks.
   * @param parentLogger Logger to use for logging messages.
   */
  constructor(
    client: Client,
    page: PageObjectResponse,
    imageSavePath: string,
    logger: AstroIntegrationLogger
  ) {
    this.logger = logger.fork(`${logger.label}/render`);
    this.client = client;
    this.page = page;
    this.imageSavePath = imageSavePath;
  }

  /**
   * Return page properties for Astro to use.
   */
  async getPageData(
    transformCoverImage = false,
    rootAlias = "src"
  ): Promise<ParseDataOptions<NotionPageData>> {
    const { page } = this;
    let cover = page.cover;
    // transform cover image file
    if (cover && transformCoverImage && cover.type === "file") {
      const transformedUrl = `${rootAlias}/${transformImagePathForCover(
        await this.#fetchImage(cover)
      )}`;
      cover = {
        ...cover,
        file: {
          ...cover.file,
          url: transformedUrl,
        },
      };
    }
    return {
      id: page.id,
      data: {
        icon: page.icon,
        cover,
        archived: page.archived,
        in_trash: page.in_trash,
        url: page.url,
        public_url: page.public_url,
        properties: page.properties,
      },
    };
  }

  /**
   * Return rendered HTML for the page.
   * @param process Processor function to transform Notion blocks into HTML.
   * This is created once for all pages then shared.
   */
  async render(
    process: ReturnType<typeof buildProcessor>
  ): Promise<RenderedNotionEntry | undefined> {
    this.logger.debug("Rendering page");

    try {
      const blocks = await awaitAll(
        listBlocks(this.client, this.page.id, this.#fetchImage)
      );

      if (this.imageAnalytics.download > 0 || this.imageAnalytics.cached > 0) {
        this.logger.info(
          [
            `Found ${this.imageAnalytics.download} images to download`,
            this.imageAnalytics.cached > 0 &&
              dim(`${this.imageAnalytics.cached} already cached`),
          ].join(" ")
        );
      }

      const { vFile, headings } = await process(blocks, this.imagePaths);

      this.logger.debug("Rendered page");

      return {
        html: vFile.toString(),
        metadata: {
          headings,
          imagePaths: this.imagePaths,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to render: ${getErrorMessage(error)}`);
      return undefined;
    }
  }

  /**
   * Helper function to convert remote Notion images into local images in Astro.
   * Additionally saves the path in `this.#imagePaths`.
   * @param imageFileObject Notion file object representing an image.
   * @returns Local path to the image, or undefined if the image could not be fetched.
   */
  #fetchImage: (imageFileObject: FileObject) => Promise<string> = async (
    imageFileObject
  ) => {
    try {
      if (imageFileObject.type === "external") {
        return imageFileObject.external.url;
      }

      fse.ensureDirSync(this.imageSavePath);

      const imageUrl = await saveImageFromAWS(
        imageFileObject.file.url,
        this.imageSavePath,
        {
          log: (message) => {
            this.logger.debug(message);
          },
          tag: (type) => {
            this.imageAnalytics[type]++;
          },
        }
      );
      this.imagePaths.push(imageUrl);
      return imageUrl;
    } catch (error) {
      this.logger.error(`Failed to fetch image: ${getErrorMessage(error)}`);
      return fileToUrl(imageFileObject);
    }
  };
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  } else if (typeof error === "string") {
    return error;
  } else {
    return "Unknown error";
  }
}
