export type CommandRunner = (args: string[]) => Promise<void> | void;

export type Command = {
  flag: string;
  args: string;
  description: string;
  run: CommandRunner;
};
