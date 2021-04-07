import numpy as np
from numpy.linalg import norm
from pprint import pprint
from itertools import combinations 
from os import listdir
import json


data = np.load("pca_sample_breed.npy", allow_pickle=True)

ob = {}
for row in data:
	breed_name = row[len(row) - 1]
	components = row[0:len(row) -2]
	try:
		ob[breed_name][len(ob[breed_name])] = components
	except Exception as e:
		ob[breed_name] = {}
		ob[breed_name][len(ob[breed_name])] = components

new_ob = {}
for key in ob:
	if len(ob[key]) > 1:
		#get all samples
		all_samples = [np.array(x).astype(float) for x in ob[key].values()]
		#average the samples to get a single array of components
		averaged_sample = np.mean(all_samples, axis=0)
		new_ob[key] = averaged_sample

pairs = {}
combos = combinations(new_ob.keys(), 2)
for combo in combos:
	pair_name = combo[0].replace(" ", "-") + "_vs_" + combo[1].replace(" ", "-")
	first_el = np.array(new_ob[combo[0]])
	second_el = np.array(new_ob[combo[1]])

	eucledian_distance = norm(first_el - second_el)
	pairs[pair_name] = eucledian_distance

base_json = {}
images = listdir("flock/public/dogs")
sorted_pairs = sorted(pairs, key=pairs.get)
i = 0
for sorted_pair in sorted_pairs[0:50]:
	ob = {}

	firstDog = sorted_pair.split("_vs_")[0].replace("-", "_")
	secondDog = sorted_pair.split("_vs_")[1].replace("-", "_")

	ob["attention_checks"] = {0: {"score": 0}}
	ob["pictureA"] = firstDog
	ob["pictureB"] = secondDog
	ob["features"] = {}

	default_features = ["eyes similar?", "fur similar?", "ears similar?"]

	j = 0
	for feature in default_features:
		ob["features"]["feature_" + str(j)] = {	"text": feature, "score": {0:0}, "weight": {0: 0}}
		j += 1

	if (firstDog + ".jpg" in images) and (secondDog + ".jpg" in images):

		key = "pair_" + str(i)
		base_json[key] = ob

		i += 1

with open("top50pca.json", "w+") as outfile:
    json.dump(base_json, outfile)
