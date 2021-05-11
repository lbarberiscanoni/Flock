import json
from pprint import pprint
import numpy as np



with open("flock_matrix.json") as f: 
    raw_json = json.load(f)
    breeds = raw_json["breeds"]
    features = [x["text"] for x in raw_json["features"]]

    headers = ["name"] + features
    flock_matrix = np.array([headers])
    for breed in breeds:
    	row = np.array(breed["name"])
    	scores = [x["score"] for x in breed["features"]]
    	scores = np.array(scores)
    	a = np.concatenate((row, scores), axis=None)
    	flock_matrix = np.vstack([flock_matrix, a])

    with open('flock_matrix.npy', 'wb') as f2:
    	np.save(f2, flock_matrix)