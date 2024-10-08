# -*- coding: utf-8 -*-
"""main_file.ipynb

Automatically generated by Colab.

Original file is located at
    https://colab.research.google.com/drive/1JRzlZ196LvXCWo6DTAIF1iGCspEIpjV3
"""
import re
import torch
import nltk
import json
from torch.utils.data import DataLoader, TensorDataset
import torch.nn as nn
import torch.optim as optim

from nltk.corpus import words
from nltk.tokenize import word_tokenize
from torch.nn.utils.rnn import pad_sequence
from nltk.corpus import stopwords, words as nltk_words
from torch.nn.utils.rnn import pad_sequence

import pandas as pd
import numpy as np
import re
from urllib.parse import urlparse
from urllib.parse import urlparse
from tld import get_tld
import joblib
import sklearn
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder

nltk.download('punkt')
nltk.download('stopwords')
nltk.download('words')
nltk.download('punkt_tab')


ENGLISH_WORDS = set(words.words())
STOP_WORDS = set(stopwords.words('english'))

#define function to clean statement
def preprocess_string(s):
    s = re.sub(r"[^\w\s]", '', s)
    s = re.sub(r"\s+", ' ', s)     # Replace multiple spaces with a single space
    s = re.sub(r"\d", '', s)       # Remove digits
    return s.strip()


def remove_stop_words(text):
    # Tokenize the text
    tokens = word_tokenize(text)

    # Filter out the stop words
    filtered_tokens = [word for word in tokens if word.lower() not in STOP_WORDS]

    # Join the tokens back into a string
    return ' '.join(filtered_tokens)


def remove_non_english_words(text):
    # Extract words from the text using regex
    words_in_text = re.findall(r'\b\w+\b', text)

    # Filter out non-English words
    english_only = [word for word in words_in_text if word.lower() in ENGLISH_WORDS]

    # Join the filtered words back into a string
    return ' '.join(english_only)

import re

def replace_sql_keywords(user_input):
    # Define a dictionary of SQL keywords and their replacements
    keyword_replacements = {
        r"\bselect\b": "retrieve",  
        r"\binsert\b": "add",       
        r"\bupdate\b": "modify",    
        r"\bdelete\b": "remove",    
        r"\bcreate\b": "build",     
        r"\balter\b": "change",     
        r"\bdrop\b": "discard",     
        r"\bbegin\b": "start",      
        r"\bcommit\b": "finalize",  
        r"\brollback\b": "undo",   
        r"\bgrant\b": "allow",      
        r"\brevoke\b": "deny",      
    }

    # Convert input to lowercase for case-insensitive matching
    user_input_lower = user_input.lower()

    # Check for each SQL keyword pattern and replace the first occurrence
    for pattern, replacement in keyword_replacements.items():
        # If a pattern is found, replace the first occurrence and stop
        if re.search(pattern, user_input_lower):
            user_input = re.sub(pattern, replacement, user_input, count=1, flags=re.IGNORECASE)
            break

    return user_input


def remove_greetings(email_content):
    greetings = [
        r"best regards", r"sincerely", r"thank you", r"thanks", r"kind regards", 
        r"cheers", r"warm regards", r"yours sincerely", r"yours truly", 
        r"regards", r"with gratitude", r"respectfully"
    ]
    
    pattern = r"(?:{})\s*(?:(?:\n|$)|(?:,\s*)|\b)".format('|'.join(greetings))
    
    cleaned_email = re.sub(pattern, '', email_content, flags=re.IGNORECASE).strip()
    
    return cleaned_email

# define a function to process user's input
def process_single_text(text, vocab, max_sequence_length=350, unk_index=None):
    # Preprocess the input text (cleaning, removing non-English words, and stopwords)
    text = preprocess_string(text)
    text = remove_non_english_words(text)
    text = remove_stop_words(text)
    text = remove_greetings(text)

    # Tokenize the preprocessed text
    tokens = word_tokenize(text.lower())

    # Convert tokens to their corresponding indices in the vocab, using <unk> for unknown words
    if unk_index is None:
        unk_index = vocab.get("<unk>", len(vocab))

    token_indices = [vocab.get(token, unk_index) for token in tokens]

    # Pad or truncate the tokenized sequence
    if len(token_indices) > max_sequence_length:
        token_indices = token_indices[:max_sequence_length]
    else:
        # Pad with 0 (assuming <pad> is mapped to index 0)
        token_indices.extend([0] * (max_sequence_length - len(token_indices)))

    # Convert the sequence to a tensor
    processed_tensor = torch.tensor(token_indices, dtype=torch.long)

    return processed_tensor


#Define a function to check if the user's input is mostly English
def is_mostly_english(text, threshold=0.5):
    tokens = [word.lower() for word in text.split() if word.isalpha()]
    english_count = sum(1 for word in tokens if word in ENGLISH_WORDS)

    if len(tokens) == 0:
      return False
    english_ratio = english_count / len(tokens)
    if english_ratio > threshold:
      return(True)
    else:
      return(False)


# Use the model to analyze user's email and return email type, reasons and recommendation
def take_clean_input(email_content, vocab, model):
  if email_content == '':
    email_type = 'Could not tell'
    reason = 'there is no content input'
    recommendation = 'input your email content or website link you want to check before clickng the check button'
    prob = None
    return prob, email_type, reason, recommendation


  elif len(email_content.split()) <= 10:
    email_type = 'Could not tell'
    reason = 'there is no enough content provided'
    recommendation = 'make sure the content input has more than 10 English words'
    prob = None
    return  prob, email_type, reason, recommendation


  elif not is_mostly_english(email_content):
    email_type = 'Could not tell'
    reason = 'the email content are not primarily in English'
    recommendation = 'make sure the content you input is in English'
    prob = None
    return prob, email_type, reason, recommendation
  
  elif len(email_content.split()) > 500:
    email_type = 'Could not tell'
    reason = 'the words you entered exceed our word limit'
    recommendation = 'make sure you input no more than 500 words'
    prob = None
    return prob, email_type, reason, recommendation
  
  else:
    email_content = replace_sql_keywords(email_content)
    processed_email_tensor = process_single_text(email_content, vocab, max_sequence_length=350, unk_index=vocab["<unk>"])
    processed_email_tensor = processed_email_tensor.unsqueeze(0)
    with torch.no_grad():  # No need to track gradients during inference
      logits = model(processed_email_tensor)

    probabilities = torch.softmax(logits, dim=1)
    label = torch.argmax(probabilities, dim=1).item()
    label = int(label)
    if label == 0:
      email_type = "Safe email"
      reason = 'The email content does not raise any red flags and appears to be routine communication'
      recommendation = 'No special action is required, handle this email as you would with any other legitimate message.'
    elif label == 1:
      email_type = "Phishing email"
      reason = 'The email contains a suspicious link that could lead to a phishing site, which is a common indicator of phishing'
      recommendation = 'Avoid interacting with this email, verify it through official channels, and report it as phishing if you suspect it is not legitimate.'

    elif label == 2:
      email_type = "Phishing email"
      reason = 'The email has common signs of a scam, like unexpected offers or unusual requests for you to take action'
      recommendation = 'Be cautious with this email, report it as phishing if unsure, and always verify the source before acting.'

    elif label == 3:
      email_type = "Safe email"
      reason = 'The email includes discussion of a project update or report, which are typical of legitimate professional communication'
      recommendation = 'This appears to be a normal email, you can proceed as usual.'

    elif label == 4 :
      email_type = 'Safe Email'
      reason = 'The email includes mention of scheduling a meeting or appointment, discussion of a project update or report, which are typical of legitimate professional communication'
      recommendation = 'This appears to be a normal email, you can proceed as usual.'

    elif label == 5:
      email_type = 'Phishing Email'
      reason = 'The email contains a call to action like ''Click here'' or ''Login'',  which is a common indicator of phishing'
      recommendation = 'Do not interact with this email or provide personal information; verify its authenticity through official channels and report it as phishing if it is suspicious.'

    elif label == 6:
      email_type = 'Safe Email'
      reason = 'The email includes mention of scheduling a meeting or appointment, which are typical of legitimate professional communication'
      recommendation = 'This appears to be a normal email, you can proceed as usual.'

    elif label == 7:
      email_type = 'Phishing Email'
      reason = 'The email offers an unexpected discount or special deal. This is a common sign of a scam'
      recommendation = 'Avoid interacting with the email, verify its authenticity through official channels, and report it as phishing if suspicious.'

    elif label == 8:
      email_type = 'Phishing Email'
      reason = 'The email contains urgent language like ''Urgent'' or ''Immediate action required'' and includes a suspicious link, both of which are common indicators of phishing'
      recommendation = 'Avoid interacting with the email, verify its authenticity through official channels, and report it as phishing if suspicious.'


    elif label == 9:
      email_type = 'Phishing Email'
      reason = 'The email contains a call to action like ''Click here'' or ''Login'' and includes a suspicious link that could lead to a phishing site, both of which are common indicators of phishing'
      recommendation = 'Avoid interacting with the email, verify its authenticity through official channels, and report it as phishing if suspicious.'

    elif label == 10:
      email_type = 'Phishing Email'
      reason = 'The email contains urgent language like ''Urgent'' or ''Immediate action required'', which are common indicators of phishing'
      recommendation = 'Avoid interacting with the email, verify its authenticity through official channels, and report it as phishing if suspicious.'


    elif label == 11:
      email_type = 'Phishing Email'
      reason = 'The email contains an offer of a prize or reward, which are common indicators of phishing'
      recommendation = 'Avoid interacting with the email, verify its authenticity through official channels, and report it as phishing if suspicious.'


    elif label == 12:
      email_type = 'Phishing Email'
      reason = 'The email offers an unexpected discount or special deal and includes a suspicious link that could take you to a fake website, which are common signs of a scam'
      recommendation = 'Avoid interacting with the email, verify its authenticity through official channels, and report it as phishing if suspicious.'


    elif label == 13:
      email_type = 'Phishing Email'
      reason = 'The email asks you to do something like ''Click here'' or ''Login'' and offers an unexpected discount or special deal, both of which are common signs of a scam'
      recommendation = 'Avoid interacting with the email, verify its authenticity through official channels, and report it as phishing if suspicious.'


    elif label == 14:
      email_type = 'Phishing Email'
      reason = 'The email contains a call to action like ''Click here'' or ''Login'' and uses urgent language like ''Urgent'' or ''Immediate action required'', both of which are common indicators of phishing'
      recommendation = 'Avoid interacting with the email, verify its authenticity through official channels, and report it as phishing if suspicious.'


    elif label == 15:
      email_type = 'Phishing Email'
      reason = 'The email contains an offer of a prize or reward and includes a suspicious link that could lead to a phishing site, both of which are common indicators of phishing'
      recommendation = 'Avoid interacting with the email, verify its authenticity through official channels, and report it as phishing if suspicious.'

    elif label == 16 or label == 19:
      email_type = 'Phishing Email'
      reason = 'The email contains a call to action like ''Click here'' or ''Login'', an unsolicited discount or special offer, and a suspicious link that could lead to a phishing site, all of which are common indicators of phishing'
      recommendation = 'Avoid interacting with the email, verify its authenticity through official channels, and report it as phishing if suspicious.'


    elif label == 17:
      email_type = 'Phishing Email'
      reason = 'The email contains a call to action like ''Click here'' or ''Login'', an offer of a prize or reward, which are common indicators of phishing'
      recommendation = 'Avoid interacting with the email, verify its authenticity through official channels, and report it as phishing if suspicious.'


    elif label == 18:
      email_type = 'Phishing Email'
      reason = 'The email contains an offer of a prize or reward, an unsolicited discount or special offer, a suspicious link, which could lead to a phishing site, which are common indicators of phishing'
      recommendation = 'Avoid interacting with the email, verify its authenticity through official channels, and report it as phishing if suspicious.'


    elif label == 20 or label == 21:
      email_type = 'Phishing Email'
      reason = 'The email contains a call to action like ''Click here'' or ''Login'', an offer of a prize or reward, a suspicious link, which could lead to a phishing site, which are common indicators of phishing'
      recommendation = 'Avoid interacting with the email, verify its authenticity through official channels, and report it as phishing if suspicious.'


    elif label == 22 or label == 23:
      email_type = 'Phishing Email'
      reason = 'The email contains urgent language like ''Urgent'' or ''Immediate action required'', an offer of a prize or reward, which are common indicators of phishing'
      recommendation = 'Avoid interacting with the email, verify its authenticity through official channels, and report it as phishing if suspicious.'
    
    safe_probs_index = [0, 3, 4, 6] 
    if label == 0 or label == 3 or label == 4 or label == 6:
      selected_values = probabilities[:, safe_probs_index]  # Extract values at these indices
      sum_values = selected_values.sum(dim=1)  # Sum the values across the selected indices for each batch element
      prob = sum_values[0].item() * 100
      prob = float(f"{prob:.3f}"[:-1]) 

    else:
       safe_probs = probabilities[:, safe_probs_index]
       safe_total_prob = safe_probs.sum(dim=1)
       safe_prob = safe_total_prob[0].item()
       prob = (1 - safe_prob) * 100
       prob = float(f"{prob:.3f}"[:-1]) 
       
    
    return prob, email_type, reason, recommendation


#Define model structure
class LSTMDropoutClassifier(nn.Module):
    def __init__(self, vocab_size, embedding_dim, hidden_dim, output_size, num_layers, dropout):
        super(LSTMDropoutClassifier, self).__init__()
        self.embedding = nn.Embedding(vocab_size, embedding_dim, padding_idx=0)  # Embedding layer

        # First LSTM layer
        self.lstm1 = nn.LSTM(embedding_dim, hidden_dim, num_layers=1, batch_first=True)
        self.dropout1 = nn.Dropout(dropout)  # Dropout after first LSTM

        # Second LSTM layer
        self.lstm2 = nn.LSTM(hidden_dim, hidden_dim, num_layers=1, batch_first=True)
        self.dropout2 = nn.Dropout(dropout)  # Dropout after second LSTM

        # Fully connected layer
        self.fc1 = nn.Linear(hidden_dim, 64)  # First dense layer
        self.relu = nn.ReLU()  # ReLU activation

        # Final classification layer
        self.fc2 = nn.Linear(64, output_size)  # Final output layer with 24 classes

    def forward(self, x):
        # Embedding
        x = self.embedding(x)

        # First LSTM layer
        lstm_out, _ = self.lstm1(x)
        lstm_out = self.dropout1(lstm_out)

        # Second LSTM layer
        lstm_out, _ = self.lstm2(lstm_out)
        lstm_out = self.dropout2(lstm_out)

        # Get the final hidden state (from the last time step)
        final_hidden_state = lstm_out[:, -1, :]  # Get the last output of the LSTM

        # Pass through dense layers
        out = self.fc1(final_hidden_state)
        out = self.relu(out)
        out = self.fc2(out)

        return out



# Backend functions for URL detection model
def extract_url(t):
   url_regex = r"(?i)\b((?:https?://|www\d{0,3}[.]|)[a-z0-9.\-]+[.][a-z]{2,4}(?:/[^()\s<>]*|\([^()\s<>]*\))*[^()\s`!()\[\]{};:'\".,<>?«»“”‘’]*)"
   result = re.findall(url_regex, t)
   return(result) #List of URLs

def having_ip_address(url):
    match = re.search(
        '(([01]?\\d\\d?|2[0-4]\\d|25[0-5])\\.([01]?\\d\\d?|2[0-4]\\d|25[0-5])\\.([01]?\\d\\d?|2[0-4]\\d|25[0-5])\\.'
        '([01]?\\d\\d?|2[0-4]\\d|25[0-5])\\/)|'  # IPv4
        '((0x[0-9a-fA-F]{1,2})\\.(0x[0-9a-fA-F]{1,2})\\.(0x[0-9a-fA-F]{1,2})\\.(0x[0-9a-fA-F]{1,2})\\/)' # IPv4 in hexadecimal
        '(?:[a-fA-F0-9]{1,4}:){7}[a-fA-F0-9]{1,4}', url)  # Ipv6
    return 1 if match else 0

def abnormal_url(url):
    hostname = urlparse(url).hostname
    hostname = str(hostname)
    match = re.search(hostname, url)
    
    return 1 if match else 0

def no_of_dir(url):
    urldir = urlparse(url).path
    return urldir.count('/')

def no_of_embed(url):
    urldir = urlparse(url).path
    return urldir.count('//')

def suspicious_words(url):
    match = re.search('PayPal|login|signin|bank|account|update|free|lucky|service|bonus|ebayisapi|webscr',
                      url)
    return 1 if match else 0

def shortening_service(url):
    match = re.search('bit\.ly|goo\.gl|shorte\.st|go2l\.ink|x\.co|ow\.ly|t\.co|tinyurl|tr\.im|is\.gd|cli\.gs|'
                      'yfrog\.com|migre\.me|ff\.im|tiny\.cc|url4\.eu|twit\.ac|su\.pr|twurl\.nl|snipurl\.com|'
                      'short\.to|BudURL\.com|ping\.fm|post\.ly|Just\.as|bkite\.com|snipr\.com|fic\.kr|loopt\.us|'
                      'doiop\.com|short\.ie|kl\.am|wp\.me|rubyurl\.com|om\.ly|to\.ly|bit\.do|t\.co|lnkd\.in|'
                      'db\.tt|qr\.ae|adf\.ly|goo\.gl|bitly\.com|cur\.lv|tinyurl\.com|ow\.ly|bit\.ly|ity\.im|'
                      'q\.gs|is\.gd|po\.st|bc\.vc|twitthis\.com|u\.to|j\.mp|buzurl\.com|cutt\.us|u\.bb|yourls\.org|'
                      'x\.co|prettylinkpro\.com|scrnch\.me|filoops\.info|vzturl\.com|qr\.net|1url\.com|tweez\.me|v\.gd|'
                      'tr\.im|link\.zip\.net',
                      url)
    return 1 if match else 0

def count_digit(url):
    return sum(c.isdigit() for c in url)

def count_letter(url):
    return sum(c.isalpha() for c in url)

def fd_length(url):
    urlpath= urlparse(url).path
    try:
        return len(urlpath.split('/')[1])
    except:
        return 0
    
def tld_length(tld):
    try:
        return len(tld)
    except:
        return -1
    

def process_input_url(input):
  feature_dict = {}
  feature_dict['use_of_ip'] = []
  feature_dict['abnormal_url'] = []
  feature_dict['count.'] = []
  feature_dict['count-www'] = []
  feature_dict['count@'] = []
  feature_dict['count_dir'] = []
  feature_dict['count_embed_domian'] = []
  feature_dict['sus_words'] = []
  feature_dict['short_url'] = []
  feature_dict['count-https'] = []
  feature_dict['count-http'] =  []
  feature_dict['count%'] =[]
  feature_dict['count-'] = []
  feature_dict['count='] = []
  feature_dict['count-digits'] = []
  feature_dict['count-letters'] = []
  feature_dict['url_length'] = []
  feature_dict['hostname_length'] = []
  feature_dict['fd_length'] = []
  feature_dict['tld_length'] = []
  if extract_url(input):
     url_list = extract_url(input)
     for i in url_list:
        feature_dict['use_of_ip'].append(having_ip_address(i)) 
        feature_dict['abnormal_url'].append(abnormal_url(i)) 
        feature_dict['count.'].append(i.count('.'))
        feature_dict['count-www'].append(i.count('www')) 
        feature_dict['count@'].append(i.count('@')) 
        feature_dict['count_dir'].append(no_of_dir(i)) 
        feature_dict['count_embed_domian'].append(no_of_embed(i)) 
        feature_dict['sus_words'].append(suspicious_words(i))
        feature_dict['short_url'].append(shortening_service(i))
        feature_dict['count-https'].append(i.count('https'))
        feature_dict['count-http'].append(i.count('http'))
        feature_dict['count%'].append(i.count('%'))
        feature_dict['count-'].append(i.count('-'))
        feature_dict['count='].append(i.count('='))
        feature_dict['count-digits'].append(count_digit(i))
        feature_dict['count-letters'].append(count_letter(i))
        feature_dict['url_length'].append(len(str(i)))
        feature_dict['hostname_length'].append(len(urlparse(i).netloc))
        feature_dict['fd_length'].append(fd_length(i))
        tld = get_tld(i, fail_silently=True)
        feature_dict['tld_length'].append(tld_length(tld))

     df = pd.DataFrame(feature_dict)
     return(df)
  else: 
     return(None)



####### Prediction function called by backend ########
def predict(features: str) -> str:
    # Fraud email detection
    #load vocab
    with open('fraud_detection/backend/vocab.json', 'r') as file:
        vocab = json.load(file)
    
    #Load model
    embedding_dim = 128  # Embedding size
    hidden_dim = 256  # Hidden size for LSTM
    output_size = 24  # Number of output classes (24 in your case)
    num_layers = 2  # Number of LSTM layers
    dropout = 0.2  # Dropout rate
    vocab_size = len(vocab) + 1


    loaded_model = LSTMDropoutClassifier(vocab_size, embedding_dim, hidden_dim, output_size, num_layers, dropout)
    loaded_model.load_state_dict(torch.load("fraud_detection/backend/deeper_bilstm_with_dropout.pth", weights_only=True))
    loaded_model.eval()


    prob, email_type, reason, recommendation = take_clean_input(features, vocab, loaded_model)
    email_type = email_type.lower()


    # URL detection
    label_mapping = ['safe', 'defacement', 'malware', 'phishing']
    url_list = extract_url(features)
    url_features = process_input_url(features)
    if url_features is not None:
       with open('fraud_detection/backend/xgb.joblib', 'rb') as f:
          loaded_rf = joblib.load(f)       
       url_predictions = loaded_rf.predict(url_features)
       url_predictions = url_predictions.tolist()
       url_types = [label_mapping[i] for i in url_predictions]
       url_num = len(url_types)

    # Converage the predictions together

    # If user only input the URL or the input content except the URL is too short
    if url_features is not None and prob is None: 
       url_print = ''
       for i in range(url_num):
          url_print = url_print + '{} : {}.<br>'.format(url_list[i], url_types[i])
       prediction = '{} URL detected, the identified type for the URL is as follows: <br>'.format(url_num) + url_print

    elif url_features is not None and prob is not None:
      url_print = ''
      for i in range(url_num):
         if url_types[i] != 'safe':
            url_print = url_print + '{} : {}.<br>'.format(url_list[i], url_types[i])

      if url_print != '':
         prediction ='The email content is most likely a phishing email, with probability {} %. This is because at least one malicious website link was detected.<br> The detected malicious links are listed as below:<br>'.format(prob) + url_print

      else:
         prediction = 'This email is most likely a {}, with probability {} %.<br> Reason: {}.<br> Recommendation: {}'.format(email_type, prob, reason, recommendation)
         

    elif url_features is None and prob is None:
       prediction = 'We could not identify the safety of the input, the reason is that {}, please {}'.format(reason.lower(), recommendation.lower())

    else:
       prediction = 'This email is most likely a {}, with probability {} %.<br> Reason: {}.<br>  Recommendation: {}'.format(email_type, prob, reason, recommendation)
   
    return prediction


if __name__ == '__main__':
  test = "lowers blood pressure and cholesterol let ' s face it , age should be nothing more than a number it ' s okay to want to hold on to your young body as long as you can with increasing longevity for an increasing segment of the population , this is the frontier for the new millennium - dr virgil howard view more about a new lifespan enhancement press here we ship right to your door sorry not for me and the twenty trials compared the same lactam all cause fatality the most significant and objective outcome was not reduced by the addition of aminoglycosides clinical and bacteriological failure which may be prone to bias with nonblinded trials and are of much lesser relevance to patients were not significantly different the wind at first sent him spinning away to the south , but he continued to rise until he was above the air currents , and the storm raged far beneath him"
  prediction = predict(test)
  print(prediction)