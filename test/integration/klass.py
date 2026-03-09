class MyClass:
    def __init__(self):
        self.str = "test"
        self.array = [1, True, False, None, 4294967295]
        self.fruits = ['apple', 'banana', 'cherry']


class Reduce:
    def __reduce__(self):
        return (self.__class__, tuple(['379', 'acd']))


class WithSetState:
    def __init__(self):
        self.x = 0
        self.y = 0

    def __getstate__(self):
        return {"x": self.x, "y": self.y}

    def __setstate__(self, state):
        self.x = state["x"]
        self.y = state["y"]


class WithSlots:
    __slots__ = ['a', 'b']
    def __init__(self):
        self.a = 1
        self.b = "two"


def klass():
    return MyClass()


def reduce():
    return Reduce()


def with_setstate():
    obj = WithSetState()
    obj.x = 10
    obj.y = 20
    return obj


def with_slots():
    return WithSlots()
