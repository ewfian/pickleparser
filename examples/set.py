import pickle

s = set([1, 2, 3])
s.add('xxxx')
s.add(3243253)
s.add(9007199254740991)
s.add(4294967296)
s.add(4294967295)
s.add(429496729)
s.add(True)
s.add(False)
s.add(None)

fruits = ['apple', 'banana', 'cherry']
fruits.append("orange")

filehandler = open(b"index.pkl", "wb")
pickle.dump(fruits, filehandler)