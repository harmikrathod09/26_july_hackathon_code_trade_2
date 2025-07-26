import os
import pandas as pd

def detect_patterns(df):
    patterns = []

    for i in range(2, len(df)):
        row = df.iloc[i]
        prev_row = df.iloc[i - 1]
        prev_prev_row = df.iloc[i - 2]

        open_, high, low, close = row['open'], row['high'], row['low'], row['close']
        real_body = abs(open_ - close)
        candle_range = high - low
        lower_shadow = min(open_, close) - low
        upper_shadow = high - max(open_, close)

        pattern = None

        # Dragonfly Doji
        if real_body <= 0.001 * open_ and lower_shadow >= 0.6 * candle_range and upper_shadow <= 0.1 * candle_range:
            pattern = "Dragonfly Doji"

        # Hammer
        elif candle_range > 2 * real_body and (close - low) / candle_range > 0.6:
            pattern = "Hammer"

        # Rising Window
        elif close > open_ and prev_row['close'] > prev_row['open'] and row['low'] > prev_row['high']:
            pattern = "Rising Window"

        # Evening Star
        elif (
            prev_prev_row['close'] > prev_prev_row['open'] and
            abs(prev_row['close'] - prev_row['open']) < 0.3 * (prev_row['high'] - prev_row['low']) and
            row['close'] < row['open'] and
            row['close'] < prev_prev_row['open']
        ):
            pattern = "Evening Star"

        # Three White Soldiers
        elif (
            prev_prev_row['close'] > prev_prev_row['open'] and
            prev_row['close'] > prev_row['open'] and
            close > open_ and
            open_ > prev_row['open'] and
            close > prev_row['close']
        ):
            pattern = "Three White Soldiers"

        patterns.append(pattern)

    # Prepend NaNs to align with DataFrame rows
    return [None, None] + patterns


def mine_patterns_from_company_folder(company_path, output_file):
    results = []

    for file in os.listdir(company_path):
        if file.endswith(".csv"):
            filepath = os.path.join(company_path, file)
            try:
                df = pd.read_csv(filepath)
                df.columns = df.columns.str.lower()

                if {'datetime', 'open', 'high', 'low', 'close', 'volume'}.issubset(df.columns):
                    df['datetime'] = pd.to_datetime(df['datetime'])
                    df.sort_values('datetime', inplace=True)
                    df.reset_index(drop=True, inplace=True)

                    df['pattern'] = detect_patterns(df)
                    df['source_file'] = file
                    df['path_that_file'] = os.path.abspath(filepath)
                    df['timeframe'] = file.replace('.csv', '')
                    df['company'] = os.path.basename(company_path)

                    matched = df[df['pattern'].notnull()]
                    results.append(matched)
            except Exception as e:
                print(f"[Error] Failed to process {filepath}: {e}")

    if results:
        final_df = pd.concat(results)
        final_df.to_csv(output_file, index=False)
        print(f"[✔] Saved: {output_file}")
    else:
        print(f"[!] No patterns detected in {company_path}")


def run_for_all_companies(base_dir, output_dir):
    os.makedirs(output_dir, exist_ok=True)

    for company_folder in os.listdir(base_dir):
        full_path = os.path.join(base_dir, company_folder)
        if os.path.isdir(full_path):
            output_file = os.path.join(output_dir, f"{company_folder}_patterns.csv")
            mine_patterns_from_company_folder(full_path, output_file)


if __name__ == "__main__":

    base_dir = "../dataset"
    output_dir = "../dataset/patterns_output"

    run_for_all_companies(base_dir, output_dir)
