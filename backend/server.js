require('dotenv').config();
const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');
const axios = require('axios'); 
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 5001;

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY
});

app.use(cors());
app.use(express.json());

// function to fetch PartSelect page and extract the header using Puppeteer
async function fetchPartSelectPage(partNumber) {
  const browser = await puppeteer.launch({ headless: false }); 
  const page = await browser.newPage();

  try {
    console.log(`Navigating to https://www.partselect.com/Models/${partNumber}/`);
    await page.goto(`https://www.partselect.com/Models/${partNumber}/`, {
      waitUntil: 'networkidle2', 
      timeout: 60000 
    });

    // extract the page title
    const pageTitle = await page.title();
    console.log(`Page title: ${pageTitle}`);

    // extract the header (h1 tag)
    const header = await page.evaluate(() => {
      return document.querySelector('h1')?.innerText.trim() || 'No header found';
    });
    console.log(`Extracted header: ${header}`);

    return header;
  } catch (error) {
    console.error('Error fetching PartSelect page:', error);
    return null;
  } finally {
    await browser.close();
  }
}

// function to check relevance using FAISS microservice
async function checkRelevance(text) {
  try {
    console.log('Checking relevance for text:', text);
    const response = await axios.post('http://localhost:5002/query', { text });
    console.log('Relevance response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error querying FAISS service:', error.response ? error.response.data : error.message);
    throw new Error('Relevance check failed');
  }
}

// function to generate a response using DeepSeek API
async function generateResponseWithContext(userMessage, context) {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "You are an assistant focused on providing product information and support for parts offered on the PartSelect website. Do not answer questions outside of this scope." },
        { role: "user", content: `Context: ${context}\n\nUser Question: ${userMessage}` }
      ],
      model: "deepseek-chat",
      stream: false 
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error generating response with DeepSeek:', error);
    throw error;
  }
}

app.post('/api/message', async (req, res) => {
  const userMessage = req.body.message;
  console.log('Received message from frontend:', userMessage);

  try {
    // check relevance using FAISS 
    const relevanceResult = await checkRelevance(userMessage);
    console.log('Relevance result:', relevanceResult);

    if (!relevanceResult.closest_match) {
      res.json({
        role: 'assistant',
        content: "I'm sorry, but I can only assist with questions related to the products and brands offered on the PartSelect website. Please ask a relevant question."
      });
      return;
    }

    // extract part number from the user's message
    const partNumberMatch = userMessage.match(/[A-Za-z]*\d{2,}[A-Za-z\d]*/);
    const partNumber = partNumberMatch ? partNumberMatch[0] : null;

    let context = null;
    if (partNumber) {
      // fetch PartSelect page and extract the header
      context = await fetchPartSelectPage(partNumber);
    }

    // generate a response using DeepSeek API
    let aiMessage;
    if (context) {
      aiMessage = await generateResponseWithContext(userMessage, `This page is about ${context}.`);
    } else {
      aiMessage = await generateResponseWithContext(userMessage, 'No context available.');
    }

    res.json({ role: 'assistant', content: aiMessage });
  } catch (error) {
    console.error('Error during API call:', error);
    res.status(500).send('An error occurred');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});