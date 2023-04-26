import { spawn } from 'node:child_process';
import path from 'node:path';

const DefaultPythonPath = process.platform != 'win32' ? 'python3' : 'python';
export async function caller(file: string, func: string) {
    const python = spawn(DefaultPythonPath, [path.join(__dirname, 'runner.py'), file, func]);

    return new Promise<Uint8Array>((resolve, reject) => {
        python.stdout.on('data', (data) => {
            resolve(data);
        });

        python.stderr.on('data', (data) => {
            reject(data.toString());
        });
    });
}
