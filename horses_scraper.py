from selenium import webdriver
from pprint import pprint
import csv


def breeds_pic(breed_name):
	ob = {}
	ob["name"] = breed_name

	url = "https://www.horsebreedspictures.com/" + breed_name.replace(" ", "-") + ".asp"
	# url = "https://www.horsebreedspictures.com/belgian-draft-horse.asp"
	browser.get(url)

	info = browser.find_elements_by_css_selector('.toc table tbody td')
	features = []
	values = []
	for i in range(len(info)):
		if i % 2: 
			values.append(info[i].text)
		else:
			features.append(info[i].text)

	for i in range(len(features)):
		ob[features[i]] = {}
		ob[features[i]] = values[i]

	if len(ob.keys()) < 2:

		url = "https://www.horsebreedspictures.com/" + breed_name.split(" ")[0] + ".asp"
		# url = "https://www.horsebreedspictures.com/belgian-draft-horse.asp"
		browser.get(url)

		info = browser.find_elements_by_css_selector('.toc table tbody td')
		features = []
		values = []
		for i in range(len(info)):
			if i % 2: 
				values.append(info[i].text)
			else:
				features.append(info[i].text)

		for i in range(len(features)):
			ob[features[i]] = {}
			ob[features[i]] = values[i]

	if len(ob.keys()) < 2:
		print(breed_name, ob)

	return ob

def equinest(breed_name):
	ob = {}
	ob["name"] = breed_name

	url = "http://www.theequinest.com/breeds/" + breed_name.replace(" ", "-")
	# url = "http://www.theequinest.com/breeds/andalusian-horse/"
	browser.get(url)

	info = browser.find_elements_by_xpath('//div[@class="maincontent"]//br//parent::p')
	features = ["features", "physique", "traditional colors", "temperament", "use"]
	i = 0
	for el in info[-7:-2]:
		ob[features[i]] = el.text
		i += 1

	if len(ob.keys()) < 2:
		url = "https://www.horsebreedspictures.com/" + breed_name.split(" ")[0] + ".asp"

		browser.get(url)

		info = browser.find_elements_by_xpath('//div[@class="maincontent"]//br//parent::p')
		features = ["features", "physique", "traditional colors", "temperament", "use"]
		i = 0
		for el in info[-7:-2]:
			ob[features[i]] = el.text
			i += 1

	if len(ob.keys()) < 2:
		print(breed_name, ob)

	pprint(ob)

breeds = []
with open('horse_breeds_list.txt') as f:
    lines = f.readlines()
    i = 0
    for line in lines:
    	breed_name = line.strip().split("  ")[-1]
    	breeds.append(breed_name)

browser = webdriver.Chrome()

ob = {}
for breed in breeds:
	ob[breed] = {}
	try:
		ob[breed] = equinest(breed)
	except Exception as e:
		print(e)

# ob = {}
# for breed in breeds:
# 	ob[breed] = {}
# 	try:
# 		ob[breed] = breeds_pic(breed)
# 	except Exception as e:
# 		print(e)

# with open('horse_breeds.csv', 'w', newline='') as csvfile:
# 	fieldnames = []
# 	for breed in breeds:
# 		features = ob[breed].keys()
# 		for feature in features:
# 			if feature not in fieldnames:
# 				fieldnames.append(feature)

# 	writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
# 	writer.writeheader()

# 	for breed in breeds:

# 		writer.writerow(ob[breed])

browser.close()