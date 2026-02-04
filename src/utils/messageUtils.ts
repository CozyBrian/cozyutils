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

const CLIPBOARD_COMMANDS: Array<{ cmd: string[]; label: string }> = [
  { cmd: ["pbcopy"], label: "pbcopy" },
  { cmd: ["wl-copy"], label: "wl-copy" },
  { cmd: ["xclip", "-selection", "clipboard"], label: "xclip" },
  { cmd: ["xsel", "--clipboard", "--input"], label: "xsel" },
  { cmd: ["clip"], label: "clip" },
];

export async function runGitCommand(
  args: string[],
  label: string
): Promise<string> {
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

export async function generateGeminiText(
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

export async function copyToClipboard(text: string): Promise<string> {
  for (const command of CLIPBOARD_COMMANDS) {
    try {
      const process = Bun.spawn({
        cmd: command.cmd,
        stdin: "pipe",
        stdout: "ignore",
        stderr: "ignore",
      });

      await process.stdin.write(text);
      await process.stdin.end();
      const exitCode = await process.exited;
      if (exitCode === 0) {
        return command.label;
      }
    } catch {
      // Ignore and try next clipboard option.
    }
  }

  throw new Error(
    "No clipboard command available. Install pbcopy, wl-copy, xclip, or xsel."
  );
}
