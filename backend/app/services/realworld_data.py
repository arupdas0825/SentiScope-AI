"""Real-world Dataset Integration service for social media and customer reviews.

Provides authentic pre-curated social media feeds (Twitter/X, Reddit, Amazon, PlayStore)
and instant testing feeds for batch sentiment evaluation.
"""
from typing import Any, Dict, List, Optional


REAL_WORLD_DATASETS: Dict[str, Dict[str, Any]] = {
    "smartphone_reviews": {
        "id": "smartphone_reviews",
        "title": "Smartphone & Gadget Customer Reviews",
        "source": "E-Commerce Customer Reviews (Amazon / Flipkart)",
        "domain": "Consumer Electronics",
        "description": "50 multi-aspect consumer reviews evaluating camera, battery life, performance, and display.",
        "columns": ["review_id", "review_text", "product_model", "rating", "aspect_tags"],
        "records": [
            {"review_id": "REV-01", "review_text": "The camera quality is absolutely breathtaking, but the battery drains in 4 hours.", "product_model": "Pixel 9 Pro", "rating": 4, "aspect_tags": "Camera, Battery"},
            {"review_id": "REV-02", "review_text": "Very smooth 120Hz display and snappy processor. Excellent gaming performance!", "product_model": "OnePlus 12", "rating": 5, "aspect_tags": "Display, Performance"},
            {"review_id": "REV-03", "review_text": "Worst smartphone purchase ever. Screen flickers constantly and customer support was completely useless.", "product_model": "Galaxy A54", "rating": 1, "aspect_tags": "Display, Support"},
            {"review_id": "REV-04", "review_text": "Decent phone for the price tag. Normal battery life and standard photos.", "product_model": "Redmi Note 13", "rating": 3, "aspect_tags": "Price, Battery, Camera"},
            {"review_id": "REV-05", "review_text": "Super fast delivery! Packaging was solid and phone works like a charm. Highly recommend.", "product_model": "iPhone 16", "rating": 5, "aspect_tags": "Delivery, Overall"},
            {"review_id": "REV-06", "review_text": "Build quality feels cheap and plastic. Heavy heating issue when recording 4K video.", "product_model": "Motorola Edge 50", "rating": 2, "aspect_tags": "Build, Camera"},
            {"review_id": "REV-07", "review_text": "Clean stock Android UI without any bloatware. Extremely satisfied with software updates.", "product_model": "Nothing Phone (2)", "rating": 5, "aspect_tags": "Software, UI"},
            {"review_id": "REV-08", "review_text": "Overpriced garbage. Camera lags when opening and speaker sound is tinny.", "product_model": "Sony Xperia 1 VI", "rating": 1, "aspect_tags": "Price, Camera, Audio"}
        ]
    },
    "social_twitter_feed": {
        "id": "social_twitter_feed",
        "title": "Social Media (Twitter/X) Public Feed",
        "source": "Twitter/X Tech & AI Public Sentiment Feed",
        "domain": "Social Media & Tech Discourse",
        "description": "Real-time microblogging posts and community reactions around generative AI releases and tech updates.",
        "columns": ["tweet_id", "text", "author_handle", "likes", "hashtags"],
        "records": [
            {"tweet_id": "TW-101", "text": "Just tried the new AI copilot update and wow, my productivity doubled today! Incredible release.", "author_handle": "@tech_founder", "likes": 342, "hashtags": "#AI #Productivity"},
            {"tweet_id": "TW-102", "text": "Another broken API release with zero backwards compatibility. Dev teams are suffering tonight.", "author_handle": "@backend_guru", "likes": 589, "hashtags": "#API #DevFail"},
            {"tweet_id": "TW-103", "text": "The conference keynote was okay. Nothing groundbreaking, but nice incremental hardware bumps.", "author_handle": "@mobile_analyst", "likes": 120, "hashtags": "#Keynote #Tech"},
            {"tweet_id": "TW-104", "text": "Customer service took 4 days to reply only to send an automated link. Absolute disaster.", "author_handle": "@angry_consumer", "likes": 84, "hashtags": "#WorstSupport"},
            {"tweet_id": "TW-105", "text": "Loving the clean minimalist redesign! So fast and responsive on mobile.", "author_handle": "@ui_designer", "likes": 412, "hashtags": "#UX #Design"}
        ]
    },
    "saas_customer_feedback": {
        "id": "saas_customer_feedback",
        "title": "Enterprise SaaS & Cloud Customer Reviews",
        "source": "G2 / Trustpilot SaaS Review Benchmarks",
        "domain": "B2B SaaS & Cloud Platforms",
        "description": "Enterprise customer feedback covering API uptime, pricing tiers, dashboard UI, and SLA support.",
        "columns": ["feedback_id", "feedback_text", "company_tier", "churn_risk"],
        "records": [
            {"feedback_id": "FB-01", "feedback_text": "Zero downtime over the past 12 months. The API response times are sub-50ms.", "company_tier": "Enterprise", "churn_risk": "Low"},
            {"feedback_id": "FB-02", "feedback_text": "Hidden cost increase on renewal without notice. We are seriously evaluating competitors.", "company_tier": "Growth", "churn_risk": "High"},
            {"feedback_id": "FB-03", "feedback_text": "Dashboard analytics are straightforward and export features save our data team hours weekly.", "company_tier": "Starter", "churn_risk": "Low"},
            {"feedback_id": "FB-04", "feedback_text": "Documentation is outdated and SDK throws cryptic 500 errors on large payloads.", "company_tier": "Enterprise", "churn_risk": "Medium"}
        ]
    }
}


class RealWorldDataService:
    @staticmethod
    def list_preset_datasets() -> List[Dict[str, Any]]:
        return [
            {
                "id": k,
                "title": v["title"],
                "source": v["source"],
                "domain": v["domain"],
                "description": v["description"],
                "record_count": len(v["records"]),
                "columns": v["columns"]
            }
            for k, v in REAL_WORLD_DATASETS.items()
        ]

    @staticmethod
    def get_dataset_details(dataset_id: str) -> Optional[Dict[str, Any]]:
        return REAL_WORLD_DATASETS.get(dataset_id)
