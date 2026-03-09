export const advanced: Record<string, () => unknown> = {
    nested_list() {
        return [[1, 2], [3, [4, 5]]];
    },
    nested_dict() {
        return { a: { b: { c: 1 } } };
    },
    list_of_dict() {
        return [{ k: 1 }, { k: 2 }];
    },
    dict_of_list() {
        return { a: [1, 2], b: [3, 4] };
    },
    special_floats() {
        return [Infinity, -Infinity];
    },
    // nan_value is tested separately (NaN !== NaN)
    negative_int() {
        return -42;
    },
    zero() {
        return 0;
    },
    empty_string() {
        return '';
    },
    empty_list() {
        return [];
    },
    empty_dict() {
        return {};
    },
    empty_bytes() {
        return Buffer.from([]);
    },
    unicode_cjk() {
        return '中文テスト🎉';
    },
    unicode_escape() {
        return 'line1\nline2\ttab';
    },
    bytes_data() {
        return Buffer.from([0x00, 0x01, 0x02, 0xff]);
    },
    large_bytes() {
        return Buffer.alloc(300);
    },
    // big_int tested separately (BigInt or precision warning)
    // shared_ref tested separately (reference identity)
    deep_nesting() {
        let result: unknown = 42;
        for (let i = 0; i < 10; i++) {
            result = [result];
        }
        return result;
    },
    complex_structure() {
        return {
            users: [
                { name: 'Alice', age: 30, active: true },
                { name: 'Bob', age: null, active: false },
            ],
            count: 2,
            metadata: { version: '1.0' },
        };
    },
    single_element_tuple() {
        return [42];
    },
    nested_tuple() {
        return [[1, 2], [3, [4, 5]]];
    },
    bool_values() {
        return [true, false, true];
    },
    mixed_dict_keys() {
        return { 1: 'int_key', str: 'str_key' };
    },
    large_string() {
        return 'a'.repeat(1000);
    },
    negative_float() {
        return -0.001;
    },
    int_zero() {
        return 0;
    },
    float_zero() {
        return 0.0;
    },
};
