import { parseArgs } from "../cli/args";
import { makeComponentName, readDirAndSort } from "../utils/fs";

export async function anyToExport(
  extensions: string[],
  args: string[]
): Promise<void> {
  const { positional, options } = parseArgs(args);
  const directory = positional[0];
  const outputFile = positional[1];
  const dryRun = options["dry-run"] === true;
  const customExtensions = options.ext ? String(options.ext) : "";

  if (options.help === true) {
    console.write(
      "Usage: -img2export <directory> <output_file> [--ext=.svg,.png] [--dry-run]\n"
    );
    return;
  }

  if (!directory || !outputFile) {
    console.write(
      "Missing required arguments. Expected: <directory> <output_file>\n"
    );
    return;
  }

  const extList = customExtensions
    ? customExtensions.split(",").map((ext) => ext.trim())
    : extensions;

  const files = await readDirAndSort(directory, extList);

  if (files.length === 0) {
    console.write(`No matching files found in ${directory}\n`);
    return;
  }

  const nameCounts = new Map<string, number>();
  const exportNames = files.map((file) => {
    const [filename] = file.split(".");
    const baseName = makeComponentName(filename);
    const count = nameCounts.get(baseName) ?? 0;
    nameCounts.set(baseName, count + 1);
    return count > 0 ? `${baseName}${count + 1}` : baseName;
  });

  const output = files
    .map((file, index) => {
      const exportName = exportNames[index];
      return `export { default as ${exportName} } from "./${file}";`;
    })
    .join("\n")
    .concat("\n");

  const path = `${directory}/${outputFile}`;
  if (dryRun) {
    console.write(`anyToExport - Dry run. Would write ${path}\n`);
    return;
  }

  await Bun.write(path, output);
  console.write(`anyToExport - Done! Wrote ${path}\n`);
}
