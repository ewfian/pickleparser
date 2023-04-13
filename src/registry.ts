/* eslint-disable @typescript-eslint/no-explicit-any */
export class Registry extends Map<string, new (...args: any[]) => any> {
    register(module: string, name: string, cls: new (...args: any[]) => any) {
        const id = this.getIdentity(name, module);
        if (this.has(id)) {
            throw new Error(`Module '${id}' is already registered.`);
        }
        this.set(id, cls);
    }
    resolve(module: string, name: string): new (...args: any[]) => any {
        const id = this.getIdentity(name, module);
        return this.get(id) || this.createNewPObject(module, name);
    }

    private getIdentity(module: string, name: string) {
        return module + '.' + name;
    }

    private createNewPObject(module: string, name: string): new (...args: any[]) => any {
        const PObject = function (this: any, ...args: any[]): any {
            Object.defineProperty(this, 'args', {
                value: args,
                enumerable: false,
                configurable: false,
                writable: false,
            });
        } as unknown as new (...args: any[]) => any;
        PObject.prototype.module = module;
        PObject.prototype.name = name;
        return PObject;
    }
}
