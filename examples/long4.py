import pickle
long4 = 12345678910111213141516178920 << (256*8)
print(long4)

filehandler = open(b"long4.pkl", "wb")
pickle.dump(long4, filehandler)