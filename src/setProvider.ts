/* eslint-disable @typescript-eslint/no-explicit-any */
import { UnpicklingTypeOfSet } from './parser';

export interface ISetProvider {
    create(): any;
    createWithItems(value: Iterable<unknown>): any;
    addMethod(set: any, value: unknown): void;
}
const ArraySetProvider: ISetProvider = {
    create: () => [],
    createWithItems: (value) => Array.from(value),
    addMethod: function (set: any[], value): void {
        set.push(value);
    },
};
const StdandardSetProvider: ISetProvider = {
    create: () => new Set(),
    createWithItems: (value) => new Set(value),
    addMethod: function (set: Set<unknown>, value): void {
        set.add(value);
    },
};
export const SetProviderFactory = (type: UnpicklingTypeOfSet) => {
    switch (type) {
        case 'Set':
            return StdandardSetProvider;
        case 'array':
            return ArraySetProvider;
        default:
            throw new Error(`Unknown unpickling type [${type}] of Set.`);
    }
};
