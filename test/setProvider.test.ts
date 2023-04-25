import { SetProviderFactory } from '../src/setProvider';

describe('SetProviderFactory', () => {
    describe('#constructor', () => {
        it('can be returned', () => {
            const provider = SetProviderFactory('Set');
            expect(provider).toBeDefined();
        });

        it('can be correctly provider', () => {
            const provider = SetProviderFactory('array');
            expect(provider.create()).toEqual([]);
        });

        it('throws error if the type out of bound', () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const type: any = 'xx';
            expect(() => SetProviderFactory(type)).toThrow(`Unknown unpickling type [${type}] of Set.`);
        });
    });
});

describe('ArraySetProvider', () => {
    describe('#create', () => {
        it('correct created', () => {
            const provider = SetProviderFactory('array');
            expect(provider.create()).toEqual([]);
        });
    });

    describe('#createWithItems', () => {
        it('correct created', () => {
            const provider = SetProviderFactory('array');
            const items = [13, 6, 4];
            expect(provider.createWithItems(items)).toEqual([...items]);
        });
    });

    describe('#createWithItems', () => {
        it('can be create', () => {
            const provider = SetProviderFactory('array');
            const items = [13, 6, 4];
            const array = provider.createWithItems(items);
            const values = 7;
            provider.addMethod(array, 7);
            expect(array).toEqual([...items, values]);
        });
    });
});

describe('StdandardSetProvider', () => {
    describe('#create', () => {
        it('correct created', () => {
            const provider = SetProviderFactory('Set');
            expect(provider.create()).toEqual(new Set());
        });
    });

    describe('#createWithItems', () => {
        it('correct created', () => {
            const provider = SetProviderFactory('Set');
            const items = [13, 6, 4];
            expect(provider.createWithItems(items)).toEqual(new Set(items));
        });
    });

    describe('#createWithItems', () => {
        it('can be create', () => {
            const provider = SetProviderFactory('Set');
            const items = [13, 6, 4];
            const array = provider.createWithItems(items);
            const values = 7;
            provider.addMethod(array, 7);
            expect(array).toEqual(new Set([...items, values]));
        });
    });
});
