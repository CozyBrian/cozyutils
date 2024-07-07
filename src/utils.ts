import { file } from "bun";
import { readdir } from "node:fs/promises";

export async function readdirAndSort(path: string, extfilter: string[] = []): Promise<string[]> {
  let files = await readdir(path);

  files = files.filter((file) => {
    return extfilter.some((ext) => file.includes(ext));
  });

  files.sort()

  return files;
}

export function makeComponentName(filename: string): string {
  filename = filename.replace(/\s/g, "");
  const fileSections = filename.split("-");
  return fileSections
    .map((section) => {
      return section.charAt(0).toUpperCase() + section.slice(1);
    })
    .join("");
}

export function componentTemplate(componentName: string, content: string) {
  return `import React from "react";
  
function ${componentName}(props: JSX.IntrinsicElements["svg"]) {
  return (
    ${content}
  );
}

export default ${componentName};`;
}
