export const basic: Record<string, () => unknown> = {
    int() {
        return 123;
    },
    long() {
        return 281474976710656;
    },
    string() {
        return '123';
    },
    float() {
        return 3.14;
    },
    none() {
        return null;
    },
    bool() {
        return true;
    },
    list() {
        return ['a', 1, null];
    },
    tuple2() {
        return [1, 1.34];
    },
    tuple3() {
        return [1, null, '3'];
    },
    tuple4() {
        return [1, null, '3', [1.2334535, false]];
    },
};
