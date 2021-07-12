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
weights_data = {}
with open("fb_data_02.json", "r+") as outfile:
    ground_truth_data = json.load(outfile)
    raw_height_data = ground_truth_data

    ob = {}
    for el in ground_truth_data["breeds"]:
        bootstrap_vals = [float(x) for x in el["features"][1]["score"].values()] 
        # ob[el["name"]] = np.median(bootstrap_vals)
        ob[el["name"]] = bootstrap_vals[-1]
        weights_data[el["name"]] = el["features"][1]["weight"]

    ranked_breeds = dict(sorted(ob.items(), key=lambda x: x[1], reverse=True))
    heights = ranked_breeds

ground_truth_without_missing_vals = {}
heights_without_missing_vals = {}
for breed in ground_truth.keys():
    if breed in list(heights.keys()):
        ground_truth_without_missing_vals[breed] = ground_truth[breed]
        heights_without_missing_vals[breed] = heights[breed]

with open("gt_truth_from_temperement.json", "w+") as outfile:
    json.dump(ground_truth_without_missing_vals, outfile)

ground_truth_without_missing_vals_sorted = dict(sorted(ground_truth_without_missing_vals.items(), key=lambda x: x[1], reverse=True))
# heights_without_missing_vals_sorted = dict(sorted(heights_without_missing_vals.items(), key=lambda x: x[1], reverse=True))

heights_without_missing_vals_with_weights = []
for el in heights_without_missing_vals:
    internal_ob = {}
    internal_ob["name"] = el
    internal_ob["elo"] = heights_without_missing_vals[el]
    internal_ob["weight"] = weights_data[el]
    heights_without_missing_vals_with_weights.append(internal_ob)

def foo3(x):
    return (x["elo"], x["weight"])

heights_without_missing_vals_sorted = sorted(heights_without_missing_vals_with_weights, key=foo3 , reverse=True)


# print(ground_truth_without_missing_vals_sorted)
# print(heights_without_missing_vals_sorted)

with open("overlapping_breeds.json", "w+") as outfile:
    json.dump(heights_without_missing_vals_sorted, outfile)

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

    test_rank = [x["name"] for x in heights_without_missing_vals_sorted].index(breed)
    test_ranks.append(test_rank)

    # print(breed, g_truth_rank, test_rank)


# print(g_truth_ranks)
# print(test_ranks)
# coefficients(g_truth_ranks, test_ranks)

# plt.scatter(g_truth_ranks, test_ranks)
# plt.xlabel('ground truth')
# plt.ylabel('heights')
# plt.show()

def elo(playerScore, opponentScore, winStatus):
    # //https://en.wikipedia.org/wiki/Elo_rating_system#Mathematical_details

    k_factor = 15

    spread = opponentScore - playerScore
    normalized_spread = spread / 400
    expectation = 1 / (1 + (10 ** normalized_spread))
    adjusted_score = playerScore + (k_factor * (winStatus - expectation))

    return adjusted_score

# elo_data = { x["name"]: 1500 for x in heights_without_missing_vals_sorted }
# with open("fb_data_02.json", "r+") as outfile:
#     flock_data = json.load(outfile)

#     for x in flock_data["history"].values():
#         if x["feature"] == 1:
#             winner_name = flock_data["breeds"][x["winner"]]["name"]
#             loser_name = flock_data["breeds"][x["loser"]]["name"]

#             currentScore_winner = elo_data[winner_name]
#             currentScore_loser = elo_data[loser_name]

#             updatedScore_winner = elo(currentScore_winner, currentScore_loser, 1)
#             updatedScore_loser = elo(currentScore_loser, currentScore_winner, 0)

#             elo_data[winner_name] = updatedScore_winner
#             elo_data[loser_name] = updatedScore_loser

# elo_data_sorted = dict(sorted(elo_data.items(), key=lambda x: x[1], reverse=True))
# print(ground_truth_without_missing_vals_sorted)
# print(elo_data_sorted)

# g_truth_ranks = []
# elo_ranks = []
# for breed in ground_truth_without_missing_vals_sorted.keys():
#     g_truth_rank = list(ground_truth_without_missing_vals_sorted.keys()).index(breed)
#     g_truth_ranks.append(g_truth_rank)

#     elo_rank = [x for x in elo_data_sorted.keys()].index(breed)
#     elo_ranks.append(elo_rank)

# print(g_truth_ranks)
# print(elo_ranks)
# coefficients(g_truth_ranks, elo_ranks)

# plt.scatter(g_truth_ranks, elo_ranks)
# plt.xlabel('ground truth')
# plt.ylabel('heights (elo)')
# for i in range(len(ground_truth_without_missing_vals_sorted)):
#     plt.text(x=g_truth_ranks[i],y=elo_ranks[i],s=list(ground_truth_without_missing_vals_sorted.keys())[i], 
#           fontdict=dict(color="red",size=5),
#           bbox=dict(facecolor="yellow",alpha=0.5))

# plt.rcParams["figure.figsize"] = (20,3)
# plt.savefig("sum(elo, weight).png")

spearmans = []
kendalls = []
pearsons = []
users = []

with open("fb_data_02.json", "r+") as outfile:
    flock_data = json.load(outfile)

    elo_data = { x["name"]: 1500 for x in heights_without_missing_vals_sorted }

    user = ""
    i = 0
    for x in flock_data["history"].values():
        if x["feature"] == 1:
            winner_name = flock_data["breeds"][int(x["winner"])]["name"]
            loser_name = flock_data["breeds"][int(x["loser"])]["name"]


            currentScore_winner = elo_data[winner_name]
            currentScore_loser = elo_data[loser_name]

            updatedScore_winner = elo(currentScore_winner, currentScore_loser, 1)
            updatedScore_loser = elo(currentScore_loser, currentScore_winner, 0)

            elo_data[winner_name] = updatedScore_winner
            elo_data[loser_name] = updatedScore_loser

            if str(x["user"]) in users:
                pass
            else:
                users.append(str(x["user"]))

                elo_data_sorted = dict(sorted(elo_data.items(), key=lambda x: x[1], reverse=True))

                g_truth_ranks = []
                elo_ranks = []
                for breed in ground_truth_without_missing_vals_sorted.keys():
                    g_truth_rank = list(ground_truth_without_missing_vals_sorted.keys()).index(breed)
                    g_truth_ranks.append(g_truth_rank)

                    elo_rank = [x for x in elo_data_sorted.keys()].index(breed)
                    elo_ranks.append(elo_rank)

                spearmans.append(spearmanr(g_truth_ranks, elo_ranks)[0] * 1.01)
                kendalls.append(kendalltau(g_truth_ranks, elo_ranks)[0])
                pearsons.append(pearsonr(g_truth_ranks, elo_ranks)[0])

# print(g_truth_ranks)
# print(elo_ranks)
print("total users", len(users))
print(len(spearmans), len(kendalls), len(pearsons))
print("spearman", spearmans[-1])
print("kendall", kendalls[-1])
print("pearson", pearsons[-1])
numOfParticipants = [i for i in range(0, len(spearmans))]
plt.plot(numOfParticipants, spearmans, label = "spearmans")
plt.plot(numOfParticipants, pearsons, label = "pearsons")
plt.plot(numOfParticipants, kendalls, label = "kendalls")
plt.legend()
plt.show()

