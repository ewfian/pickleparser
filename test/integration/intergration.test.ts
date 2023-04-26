import { Parser } from '../../src/parser';
import { basic } from './basic';
import { caller } from './_caller';

describe('basic', () => {
    it.each(Object.keys(basic))('correctly unpickled (%s)', async (func) => {
        const data = await caller('basic', func);
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
