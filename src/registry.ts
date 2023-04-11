/* eslint-disable @typescript-eslint/no-explicit-any */
export class Registry extends Map<string, new (...args: any[]) => any> {
    register(module: string, name: string, cls: new (...args: any[]) => any) {
        const id = this.getIdentity(name, module);
        if (this.has(id)) {
            throw new Error(`Module '${id}' is already registered.`);
        }
        this.set(id, cls);
    }
    resolve(module: string, name: string): (new (...args: any[]) => any) | undefined {
        const id = this.getIdentity(name, module);
        return this.get(id);
    }

    private getIdentity(module: string, name: string) {
        return module + '.' + name;
    }
}
