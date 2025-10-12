import { BlockType, type Context } from "../types";
import { h } from "../utils";

const handler = (_context: Context, block: any) => {
  const data = block[BlockType.equation];

  const hast = h("section", { className: ["math", "math-display"] }, [
    h("text", data.expression),
  ]);

  return hast;
};

export default handler;
