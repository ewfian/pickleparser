import * as entrypoint from '../src/index';

describe('entrypoint', () => {
    it('can be exported', () => {
        expect(entrypoint.BufferReader).toBeDefined();
        expect(entrypoint.NameRegistry).toBeDefined();
        expect(entrypoint.Parser).toBeDefined();
    });
});
