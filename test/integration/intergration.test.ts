import { createPObject } from '../../src/PObject';
import { Parser } from '../../src/parser';
import { basic } from './basic';
import { caller } from './caller';

describe('basic', () => {
    it.each(Object.keys(basic))('correctly unpickled(%s)', async (func) => {
        const data = await caller('basic', func);
        const expected = basic[func]();
        const obj = new Parser().parse(data);
        expect(obj).toStrictEqual(expected);
    });
});

describe('klass', () => {
    it('correctly unpickled class', async () => {
        const expected = {
            array: [1, true, false, null, 4294967295],
            fruits: ['apple', 'banana', 'cherry'],
            str: 'test',
        };
        const data = await caller('klass', 'klass');
        const obj = new Parser().parse(data);
        expect(obj).toMatchObject(expected);
    });
});
