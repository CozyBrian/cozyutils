import { commands } from "./commands";

export const usage = `
Usage:
${commands
  .map((command) => `  ${command.flag} ${command.args}`)
  .join("\n")}
`;

export const help = `
Options:
${commands
  .map((command) => `  ${command.flag} ${command.args}  ${command.description}`)
  .join("\n")}

Flags:
  --ext=.svg,.png     Override extensions to include
  --dry-run           Print planned changes only
  --force             Overwrite existing output files
  --no-move           Keep original SVGs in place
  --base=origin/dev    Base ref for PR message generation
  --out=path           Output PR message to a file
  --model=gemini-1.5-pro Override Gemini model name
  --help, -h          Show help
`;
