def nested_list():
    return [[1, 2], [3, [4, 5]]]

def nested_dict():
    return {"a": {"b": {"c": 1}}}

def list_of_dict():
    return [{"k": 1}, {"k": 2}]

def dict_of_list():
    return {"a": [1, 2], "b": [3, 4]}

def special_floats():
    return [float('inf'), float('-inf')]

def nan_value():
    return float('nan')

def negative_int():
    return -42

def zero():
    return 0

def empty_string():
    return ""

def empty_list():
    return []

def empty_dict():
    return {}

def empty_bytes():
    return b""

def unicode_cjk():
    return "中文テスト🎉"

def unicode_escape():
    return "line1\nline2\ttab"

def bytes_data():
    return b"\x00\x01\x02\xff"

def large_bytes():
    return b"\x00" * 300

def big_int():
    return 2**53 + 1

def shared_ref():
    x = [1, 2, 3]
    return [x, x]

def deep_nesting():
    result = 42
    for _ in range(10):
        result = [result]
    return result

def complex_structure():
    return {
        "users": [
            {"name": "Alice", "age": 30, "active": True},
            {"name": "Bob", "age": None, "active": False},
        ],
        "count": 2,
        "metadata": {"version": "1.0"},
    }

def single_element_tuple():
    return (42,)

def nested_tuple():
    return ((1, 2), (3, (4, 5)))

def bool_values():
    return [True, False, True]

def mixed_dict_keys():
    return {1: "int_key", "str": "str_key"}

def large_string():
    return "a" * 1000

def negative_float():
    return -0.001

def int_zero():
    return 0

def float_zero():
    return 0.0
