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
