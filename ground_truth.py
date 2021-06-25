import json
from pprint import pprint
import numpy as np
from scipy.stats import spearmanr, kendalltau, pearsonr
import matplotlib.pyplot as plt

ground_truth = []
with open("temperment.json", "r+") as outfile:
    temperment_data = json.load(outfile)
    dog_names = temperment_data.keys()

    ob = {}

    for dog_name in dog_names:
    	raw_height = temperment_data[dog_name]["Height"]
    	height_nums = [x for x in raw_height if x.isdigit() ]
    	height = 0
    	if len(height_nums) > 0:
    		try:
    			height_range = raw_height.split("(")[1].split(")")[0].replace("cm", "").strip()
    			if "-" in height_range:
    				height = (int(height_range.split("-")[0]) + int(height_range.split("-")[1])) / float(2)
    			else:
    				height = int(height_range)
    		except:
    			pass
    	if height != 0:
    		ob[dog_name] = height

    ranked_breeds = dict(sorted(ob.items(), key=lambda x: x[1], reverse=True))
    ground_truth = ranked_breeds
    # print(ranked_breeds)

# print("\n\n\n")

heights = []
with open("ground_truth.json", "r+") as outfile:
	ground_truth_data = json.load(outfile)

	ob = {}
	for el in ground_truth_data:
		bootstrap_vals = [float(x) for x in el["features"][1]["bootstrap"].values()]
		ob[el["name"]] = np.median(bootstrap_vals)

	ranked_breeds = dict(sorted(ob.items(), key=lambda x: x[1], reverse=True))
	heights = ranked_breeds
	# print(ranked_breeds)

ground_truth_without_missing_vals = {}
heights_without_missing_vals = {}
for breed in ground_truth.keys():
    if breed.replace(" ", "_") in list(heights.keys()):
        ground_truth_without_missing_vals[breed] = ground_truth[breed]
        heights_without_missing_vals[breed] = heights[breed.replace(" ", "_")]


print(ground_truth_without_missing_vals)
# print(heights_without_missing_vals)
ground_truth_without_missing_vals_sorted = dict(sorted(ground_truth_without_missing_vals.items(), key=lambda x: x[1], reverse=True))
heights_without_missing_vals_sorted = dict(sorted(heights_without_missing_vals.items(), key=lambda x: x[1], reverse=True))
print(ground_truth_without_missing_vals_sorted)
# print(heights_without_missing_vals_sorted)

def coefficients(g_truth, estimates):
    print(len(g_truth), len(estimates))
    rho, p = spearmanr(g_truth, estimates)
    print("spearman", rho)

    tau, p = kendalltau(g_truth, estimates)
    print("kendalltau", tau)

    pearson, p = pearsonr(g_truth, estimates)
    print("pearson", pearson) 



g_truth_ranks = []
test_ranks = []
for breed in ground_truth_without_missing_vals_sorted.keys():
    g_truth_rank = list(ground_truth_without_missing_vals_sorted.keys()).index(breed)
    g_truth_ranks.append(g_truth_rank)

    test_rank = list(heights_without_missing_vals_sorted.keys()).index(breed)
    test_ranks.append(test_rank)

    # print(breed, g_truth_rank, test_rank)


print(g_truth_ranks)
print(test_ranks)
coefficients(g_truth_ranks, test_ranks)

# plt.scatter(g_truth_ranks, test_ranks)
# plt.xlabel('ground truth')
# plt.ylabel('heights')
# plt.show()



		