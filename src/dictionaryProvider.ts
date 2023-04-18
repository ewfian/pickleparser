/* eslint-disable @typescript-eslint/no-explicit-any */
import { UnpicklingTypeOfDictionary } from './parser';

export interface IDictionaryProvider {
    create(): any;
    setMethod(dict: any, key: unknown, value: unknown): void;
}
const ObjectDictionaryProvider: IDictionaryProvider = {
    create: () => ({}),
    setMethod: function (dict: Record<string, unknown>, key: string, value: unknown): void {
        dict[key] = value;
    },
};
const StdandardDictionaryProvider: IDictionaryProvider = {
    create: () => new Map(),
    setMethod: function (dict: Map<unknown, unknown>, key: unknown, value: unknown): void {
        dict.set(key, value);
    },
};
export const DictionaryProviderFactory = (type: UnpicklingTypeOfDictionary) => {
    switch (type) {
        case 'Map':
            return StdandardDictionaryProvider;
        case 'object':
            return ObjectDictionaryProvider;
        default:
            throw new Error(`Unknown unpickling type [${type}] of Dictionary.`);
    }
};
