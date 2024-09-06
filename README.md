# CYBERCRIME & SCAMS

# Frontend Setup
Follow these steps to start the frontend:

1. **Navigate to the `frontend` Directory:**
2. **Open the Home Page:**
   - Double-click on `index.html` to open the home page in the web browser

# Backend Setup
Follow these steps to run the Scrollystory:

1. **Download Python if you don't have it installed on your computer**
   - https://www.python.org/downloads/
2. **Navigate to `scrollytelly` the Directory**
```bash
   cd path/to/scrollytelly
```
3. **Download all the required dependencies specified in the `requirements.txt` file**
```bash
   pip install uvicorn fastapi pymysql pandas
```
4. **Run the `data.py` script for starting the backend**
```bash
   uvicorn scrollytelly.data:app --reload
```
   - You can check it is working by going to http://127.0.0.1:8000/docs
   - If you have an issue running the above, it might be because of the directory you are in.
   - Try
```bash
   uvicorn data:app --reload
```

5. **(Optional) Run the `data.html` file in the web browser**
   - Download the `Live Server` extension in the Visual Studio Code
   - Open the `data.html` file in the VS Code
   - Right-click on the file and select `open with Live Server`
   - It should be live on the URL `http://127.0.0.1:5500/scrollytelly/index.html`
