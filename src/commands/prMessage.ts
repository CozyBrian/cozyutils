import { parseArgs } from "../cli/args";

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
  error?: {
    message?: string;
  };
};

const DEFAULT_BASE_REF = "origin/dev";
const DEFAULT_MODEL = "gemini-3-flash-preview";
const BASE_REF_FALLBACKS = [
  "origin/main",
  "origin/master",
  "main",
  "master",
  "dev",
];

async function runGitCommand(args: string[], label: string): Promise<string> {
  const process = Bun.spawn({
    cmd: ["git", ...args],
    stdout: "pipe",
    stderr: "pipe",
  });

  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(process.stdout).text(),
    new Response(process.stderr).text(),
    process.exited,
  ]);

  if (exitCode !== 0) {
    const errorMessage = stderr.trim() || stdout.trim();
    const suffix = errorMessage ? `: ${errorMessage}` : "";
    throw new Error(`git ${label} failed${suffix}`);
  }

  return stdout.trimEnd();
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

async function generateGeminiText(
  apiKey: string,
  model: string,
  prompt: string
): Promise<string> {
  const url = new URL(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`
  );
  url.searchParams.set("key", apiKey);

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
      },
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Gemini API request failed: ${response.status} ${message}`);
  }

  const data = (await response.json()) as GeminiResponse;
  if (data.error?.message) {
    throw new Error(`Gemini API error: ${data.error.message}`);
  }

  const text = data.candidates
    ?.flatMap((candidate) => candidate.content?.parts ?? [])
    .map((part) => part.text ?? "")
    .join("")
    .trim();

  if (!text) {
    throw new Error("Gemini response was empty.");
  }

  return text;
}

export async function prMessage(args: string[]): Promise<void> {
  const { positional, options } = parseArgs(args);
  const baseRef = String(options.base ?? positional[0] ?? DEFAULT_BASE_REF);
  const outputPath = options.out ? String(options.out) : "";
  const model = String(options.model ?? DEFAULT_MODEL);

  if (options.help === true) {
    console.write(
      "Usage: -prmsg [--base=origin/dev] [--out=path] [--model=gemini-1.5-pro]\n"
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
    status = await runGitCommand(["status"], "status");
    log = await runGitCommand(
      ["log", "--oneline", `${resolvedBaseRef}..HEAD`],
      "log"
    );
    diffStat = await runGitCommand(
      ["diff", `${resolvedBaseRef}..HEAD`, "--stat"],
      "diff --stat"
    );
    diff = await runGitCommand(
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
    prMessageText = await generateGeminiText(apiKey, model, prompt);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.write(`${message}\n`);
    return;
  }

  if (outputPath) {
    await Bun.write(outputPath, `${prMessageText}\n`);
    console.write(`prMessage - Done! Wrote ${outputPath}\n`);
    return;
  }

  console.write(`${prMessageText}\n`);
}
