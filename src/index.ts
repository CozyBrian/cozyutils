import { commands } from "./cli/commands";
import { help, usage } from "./cli/usage";
import { fileURLToPath } from "node:url";

async function main(): Promise<void> {
  const [commandFlag, ...args] = process.argv.slice(2);
  const command = commandFlag || "";

  if (command === "-v" || command === "--version") {
    const packageUrl = new URL("../package.json", import.meta.url);
    const packagePath = fileURLToPath(packageUrl);
    const packageJson = (await Bun.file(packagePath).json()) as {
      name?: string;
      version?: string;
    };
    const name = packageJson.name ?? "cozyutils";
    const version = packageJson.version ?? "unknown";
    console.write(`${name} ${version} (bun)\n`);
    return;
  }

  if (!command.startsWith("-")) {
    console.write(usage);
    return;
  }

  if (command === "-help" || command === "-h" || command === "--help") {
    console.write(help);
    return;
  }

  const commandConfig = commands.find((entry) => entry.flag === command);

  if (!commandConfig) {
    console.write("Invalid command\n");
    console.write(usage);
    return;
  }

  await commandConfig.run(args);
}

main();
