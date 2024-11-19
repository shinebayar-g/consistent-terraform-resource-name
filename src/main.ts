#!/usr/bin/env node
import { Command } from 'commander';
import * as fs from 'node:fs';
import * as process from 'node:process';
import * as readline from 'node:readline';

/**
 * Read the target file and write to a new file with all hyphens replaced with underscores.
 */
async function findResources(target: string, newModule?: string): Promise<Map<string, string>> {
    const readStream = fs.createReadStream(`${target}.tf`);
    const rl = readline.createInterface({
        input: readStream,
        crlfDelay: Infinity,
    });

    const newFileName = `${target}.underscored.tf`;
    const writeStream = fs.createWriteStream(newFileName);

    /**
     * List of resources and modules found in the target file, not modified.
     * <resource-name>: <resource_name>
     */
    const resources: Map<string, string> = new Map();

    for await (const l of rl) {
        let writeLine = l;
        if (
            (!l.startsWith('//') || !l.startsWith('#')) &&
            (l.includes('resource ') || l.includes('module '))
        ) {
            const from = l
                .replaceAll('resource ', '')
                .replaceAll('{', '')
                .trim()
                .replaceAll(' ', '.')
                .replaceAll('"', '');
            const to = newModule
                ? `module.${newModule}.` + from.replaceAll('-', '_')
                : from.replaceAll('-', '_');
            resources.set(from, to);
            // Replace all hyphens with underscores in the resource name
            writeLine = l.replaceAll('-', '_');
        }
        /**
         * Fix all references to the resource name if it's been renamed
         * Before: google_service_account.my-sa.member
         * After: google_service_account.my_sa.member
         */
        if (!writeLine.startsWith('source') && writeLine.includes('.')) {
            const parts = writeLine.split('.');
            for (let i = 0; i < parts.length; i++) {
                if (parts[i].includes('_')) {
                    if (parts[i + 1] && parts[i + 1].includes('-')) {
                        const newPart = parts[i + 1].replaceAll('-', '_');
                        parts[i + 1] = newPart;
                        i++;
                    }
                }
            }
            const updatedLine = parts.join('.');
            if (writeLine !== updatedLine) {
                /**
                 * TODO: Maybe print the diff in a git diff colored format
                 */
                console.log('Fixed resource references:');
                console.log('-', writeLine);
                console.log('+', updatedLine);
                writeLine = updatedLine;
            }
        }
        writeStream.write(writeLine + '\n');
    }

    writeStream.end();

    console.log('Written to file:', newFileName);

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
        .parse();
    const options = program.opts();
    const newModule = options['module'];

    const resources = await findResources(targetFileName, newModule);

    const movedFileName = `${targetFileName}.moved.tf`;
    const moved = fs.createWriteStream(movedFileName);

    for (const [from, to] of resources) {
        if (from !== to) {
            moved.write(`moved {
  from = ${from}
  to   = ${to}
}

`);
        }
    }

    moved.end();

    console.log('Written to file:', movedFileName);
}

main();
