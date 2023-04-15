
import pickle
from collections import namedtuple

MemoRecord = namedtuple("MemoRecord", "key, task")

class MyPickler(pickle.Pickler):

    def persistent_id(self, obj):
        # Instead of pickling MemoRecord as a regular class instance, we emit a
        # persistent ID.
        if isinstance(obj, MemoRecord):
            # Here, our persistent ID is simply a tuple, containing a tag and a
            # key, which refers to a specific record in the database.
            print('persistent_id set')
            return ("MemoRecord", obj.key)
        else:
            # If obj does not have a persistent ID, return None. This means obj
            # needs to be pickled as usual.
            return None

def main():
    memo = MemoRecord("aa", "bb")
    filehandler = open(b"persistent_id.pkl", "wb")
    MyPickler(filehandler).dump(memo)

if __name__ == '__main__':
    main()