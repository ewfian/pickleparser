import pickle
from pathlib import Path

ps = list(Path("..").glob("*.js"))

filehandler = open(b"path.pkl", "wb")
pickle.dump({"source": ps}, filehandler)