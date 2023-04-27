import { createPObject } from './PObject';
import { NameResolver } from './parser';

/* eslint-disable @typescript-eslint/no-explicit-any */
export class NameRegistry implements NameResolver {
    protected readonly _registry = new Map<string, (new (...args: any[]) => any) | ((...args: any[]) => any)>();

    register(module: string, name: string, func: (new (...args: any[]) => any) | ((...args: any[]) => any)) {
        const fqn = NameRegistry.getFullyQualifiedName(module, name);
        if (this._registry.has(fqn)) {
            throw new Error(`'${fqn}' is already registered.`);
        }
        this._registry.set(fqn, func);
        return this;
    }

    resolve(module: string, name: string) {
        const fqn = NameRegistry.getFullyQualifiedName(module, name);
        return this._registry.get(fqn) ?? this.onMissingName(module, name);
    }

    onMissingName(module: string, name: string) {
        return createPObject(module, name);
    }

    static getFullyQualifiedName(module: string, name: string) {
        return module + '.' + name;
    }
}
