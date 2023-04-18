/* eslint-disable @typescript-eslint/no-explicit-any */
import { UnpicklingTypeOfSet } from './parser';

export interface ISetProvider {
    create(): any;
    createWithItems(value: Iterable<unknown>): any;
    addMethod(set: any, value: Iterable<unknown>): void;
}
const ArraySetProvider: ISetProvider = {
    create: () => [],
    createWithItems: (value: Iterable<unknown>) => value,
    addMethod: function (set: any[], value: Iterable<unknown>): void {
        set.push(value);
    },
};
const StdandardSetProvider: ISetProvider = {
    create: () => new Set(),
    createWithItems: (value: Iterable<unknown>) => new Set(value),
    addMethod: function (set: Set<unknown>, value: Iterable<unknown>): void {
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
