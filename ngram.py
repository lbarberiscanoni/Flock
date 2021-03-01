#got the code from here (https://www.geeksforgeeks.org/tf-idf-for-bigrams-trigrams/)
import nltk 
import re 
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer 
from nltk.corpus import stopwords 
from nltk.tokenize import word_tokenize 
import pandas as pd 
import json
  
# First, the system splits each response into multiple suggestions (e.g. by sentence, newlines, and conjunctions such as “and”). 
#The system then performs kmeans clustering (k = 50) using tf-idf weighted bigram text features. 

# Input the file  
txt1 = [] 
with open("flock-cafbb-default-rtdb-export.json") as f: 
    raw_json = json.load(f)
    suggestions = raw_json["suggestions"]
    for key in suggestions:
        txt1.append(suggestions[key]["text"])
      
# Getting bigrams  
vectorizer = CountVectorizer(ngram_range =(2, 2)) 
X1 = vectorizer.fit_transform(txt1)  
features = (vectorizer.get_feature_names()) 
print("\n\nFeatures : \n", features) 
print("\n\nX1 : \n", X1.toarray()) 
  
# Applying TFIDF 
# You can still get n-grams here 
vectorizer = TfidfVectorizer(ngram_range = (2, 2)) 
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
print ("\n\nWords : \n", words.head(7))