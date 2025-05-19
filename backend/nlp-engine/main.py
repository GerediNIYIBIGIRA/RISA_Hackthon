# import pandas as pd
# import matplotlib.pyplot as plt
# import seaborn as sns
# from sentiment_analyzer import analyze_text_batch  # Assuming your code from paste.txt is saved as sentiment_analyzer.py

# # 1. Load your CSV file
# df = pd.read_csv('Newdataset.csv')

# # 2. Extract comments for analysis (drop missing)
# comments = df['Comment'].dropna().tolist()

# # 3. Run batch sentiment analysis using your pipeline
# results = analyze_text_batch(comments)

# # 4. Convert analysis results to DataFrame
# results_df = pd.DataFrame([
#     {
#         'Comment': r['original_text'],
#         'Predicted_Sentiment': r['sentiment']['sentiment'],
#         'Sentiment_Score': r['sentiment']['score'],
#         'Entities': r['entities'],
#         'Topic': r.get('topic', {}).get('label', None)
#     }
#     for r in results
# ])

# # 5. Merge sentiment results with the original DataFrame
# merged_df = pd.merge(df, results_df, on='Comment', how='left')

# # 6. Optional: Save merged results for later use
# merged_df.to_csv('New-dataset-with-sentiment.csv', index=False)

# # 7. Visualize overall sentiment distribution
# sentiment_counts = merged_df['Predicted_Sentiment'].value_counts()
# plt.figure(figsize=(6,4))
# sns.barplot(x=sentiment_counts.index, y=sentiment_counts.values, palette='viridis')
# plt.title('Predicted Sentiment Distribution')
# plt.xlabel('Sentiment')
# plt.ylabel('Number of Comments')
# plt.tight_layout()
# plt.show()

# # 8. Visualize sentiment by district (if 'District' column exists)
# if 'District' in merged_df.columns:
#     district_sentiment = merged_df.groupby('District')['Predicted_Sentiment'].value_counts().unstack().fillna(0)
#     district_sentiment.plot(kind='bar', stacked=True, figsize=(10,6), colormap='Set2')
#     plt.title('Sentiment by District')
#     plt.xlabel('District')
#     plt.ylabel('Number of Comments')
#     plt.tight_layout()
#     plt.show()

# # 9. Visualize top topics (if topic extraction was performed)
# if 'Topic' in merged_df.columns and merged_df['Topic'].notnull().any():
#     top_topics = merged_df['Topic'].value_counts().head(10)
#     plt.figure(figsize=(8,4))
#     sns.barplot(x=top_topics.values, y=top_topics.index, palette='magma')
#     plt.title('Top Topics in Comments')
#     plt.xlabel('Number of Comments')
#     plt.ylabel('Topic')
#     plt.tight_layout()
#     plt.show()

# # 10. (Optional) Visualize sentiment scores by rating if you have a 'Rating' or 'Sentiment' column
# if 'Sentiment' in merged_df.columns:
#     plt.figure(figsize=(6,4))
#     sns.barplot(data=merged_df, x='Sentiment', y='Sentiment_Score', ci=None, palette='coolwarm')
#     plt.title('Average Sentiment Score by Labeled Sentiment')
#     plt.xlabel('Original Sentiment Label')
#     plt.ylabel('Predicted Sentiment Score')
#     plt.tight_layout()
#     plt.show()
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# 1. Load CSV
df = pd.read_csv('New-dataset-with-sentiment.csv')

# 2. Remove exact duplicates (all columns)
df_unique = df.drop_duplicates()

# 3. (Optional) Remove duplicates only by Comment if you want each comment once
# df_unique = df.drop_duplicates(subset=['Comment'])

# 4. Compare human and predicted sentiment
df_unique['Sentiment_Match'] = df_unique['Sentiment'].str.lower() == df_unique['Predicted_Sentiment'].str.lower()

# 5. Sentiment distribution: Human vs Predicted
plt.figure(figsize=(10,4))
plt.subplot(1,2,1)
sns.countplot(data=df_unique, x='Sentiment', order=['Positive','Neutral','Negative'])
plt.title('Human Sentiment')
plt.subplot(1,2,2)
sns.countplot(data=df_unique, x='Predicted_Sentiment', order=['positive','neutral','negative'])
plt.title('Predicted Sentiment')
plt.tight_layout()
plt.show()

# 6. Agreement/Disagreement
match_rate = df_unique['Sentiment_Match'].mean()
print(f"Sentiment agreement rate: {match_rate:.2%}")

plt.figure(figsize=(5,3))
sns.countplot(data=df_unique, x='Sentiment_Match')
plt.xticks([0,1], ['Disagree','Agree'])
plt.title('Human vs Predicted Sentiment Match')
plt.show()

# 7. Sentiment by District
plt.figure(figsize=(8,5))
sns.countplot(data=df_unique, x='District', hue='Predicted_Sentiment', order=df_unique['District'].value_counts().index)
plt.title('Predicted Sentiment by District')
plt.ylabel('Number of Comments')
plt.show()

# 8. Top Topics
if 'Topic' in df_unique.columns:
    top_topics = df_unique['Topic'].value_counts().head(10)
    plt.figure(figsize=(8,4))
    sns.barplot(x=top_topics.values, y=top_topics.index, palette='magma')
    plt.title('Top Topics')
    plt.xlabel('Number of Comments')
    plt.ylabel('Topic')
    plt.show()

# 9. Sentiment Score Distribution
plt.figure(figsize=(6,4))
sns.histplot(data=df_unique, x='Sentiment_Score', hue='Predicted_Sentiment', bins=20, kde=True, multiple='stack')
plt.title('Distribution of Sentiment Scores')
plt.show()

# 10. (Optional) Save deduplicated file for dashboarding
df_unique.to_csv('New-dataset-with-sentiment-deduped.csv', index=False)
