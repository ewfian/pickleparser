import { OP } from '../src/opcode';
import { Parser } from '../src/parser';

describe('Parser', () => {
    describe('#load', () => {
        it('throws an error if the input buffer is empty', () => {
            const parser = new Parser();
            expect(() => parser.parse(new Uint8Array())).toThrow('Unexpected end of file.');
        });

        it('correctly load data', () => {
            const parser = new Parser();
            const pkl = new Uint8Array([OP.PROTO, 4, OP.BININT1, 3, OP.STOP]);
            expect(parser.parse(pkl)).toEqual(3);
        });
    });
});
