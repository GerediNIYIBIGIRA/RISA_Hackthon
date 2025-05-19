import pandas as pd
df = pd.read_csv('New-dataset-with-sentiment-deduped.csv')
df.to_json('public/dashboard-data.json', orient='records')
