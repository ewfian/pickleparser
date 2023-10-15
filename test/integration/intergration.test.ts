import { Parser } from '../../src/parser';
import { basic } from './basic';
import { PROTOCOL, PROTOCOLS, caller } from './_caller';
import { NameRegistry } from '../../src/nameRegistry';

describe('basic with version', () => {
    it.each(
        Object.keys(basic).reduce((a: Array<[string, PROTOCOL]>, c) => {
            PROTOCOLS.forEach((p) => {
                a.push([c, p]);
            });
            return a;
        }, []),
    )('correctly unpickled (%s) with protocol %s', async (func, protocol) => {
        const data = await caller('basic', func, protocol);
        const expected = basic[func]();
        const obj = new Parser().parse(data);
        expect(obj).toStrictEqual(expected);
    });
});

describe('klass', () => {
    it('correctly unpickl class', async () => {
        const expected = {
            array: [1, true, false, null, 4294967295],
            fruits: ['apple', 'banana', 'cherry'],
            str: 'test',
        };
        const data = await caller('klass', 'klass');
        const obj = new Parser().parse(data);
        expect(obj).toMatchObject(expected);
        const prototype = Object.getPrototypeOf(obj);
        expect(prototype).toHaveProperty('__module__', 'klass');
        expect(prototype).toHaveProperty('__name__', 'MyClass');
    });

    it('correctly unpickl reduce', async () => {
        const expected = ['379', 'acd'];
        const data = await caller('klass', 'reduce');
        const obj = new Parser().parse<{
            args: typeof expected;
        }>(data);
        expect(obj.args).toStrictEqual(expected);
        const prototype = Object.getPrototypeOf(obj);
        expect(prototype).toHaveProperty('__module__', 'klass');
        expect(prototype).toHaveProperty('__name__', 'Reduce');
    });

    it('correctly unpickl with customized reduce', async () => {
        const expected = ['379', 'acd'].join(',');
        const data = await caller('klass', 'reduce');
        const obj = new Parser({
            nameResolver: {
                resolve:
                    () =>
                    (...args) =>
                        args.join(','),
            },
        }).parse(data);
        expect(obj).toStrictEqual(expected);
    });

    it('with NameRegistry', async () => {
        class MyClass {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            array: any[] = [];
            fruits: string[] = [];
            str: string | undefined;
        }

        const expected = new MyClass();
        expected.array = [1, true, false, null, 4294967295];
        expected.fruits = ['apple', 'banana', 'cherry'];
        expected.str = 'test';

        const registry = new NameRegistry().register('klass', 'MyClass', MyClass);

        const data = await caller('klass', 'klass');
        const obj = new Parser({
            nameResolver: registry,
        }).parse(data);
        expect(obj).toStrictEqual(expected);
    });
});

describe('long', () => {
    it('correctly unpickl long4', async () => {
        const expected =
            '398975380292520334652879605459872453583337697310312075368132832107577484344336733631267656030491697975730319706482065334076861898105601071965378874928385172947532987811819170262577671821213107453864961626619206677733226746811432113436292476143879109827341785450751168773699095642803230314850775984760865060210698176217969616820780411226838820532294252280967457872536334204782734733250992661824578272424009848363696719993178605177831220265480726240392211861785871121272419902398980354868722930075005775349612053991637884090384318432325292289645358976894389564741519731777181442461757394830856205901222601730755928883177016176597856688472084971520';
        const data = await caller('long', 'long4');
        const obj = new Parser().parse<bigint>(data);
        expect(obj.toString()).toStrictEqual(expected);
    });
});

describe('protocol5', () => {
    it('correctly unpickl bytearray8', async () => {
        const expected = Buffer.from([1, 2, 3]);
        const data = await caller('protocol5', 'bytearray8');
        const obj = new Parser().parse<Buffer>(data);
        expect(obj).toStrictEqual(expected);
    });

    it('correctly unpickl next_buffer', async () => {
        const expected = 123;
        const data = await caller('protocol5', 'next_buffer');
        const obj = new Parser({
            buffers: (function* () {
                yield expected;
            })(),
        }).parse(data);
        expect(obj).toStrictEqual(expected);
    });

    it('correctly unpickl multi_next_buffer', async () => {
        const expected = [123, 'str'];
        const data = await caller('protocol5', 'multi_next_buffer');
        const obj = new Parser({
            buffers: expected.values(),
        }).parse(data);
        expect(obj).toStrictEqual(expected);
    });

    it('correctly unpickl readonly_buffer', async () => {
        const expected = 123;
        const data = await caller('protocol5', 'readonly_buffer');
        const obj = new Parser({
            buffers: (function* () {
                yield expected;
            })(),
        }).parse(data);
        expect(obj).toStrictEqual(expected);
    });

    it('correctly unpickl next_buffer_and_readonly_buffer', async () => {
        const expected = [123, [1, '22', null]];
        const data = await caller('protocol5', 'next_buffer_and_readonly_buffer');
        const obj = new Parser({
            buffers: expected.values(),
        }).parse(data);
        expect(obj).toStrictEqual(expected);
    });

    it('correctly unpickl next_buffer_with_reduce_ex', async () => {
        class mybytearray {
            public args: number[];
            constructor(args: number[]) {
                this.args = args;
            }
            static __reduce_ex__(args: number[]) {
                return new mybytearray(args);
            }
        }
        const externalData = [1, 2, 3, 4];
        const expected = new mybytearray(externalData);
        const registry = new NameRegistry();
        registry.register('protocol5', 'mybytearray', mybytearray.__reduce_ex__);
        const data = await caller('protocol5', 'next_buffer_with_reduce_ex');
        const obj = new Parser({
            nameResolver: registry,
            buffers: (function* () {
                yield externalData;
            })(),
        }).parse<mybytearray>(data);
        expect(obj).toStrictEqual(expected);
    });
});

describe('dict', () => {
    it.each(PROTOCOLS)('correctly unpickl emptydict', async (protocol) => {
        const data = await caller('dict', 'emptydict', protocol);
        const obj = new Parser().parse(data);
        expect(obj).toStrictEqual({});
    });

    it.each(PROTOCOLS)('correctly unpickl emptydict with Map (protocol: %d)', async (protocol) => {
        const data = await caller('dict', 'emptydict', protocol);
        const obj = new Parser({
            unpicklingTypeOfDictionary: 'Map',
        }).parse(data);
        expect(obj).toStrictEqual(new Map());
    });

    it.each(PROTOCOLS)('correctly unpickl dict w/ data', async (protocol) => {
        const data = await caller('dict', 'dict1', protocol);
        const obj = new Parser().parse(data);
        expect(obj).toStrictEqual({
            key: 'foo',
        });
    });

    it.each(PROTOCOLS)('correctly unpickl dict w/ multidata', async (protocol) => {
        const data = await caller('dict', 'dict2', protocol);
        const obj = new Parser().parse(data);
        expect(obj).toStrictEqual({
            key: 'foo',
            key2: 123,
            key3: {},
        });
    });
});

describe('set', () => {
    it.each(['0', '1', '2'] as const)('correctly unpickl emptyset with p/ 0,1,2', async (protocol) => {
        const registry = new NameRegistry().register('__builtin__', 'set', Array.from);
        const data = await caller('set', 'emptyset', protocol);
        const obj = new Parser({
            nameResolver: registry,
        }).parse(data);
        expect(obj).toStrictEqual([]);
    });

    it('correctly unpickl emptyset with p/ 3', async () => {
        const registry = new NameRegistry().register('builtins', 'set', Array.from);
        const data = await caller('set', 'emptyset', '3');
        const obj = new Parser({
            nameResolver: registry,
            unpicklingTypeOfSet: 'Set',
        }).parse(data);
        expect(obj).toStrictEqual([]);
    });

    it('correctly unpickl emptyset with p/ 5', async () => {
        const data = await caller('set', 'emptyset', '5');
        const obj = new Parser({
            unpicklingTypeOfSet: 'Set',
        }).parse(data);
        expect(obj).toStrictEqual(new Set());
    });

    it('correctly unpickl emptyset with p/ 5 and array', async () => {
        const data = await caller('set', 'emptyset', '5');
        const obj = new Parser({
            unpicklingTypeOfSet: 'array',
        }).parse(data);
        expect(obj).toStrictEqual([]);
    });

    it('correctly unpickl set with data with p/ 5', async () => {
        const data = await caller('set', 'set1', '5');
        const obj = new Parser({
            unpicklingTypeOfSet: 'Set',
        }).parse(data);
        expect(obj).toStrictEqual(new Set(['apple', 'banana', 'cherry']));
    });

    it('correctly unpickl frozenset', async () => {
        const data = await caller('set', 'frozenset1');
        const obj = new Parser({
            unpicklingTypeOfSet: 'Set',
        }).parse(data);
        expect(obj).toStrictEqual(new Set([1, 2]));
    });
});
