import { readdir } from "node:fs/promises";

const DIRECTORY = process.argv[2] || ".";
const OUTPUT_FILE = process.argv[3] || "index.ts";

let files = await readdir(DIRECTORY);

files = files.filter((file) => {
  return file.includes(".svg") || file.includes(".png");
});
files.sort()

const componentNames = files.map((file) => {
  const [filename] = file.split(".");
  const fileSections = filename.split("-");
  return fileSections
    .map((section) => {
      return section.charAt(0).toUpperCase() + section.slice(1);
    })
    .join("");
});

let output = "";

files.forEach((file, i) => {
  const line = `export { default as ${componentNames[i]} } from "./${file}";\n`;
  output += line; 
});

const path = `${DIRECTORY}/${OUTPUT_FILE}`;
await Bun.write(path, output);

Bun.$`echo "Done!"`;