import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import NMF
from sklearn.metrics import silhouette_score
from sklearn.cluster import KMeans
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import re
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import PorterStemmer, WordNetLemmatizer
import spacy
from textblob import TextBlob
# import kinyarwanda_nlp  # Custom module for Kinyarwanda language processing

# Download required NLTK data
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('wordnet')
# Add this at the beginning of your script with the other downloads
nltk.download('punkt_tab')

# Load models for multiple languages
nlp_en = spacy.load("en_core_web_md")
nlp_fr = spacy.load("fr_core_news_md")
# nlp_rw = kinyarwanda_nlp.load()  # Custom model for Kinyarwanda

# Load pre-trained sentiment models
# tokenizer = AutoTokenizer.from_pretrained("Davlan/afro-xlmr-base-sentiment")
# model = AutoModelForSequenceClassification.from_pretrained("Davlan/afro-xlmr-base-sentiment")
tokenizer = AutoTokenizer.from_pretrained("nlptown/bert-base-multilingual-uncased-sentiment")
model = AutoModelForSequenceClassification.from_pretrained("nlptown/bert-base-multilingual-uncased-sentiment")


# Initialize preprocessing tools
ps = PorterStemmer()
lemmatizer = WordNetLemmatizer()
stop_words_en = set(stopwords.words('english'))
stop_words_fr = set(stopwords.words('french'))
# stop_words_rw = set(kinyarwanda_nlp.STOP_WORDS)  # Custom stop words for Kinyarwanda

def preprocess_text(text, language='en'):
    """Preprocess text data based on language"""
    if not isinstance(text, str):
        return ""
    
    # Remove URLs, mentions, hashtags, and special characters
    text = re.sub(r'http\S+', '', text)
    text = re.sub(r'@\w+', '', text)
    text = re.sub(r'#\w+', '', text)
    text = re.sub(r'[^\w\s]', '', text)
    
    # Convert to lowercase
    text = text.lower()
    
    # Tokenize based on language
    if language == 'en':
        tokens = word_tokenize(text)
        stop_words = stop_words_en
        tokens = [lemmatizer.lemmatize(token) for token in tokens if token not in stop_words]
    elif language == 'fr':
        tokens = word_tokenize(text)
        stop_words = stop_words_fr
        tokens = [token for token in tokens if token not in stop_words]
    # elif language == 'rw':
    #     tokens = kinyarwanda_nlp.tokenize(text)
    #     stop_words = stop_words_rw
    #     tokens = [token for token in tokens if token not in stop_words]
    
    return ' '.join(tokens)

# def detect_language(text):
#     """Detect language of the text"""
#     if not isinstance(text, str) or len(text.strip()) == 0:
#         return 'en'  # Default to English
    
#     # Simple language detection based on stop words
#     # In production, use a more sophisticated library like langdetect
#     words = set(word_tokenize(text.lower()))
    
#     en_count = len(words.intersection(stop_words_en))
#     fr_count = len(words.intersection(stop_words_fr))
#     # rw_count = len(words.intersection(stop_words_rw))
    
#     if rw_count > en_count and rw_count > fr_count:
#         return 'rw'
#     elif fr_count > en_count:
#         return 'fr'
#     else:
#         return 'en'
def detect_language(text):
    """Detect language of the text"""
    if not isinstance(text, str) or len(text.strip()) == 0:
        return 'en'  # Default to English
    
    # Simple language detection based on common words
    text_lower = text.lower()
    
    # Simple word splitting instead of sophisticated tokenization
    words = set(re.findall(r'\b\w+\b', text_lower))
    
    en_count = len(words.intersection(stop_words_en))
    fr_count = len(words.intersection(stop_words_fr))
    # rw_count line commented out in your code
    # rw_count = len(words.intersection(stop_words_rw))
    
    # Since rw_count is commented out, this comparison won't work
    # if rw_count > en_count and rw_count > fr_count:
    #     return 'rw'
    if fr_count > en_count:
        return 'fr'
    else:
        return 'en'

# def analyze_sentiment(text, language='en'):
#     """Analyze sentiment of text using appropriate model based on language"""
#     if not isinstance(text, str) or len(text.strip()) == 0:
#         return {'sentiment': 'neutral', 'score': 0.0}
    
#     # For multilingual sentiment, use transformer model
#     inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
#     with torch.no_grad():
#         outputs = model(**inputs)
#         scores = torch.softmax(outputs.logits, dim=1).numpy()[0]
    
#     # Get sentiment label and score
#     sentiment_id = scores.argmax()
#     sentiment_map = {0: 'negative', 1: 'neutral', 2: 'positive'}
#     sentiment = sentiment_map[sentiment_id]
#     score = scores[sentiment_id]
    
#     # Convert to -1 to 1 range for consistency
#     if sentiment == 'negative':
#         final_score = -score
#     elif sentiment == 'positive':
#         final_score = score
#     else:
#         final_score = 0.0
    
#     return {
#         'sentiment': sentiment,
#         'score': float(final_score),
#         'confidence': float(score)
#     }

def analyze_sentiment(text, language='en'):
    """Analyze sentiment of text using appropriate model based on language"""
    if not isinstance(text, str) or len(text.strip()) == 0:
        return {'sentiment': 'neutral', 'score': 0.0}
    
    # For multilingual sentiment, use transformer model
    inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
    with torch.no_grad():
        outputs = model(**inputs)
        scores = torch.softmax(outputs.logits, dim=1).numpy()[0]
    
    # Get sentiment label and score
    sentiment_id = scores.argmax()
    
    # For nlptown/bert-base-multilingual-uncased-sentiment model
    # It uses rating from 1 to 5 stars
    # Map to our sentiment categories: 1-2 = negative, 3 = neutral, 4-5 = positive
    if sentiment_id < 2:  # 1-2 stars
        sentiment = 'negative'
        final_score = -scores[sentiment_id]
    elif sentiment_id > 2:  # 4-5 stars
        sentiment = 'positive'
        final_score = scores[sentiment_id]
    else:  # 3 stars
        sentiment = 'neutral'
        final_score = 0.0
    
    return {
        'sentiment': sentiment,
        'score': float(final_score),
        'confidence': float(scores[sentiment_id])
    }

# def extract_topics(texts, n_topics=5):
#     """Extract main topics from a corpus of texts using NMF"""
#     # Create TF-IDF representation
#     tfidf_vectorizer = TfidfVectorizer(
#         max_df=0.95, min_df=2, max_features=1000, stop_words='english'
#     )
#     tfidf = tfidf_vectorizer.fit_transform(texts)
    
#     # Find optimal number of topics using silhouette score
#     silhouette_scores = []
#     range_n_topics = range(2, min(n_topics + 5, 20))
#     for n in range_n_topics:
#         kmeans = KMeans(n_clusters=n, random_state=42, n_init=10)
#         kmeans.fit(tfidf)
#         score = silhouette_score(tfidf, kmeans.labels_)
#         silhouette_scores.append(score)
    
#     optimal_n_topics = range_n_topics[np.argmax(silhouette_scores)]
    
#     # Extract topics using NMF
#     nmf = NMF(n_components=optimal_n_topics, random_state=42)
#     nmf_features = nmf.fit_transform(tfidf)
    
#     # Get feature names
#     feature_names = tfidf_vectorizer.get_feature_names_out()
    
#     # Get top words for each topic
#     topics = []
#     for topic_idx, topic in enumerate(nmf.components_):
#         top_words_idx = topic.argsort()[:-10 - 1:-1]
#         top_words = [feature_names[i] for i in top_words_idx]
#         topics.append({
#             'id': topic_idx,
#             'words': top_words,
#             'label': ' '.join(top_words[:3])  # Auto-label based on top 3 words
#         })
    
#     # Assign dominant topic to each document
#     doc_topic_assignments = np.argmax(nmf_features, axis=1)
    
#     return {
#         'topics': topics,
#         'document_topics': doc_topic_assignments.tolist()
#     }

def extract_topics(texts, n_topics=5):
    """Extract main topics from a corpus of texts using NMF"""
    # Check if we have enough texts for clustering
    if len(texts) < 2:
        return {
            'topics': [{'id': 0, 'words': ['insufficient', 'data'], 'label': 'insufficient data'}],
            'document_topics': [0] * len(texts)
        }
        
    # Create TF-IDF representation
    tfidf_vectorizer = TfidfVectorizer(
        max_df=0.95, min_df=1, max_features=1000, stop_words='english'
    )
    tfidf = tfidf_vectorizer.fit_transform(texts)
    
    # Find optimal number of topics - ensure it's less than the number of samples
    max_possible_topics = min(n_topics, len(texts) - 1)
    
    # If we have very few samples, just use 2 topics
    if max_possible_topics < 2:
        n_components = 2
    else:
        # Try to find optimal number of topics using silhouette score
        silhouette_scores = []
        range_n_topics = range(2, max_possible_topics + 1)
        
        for n in range_n_topics:
            # Skip if we don't have enough samples
            if len(texts) <= n:
                continue
                
            kmeans = KMeans(n_clusters=n, random_state=42, n_init=10)
            kmeans.fit(tfidf)
            
            # Skip silhouette calculation if only one sample per cluster on average
            if tfidf.shape[0] / n < 2:
                silhouette_scores.append(0)
                continue
                
            score = silhouette_score(tfidf, kmeans.labels_)
            silhouette_scores.append(score)
        
        if silhouette_scores:
            optimal_n_topics = range_n_topics[np.argmax(silhouette_scores)]
        else:
            optimal_n_topics = 2
        
        n_components = optimal_n_topics
    
    # Extract topics using NMF
    nmf = NMF(n_components=n_components, random_state=42)
    nmf_features = nmf.fit_transform(tfidf)
    
    # Get feature names
    feature_names = tfidf_vectorizer.get_feature_names_out()
    
    # Get top words for each topic
    topics = []
    for topic_idx, topic in enumerate(nmf.components_):
        # Get top words (up to 10, but not more than we have)
        max_words = min(10, len(feature_names))
        top_words_idx = topic.argsort()[:-max_words - 1:-1]
        top_words = [feature_names[i] for i in top_words_idx]
        topics.append({
            'id': topic_idx,
            'words': top_words,
            'label': ' '.join(top_words[:min(3, len(top_words))])  # Auto-label based on top 3 words
        })
    
    # Assign dominant topic to each document
    doc_topic_assignments = np.argmax(nmf_features, axis=1)
    
    return {
        'topics': topics,
        'document_topics': doc_topic_assignments.tolist()
    }

def detect_misinformation(text, verified_facts):
    """Detect potential misinformation by comparing with verified facts"""
    # Simplified version - in production, use more sophisticated models
    potential_misinformation = []
    
    # Process the text
    doc = nlp_en(text)
    
    for fact in verified_facts:
        fact_doc = nlp_en(fact['statement'])
        similarity = doc.similarity(fact_doc)
        
        # If text is similar to a verified fact but contradicts it
        if similarity > 0.7:
            sentiment = analyze_sentiment(text)
            fact_sentiment = analyze_sentiment(fact['statement'])
            
            # If sentiments are opposite, flag as potential misinformation
            if (sentiment['sentiment'] == 'positive' and fact_sentiment['sentiment'] == 'negative') or \
               (sentiment['sentiment'] == 'negative' and fact_sentiment['sentiment'] == 'positive'):
                potential_misinformation.append({
                    'text': text,
                    'contradicted_fact': fact['statement'],
                    'similarity': similarity,
                    'confidence': 0.7 * similarity
                })
    
    return potential_misinformation

def analyze_text_batch(texts, verified_facts=None):
    """Process a batch of texts for the sentiment dashboard"""
    results = []
    
    for text in texts:
        language = detect_language(text)
        processed_text = preprocess_text(text, language)
        sentiment_analysis = analyze_sentiment(processed_text, language)
        
        # Extract entities
        if language == 'en':
            doc = nlp_en(text)
        elif language == 'fr':
            doc = nlp_fr(text)
        # elif language == 'rw':
        #     doc = nlp_rw(text)
        
        entities = [
            {'text': ent.text, 'label': ent.label_}
            for ent in doc.ents
        ]
        
        # Detect misinformation if verified facts are provided
        misinformation = []
        if verified_facts:
            misinformation = detect_misinformation(text, verified_facts)
        
        results.append({
            'original_text': text,
            'processed_text': processed_text,
            'language': language,
            'sentiment': sentiment_analysis,
            'entities': entities,
            'potential_misinformation': misinformation
        })
    
    # Extract topics across all texts
    if len(texts) > 5:  # Need sufficient corpus size for meaningful topic extraction
        topics = extract_topics([r['processed_text'] for r in results])
        
        # Add topic assignments to each result
        for i, result in enumerate(results):
            result['topic'] = {
                'id': topics['document_topics'][i],
                'label': topics['topics'][topics['document_topics'][i]]['label']
            }
    
    return results

def detect_emerging_concerns(sentiment_data, time_window_days=7, threshold=2.0):
    """
    Detect emerging concerns based on sentiment trends
    
    Args:
        sentiment_data: DataFrame with 'timestamp', 'topic', 'score'
        time_window_days: Number of days to consider for trend detection
        threshold: Standard deviation threshold for concern detection
    
    Returns:
        List of emerging concerns
    """
    # Convert to DataFrame if list of dicts
    if isinstance(sentiment_data, list):
        df = pd.DataFrame(sentiment_data)
    else:
        df = sentiment_data
    
    # Ensure timestamp is datetime
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    
    # Filter to recent data
    recent_cutoff = pd.Timestamp.now() - pd.Timedelta(days=time_window_days)
    recent_data = df[df['timestamp'] >= recent_cutoff]
    
    # Group by topic and day
    daily_topic_sentiment = recent_data.groupby([
        'topic', pd.Grouper(key='timestamp', freq='D')
    ])['score'].agg(['mean', 'count']).reset_index()
    
    emerging_concerns = []
    
    # Analyze each topic with sufficient data
    topics = daily_topic_sentiment['topic'].unique()
    for topic in topics:
        topic_data = daily_topic_sentiment[daily_topic_sentiment['topic'] == topic]
        
        # Skip topics with too few data points
        if len(topic_data) < 3 or topic_data['count'].sum() < 10:
            continue
        
        # Check for negative trend
        topic_data = topic_data.sort_values('timestamp')
        sentiment_values = topic_data['mean'].values
        
        # Simple trend detection
        if len(sentiment_values) >= 3:
            # Moving average
            ma = np.convolve(sentiment_values, np.ones(3)/3, mode='valid')
            
            # Check for declining sentiment
            if len(ma) >= 2 and ma[-1] < ma[0] - threshold * np.std(sentiment_values):
                # This topic has significantly declining sentiment
                emerging_concerns.append({
                    'topic': topic,
                    'sentiment_start': float(ma[0]),
                    'sentiment_end': float(ma[-1]),
                    'change': float(ma[-1] - ma[0]),
                    'message_volume': int(topic_data['count'].sum()),
                    'confidence': min(1.0, abs(ma[-1] - ma[0]) / (np.std(sentiment_values) + 1e-5))
                })
    
    # Sort by confidence
    emerging_concerns.sort(key=lambda x: x['confidence'], reverse=True)
    
    return emerging_concerns

def detect_sentiment_spikes(sentiment_data, time_window_days=7, threshold=3.0):
    """
    Detect sudden spikes in negative sentiment
    
    Args:
        sentiment_data: DataFrame with 'timestamp', 'source', 'score'
        time_window_days: Number of days to consider for spike detection
        threshold: Standard deviation threshold for spike detection
    
    Returns:
        List of sentiment spikes
    """
    # Convert to DataFrame if list of dicts
    if isinstance(sentiment_data, list):
        df = pd.DataFrame(sentiment_data)
    else:
        df = sentiment_data
    
    # Ensure timestamp is datetime
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    
    # Filter to recent data
    recent_cutoff = pd.Timestamp.now() - pd.Timedelta(days=time_window_days)
    recent_data = df[df['timestamp'] >= recent_cutoff]
    
    # Group by day
    daily_sentiment = recent_data.groupby(
        pd.Grouper(key='timestamp', freq='H')
    )['score'].agg(['mean', 'count', 'std']).reset_index()
    
    # Calculate baseline mean and std from first 80% of time window
    baseline_end_idx = int(len(daily_sentiment) * 0.8)
    if baseline_end_idx < 3:  # Not enough data
        return []
        
    baseline = daily_sentiment.iloc[:baseline_end_idx]
    baseline_mean = baseline['mean'].mean()
    baseline_std = baseline['mean'].std()
    
    # Detect spikes in last 20% of time window
    recent_period = daily_sentiment.iloc[baseline_end_idx:]
    
    spikes = []
    for _, row in recent_period.iterrows():
        # Check for significant negative deviation
        if row['mean'] < baseline_mean - threshold * baseline_std and row['count'] > 5:
            spikes.append({
                'timestamp': row['timestamp'],
                'sentiment_value': float(row['mean']),
                'baseline_mean': float(baseline_mean),
                'deviation': float(row['mean'] - baseline_mean),
                'message_count': int(row['count']),
                'confidence': min(1.0, abs(row['mean'] - baseline_mean) / (baseline_std + 1e-5))
            })
    
    # Sort by confidence
    spikes.sort(key=lambda x: x['confidence'], reverse=True)
    
    return spikes

def generate_demographic_insights(sentiment_data):
    """
    Generate insights about sentiment across different demographics
    
    Args:
        sentiment_data: DataFrame with demographic and sentiment info
        
    Returns:
        Dictionary of demographic insights
    """
    # Convert to DataFrame if list of dicts
    if isinstance(sentiment_data, list):
        df = pd.DataFrame(sentiment_data)
    else:
        df = sentiment_data
    
    insights = {}
    
    # Get demographic categories
    if 'metadata' in df.columns and isinstance(df['metadata'].iloc[0], dict):
        # Extract demographic from metadata
        if 'demographic' not in df.columns:
            df['demographic'] = df['metadata'].apply(
                lambda x: x.get('demographic', 'Unspecified') if isinstance(x, dict) else 'Unspecified'
            )
    
    # Analyze sentiment by demographic
    if 'demographic' in df.columns:
        demo_sentiment = df.groupby('demographic')['score'].agg(
            ['mean', 'count', 'std']
        ).reset_index()
        
        # Sort by count (sample size)
        demo_sentiment = demo_sentiment.sort_values('count', ascending=False)
        
        # Calculate overall mean for comparison
        overall_mean = df['score'].mean()
        
        # Generate insights
        demographic_insights = []
        for _, row in demo_sentiment.iterrows():
            if row['count'] < 10:  # Skip groups with small sample size
                continue
                
            # Compare to overall mean
            diff = row['mean'] - overall_mean
            sentiment_text = 'more positive' if diff > 0 else 'more negative'
            
            insight = {
                'demographic': row['demographic'],
                'sentiment_mean': float(row['mean']),
                'sample_size': int(row['count']),
                'difference_from_overall': float(diff),
                'insight_text': f"{row['demographic']} are {abs(diff):.2f} points {sentiment_text} than average"
            }
            demographic_insights.append(insight)
        
        insights['demographic_sentiment'] = demographic_insights
    
    # Analyze most discussed topics by demographic
    if 'demographic' in df.columns and 'topic' in df.columns:
        # Group by demographic and topic
        demo_topics = df.groupby(['demographic', 'topic']).size().reset_index(name='count')
        
        # Get top topics for each demographic
        top_topics_by_demo = {}
        for demo in demo_topics['demographic'].unique():
            demo_data = demo_topics[demo_topics['demographic'] == demo]
            top_topics = demo_data.sort_values('count', ascending=False).head(3)
            top_topics_by_demo[demo] = top_topics.to_dict('records')
        
        insights['top_topics_by_demographic'] = top_topics_by_demo
    
    return insights

def generate_geographic_insights(sentiment_data):
    """
    Generate insights about sentiment across different geographic regions
    
    Args:
        sentiment_data: DataFrame with location and sentiment info
        
    Returns:
        Dictionary of geographic insights
    """
    # Convert to DataFrame if list of dicts
    if isinstance(sentiment_data, list):
        df = pd.DataFrame(sentiment_data)
    else:
        df = sentiment_data
    
    insights = {}
    
    # Get location information
    if 'metadata' in df.columns and isinstance(df['metadata'].iloc[0], dict):
        # Extract location from metadata
        if 'province' not in df.columns:
            df['province'] = df['metadata'].apply(
                lambda x: x.get('location', {}).get('province', 'Unknown') 
                if isinstance(x, dict) and isinstance(x.get('location'), dict) 
                else 'Unknown'
            )
        if 'district' not in df.columns:
            df['district'] = df['metadata'].apply(
                lambda x: x.get('location', {}).get('district', 'Unknown') 
                if isinstance(x, dict) and isinstance(x.get('location'), dict) 
                else 'Unknown'
            )
    
    # Analyze sentiment by province
    if 'province' in df.columns:
        province_sentiment = df.groupby('province')['score'].agg(
            ['mean', 'count', 'std']
        ).reset_index()
        
        # Sort by count (sample size)
        province_sentiment = province_sentiment.sort_values('count', ascending=False)
        
        # Calculate overall mean for comparison
        overall_mean = df['score'].mean()
        
        # Generate insights
        geo_insights = []
        for _, row in province_sentiment.iterrows():
            if row['count'] < 10 or row['province'] == 'Unknown':  # Skip groups with small sample size
                continue
                
            # Compare to overall mean
            diff = row['mean'] - overall_mean
            sentiment_text = 'more positive' if diff > 0 else 'more negative'
            
            insight = {
                'province': row['province'],
                'sentiment_mean': float(row['mean']),
                'sample_size': int(row['count']),
                'difference_from_overall': float(diff),
                'insight_text': f"{row['province']} is {abs(diff):.2f} points {sentiment_text} than average"
            }
            geo_insights.append(insight)
        
        insights['provincial_sentiment'] = geo_insights
    
    # Analyze most discussed topics by province
    if 'province' in df.columns and 'topic' in df.columns:
        # Group by province and topic
        geo_topics = df.groupby(['province', 'topic']).size().reset_index(name='count')
        
        # Get top topics for each province
        top_topics_by_province = {}
        for province in geo_topics['province'].unique():
            if province == 'Unknown':
                continue
                
            province_data = geo_topics[geo_topics['province'] == province]
            top_topics = province_data.sort_values('count', ascending=False).head(3)
            top_topics_by_province[province] = top_topics.to_dict('records')
        
        insights['top_topics_by_province'] = top_topics_by_province
    
    return insights

def generate_policy_recommendations(sentiment_analysis_results):
    """Generate policy recommendations based on sentiment analysis"""
    # This is a placeholder for a more sophisticated recommendation engine
    # In a real implementation, this would use ML models trained on past policy effectiveness
    
    recommendations = []
    
    # Add recommendations based on top concerns
    if 'top_concerns' in sentiment_analysis_results:
        for concern in sentiment_analysis_results['top_concerns'][:3]:
            if concern['sentiment'] < -0.3:
                recommendations.append({
                    'category': 'address_concern',
                    'priority': 'high' if concern['sentiment'] < -0.5 else 'medium',
                    'text': f"Develop targeted communication addressing {concern['name']} concerns",
                    'rationale': f"This is a top concern with {concern['count']} mentions and strong negative sentiment ({concern['sentiment']:.2f})"
                })
    
    # Add recommendations based on demographic insights
    if 'demographic_insights' in sentiment_analysis_results:
        for insight in sentiment_analysis_results['demographic_insights']:
            if insight['difference_from_overall'] < -0.3:
                recommendations.append({
                    'category': 'demographic_targeting',
                    'priority': 'medium',
                    'text': f"Create tailored outreach for {insight['demographic']}",
                    'rationale': f"This demographic shows significantly more negative sentiment ({insight['difference_from_overall']:.2f} below average)"
                })
    
    # Add recommendations based on geographic insights
    if 'geographic_insights' in sentiment_analysis_results:
        for insight in sentiment_analysis_results['geographic_insights']:
            if insight['difference_from_overall'] < -0.3:
                recommendations.append({
                    'category': 'geographic_targeting',
                    'priority': 'medium',
                    'text': f"Focus community meetings in {insight['province']}",
                    'rationale': f"This region shows significantly more negative sentiment ({insight['difference_from_overall']:.2f} below average)"
                })
    
    # Add general recommendations
    if 'overall_sentiment' in sentiment_analysis_results:
        overall = sentiment_analysis_results['overall_sentiment']
        if overall < -0.2:
            recommendations.append({
                'category': 'communication',
                'priority': 'high',
                'text': "Launch educational campaign about distance calculation methods",
                'rationale': "Overall sentiment is negative, indicating lack of understanding about the fare system"
            })
        
        if 'emerging_concerns' in sentiment_analysis_results and len(sentiment_analysis_results['emerging_concerns']) > 0:
            recommendations.append({
                'category': 'monitoring',
                'priority': 'high',
                'text': "Increase monitoring of social media for misinformation",
                'rationale': "Several emerging concerns detected that could develop into misinformation"
            })
    
    # Sort by priority
    priority_order = {'high': 0, 'medium': 1, 'low': 2}
    recommendations.sort(key=lambda x: priority_order.get(x['priority'], 999))
    
    return recommendations

if __name__ == "__main__":
    # Example usage
    sample_texts = [
        "The new distance-based fare system is excellent. It's much fairer for shorter trips!",
        "These new fares are terrible. I now pay twice as much for my daily commute.",
        "Je ne comprends pas comment les tarifs sont calculés. C'est très confus.",
        "Gahunda nshya y'ibitwaro iradutera igihombo cyane. Tuzahomba ku musaruro wacu.",
        "The card readers often don't work properly. Had to pay cash today.",
    ]
    
    verified_facts = [
        {
            "statement": "The new distance-based fare system calculates fares based on kilometers traveled.",
            "source": "Rwanda Transport Authority Official Website"
        },
        {
            "statement": "The maximum fare increase for any single route is 50% compared to previous flat rates.",
            "source": "Ministry of Infrastructure Press Release"
        },
        {
            "statement": "Card readers are installed and functional on all public buses in Kigali.",
            "source": "TAP&Go System Status Report"
        }
    ]
    
    # Analyze batch of texts
    results = analyze_text_batch(sample_texts, verified_facts)
    
    # Print results
    print("Sentiment Analysis Results:")
    for i, result in enumerate(results):
        print(f"\nText {i+1}: {result['original_text']}")
        print(f"Language: {result['language']}")
        print(f"Sentiment: {result['sentiment']['sentiment']} (Score: {result['sentiment']['score']:.2f})")
        
        if result.get('potential_misinformation'):
            print("Potential Misinformation Detected!")
            for misinfo in result['potential_misinformation']:
                print(f"  - Contradicts: {misinfo['contradicted_fact']}")
                print(f"    Confidence: {misinfo['confidence']:.2f}")
                
        if result.get('topic'):
            print(f"Topic: {result['topic']['label']}")
            
    # Extract topics from all texts
    topic_results = extract_topics([r['processed_text'] for r in results])
    print("\nExtracted Topics:")
    for topic in topic_results['topics']:
        print(f"Topic {topic['id']}: {topic['label']}")
        print(f"  Top words: {', '.join(topic['words'][:5])}")