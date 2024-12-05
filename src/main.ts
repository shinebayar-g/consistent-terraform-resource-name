#!/usr/bin/env tsx
import { Command } from 'commander';
import * as fs from 'node:fs';
import * as process from 'node:process';
import * as readline from 'node:readline';
import { moveResources } from './moveResources';
import { fixResourceReferences } from './fixResourceReferences';

/**
 * Read the target file and write to a new file with all hyphens replaced with underscores.
 */
async function findResources(target: string, newModule?: string): Promise<Map<string, string>> {
    const readStream = fs.createReadStream(`${target}.tf`);
    const rl = readline.createInterface({
        input: readStream,
        crlfDelay: Number.POSITIVE_INFINITY,
    });
    const tempFileName = `${target}.temp.tf`;
    const writeStream = fs.createWriteStream(tempFileName);

    /**
     * List of resources and modules found in the target file, not modified.
     * <resource-name>: <resource_name>
     */
    const resources: Map<string, string> = new Map();

    let lastLine = '';
    for await (const l of rl) {
        const writeLine = moveResources(resources, l, newModule);
        if (writeLine !== '') {
            writeStream.write(`${writeLine}\n`);
        }
        if (lastLine === '}') {
            writeStream.write('\n');
        }
        lastLine = writeLine;
    }

    writeStream.end();

    /**
     * Only try to fix resource references if there are resources to move
     */
    const readStream2 = fs.createReadStream(tempFileName);
    const rl2 = readline.createInterface({
        input: readStream2,
        crlfDelay: Number.POSITIVE_INFINITY,
    });
    const fixedFileName = `${target}.fixed.tf`;
    const writeStream2 = fs.createWriteStream(fixedFileName);

    for await (const l of rl2) {
        let writeLine = l;
        for (const [from, to] of resources) {
            if (from !== to && writeLine.includes(from)) {
                writeLine = fixResourceReferences(writeLine);
            }
        }
        writeStream2.write(`${writeLine}\n`);
    }

    writeStream2.end();

    console.log('Saved to file:', fixedFileName);
    fs.rmSync(tempFileName);

    return resources;
}

/**
 * Usage: move-terraform-resources <target>.tf --from <module-name> --to <module-name>
 */
async function main() {
    const program = new Command();
    let targetFileName = '';
    program
        .name('move-terraform-resources')
        .argument('<target>', 'Target file to read and modify')
        .option('-m, --module <module-name>', 'Move resources to a new module')
        .action((target, options) => {
            const [filename, ext] = target.split('.');
            if (ext !== 'tf') {
                console.error('Invalid file extension');
                process.exit(1);
            }
            targetFileName = filename;
        })
        .version('0.3.1')
        .parse();
    const options = program.opts();
    const newModule = options.module;

    const resources = await findResources(targetFileName, newModule);

    const movedFileName = `${targetFileName}.moved.tf`;
    const moved = fs.createWriteStream(movedFileName);

    let counter = 0;
    for (const [from, to] of resources) {
        if (from !== to) {
            const writeLine = `moved {
  from = ${from}
  to   = ${to}
}`;
            moved.write(`${writeLine}\n`);

            if (counter < resources.size - 1) {
                moved.write('\n');
            }
            counter++;
        }
    }

    moved.end();

    console.log('Written to file:', movedFileName);
}

main();
