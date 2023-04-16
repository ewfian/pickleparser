import pickle
bytes8 = b'\x80\x04\x8e\4\0\0\0\0\0\0\0\xe2\x82\xac\x00.'

print(bytes8)

filehandler = open(b"bytes8.pkl", "wb")
filehandler.write(bytes8)
filehandler.close()