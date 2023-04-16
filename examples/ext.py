import copyreg, copy, pickle

class MyList(list):
    sample = [1, 2, 3]

copyreg.add_extension(__name__, "MyList", 0x60000023)
x = MyList([1, 2, 3])
x.foo = 42
x.bar = "hello"

filehandler = open(b"ext.pkl", "wb")
pickle.dump(x, filehandler, 2)