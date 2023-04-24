/* eslint-disable @typescript-eslint/no-explicit-any */
export function createPObject(module: string, name: string): (new (...args: any[]) => any) | ((...args: any[]) => any) {
    const PObject = function (this: any, ...args: any[]): any {
        if (new.target) {
            Object.defineProperty(this, 'args', {
                value: args,
                enumerable: false,
                configurable: false,
                writable: false,
            });
        } else {
            const PFunction = function (this: any, ...args: any[]) {
                Object.defineProperty(this, 'args', {
                    value: args,
                    enumerable: false,
                    configurable: false,
                    writable: false,
                });
            };
            PFunction.prototype.__module__ = module;
            PFunction.prototype.__name__ = name;
            return Reflect.construct(PFunction, args);
        }
    } as unknown as (new (...args: any[]) => any) | ((...args: any[]) => any);
    PObject.prototype.__module__ = module;
    PObject.prototype.__name__ = name;
    PObject.prototype.__setnewargs_ex__ = function (kwargs: any) {
        Object.defineProperty(this, 'kwargs', {
            value: kwargs,
            enumerable: false,
            configurable: false,
            writable: false,
        });
    };
    return PObject;
}
