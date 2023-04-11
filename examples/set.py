import pickle

s = set([1, 2, 3])
s.add('xxxx')
# s.add(99999999999999999999999999999)
s.add(True)
s.add(False)

filehandler = open(b"index.pkl", "wb")
pickle.dump(s, filehandler)