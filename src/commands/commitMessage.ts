import { parseArgs } from "../cli/args";
import {
  copyToClipboard,
  generateGeminiText,
  runGitCommand,
} from "../utils/messageUtils";

const DEFAULT_MODEL = "gemini-3-flash-preview";

type CommitParts = {
  subject: string;
  body: string;
};

function splitCommitMessage(text: string): CommitParts {
  const lines = text.trim().split(/\r?\n/);
  const subject = lines.shift()?.trim() ?? "";
  if (!subject) {
    return { subject: "", body: "" };
  }

  let bodyLines = lines;
  const blankIndex = bodyLines.findIndex((line) => line.trim() === "");
  if (blankIndex !== -1) {
    bodyLines = bodyLines.slice(blankIndex + 1);
  }

  return { subject, body: bodyLines.join("\n").trim() };
}

export async function commitMessage(args: string[]): Promise<void> {
  const { options } = parseArgs(args);
  const outputPath = options.out ? String(options.out) : "";
  const model = String(options.model ?? DEFAULT_MODEL);
  const shouldCommit = options.commit === true;
  const clipboardOnly = options["clipboard-only"] === true;
  const clipboard =
    clipboardOnly || options.clipboard === true || options.copy === true;

  if (options.help === true) {
    console.write(
      "Usage: -cmsg [--out=path] [--model=gemini-3-flash-preview] [--clipboard] [--clipboard-only] [--commit]\n"
    );
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.write("Missing GEMINI_API_KEY environment variable.\n");
    return;
  }

  let status = "";
  let diffStat = "";
  let diff = "";

  try {
    status = await runGitCommand(["status"], "status");
    diffStat = await runGitCommand(
      ["diff", "--cached", "--stat"],
      "diff --cached --stat"
    );
    diff = await runGitCommand(["diff", "--cached"], "diff --cached");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.write(`${message}\n`);
    return;
  }

  const prompt = [
    "Generate a Conventional Commit message from the staged git changes below.",
    "Output ONLY the commit message with no extra commentary.",
    "Format:",
    "- First line: conventional commit subject (e.g., feat:, fix:, chore:, docs:, refactor:, test:)",
    "- Blank line",
    "- 2 to 5 bullet points describing the changes",
    "Avoid quoting diffs verbatim unless needed for clarity.",
    "",
    "git status:",
    status || "(no output)",
    "",
    "git diff --cached --stat:",
    diffStat || "(no changes)",
    "",
    "git diff --cached:",
    diff || "(no changes)",
  ].join("\n");

  let commitMessageText = "";

  try {
    commitMessageText = await generateGeminiText(apiKey, model, prompt);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.write(`${message}\n`);
    return;
  }

  if (shouldCommit) {
    const { subject, body } = splitCommitMessage(commitMessageText);
    if (!subject) {
      console.write("Commit message subject was empty.\n");
      return;
    }
    try {
      const commitArgs = ["commit", "-m", subject];
      if (body) {
        commitArgs.push("-m", body);
      }
      await runGitCommand(commitArgs, "commit");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.write(`${message}\n`);
      return;
    }
  }

  if (outputPath && !clipboardOnly) {
    await Bun.write(outputPath, `${commitMessageText}\n`);
    if (clipboard) {
      try {
        await copyToClipboard(commitMessageText);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.write(`${message}\n`);
      }
    }
    return;
  }

  if (!clipboardOnly) {
    console.write(`${commitMessageText}\n`);
  }

  if (clipboard) {
    try {
      await copyToClipboard(commitMessageText);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.write(`${message}\n`);
    }
  }
}
