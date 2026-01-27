import { mkdir, rename } from "node:fs/promises";

import { parseArgs } from "../cli/args";
import { componentTemplate, makeComponentName, readDirAndSort } from "../utils/fs";
import { anyToExport } from "./anyToExport";

export async function svgToTsx(args: string[]): Promise<void> {
  const { positional, options } = parseArgs(args);
  const directory = positional[0];
  const dryRun = options["dry-run"] === true;
  const force = options.force === true;
  const noMove = options["no-move"] === true;
  const customExtensions = options.ext ? String(options.ext) : "";

  if (options.help === true) {
    console.write(
      "Usage: -svg2tsx <directory> [--ext=.svg] [--dry-run] [--force] [--no-move]\n"
    );
    return;
  }

  if (!directory) {
    console.write("Missing required argument. Expected: <directory>\n");
    return;
  }

  const extList = customExtensions
    ? customExtensions.split(",").map((ext) => ext.trim())
    : [".svg"];

  const files = await readDirAndSort(directory, extList);

  if (files.length === 0) {
    console.write(`No matching files found in ${directory}\n`);
    return;
  }

  for (const filename of files) {
    const file = Bun.file(`${directory}/${filename}`);
    let content = await file.text();

    const [filenameNoExt] = filename.split(".");
    const componentName = makeComponentName(filenameNoExt);

    const dashedAttributeRegex = /(\w+)-(\w+)/g;

    content = content.replace(dashedAttributeRegex, (_, p1, p2) => {
      return `${p1}${p2.charAt(0).toUpperCase() + p2.slice(1)}`;
    });

    content = content.replace(
      /fill="(?!none)([^"\s]+)"/g,
      "fill=\"currentColor\""
    );
    content = content.replace(
      /stroke="#([^"\s]+)"/g,
      "stroke=\"currentColor\""
    );
    content = content.replace(
      /stroke="([^"\s]+)"/g,
      "stroke=\"currentColor\""
    );
    content = content.replace(/class="/g, "className=\"");
    content = content.replace(/clip-rule="/g, "clipRule=\"");
    content = content.replace(/fill-rule="/g, "fillRule=\"");
    content = content.replace(/stroke-linecap="/g, "strokeLinecap=\"");
    content = content.replace(/stroke-linejoin="/g, "strokeLinejoin=\"");
    content = content.replace(/stroke-width="/g, "strokeWidth=\"");
    const componentContent = componentTemplate(componentName, content);
    const path = `${directory}/${componentName}.tsx`;

    const fileExists = await Bun.file(path).exists();
    if (fileExists && !force) {
      console.write(`File ${componentName}.tsx already exists. Skipping...\n`);
      continue;
    }

    if (dryRun) {
      console.write(`svgToTsx - Dry run. Would write ${path}\n`);
      continue;
    }

    await Bun.write(path, componentContent);

    if (!noMove) {
      const newSvgPath = `${directory}/original/${filename}`;
      const oldSvgPath = `${directory}/${filename}`;

      await mkdir(`${directory}/original`, { recursive: true });
      await rename(oldSvgPath, newSvgPath);
    }
  }

  if (!dryRun) {
    await anyToExport([".tsx"], [directory, "index.ts"]);
  }

  console.write(`svgToTsx - Done! Processed ${files.length} file(s).\n`);
}
