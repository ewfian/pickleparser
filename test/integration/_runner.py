import sys
import pickle

if __name__ == "__main__":
    func = getattr(__import__(sys.argv[1]), sys.argv[2])
    sys.stdout.buffer.write(pickle.dumps(func()))
    sys.stdout.flush()