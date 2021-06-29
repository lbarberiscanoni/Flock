from os import listdir
from itertools import combinations 
import json
from pprint import pprint



def generatePairs():
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

	return base_json

def breed_centric_model():
	images = [x.split(".jpg")[0] for x in listdir("./dogs/") if ".jpg" in x]
	base_json = {}

	features = ["how heavy is it?", "how tall is it?"]
	# features = ["who has the longer nose?",
	# "who has the darker eyes?",
	# "who has the most promiment chest?",
	# "who is most furry?",
	# "who is taller?",
	# "who has the bigger paws?",
	# "who is heavier weight-wise?",
	# "who has the darker ears?",
	# "who has the thicker tail?",
	# "who has the largest width between their legs?",
	# "who has the most spots in their ears?",
	# "who has the darker coat?",
	# "who looks most similar to a horse?",
	# "who has the highest front legs?",
	# "who has the stronger posture?",
	# "who has the widest stance?",
	# "who is more pale?",
	# "who has the more aggressive (ready to bite) look?",
	# "who has the longest stomatch hair?",
	# "who has the most consistency in their skin-color?",
	# "who has more spots near their eyes?",
	# "who has the thicker neck?"
	# ]

	base_json["features"] = {}

	i = 0
	for feature in features:
		base_json["features"][i] = {"text": feature}
		i += 1

	base_json["breeds"] = {}
	i = 0
	for dogName in images:
		base_json["breeds"][i] = {}
		base_json["breeds"][i]["name"] = dogName
		base_json["breeds"][i]["picture"] = dogName + ".jpg"
		base_json["breeds"][i]["features"] = {}

		for n in range(len(features)):
			base_json["breeds"][i]["features"][n] = {"weight": 0, "score": 1500, "bootstrap": 0}

		i += 1

	return base_json

def just_overlapping_breeds():
	with open("overlapping_breeds.json", "r+") as outfile:
		overlapping_breeds = json.load(outfile).keys()
		print(overlapping_breeds)

	base_json = {}

	features = ["which one is heavier?", "which one is taller?"]

	base_json["features"] = {}

	i = 0
	for feature in features:
		base_json["features"][i] = {"text": feature}
		i += 1

	base_json["breeds"] = {}
	i = 0
	for dogName in overlapping_breeds:
		base_json["breeds"][i] = {}
		base_json["breeds"][i]["name"] = dogName
		base_json["breeds"][i]["picture"] = dogName.replace(" ", "_") + ".jpg"
		base_json["breeds"][i]["features"] = {}

		for n in range(len(features)):
			base_json["breeds"][i]["features"][n] = {"weight": 0, "score": 1500, "bootstrap": 0}

		i += 1

	return base_json

with open("sample.json", "w+") as outfile:
	data = just_overlapping_breeds()
	json.dump(data, outfile)