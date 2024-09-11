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


# define a function to process user's input
def process_single_text(text, vocab, max_sequence_length=350, unk_index=None):
    # Preprocess the input text (cleaning, removing non-English words, and stopwords)
    text = preprocess_string(text)
    text = remove_non_english_words(text)
    text = remove_stop_words(text)

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
  if not is_mostly_english(email_content):
    print('The email content are not mostly in English, please enter English content')
  else:
    processed_email_tensor = process_single_text(email_content, vocab, max_sequence_length=350, unk_index=vocab["<unk>"])
    processed_email_tensor = processed_email_tensor.unsqueeze(0)
    with torch.no_grad():  # No need to track gradients during inference
      logits = model(processed_email_tensor)

    probabilities = torch.softmax(logits, dim=1)
    label = torch.argmax(probabilities, dim=1).item()
    label = int(label)
    if label == 0:
      email_type = "Safe email"
      reason = 'The email content does not raise any red flags and appears to be routine communication.'
      recommendation = 'No special action is required. Handle this email as you would with any other legitimate message.'
    elif label == 1:
      email_type = "Phishing email"
      reason = 'The email contains a suspicious link, which could lead to a phishing site, which are common indicators of phishing.'
      recommendation = 'Avoid interacting with this email. Do not click on any links or provide personal information. Instead, verify the authenticity of the message through official channels. Report the email as phishing if you suspect it is not legitimate.'

    elif label == 2:
      email_type = "Phishing email"
      reason = 'The email contains general characteristics of a phishing attempt, such as unsolicited offers or abnormal requests for action.'
      recommendation = 'Exercise caution with this email. If you are unsure about its legitimacy, report it as phishing. Always verify the source before taking any action.'

    elif label == 3:
      email_type = "Safe email"
      reason = 'The email includes discussion of a project update or report, which are typical of legitimate professional communication.'
      recommendation = 'This appears to be a normal email. You can proceed as usual.'

    elif label == 4 :
      email_type = 'Safe Email'
      reason = 'The email includes mention of scheduling a meeting or appointment, discussion of a project update or report, which are typical of legitimate professional communication.'
      recommendation = 'This appears to be a normal email. You can proceed as usual.'

    elif label == 5:
      email_type = 'Phishing Email'
      reason = 'The email contains a call to action like ''Click here'' or ''Login'',  which are common indicators of phishing.'
      recommendation = 'Avoid interacting with this email. Do not click on any links or provide personal information. Instead, verify the authenticity of the message through official channels. Report the email as phishing if you suspect it is not legitimate.'

    elif label == 6:
      email_type = 'Safe Email'
      reason = 'The email includes mention of scheduling a meeting or appointment, which are typical of legitimate professional communication.'
      recommendation = 'This appears to be a normal email. You can proceed as usual.'

    elif label == 7:
      email_type = 'Phishing Email'
      reason = 'The email contains an unsolicited discount or special offer, which are common indicators of phishing.'
      recommendation = 'Avoid interacting with this email. Do not click on any links or provide personal information. Instead, verify the authenticity of the message through official channels. Report the email as phishing if you suspect it is not legitimate.'

    elif label == 8:
      email_type = 'Phishing Email'
      reason = 'The email contains urgent language like ''Urgent'' or ''Immediate action required'' and a suspicious link, which could lead to a phishing site, which are common indicators of phishing.'
      recommendation = 'Avoid interacting with this email. Do not click on any links or provide personal information. Instead, verify the authenticity of the message through official channels. Report the email as phishing if you suspect it is not legitimate.'


    elif label == 9:
      email_type = 'Phishing Email'
      reason = 'The email contains a call to action like ''Click here'' or ''Login'', a suspicious link, which could lead to a phishing site, which are common indicators of phishing.'
      recommendation = 'Avoid interacting with this email. Do not click on any links or provide personal information. Instead, verify the authenticity of the message through official channels. Report the email as phishing if you suspect it is not legitimate.'

    elif label == 10:
      email_type = 'Phishing Email'
      reason = 'The email contains urgent language like ''Urgent'' or ''Immediate action required'', which are common indicators of phishing.'
      recommendation = 'Avoid interacting with this email. Do not click on any links or provide personal information. Instead, verify the authenticity of the message through official channels. Report the email as phishing if you suspect it is not legitimate.'


    elif label == 11:
      email_type = 'Phishing Email'
      reason = 'The email contains an offer of a prize or reward, which are common indicators of phishing.'
      recommendation = 'Avoid interacting with this email. Do not click on any links or provide personal information. Instead, verify the authenticity of the message through official channels. Report the email as phishing if you suspect it is not legitimate.'


    elif label == 12:
      email_type = 'Phishing Email'
      reason = 'The email contains an unsolicited discount or special offer, a suspicious link, which could lead to a phishing site, which are common indicators of phishing.'
      recommendation = 'Avoid interacting with this email. Do not click on any links or provide personal information. Instead, verify the authenticity of the message through official channels. Report the email as phishing if you suspect it is not legitimate.'


    elif label == 13:
      email_type = 'Phishing Email'
      reason = 'The email contains a call to action like ''Click here'' or ''Login'', an unsolicited discount or special offer, which are common indicators of phishing.'
      recommendation = 'Avoid interacting with this email. Do not click on any links or provide personal information. Instead, verify the authenticity of the message through official channels. Report the email as phishing if you suspect it is not legitimate.'


    elif label == 14:
      email_type = 'Phishing Email'
      reason = 'The email contains a call to action like ''Click here'' or ''Login'', urgent language like ''Urgent'' or ''Immediate action required'', which are common indicators of phishing.'
      recommendation = 'Avoid interacting with this email. Do not click on any links or provide personal information. Instead, verify the authenticity of the message through official channels. Report the email as phishing if you suspect it is not legitimate.'


    elif label == 15:
      email_type = 'Phishing Email'
      reason = 'The email contains an offer of a prize or reward, a suspicious link, which could lead to a phishing site, which are common indicators of phishing.'
      recommendation = 'Avoid interacting with this email. Do not click on any links or provide personal information. Instead, verify the authenticity of the message through official channels. Report the email as phishing if you suspect it is not legitimate.'

    elif label == 16 or label == 19:
      email_type = 'Phishing Email'
      reason = 'The email contains a call to action like ''Click here'' or ''Login'', an unsolicited discount or special offer, a suspicious link, which could lead to a phishing site, which are common indicators of phishing.'
      recommendation = 'Avoid interacting with this email. Do not click on any links or provide personal information. Instead, verify the authenticity of the message through official channels. Report the email as phishing if you suspect it is not legitimate.'


    elif label == 17:
      email_type = 'Phishing Email'
      reason = 'The email contains a call to action like ''Click here'' or ''Login'', an offer of a prize or reward, which are common indicators of phishing.'
      recommendation = 'Avoid interacting with this email. Do not click on any links or provide personal information. Instead, verify the authenticity of the message through official channels. Report the email as phishing if you suspect it is not legitimate.'


    elif label == 18:
      email_type = 'Phishing Email'
      reason = 'The email contains an offer of a prize or reward, an unsolicited discount or special offer, a suspicious link, which could lead to a phishing site, which are common indicators of phishing.'
      recommendation = 'Avoid interacting with this email. Do not click on any links or provide personal information. Instead, verify the authenticity of the message through official channels. Report the email as phishing if you suspect it is not legitimate.'


    elif label == 20 or label == 21:
      email_type = 'Phishing Email'
      reason = 'The email contains a call to action like ''Click here'' or ''Login'', an offer of a prize or reward, a suspicious link, which could lead to a phishing site, which are common indicators of phishing.'
      recommendation = 'Avoid interacting with this email. Do not click on any links or provide personal information. Instead, verify the authenticity of the message through official channels. Report the email as phishing if you suspect it is not legitimate.'


    elif label == 22 or label == 23:
      email_type = 'Phishing Email'
      reason = 'The email contains urgent language like ''Urgent'' or ''Immediate action required'', an offer of a prize or reward, which are common indicators of phishing.'
      recommendation = 'Avoid interacting with this email. Do not click on any links or provide personal information. Instead, verify the authenticity of the message through official channels. Report the email as phishing if you suspect it is not legitimate.'

    return email_type, reason, recommendation


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



####### Prediction function called by backend ########
def predict(features: str) -> str:
    #load vocab
    with open('vocab.json', 'r') as file:
        vocab = json.load(file)
    
    #Load model
    embedding_dim = 128  # Embedding size
    hidden_dim = 256  # Hidden size for LSTM
    output_size = 24  # Number of output classes (24 in your case)
    num_layers = 2  # Number of LSTM layers
    dropout = 0.2  # Dropout rate
    vocab_size = len(vocab) + 1


    loaded_model = LSTMDropoutClassifier(vocab_size, embedding_dim, hidden_dim, output_size, num_layers, dropout)
    loaded_model.load_state_dict(torch.load("deeper_bilstm_with_dropout.pth", weights_only=True))
    loaded_model.eval()
    


    email_type, reason, recommendation = take_clean_input(features, vocab, loaded_model)
    email_type = email_type.lower()
    reason = reason.lower()
    recommendation = recommendation.lower()

    prediction = 'This email is most likely a {}, the reason is that {} The remommendation is that {}'.format(email_type, reason, recommendation)
    return prediction


if __name__ == '__main__':
  test = "lowers blood pressure and cholesterol let ' s face it , age should be nothing more than a number it ' s okay to want to hold on to your young body as long as you can with increasing longevity for an increasing segment of the population , this is the frontier for the new millennium - dr virgil howard view more about a new lifespan enhancement press here we ship right to your door sorry not for me and the twenty trials compared the same lactam all cause fatality the most significant and objective outcome was not reduced by the addition of aminoglycosides clinical and bacteriological failure which may be prone to bias with nonblinded trials and are of much lesser relevance to patients were not significantly different the wind at first sent him spinning away to the south , but he continued to rise until he was above the air currents , and the storm raged far beneath him"
  prediction = predict(test)
  print(prediction)