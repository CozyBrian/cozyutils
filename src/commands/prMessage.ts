import { parseArgs } from "../cli/args";
import {
  copyToClipboard,
  generateGeminiText,
  runGitCommand,
} from "../utils/messageUtils";

const DEFAULT_BASE_REF = "origin/dev";
const DEFAULT_MODEL = "gemini-3-flash-preview";
const BASE_REF_FALLBACKS = [
  "origin/main",
  "origin/master",
  "main",
  "master",
  "dev",
];

function logRun(command: string): void {
  console.write(`Running '${command}'\n`);
}

async function checkGitRef(ref: string): Promise<boolean> {
  const process = Bun.spawn({
    cmd: ["git", "rev-parse", "--verify", ref],
    stdout: "ignore",
    stderr: "ignore",
  });

  const exitCode = await process.exited;
  return exitCode === 0;
}

async function resolveBaseRef(baseRef: string): Promise<string> {
  const isValid = await checkGitRef(baseRef);
  if (isValid) {
    return baseRef;
  }

  if (baseRef !== DEFAULT_BASE_REF) {
    throw new Error(
      `Base ref '${baseRef}' not found. Use --base to specify a valid ref.`
    );
  }

  for (const fallback of BASE_REF_FALLBACKS) {
    if (await checkGitRef(fallback)) {
      console.write(
        `Base ref '${baseRef}' not found. Falling back to '${fallback}'.\n`
      );
      return fallback;
    }
  }

  throw new Error(
    `Base ref '${baseRef}' not found. Run 'git fetch' or set --base to a valid ref.`
  );
}

async function runGitCommandWithLog(
  args: string[],
  label: string
): Promise<string> {
  logRun(`git ${args.join(" ")}`);
  return runGitCommand(args, label);
}

export async function prMessage(args: string[]): Promise<void> {
  const { positional, options } = parseArgs(args);
  const baseRef = String(options.base ?? positional[0] ?? DEFAULT_BASE_REF);
  const outputPath = options.out ? String(options.out) : "";
  const model = String(options.model ?? DEFAULT_MODEL);
  const clipboardOnly = options["clipboard-only"] === true;
  const clipboard =
    clipboardOnly || options.clipboard === true || options.copy === true;

  if (options.help === true) {
    console.write(
      "Usage: -prmsg [--base=origin/dev] [--out=path] [--model=gemini-3-flash-preview] [--clipboard] [--clipboard-only]\n"
    );
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.write("Missing GEMINI_API_KEY environment variable.\n");
    return;
  }

  let status = "";
  let log = "";
  let diffStat = "";
  let diff = "";
  let resolvedBaseRef = baseRef;

  try {
    resolvedBaseRef = await resolveBaseRef(baseRef);
    status = await runGitCommandWithLog(["status"], "status");
    log = await runGitCommandWithLog(
      ["log", "--oneline", `${resolvedBaseRef}..HEAD`],
      "log"
    );
    diffStat = await runGitCommandWithLog(
      ["diff", `${resolvedBaseRef}..HEAD`, "--stat"],
      "diff --stat"
    );
    diff = await runGitCommandWithLog(
      ["diff", `${resolvedBaseRef}..HEAD`],
      "diff"
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.write(`${message}\n`);
    return;
  }

  const prompt = [
    "Generate a PR description from the following git outputs.",
    "Return markdown formatted text suitable for a pull request description.",
    "Avoid quoting diffs verbatim unless needed for clarity.",
    "",
    "git status:",
    status || "(no output)",
    "",
    `git log --oneline ${resolvedBaseRef}..HEAD:`,
    log || "(no commits)",
    "",
    `git diff ${resolvedBaseRef}..HEAD --stat:`,
    diffStat || "(no changes)",
    "",
    `git diff ${resolvedBaseRef}..HEAD:`,
    diff || "(no changes)",
  ].join("\n");

  let prMessageText = "";

  try {
    logRun(`Generating (${model})`);
    prMessageText = await generateGeminiText(apiKey, model, prompt);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.write(`${message}\n`);
    return;
  }

  if (outputPath && !clipboardOnly) {
    await Bun.write(outputPath, `${prMessageText}\n`);
    console.write(`prMessage - Done! Wrote ${outputPath}\n`);
    if (clipboard) {
      try {
        const clipboardCommand = await copyToClipboard(prMessageText);
        console.write(`prMessage - Copied to clipboard (${clipboardCommand})\n`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.write(`${message}\n`);
      }
    }
    return;
  }

  if (!clipboardOnly) {
    console.write(`${prMessageText}\n`);
  }

  if (clipboard) {
    try {
      const clipboardCommand = await copyToClipboard(prMessageText);
      console.write(`prMessage - Copied to clipboard (${clipboardCommand})\n`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.write(`${message}\n`);
    }
  }
}
