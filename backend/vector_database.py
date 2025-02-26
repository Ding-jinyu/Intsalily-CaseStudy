from dotenv import load_dotenv
import os
import faiss
import openai
import numpy as np

load_dotenv()

products = [
    "Aerator", "Air Compressor", "Air Conditioner", "Auger", "Blower", "Chainsaw", 
    "Chipper Shredder", "Clearing Saw", "Cooktop", "Cultivator", "Dehumidifier", 
    "Dethatcher", "Dishwasher", "Dryer", "Edger", "Freezer", "Garbage Disposal", 
    "Generator", "Hedge Trimmer", "Ice Maker", "Laundry Accessories", "Lawn Mower", 
    "Lawn Tractor", "Lawn Tractor Accessories", "Log Splitter", "Microwave", 
    "Microwave Oven Combo", "Pole Saw", "Power Broom", "Pressure Washer", 
    "Refrigerator", "Seeder", "Small Engine", "Snow Blower", "Sod Cutter", 
    "Sprayer", "Spreader", "Stove/Oven", "String Trimmer", "Stump Grinder", 
    "Sweeper", "Tiller", "Trash Compactor", "Wall Oven", "Washer", 
    "Washer Dryer Combo", "Water Pump"
]


brands = [
    "Admiral", "Amana", "Ariens", "Bosch", "Briggs and Stratton", "Caloric", 
    "Crosley", "Dacor", "Echo", "Electrolux", "Estate", "Frigidaire", 
    "General Electric", "Gibson", "Haier", "Hardwick", "Hoover", "Hotpoint", 
    "Husqvarna", "Inglis", "Jenn-Air", "Kawasaki", "Kelvinator", "Kenmore", 
    "KitchenAid", "Kohler", "LG", "Lawn Boy", "MTD", "Magic Chef", "Maytag", 
    "Murray", "Norge", "Poulan", "RCA", "Roper", "Ryobi", "Samsung", "Sharp", 
    "Shindaiwa", "Snapper", "Speed Queen", "Tappan", "Tecumseh", "Toro", 
    "Troy-Bilt", "Weed Eater", "Whirlpool", "White-Westinghouse"
]


keywords = [
    "part number", "compatibility", "install", "fix", 
    "repair","shopping", "help", "model", "appliance", "support", "order", "status", 
    "delivery", "returns", "refund", "cancel","price", "cost", "payment", "methods", 
    "warranty", "guide", "manual", "problem", "issue"
]

openai.api_key = os.environ['OPENAI_API_KEY']

def create_embedding(text):
    response = openai.embeddings.create(
        input=[text],
        model="text-embedding-ada-002"
    )
    return response.data[0].embedding

# create embeddings
product_embeddings = np.array([create_embedding(product) for product in products]).astype('float32')
brand_embeddings = np.array([create_embedding(brand) for brand in brands]).astype('float32')
keyword_embeddings = np.array([create_embedding(keyword) for keyword in keywords]).astype('float32')

# combine products, brands, and keywords embeddings
all_embeddings = np.concatenate((product_embeddings, brand_embeddings, keyword_embeddings), axis=0)

embedding_dim = all_embeddings.shape[1]
print(f"Embedding dimension: {embedding_dim}")

# create Index
index = faiss.IndexFlatL2(embedding_dim)  
index.add(all_embeddings)

faiss.write_index(index, 'products_brands_keywords.index')
np.save('products_brands_keywords_metadata.npy', np.array(products + brands + keywords))