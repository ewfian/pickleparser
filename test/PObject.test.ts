import { createPObject } from '../src/PObject';

describe('PObject', () => {
    describe('createPObject', () => {
        it('can be created', () => {
            const name = 'name';
            const module = 'module';
            const pobject = createPObject(module, name);
            expect(pobject).toBeDefined();
        });

        it('can be used with as a class', () => {
            const name = 'name';
            const module = 'module';
            const data = [1, true, [null, 'str']];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const pobject = createPObject<new (...args: any[]) => any>(module, name);
            const obj = new pobject(...data);
            expect(obj).toHaveProperty('__module__', module);
            expect(obj).toHaveProperty('__name__', name);
            expect(obj.args).toStrictEqual(data);
        });

        it('can be used with as a function', () => {
            const name = 'name';
            const module = 'module';
            const data = [1, true, [null, 'str']];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const pobject = createPObject<(...args: any[]) => any>(module, name);
            const obj = pobject(...data);
            expect(obj).toHaveProperty('__module__', module);
            expect(obj).toHaveProperty('__name__', name);
            expect(obj.args).toStrictEqual(data);
        });

        it('can be worked with __setnewargs_ex__', () => {
            const name = 'name';
            const module = 'module';
            const data = [1, true, [null, 'str']];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const pobject = createPObject<new (...args: any[]) => any>(module, name);
            const obj = new pobject(...data);
            obj.__setnewargs_ex__(...data);
            expect(obj).toHaveProperty('__module__', module);
            expect(obj).toHaveProperty('__name__', name);
            expect(obj.args).toStrictEqual(data);
            expect(obj.kwargs).toStrictEqual(data);
        });
    });
});
