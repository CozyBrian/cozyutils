import { commands } from "./cli/commands";
import { help, usage } from "./cli/usage";

async function main(): Promise<void> {
  const [commandFlag, ...args] = process.argv.slice(2);
  const command = commandFlag || "";

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
