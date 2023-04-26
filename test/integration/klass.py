class MyClass:
    def __init__(self):
        self.str = "test"
        self.array = [1, True, False, None, 4294967295]
        self.fruits = ['apple', 'banana', 'cherry']


class Reduce:
    def __reduce__(self):
        return (self.__class__, tuple(['379', 'acd']))


def klass():
    return MyClass()


def reduce():
    return Reduce()
