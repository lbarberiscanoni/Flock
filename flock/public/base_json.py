from os import listdir
from itertools import combinations 
import json

images = [x.split(".jpg")[0] for x in listdir(".") if ".jpg" in x]
pairs = combinations(images, 2)

base_json = {}

i = 0
for pair in pairs:
	ob = {}
	ob["attention_checks"] = {0: {"score": 0}}

	ob["pictureA"] = pair[0]
	ob["pictureB"] = pair[1]
	ob["features"] = {}

	# default_features = ["eyes similar?", "fur similar?", "ears similar?"]
	default_features = ["is the fur color similar?", 
	"are they the same size?", 
	"do they have patches on their skin?", 
	"are their faces droopy?", 
	"is the length of their necks similar?", 
	"is the size of their mid-section similar?", 
	"are their ears droopy?",
	"is the looseness of their fur similar?",
	"is the curvature of their stomach similar?",
	"is the length of their tail similar?",
	"is the length of their jaw similar?",
	"is the curly-ness of their tail similar?",
	"is the skin around their nose similar?",
	"is their posture similar?",
	"are their teeth similar?",
	"is their demeneaor ferocious?"
	]

	j = 0
	for feature in default_features:
		ob["features"]["feature_" + str(j)] = {	"text": feature, "score": {0:0}, "weight": {0: 0}}
		j += 1


	key = "pair_" + str(i)
	base_json[key] = ob

	i += 1

with open("sample.json", "w+") as outfile:
    json.dump(base_json, outfile)