import sys
import pickle

if __name__ == "__main__":
    func = getattr(__import__(sys.argv[1]), sys.argv[2])
    protocol = int(sys.argv[3])
    pickled = pickle.dumps(func(), protocol, buffer_callback = (lambda _: False) if protocol >= 5 else None)
    sys.stdout.buffer.write(pickled)
    sys.stdout.flush()