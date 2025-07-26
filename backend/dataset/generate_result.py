import os
import pandas as pd

def process_candle_files(input_folder, output_folder, company_name):
    os.makedirs(output_folder, exist_ok=True)

    intervals = {
        '5min': '5T',
        '10min': '10T',
        '15min': '15T',
        '30min': '30T',
        '1h': '1H'
    }

    all_resampled = {label: [] for label in intervals}

    for filename in os.listdir(input_folder):
        if filename.endswith(".csv"):
            file_path = os.path.abspath(os.path.join(input_folder, filename))
            try:
                df = pd.read_csv(file_path)
                df['datetime'] = pd.to_datetime(df['date'] + ' ' + df['time'], format="%d-%m-%Y %H:%M:%S")
                df.set_index('datetime', inplace=True)
                ohlc_data = df[['open', 'high', 'low', 'close', 'volume']]

                for label, rule in intervals.items():
                    resampled = ohlc_data.resample(rule).agg({
                        'open': 'first',
                        'high': 'max',
                        'low': 'min',
                        'close': 'last',
                        'volume': 'sum'
                    }).dropna().reset_index()

                    resampled['source_file'] = file_path
                    all_resampled[label].append(resampled)

                # print(f"Processed: {filename}")
            except Exception as e:
                print(f"[X] Failed to process {filename}: {e}")

    for label, df_list in all_resampled.items():
        combined_df = pd.concat(df_list).sort_values('datetime').reset_index(drop=True)
        output_file = os.path.join(output_folder, f"{company_name}_{label}.csv")
        combined_df.to_csv(output_file, index=False)
        # print(f"Saved: {output_file}")

    print("All files processed and merged with absolute paths!")


input_folder = "dataset\BAJAJ-AUTO"
output_folder = "dataset\BAJAJ-AUTO_Output"
company_name = "BAJAJ-AUTO"
process_candle_files(input_folder, output_folder, company_name)
