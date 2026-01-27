import { readdir, stat } from "node:fs/promises";

export async function readDirAndSort(
  path: string,
  extFilter: string[] = []
): Promise<string[]> {
  try {
    const stats = await stat(path);
    if (!stats.isDirectory()) {
      console.write(`${path} is not a directory.\n`);
      return [];
    }
  } catch (error) {
    console.write(`Directory not found: ${path}\n`);
    return [];
  }

  let files = await readdir(path);

  if (extFilter.length > 0) {
    const normalized = extFilter
      .map((ext) => ext.trim())
      .filter((ext) => ext.length > 0)
      .map((ext) => (ext.startsWith(".") ? ext : `.${ext}`));

    files = files.filter((file) => {
      return normalized.some((ext) =>
        file.toLowerCase().endsWith(ext.toLowerCase())
      );
    });
  }

  files.sort();

  return files;
}

export function makeComponentName(filename: string): string {
  const sanitized = filename.replace(/\s/g, "");
  const fileSections = sanitized.split("-");
  return fileSections
    .map((section) => {
      return section.charAt(0).toUpperCase() + section.slice(1);
    })
    .join("");
}

export function componentTemplate(componentName: string, content: string): string {
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
  const hasProps = content.includes("{...props}");
  let formatted = content
    .replace(/\r\n/g, "\n")
    .replace(/^\s*\n/gm, "")
    .replace(/ +$/gm, "")
    .replace(/\{\.\.\.props\}/, "{...props}")
    .replace(/ {2,}/g, "  ")
    .replace(/;+\n/g, ";\n")
    .replace(/\n{2,}/g, "\n\n")
    .replace(/^\s+/gm, (match) => match.replace(/\t/g, "  "));

  if (!hasProps) {
    formatted = formatted.replace(/<svg([^>]*)>/, "<svg$1 {...props}>");
  }

  const lines = formatted.split("\n");
  const indented: string[] = [];
  let indentLevel = 0;

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith("</")) {
      indentLevel = Math.max(indentLevel - 1, 0);
    }

    indented.push("  ".repeat(indentLevel) + trimmedLine);

    if (trimmedLine.startsWith("<") && !trimmedLine.startsWith("</")) {
      if (!trimmedLine.includes("/>") && !trimmedLine.endsWith("?>")) {
        indentLevel++;
      }
    }
  }

  return indented.join("\n").trim() + "\n";
}
