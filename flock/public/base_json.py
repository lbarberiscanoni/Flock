from os import listdir
from itertools import combinations 
import json

images = [x.split(".jpg")[0] for x in listdir(".") if ".jpg" in x]
pairs = combinations(images, 2)

base_json = {}

i = 0
for pair in pairs:
	ob = {}

	ob["pictureA"] = pair[0]
	ob["pictureB"] = pair[1]
	ob["features"] = {}

	default_features = ["eyes similar?", "fure similar?", "ears similar?"]
	j = 0
	for feature in default_features:
		ob["features"]["feature_" + str(j)] = {	"text": feature, "score": {0:0}, "weight": 1}
		j += 1


	key = "pair_" + str(i)
	base_json[key] = ob

	i += 1

with open("sample.json", "w+") as outfile:
    json.dump(base_json, outfile)