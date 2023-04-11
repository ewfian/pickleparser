import pickle

class MyClass:
    def __init__(self):
        self.data = "test"
        self.set = set([1, 2, 3])
        self.fruits = ['apple', 'banana', 'cherry']

me = MyClass()
me.set.add('abc')
me.set.add(9007199254740991)
me.set.add(4294967295)
me.set.add(True)
me.set.add(False)
me.set.add(None)
me.fruits.append("orange")

filehandler = open(b"index.pkl", "wb")
pickle.dump(me, filehandler)