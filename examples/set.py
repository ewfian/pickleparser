import pickle

class MyClass:
    def __init__(self, s):
        self.data = "test"
        self.set = s
        self.fruits = ['apple', 'banana', 'cherry']

s= set([1, 2, 3])
s.add('abc')
s.add(9007199254740991)
s.add(4294967295)
s.add(True)
s.add(False)
s.add(None)

me = MyClass(s)
me.fruits.append("orange")

filehandler = open(b"index.pkl", "wb")
pickle.dump(me, filehandler)