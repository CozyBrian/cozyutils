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

Flags by command:
  -svg2tsx
    --ext=.svg          Override extensions to include
    --dry-run           Print planned changes only
    --force             Overwrite existing output files
    --no-move           Keep original SVGs in place
  -cmsg
    --out=path           Output commit message to a file
    --model=gemini-3-flash-preview Override Gemini model name
    --clipboard          Copy commit message to clipboard
    --clipboard-only     Only copy to clipboard (skip stdout/file)
    --commit             Run git commit with generated message
  -img2export
    --ext=.svg,.png     Override extensions to include
    --dry-run           Print planned changes only
  -prmsg
    --base=origin/dev    Base ref for PR message generation
    --out=path           Output PR message to a file
    --model=gemini-3-flash-preview Override Gemini model name
    --clipboard          Copy PR message to clipboard
    --clipboard-only     Only copy to clipboard (skip stdout/file)
  Global
    --help, -h          Show help
`;
