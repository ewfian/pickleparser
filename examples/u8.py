import pickle
u8 = b'\x80\x04\x8d\4\0\0\0\0\0\0\0\xe2\x82\xac\x01.'

print(u8)

filehandler = open(b"u8.pkl", "wb")
filehandler.write(u8)
filehandler.close()