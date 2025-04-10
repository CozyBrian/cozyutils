import { anytoexport } from "./anytoexport";
import { componentTemplate, makeComponentName, readdirAndSort } from "./utils";
import { mkdir, rename } from "node:fs/promises";

export async function svgtotsx() {
  const DIRECTORY = process.argv[3] || ".";

  let files = await readdirAndSort(DIRECTORY, [".svg"]);

  for (const filename of files) {
    const file = Bun.file(`${DIRECTORY}/${filename}`);
    let content = await file.text();

    const [filenameNoExt] = filename.split(".");
    const componentName = makeComponentName(filenameNoExt);

    const regex = /(\w+)-(\w+)/g;

    content = content.replace(regex, (match, p1, p2) => {
        return `${p1}${p2.charAt(0).toUpperCase() + p2.slice(1)}`;
    });

    content = content.replace(/fill="(?!none)(\w+)"/g, 'fill="currentColor"');
    content = content.replace(/stroke="#(\w+)"/g, 'stroke="currentColor"');
    content = content.replace(/stroke="(\w+)"/g, 'stroke="currentColor"');
    content = content.replace('xmlns="http://www.w3.org/2000/svg"', 'xmlns="http://www.w3.org/2000/svg" {...props}');

    const ComponentContent = componentTemplate(componentName, content);

    const path = `${DIRECTORY}/${componentName}.tsx`;
  
    const fileExists = await Bun.file(path).exists();
    if (fileExists) {
      console.write(`File ${componentName}.tsx already exists. Skipping...\n`);
      continue;
    }
    
    await Bun.write(path, ComponentContent);
    
    // Move the original SVG file to a new location
    const newSvgPath = `${DIRECTORY}/original/${filename}`;
    const oldSvgPath = `${DIRECTORY}/${filename}`;
    
    // Create the 'original' directory if it doesn't exist
    await mkdir(`${DIRECTORY}/original`, { recursive: true });
    
    // Move file
    await rename(oldSvgPath, newSvgPath);
  }

  await anytoexport(['.tsx'])
  console.write("Done!");
}
