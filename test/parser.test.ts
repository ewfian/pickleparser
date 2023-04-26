import { OP } from '../src/opcode';
import { Parser, ParserOptions } from '../src/parser';
import { BufferReader } from '../src/reader';

describe('Parser', () => {
    describe('#constructor', () => {
        it('can be constructed', () => {
            const parser = new Parser();
            expect(parser).toBeDefined();
        });

        it('has correct defalut options', () => {
            const parser = new Parser();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const options: ParserOptions = (parser as any)._options;
            expect(options.unpicklingTypeOfSet).toEqual('array');
            expect(options.unpicklingTypeOfDictionary).toEqual('object');

            const [module, name] = ['myModule', 'myName'];
            const pobj = options.nameResolver.resolve(module, name);
            expect(pobj.prototype).toHaveProperty('__module__', module);
            expect(pobj.prototype).toHaveProperty('__name__', name);
            expect(pobj.name).toEqual('PObject');

            const pid = '5';
            expect(() => options.persistentResolver.resolve(pid)).toThrow(`Unregistered persistent id: \`${pid}\`.`);

            const extCode = 3;
            expect(() => options.extensionResolver.resolve(extCode)).toThrow(
                `Unregistered extension code: \`${extCode.toString(16)}\`.`,
            );
        });

        it('correctly load Resolvers', () => {
            const parser = new Parser({
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const options: ParserOptions = (parser as any)._options;

            const [module, name] = ['myModule', 'myName'];
            expect((options.nameResolver.resolve(module, name) as () => [string, string])()).toEqual([module, name]);

            const pid = '5';
            expect(options.persistentResolver.resolve(pid)).toEqual(pid);

            const extCode = 3;
            expect(options.extensionResolver.resolve(extCode)).toEqual(extCode);
        });

        it('correctly load options', () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const parser = new Parser({
                unpicklingTypeOfSet: 'Set',
                unpicklingTypeOfDictionary: 'Map',
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const options: ParserOptions = (parser as any)._options;
            expect(options.unpicklingTypeOfSet).toEqual('Set');
            expect(options.unpicklingTypeOfDictionary).toEqual('Map');
        });
    });

    describe('#read', () => {
        it('correctly read data', () => {
            const parser = new Parser();
            const pkl = new Uint8Array([OP.PROTO, 4, OP.BININT1, 3, OP.STOP]);
            const reader = new BufferReader(pkl);
            expect(parser.read(reader)).toEqual(3);
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
