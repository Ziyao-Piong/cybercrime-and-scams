# cybercrime-and-scams

# How to run Scrollystory
# 1. In the scrollytelly file, there are 2 main files:
# - data.py: Data API
# - index.html

# To run the data.py file, paste the following in the terminal
# uvicorn scrollytelly.data:app --reload
# You can check it is working by going to http://127.0.0.1:8000/docs
# If you have an issue running the above, it might be because of the directory you are in. 
# Try uvicorn data:app --reload

# To fun the index.html file, I use Live Server. It should be live on http://127.0.0.1:5500/scrollytelly/index.html