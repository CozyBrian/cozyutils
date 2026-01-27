type ParsedArgs = {
  positional: string[];
  options: Record<string, string | boolean>;
};

const BOOLEAN_FLAGS = new Set(["dry-run", "force", "no-move", "help"]);

export function parseArgs(args: string[]): ParsedArgs {
  const positional: string[] = [];
  const options: Record<string, string | boolean> = {};

  for (let index = 0; index < args.length; index++) {
    const arg = args[index];

    if (!arg.startsWith("--")) {
      positional.push(arg);
      continue;
    }

    const trimmed = arg.slice(2);
    const [key, inlineValue] = trimmed.split("=");

    if (inlineValue !== undefined) {
      options[key] = inlineValue;
      continue;
    }

    if (BOOLEAN_FLAGS.has(key)) {
      options[key] = true;
      continue;
    }

    const next = args[index + 1];
    if (next && !next.startsWith("--")) {
      options[key] = next;
      index += 1;
      continue;
    }

    options[key] = true;
  }

  return { positional, options };
}
