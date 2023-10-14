import pickle

def bytearray8():
    key = bytearray([0x01, 0x02, 0x03])
    return key

def next_buffer():
    key = pickle.PickleBuffer(bytearray())
    return key

def multi_next_buffer():
    key = [pickle.PickleBuffer(bytearray()), pickle.PickleBuffer(bytearray())]
    return key

def readonly_buffer():
    key = pickle.PickleBuffer(memoryview(bytearray()).toreadonly())
    return key

def next_buffer_and_readonly_buffer():
    key = [pickle.PickleBuffer(memoryview(bytearray()).toreadonly()), pickle.PickleBuffer(bytearray())]
    return key

class mybytearray(bytearray):
    def __reduce_ex__(self, protocol):
        if protocol >= 5:
            return type(self), (pickle.PickleBuffer(self),), None

def next_buffer_with_reduce_ex():
    key = mybytearray([0x01, 0x02, 0x03, 0x04])
    return key