import os
import pandas as pd

def merge_company_csvs(company_dir, output_file):
    print(f"\n🔍 Checking folder: {company_dir}")
    
    if not os.path.isdir(company_dir):
        print(f"❌ Not a directory: {company_dir}")
        return

    files = sorted([f for f in os.listdir(company_dir) if f.endswith(".csv")])
    if not files:
        print(f"⚠️ No CSV files in: {company_dir}")
        return

    dfs = []
    for file in files:
        full_path = os.path.join(company_dir, file)
        try:
            df = pd.read_csv(full_path)

            # If 'datetime' not present, create it from 'date' and 'time'
            if 'datetime' not in df.columns and 'date' in df.columns and 'time' in df.columns:
                df['datetime'] = pd.to_datetime(df['date'] + ' ' + df['time'])

            if "datetime" in df.columns:
                dfs.append(df)
                print(f"✅ Loaded: {file} with {len(df)} rows")
            else:
                print(f"⚠️ Skipped (no 'datetime' column): {file}")
        except Exception as e:
            print(f"❌ Failed to read {file}: {e}")

    if dfs:
        merged = pd.concat(dfs)
        merged.sort_values(by="datetime", inplace=True)
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        merged.to_csv(output_file, index=False)
        print(f"💾 Saved merged file: {output_file}")
    else:
        print("⚠️ No valid CSVs to merge.")

def merge_all_companies(base_dir, output_dir):
    base_dir = os.path.abspath(base_dir)
    output_dir = os.path.abspath(output_dir)
    
    print(f"\n📁 Base Directory: {base_dir}")
    print(f"📂 Output Directory: {output_dir}")

    if not os.path.exists(base_dir):
        print(f"❌ Base directory does not exist: {base_dir}")
        return

    for company in os.listdir(base_dir):
        # Skip folders that end with "_Output"
        if company.endswith("_Output"):
            continue

        company_path = os.path.join(base_dir, company)
        if os.path.isdir(company_path):
            output_file = os.path.join(output_dir, f"{company}_1min.csv")
            merge_company_csvs(company_path, output_file)

# 🟡 Set this to your actual directory names
base_dir = "D:\\hackthon code trade\\dataset"
output_dir = "D:\\hackthon code trade\\dataset"

merge_all_companies(base_dir, output_dir)
