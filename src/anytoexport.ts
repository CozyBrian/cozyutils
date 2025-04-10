import { makeComponentName, readdirAndSort } from "./utils";

export async function anytoexport(extensions: string[]) {
  const DIRECTORY = process.argv[3] || ".";
  const OUTPUT_FILE = process.argv[4] || "index.ts";

  let files = await readdirAndSort(DIRECTORY, extensions);

  const componentNames = files.map((file) => {
    const [filename] = file.split(".");
    return makeComponentName(filename);
  });

  let output = "";

  files.forEach((file, i) => {
    let line = `export { default as ${componentNames[i]} } from "./${file}";\n`;
    if (output.includes(componentNames[i])) {
      line = `export { default as ${componentNames[i]}Icon } from "./${file}";\n`;
    }
    output += line; 
  });

  const path = `${DIRECTORY}/${OUTPUT_FILE}`;
  await Bun.write(path, output);
  console.write("anytoexport - Done! \n");
}