import { anyToExport } from "../commands/anyToExport";
import { commitMessage } from "../commands/commitMessage";
import { prMessage } from "../commands/prMessage";
import { svgToTsx } from "../commands/svgToTsx";

import type { Command } from "./types";

export const commands: Command[] = [
  {
    flag: "-cmsg",
    args: "[--out=path] [--model=gemini-3-flash-preview] [--clipboard] [--clipboard-only] [--commit]",
    description: "Generate a commit message from staged changes via Gemini",
    run: (args) => commitMessage(args),
  },
  {
    flag: "-svg2tsx",
    args: "<directory> [--ext=.svg] [--dry-run] [--force] [--no-move]",
    description: "Convert SVG files in a directory to React components",
    run: (args) => svgToTsx(args),
  },
  {
    flag: "-img2export",
    args: "<directory> <output_file> [--ext=.svg,.png] [--dry-run]",
    description: "Export image files in a directory as named exports",
    run: (args) =>
      anyToExport(
        [".svg", ".jpg", ".jpeg", ".png", ".gif", ".webp", ".tsx"],
        args
      ),
  },
  {
    flag: "-prmsg",
    args: "[--base=origin/dev] [--out=path] [--model=gemini-1.5-pro] [--clipboard] [--clipboard - only]",
    description: "Generate a PR message from git diffs via Gemini",
    run: (args) => prMessage(args),
  },
];
