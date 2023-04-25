import { DictionaryProviderFactory } from '../src/dictionaryProvider';

describe('DictionaryProviderFactory', () => {
    describe('#constructor', () => {
        it('can be returned', () => {
            const provider = DictionaryProviderFactory('Map');
            expect(provider).toBeDefined();
        });

        it('can be correctly provider', () => {
            const provider = DictionaryProviderFactory('object');
            expect(provider.create()).toEqual({});
        });

        it('throws error if the type out of bound', () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const type: any = 'xx';
            expect(() => DictionaryProviderFactory(type)).toThrow(`Unknown unpickling type [${type}] of Dictionary.`);
        });
    });
});

describe('ObjectDictionaryProvider', () => {
    describe('#create', () => {
        it('correct created', () => {
            const provider = DictionaryProviderFactory('object');
            expect(provider.create()).toEqual({});
        });
    });

    describe('#setMethod', () => {
        it.each([
            [[13, 6], { '13': 6 }],
            [['str', 7], { str: 7 }],
            [['__', 'test'], { __: 'test' }],
        ])('can be create (kv: %s => dict: %s)', ([key, value], expected) => {
            const provider = DictionaryProviderFactory('object');
            const dict = provider.create();
            provider.setMethod(dict, key, value);
            expect(dict).toStrictEqual(expected);
        });
    });
});

describe('StdandardDictionaryProvider', () => {
    describe('#create', () => {
        it('correct created', () => {
            const provider = DictionaryProviderFactory('Map');
            expect(provider.create()).toEqual(new Map());
        });
    });

    describe('#setMethod', () => {
        it.each([
            [[13, 6], new Map([[13, 6]])],
            [['str', 7], new Map([['str', 7]])],
            [['__', 'test'], new Map([['__', 'test']])],
        ])('can be create (kv: %s => dict: %s)', ([key, value], expected) => {
            const provider = DictionaryProviderFactory('Map');
            const dict = provider.create();
            provider.setMethod(dict, key, value);
            expect(dict).toStrictEqual(expected);
        });
    });
});
