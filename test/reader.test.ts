import { BufferReader } from '../src/reader';

describe('BufferReader', () => {
    describe('#constructor', () => {
        it('can be constructed', () => {
            const buffer = new Uint8Array();
            const reader = new BufferReader(buffer);
            expect(reader).toBeDefined();
        });

        it('has correct property', () => {
            const buffer = new Uint8Array([1, 2]);
            const reader = new BufferReader(buffer);
            expect(reader.length).toEqual(2);
            expect(reader.position).toEqual(0);
        });
    });
});
