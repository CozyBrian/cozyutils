import { componentTemplate, makeComponentName, readdirAndSort } from "./utils";

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
  }
  console.write("Done!");
}
