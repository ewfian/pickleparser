import { spawn } from 'node:child_process';
import path from 'node:path';
import { Parser } from '../../src/parser';

const DefaultPythonPath = process.platform != 'win32' ? 'python3' : 'python';
export async function caller(file: string, func: string) {
    const python = spawn(DefaultPythonPath, [path.join(__dirname, 'runner.py'), file, func]);

    return new Promise((resolve, reject) => {
        python.stdout.on('data', (data) => {
            const obj = new Parser().parse(data);
            resolve(obj);
        });

        python.stderr.on('data', (data) => {
            reject(data.toString());
        });
    });
}
