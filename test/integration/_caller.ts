import { spawn } from 'node:child_process';
import path from 'node:path';

export const PROTOCOLS = ['0', '1', '2', '3', '4', '5'] as const;
export type PROTOCOL = (typeof PROTOCOLS)[number];

const DefaultPythonPath = process.platform != 'win32' ? 'python3' : 'python';
export async function caller(file: string, func: string, protocol: PROTOCOL = '5') {
    const python = spawn(DefaultPythonPath, [path.join(__dirname, '_runner.py'), file, func, protocol]);

    return new Promise<Uint8Array>((resolve, reject) => {
        python.stdout.on('data', (data) => {
            resolve(data);
        });

        python.stderr.on('data', (data) => {
            reject(data.toString());
        });
    });
}

export async function pythonUnpickle(data: Uint8Array): Promise<string> {
    const python = spawn(DefaultPythonPath, [path.join(__dirname, '_unpickler.py')]);

    return new Promise<string>((resolve, reject) => {
        let stdout = '';
        let stderr = '';

        python.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        python.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        python.on('close', (code) => {
            if (code === 0) {
                resolve(stdout.trim());
            } else {
                reject(new Error(`Python unpickler exited with code ${code}: ${stderr}`));
            }
        });

        python.stdin.write(data);
        python.stdin.end();
    });
}
