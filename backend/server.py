from flask import Flask, request, jsonify
from model import run_model  # Import the run_model function

app = Flask(__name__)

@app.route("/api/chat", methods=["POST"])
def chat():
    user_query = request.json.get("message")

    # Prepare the input for the model
    model_input = {
        "prompt": user_query,
        "image_paths": [],  # No images
    }

    # Run the model
    response = run_model(model_input)

    # Return the response
    return jsonify({"role": "assistant", "content": response[0]['lm_response']})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)