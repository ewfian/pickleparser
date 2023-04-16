import { OP } from '../src/opcode';
import { Parser } from '../src/parser';

describe('Parser', () => {
    describe('#load', () => {
        it('throws an error if the input buffer is empty', () => {
            const parser = new Parser(new Uint8Array());
            expect(() => parser.load()).toThrow('Unexpected end of file.');
        });

        it('correctly load data', () => {
            const parser = new Parser(new Uint8Array([OP.PROTO, 4, OP.BININT1, 3, OP.STOP]));
            expect(parser.load()).toEqual(3);
        });
    });
});
