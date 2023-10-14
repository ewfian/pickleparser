import sys
import pickle

if __name__ == "__main__":
    func = getattr(__import__(sys.argv[1]), sys.argv[2])
    sys.stdout.buffer.write(pickle.dumps(func(), pickle.HIGHEST_PROTOCOL, buffer_callback= lambda _: False))
    sys.stdout.flush()