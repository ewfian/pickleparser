import { NameRegistry } from '../src/nameRegistry';

describe('NameRegistry', () => {
    describe('#constructor', () => {
        it('can be constructed', () => {
            const registry = new NameRegistry();
            expect(registry).toBeDefined();
        });
    });

    describe('#register', () => {
        it('can be chained call', () => {
            const registry = new NameRegistry();
            expect(registry.register('module', 'name', () => 1)).toStrictEqual(registry);
        });

        it('throws exception if duplicated register', () => {
            const registry = new NameRegistry();
            registry.register('module', 'name', () => 1);
            expect(() => registry.register('module', 'name', () => 1)).toThrow(`'module.name' is already registered.`);
        });

        it('throws exception if duplicated register', () => {
            const registry = new NameRegistry();
            const n = () => 1;
            registry.register('module', 'name', n);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const internalMap: Map<string, unknown> = (registry as any)._registry;
            expect(internalMap.size).toEqual(1);
            expect(internalMap.get('module.name')).toStrictEqual(n);
        });
    });

    describe('#resolve', () => {
        it('returns PObject if not found', () => {
            const registry = new NameRegistry();
            const resolved = registry.resolve('module', 'name');
            expect(resolved.name).toEqual('PObject');
        });

        it('returns registed object', () => {
            class C {}
            const registry = new NameRegistry();
            registry.register('module', 'name', C);
            const resolved = registry.resolve('module', 'name');
            expect(resolved).toStrictEqual(C);
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
