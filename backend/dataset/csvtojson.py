import pandas as pd

df = pd.read_csv("patterns_output/TCS_Output_patterns.csv")
df[['datetime', 'open', 'high', 'low', 'close', 'pattern']].head(10).to_json("patterns.json", orient='records', date_format='iso')
