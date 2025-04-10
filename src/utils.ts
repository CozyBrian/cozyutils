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
  return formatSvgComponent(`
import React from "react";
  
function ${componentName}(props: React.JSX.IntrinsicElements["svg"]) {
  return (
    ${content}
  );
}

export default ${componentName};
`);
}

export function formatSvgComponent(content: string): string {
  // Basic clean-up rules
  const formatted = content
    .replace(/\r\n/g, '\n') // normalize line endings
    .replace(/^\s*\n/gm, '') // remove empty lines
    .replace(/ +$/gm, '') // remove trailing spaces
    .replace(/<svg([^>]*)>/, '<svg$1 {...props}>') // ensure props are spread correctly
    .replace(/\{\.\.\.props\}/, '{...props}') // clean up props spread
    .replace(/ {2,}/g, '  ') // collapse multiple spaces to 2 spaces
    .replace(/;+\n/g, ';\n') // remove duplicate semicolons
    .replace(/\n{2,}/g, '\n\n') // collapse multiple empty lines
    .replace(/^\s+/gm, (match) => match.replace(/\t/g, '  ')); // tabs to 2 spaces

  // Format JSX indentation manually
  const lines = formatted.split('\n');
  const indented: string[] = [];
  let indentLevel = 0;

  for (let line of lines) {
    const trimmedLine = line.trim();

    if (trimmedLine.includes('</svg>') || trimmedLine.includes('</g>') || trimmedLine.includes('</path>')) {
      indentLevel = Math.max(indentLevel - 1, 0);
    }

    indented.push('  '.repeat(indentLevel) + trimmedLine);

    if (
      (trimmedLine.includes('<svg') && !trimmedLine.includes('/>')) ||
      (trimmedLine.includes('<g') && !trimmedLine.includes('/>')) ||
      (trimmedLine.includes('<path') && !trimmedLine.includes('/>'))
    ) {
      indentLevel++;
    }
  }

  return indented.join('\n').trim() + '\n';
}