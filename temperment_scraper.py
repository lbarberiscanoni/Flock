from selenium import webdriver
from pprint import pprint
import json

letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "X", "Y", "Z"]
# letters = ["A"]

dogs = {}

browser = webdriver.Chrome()
for letter in letters:
	url = "https://dogbreeds.wiki/letter/" + letter
	browser.get(url)
	breeds = browser.find_elements_by_css_selector('a.title')

	links = [breed.get_attribute("href") for breed in breeds]

	for link in links:

		browser.get(link)

		try:
			dog_name = browser.find_element_by_css_selector('h1.content__title span').text
			content = browser.find_element_by_css_selector('table.content-list tbody')

			breed_info = content.find_elements_by_css_selector("tr")

			dog = {}
			dog["name"] = dog_name
			for info in breed_info:
				feature = info.text.split(":")[0]
				if len(info.text.split(":")) > 2:
					dog[feature] = " ".join(info.text.split(":")[1:len(info.text.split(":")) -1])
				else:
					dog[feature] = info.text.split(":")[1]

			dogs[dog_name] = dog
		except Exception as e:
			print(e)

with open("temperment.json", "w+") as outfile:
    json.dump(dogs, outfile)

browser.close()
