#got the code from here (https://www.geeksforgeeks.org/tf-idf-for-bigrams-trigrams/)
import nltk 
import re 
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer 
from sklearn.cluster import DBSCAN, KMeans
from nltk.corpus import stopwords 
from nltk.tokenize import word_tokenize 
import pandas as pd 
import json
  
# First, the system splits each response into multiple suggestions (e.g. by sentence, newlines, and conjunctions such as "and"). 
# The system then performs kmeans clustering (k = 50) using tf-idf weighted bigram text features. 

# Input the file  
txt1 = [] 
with open("features_v3.json") as f: 
    raw_json = json.load(f)
    suggestions = raw_json
    # suggestions = raw_json["suggestions"]
    for key in suggestions:
        for el in suggestions[key]["text"].split(","):
        	txt1.append(el.strip().lower())

stop_words = set(stopwords.words('english')) 
#, "their", "they", "Their", "one", "also"
spec_words = ["dog", "dogs", "animal", "first", "second"]
i = 0
for suggestion in txt1:
	suggestion = re.sub('\s+', ' ', suggestion).strip().replace(" . ", "").replace(".", "").replace(" .", "")
	txt1[i] = ' '.join([x for x in nltk.word_tokenize(suggestion) if ( x not in stop_words ) and ( x not in spec_words )]) 
	i += 1

print(txt1)

# Getting bigrams  
vectorizer = CountVectorizer(ngram_range =(3, 3)) 
X1 = vectorizer.fit_transform(txt1)  
features = (vectorizer.get_feature_names()) 
print("\n\nFeatures : \n", features) 
print("\n\nX1 : \n", X1.toarray()) 
  
# Applying TFIDF 
# You can still get n-grams here 
vectorizer = TfidfVectorizer(ngram_range = (3, 3)) 
X2 = vectorizer.fit_transform(txt1) 
scores = (X2.toarray()) 
print("\n\nScores : \n", scores) 

# Getting top ranking features 
sums = X2.sum(axis = 0) 
data1 = [] 
for col, term in enumerate(features): 
    data1.append( (term, sums[0, col] )) 
ranking = pd.DataFrame(data1, columns = ['term', 'rank']) 
words = (ranking.sort_values('rank', ascending = False)) 
#let's remove limits to the print
pd.set_option('display.max_rows', None)
pd.options.display.max_rows
print ("\n\nWords : \n", words.head(45))

#running the DBSCAN
clustering = DBSCAN(eps=1, min_samples=2).fit(X1)
print("DBSCAN")
print(clustering.labels_)

#compare it to kmeans
kmeans = KMeans(n_clusters=3, random_state=0).fit(X1)
print("KMeans 3")
print(kmeans.labels_)