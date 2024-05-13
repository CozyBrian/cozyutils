import { help, usage } from "./constants";
import { anytoexport } from "./anytoexport";
import { svgtotsx } from "./svgtotsx";

const command = process.argv[2] || "";

async function main() {
  if (command.startsWith("-")) {
    switch (command) {
      case "-svg2tsx":
        return await svgtotsx();
      case "-img2export":
        return await anytoexport([".svg", ".jpg", ".jpeg", ".png", ".gif", ".webp"]);
      case "-help":
        console.write(help);
        break
      case "-h":
        console.write(help);
        break
      default:
        console.write("Invalid command\n");
        console.write(usage);
      }
  } else {
    console.write(usage);
    return 0;
  }
}

main();