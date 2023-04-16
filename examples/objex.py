class MyClass:
    def __getnewargs_ex__(self):
        return ('arg1', 345), {'base': 16, "test": True}

import pickle

x = MyClass()
x.abc = 666

filehandler = open(b"objex.pkl", "wb")
pickle.dump(x, filehandler)