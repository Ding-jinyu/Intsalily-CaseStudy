# **PartSelect Chatbot**

This project is a chatbot designed to assist users with machine parts on the PartSelect e-commerce website. It integrates a **FAISS vector database** for relevance checking, **Puppeteer** for fetching part details, and the **DeepSeek API** for generating natural responses.

---

## **Setup Instructions**

### **1. Clone the Repository**

```bash
git clone https://github.com/Ding-jinyu/Intsalily-CaseStudy.git
```


### **2. Set Up Environment Variables**


1. Navigate to the `backend` directory:

   ```
   cd backend
   ```
2. Create a `.env` file:

   ```
   touch .env
   ```
3. Add the following keys to the `.env` file:

   ```
   DEEPSEEK_API_KEY=your_deepseek_api_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   ```

   Replace `your_deepseek_api_key_here` `your_openai_api_key_here` with your actual API key.


### **3. Start the FAISS Microservice**

1. Navigate to the `backend` directory:

   ```
   cd backend
   ```
2. Run the FAISS microservice:

   ```
   python faiss_microservice.py
   ```

   This will start the FAISS server on port `5002`.

### **4. Start the Backend Server**

1. In the `backend` directory, start the backend server:

   ```
   node server.js
   ```

   This will start the backend server on port `5001`.

---

### **5. Start the Frontend**

1. Navigate to the `frontend` directory:

   ```
   cd ../frontend
   ```
2. Start the frontend development server:

   ```
   npm start
   ```

   This will start the frontend on port `3000`. Open your browser and navigate to `http://localhost:3000` to view the chatbot.

---

## **Project Structure**

Copy

```
partselect-chatbot/
├── backend/
│   ├── server.js               # Backend server (Node.js/Express)
│   ├── faiss_microservice.py   # FAISS vector database server
│   ├── .env                    # Environment variables for API keys
│   └── ...                     # Other backend files
├── frontend/
│   ├── public/                 # Static assets and HTML template
│   ├── src/                    # React components and styles
│   └── ...                     # Other frontend files
└── README.md                   # Project documentation
```
