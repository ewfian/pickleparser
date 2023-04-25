import { NameRegistry } from '../src/nameRegistry';

describe('NameRegistry', () => {
    describe('#constructor', () => {
        it('can be constructed', () => {
            const provider = new NameRegistry();
            expect(provider).toBeDefined();
        });
    });

    describe('#getFullyQualifiedName', () => {
        it.each([
            [['', ''], '.'],
            [['module', 'name'], 'module.name'],
            [['numpy', 'ndarray'], 'numpy.ndarray'],
        ])('can be create (kv: %s => dict: %s)', ([module, name], expected) => {
            expect(NameRegistry.getFullyQualifiedName(module, name)).toStrictEqual(expected);
        });
    });
});
