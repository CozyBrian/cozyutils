import { appendFile, readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

type ShellTarget = "zsh" | "bash" | "fish";

const shellArg = process.argv.find((arg) => arg.startsWith("--shell="));
const shellName = shellArg?.split("=")[1] as ShellTarget | undefined;
const shell = shellName ?? "zsh";

const exportString = "export PATH=\"$HOME/.cozyutils/bin:$PATH\"";

const shellConfigPaths: Record<ShellTarget, string> = {
  zsh: join(homedir(), ".zshrc"),
  bash: join(homedir(), ".bashrc"),
  fish: join(homedir(), ".config/fish/config.fish"),
};

const shellExports: Record<ShellTarget, string> = {
  zsh: exportString,
  bash: exportString,
  fish: "set -x PATH $HOME/.cozyutils/bin $PATH",
};

async function ensurePathExport(): Promise<void> {
  const shellConfigPath = shellConfigPaths[shell];
  const shellExport = shellExports[shell];

  try {
    const data = await readFile(shellConfigPath, "utf8");
    if (!data.includes(shellExport)) {
      await appendFile(shellConfigPath, `\n${shellExport}\n`);
      console.log(`Added cozyutils to PATH for ${shell}`);
      return;
    }

    console.log(`cozyutils already in PATH for ${shell}`);
  } catch (error) {
    console.error(`Error updating shell config (${shell}): ${error}`);
  }
}

ensurePathExport();
