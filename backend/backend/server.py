from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import os

app = Flask(__name__)
CORS(app)

@app.route("/get-candles", methods=["GET"])
def get_candles():
    tf = request.args.get("tf", "5min")
    company = request.args.get("company", "TCS")
    
    file_path = f"../dataset/{company}_Output/{company}_{tf}.csv"
    if not os.path.exists(file_path):
        return jsonify({"error": "File not found"}), 404

    df = pd.read_csv(file_path)
    df = df.head(50)
    df['datetime'] = pd.to_datetime(df['datetime']).astype(str)
    return jsonify(df.to_dict(orient="records"))

@app.route("/get-patterns", methods=["GET"])
def get_patterns():
    company = request.args.get("company", "TCS")
    
    file_path = f"../dataset/patterns_output/{company}_Output_patterns.csv"
    if not os.path.exists(file_path):
        return jsonify({"error": "Patterns file not found"}), 404

    try:
        df = pd.read_csv(file_path)
        # Convert datetime columns to string for JSON serialization
        datetime_columns = df.select_dtypes(include=['datetime64']).columns
        for col in datetime_columns:
            df[col] = df[col].astype(str)
        
        return jsonify(df.to_dict(orient="records"))
    except Exception as e:
        return jsonify({"error": f"Error reading patterns file: {str(e)}"}), 500

@app.route("/get-available-companies", methods=["GET"])
def get_available_companies():
    patterns_dir = "../dataset/patterns_output"
    companies = []
    
    if os.path.exists(patterns_dir):
        for file in os.listdir(patterns_dir):
            if file.endswith("_Output_patterns.csv"):
                company_name = file.replace("_Output_patterns.csv", "")
                companies.append(company_name)
    
    return jsonify(companies)

if __name__ == "__main__":
    app.run(debug=True)
