from flask import Flask, request, jsonify
import faiss
import numpy as np
import openai
import os
from dotenv import load_dotenv

app = Flask(__name__)

load_dotenv()

openai.api_key = os.getenv('OPENAI_API_KEY')

# load FAISS index and metadata
try:
    index = faiss.read_index("products_brands_keywords.index")
    metadata = np.load("products_brands_keywords_metadata.npy", allow_pickle=True)
    print('FAISS index and metadata loaded successfully.')
except Exception as e:
    print(f'Error loading FAISS index or metadata: {e}')

def create_embedding(text):
    text = text.replace("\n", " ")
    try:
        response = openai.embeddings.create(
            input=[text],
            model="text-embedding-ada-002"
        )
        print(f"Embedding response for '{text}': {response}")  
        embedding = np.array(response.data[0].embedding, dtype='float32')
        return embedding
    except Exception as e:
        print(f'Error creating embedding for text "{text}": {e}')
        return None

@app.route('/query', methods=['POST'])
def query():
    data = request.json
    text = data['text']
    vector = create_embedding(text)

    if vector is None:
        return jsonify({"error": "Failed to create embedding"}), 500
    
    k = 3  # get more potential matches
    try:
        D, I = index.search(np.expand_dims(vector, axis=0), k)
        keywords_present = [keyword for keyword in metadata if keyword.lower() in text.lower()]
        closest_match = None

        if keywords_present:
            closest_match = keywords_present[0]  # prioritize keyword match
        else:
            for dist, idx in zip(D[0], I[0]):
                if dist < 0.3:  
                    closest_match = metadata[idx]
                    break

        result = {
            "closest_match": closest_match,
            "distance": float(D[0][0]) if closest_match else float('inf')
        }
        return jsonify(result)
    except Exception as e:
        print(f'Error during FAISS index search: {e}')
        return jsonify({"error": f"Error during FAISS index search: {e}"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002)