import { makeComponentName, readdirAndSort } from "./utils";

export async function svgtoexport() {
  const DIRECTORY = process.argv[3] || ".";
  const OUTPUT_FILE = process.argv[4] || "index.ts";

  let files = await readdirAndSort(DIRECTORY, [".svg"]);

  const componentNames = files.map((file) => {
    const [filename] = file.split(".");
    return makeComponentName(filename);
  });

  let output = "";

  files.forEach((file, i) => {
    const line = `export { default as ${componentNames[i]} } from "./${file}";\n`;
    output += line; 
  });

  const path = `${DIRECTORY}/${OUTPUT_FILE}`;
  await Bun.write(path, output);
  console.write("Done!");
}