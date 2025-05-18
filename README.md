# Rwanda Transport Fare Sentiment Analysis System

## Overview
This project provides Rwandan policymakers with real-time insights into public sentiment regarding the transition from flat-rate to distance-based public transport fares. The system collects, analyzes, and visualizes sentiment data from multiple sources including social media, news comments, forums, and surveys to help inform policy decisions and communication strategies.

![Dashboard Preview](docs/dashboard-preview.png)

## Problem Statement
Rwanda has recently shifted towards a distance-based fare pricing model in public transport, replacing flat-rate fares. While intended to create a fairer and more sustainable transport system, the change has sparked varied reactions from the public. Policymakers need a comprehensive understanding of:

- How citizens feel about the new fare system
- What specific concerns exist
- Which demographic groups are most affected
- Where misinformation might be spreading

## Solution
Our solution is a sentiment analysis dashboard that processes multi-source data to provide actionable insights on public perception, helping policymakers adapt their strategies and communications.

### Key Features
- **Multi-source data collection**: Aggregates sentiment from social media, news sites, forums, and surveys
- **Multilingual analysis**: Processes content in Kinyarwanda, English, and French
- **Real-time alerts**: Flags potential misinformation and emerging concerns
- **Demographic breakdown**: Identifies how different groups perceive the change
- **Geographic visualization**: Maps sentiment patterns across regions
- **Trend tracking**: Monitors sentiment changes over time
- **Policy recommendations**: Suggests actionable responses based on data insights

## Architecture
The system follows a modular architecture with four main layers:
1. **Data Collection Layer**: Gathers data from multiple sources
2. **Processing Layer**: Analyzes sentiment and extracts topics
3. **Analysis Layer**: Detects trends and generates insights 
4. **Presentation Layer**: Visualizes data in an interactive dashboard

## Technology Stack
- **Frontend**: React.js, Tailwind CSS, Recharts
- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Redis (caching)
- **NLP & ML**: Python, spaCy, Hugging Face Transformers
- **Deployment**: Docker, Kubernetes
- **ETL Pipeline**: Apache Airflow

## Installation and Setup

### Prerequisites
- Node.js (v14+)
- Python 3.8+
- MongoDB
- Docker (optional for containerization)

### Backend Setup
```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB connection string and API keys

# Start the server
npm start
```

### Frontend Setup
```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

### NLP Engine Setup
```bash
# Navigate to the nlp-engine directory
cd nlp-engine

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Download language models
python -m spacy download en_core_web_md
python -m spacy download fr_core_news_md
# Custom Kinyarwanda model will be downloaded during first run
```

## Data Sources
- Twitter/X API (tweets with relevant hashtags)
- Facebook Graph API (public posts and comments)
- News sites comment sections (web scraping)
- Local discussion forums
- Survey data

## Roadmap
- Phase 1: Core dashboard and sentiment analysis (current)
- Phase 2: Enhanced demographic segmentation
- Phase 3: Mobile app for field surveys
- Phase 4: Integration with transport payment systems for direct feedback

## Contributors
- [Your Name] - Lead Developer

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements
- Rwanda Utilities Regulatory Authority (RURA)
- Ministry of Infrastructure
- Rwanda Public Transport Authority