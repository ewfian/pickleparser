import { basic } from './basic';
import { caller } from './caller';

describe('intergration', () => {
    it.each(Object.keys(basic))('correctly unpickled(%s)', async (func) => {
        const data = await caller('basic', func);
        const expected = basic[func]();
        expect(data).toStrictEqual(expected);
    });
});
