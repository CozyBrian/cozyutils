// IDK HOW SAFE THIS IS BUT YEAH
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

const shellConfigPath = path.join(os.homedir(), '.zshrc');
const exportString = 'export PATH="$HOME/.cozyutils/bin:$PATH"';

fs.readFile(shellConfigPath, 'utf8', (err, data) => {
    if (err) {
        console.error(`Error reading file from disk: ${err}`);
    } else {
        if (!data.includes(exportString)) {
            fs.appendFile(shellConfigPath, `\n${exportString}`, (err) => {
                if (err) console.error(`Error appending to file: ${err}`);
            });
            console.log('Added cozyutils to PATH');
        } else {
            console.log('cozyutils already in PATH');
        }
    }
});