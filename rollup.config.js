import typescript from '@rollup/plugin-typescript';
import pkg from './package.json';

export default {
    input: 'src/index.ts',
    output: [{ file: pkg.main, name: pkg.name, format: 'umd', sourcemap: true }],
    plugins: [
        typescript({
            tsconfig: 'tsconfig.build.json',
        }),
    ],
};
