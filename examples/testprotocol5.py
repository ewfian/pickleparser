import pickle

class mybytearray(bytearray):

   def __reduce_ex__(self, protocol):
      if protocol >= 5:
         return type(self), (pickle.PickleBuffer(self),), None

key = mybytearray([0x01, 0x02, 0x03, 0x04])
filehandler = open(b"bytearray8.pkl", "wb")

buffers = []
t= memoryview(bytearray())
oo = [pickle.PickleBuffer(memoryview(bytearray()).toreadonly()), pickle.PickleBuffer(bytearray())]
d = pickle.dumps(oo, pickle.HIGHEST_PROTOCOL, buffer_callback= lambda _: False)
pickle.dump(mybytearray([0x01, 0x02, 0x03, 0x04]), filehandler, pickle.HIGHEST_PROTOCOL, buffer_callback= lambda _: True)
print(buffers)
buffers = [bytearray([]), []]
l = pickle.loads(d, buffers=buffers)
print(l)
