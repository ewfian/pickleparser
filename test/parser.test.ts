import { OP } from '../src/opcode';
import { Parser } from '../src/parser';

describe('Parser', () => {
    describe('#constructor', () => {
        it('can be constructed', () => {
            const parser = new Parser();
            expect(() => parser).toBeDefined();
        });

        it('has correctly defalut options', () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const parser: any = new Parser();
            expect(parser._options.unpicklingTypeOfSet).toEqual('array');
            expect(parser._options.unpicklingTypeOfDictionary).toEqual('object');

            const [module, name] = ['myModule', 'myName'];
            const pobj = parser._options.nameResolver.resolve(module, name);
            expect(pobj.prototype).toHaveProperty('__module__', module);
            expect(pobj.prototype).toHaveProperty('__name__', name);

            const pid = 5;
            expect(() => parser._options.persistentResolver.resolve(pid)).toThrow(
                `Unregistered persistent id: \`${pid}\`.`,
            );

            const extCode = 3;
            expect(() => parser._options.extensionResolver.resolve(extCode)).toThrow(
                `Unregistered extension code: \`${extCode.toString(16)}\`.`,
            );
        });

        it('correctly load Resolvers', () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const parser: any = new Parser({
                nameResolver: {
                    resolve(module, name) {
                        return () => [module, name];
                    },
                },
                extensionResolver: {
                    resolve(extCode) {
                        return extCode;
                    },
                },
                persistentResolver: {
                    resolve(pid) {
                        return pid;
                    },
                },
            });

            const [module, name] = ['myModule', 'myName'];
            expect(parser._options.nameResolver.resolve(module, name)()).toEqual([module, name]);

            const pid = 5;
            expect(parser._options.persistentResolver.resolve(pid)).toEqual(pid);

            const extCode = 3;
            expect(parser._options.extensionResolver.resolve(extCode)).toEqual(extCode);
        });

        it('correctly load options', () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const parser: any = new Parser({
                unpicklingTypeOfSet: 'Set',
                unpicklingTypeOfDictionary: 'Map',
            });
            expect(parser._options.unpicklingTypeOfSet).toEqual('Set');
            expect(parser._options.unpicklingTypeOfDictionary).toEqual('Map');
        });
    });

    describe('#parse', () => {
        it('throws an error if the input buffer is empty', () => {
            const parser = new Parser();
            expect(() => parser.parse(new Uint8Array())).toThrow('Unexpected end of file.');
        });

        it('correctly parse data', () => {
            const parser = new Parser();
            const pkl = new Uint8Array([OP.PROTO, 4, OP.BININT1, 3, OP.STOP]);
            expect(parser.parse(pkl)).toEqual(3);
        });
    });
});
