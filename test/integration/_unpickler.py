import sys
import pickle

if __name__ == "__main__":
    pickled_data = sys.stdin.buffer.read()

    try:
        obj = pickle.loads(pickled_data)
        print(repr(obj))
    except Exception as e:
        print(f"Error unpickling data: {e}", file=sys.stderr)
        sys.exit(1)
