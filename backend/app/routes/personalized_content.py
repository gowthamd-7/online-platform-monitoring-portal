"""
Personalized Content Generation API
Generates tailored marketing content for different student segments
using Gemini AI and BIT college context data.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import google.generativeai as genai
import os
import json

router = APIRouter()

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("Warning: GEMINI_API_KEY not found in environment variables")
else:
    genai.configure(api_key=GEMINI_API_KEY)


class ContentRequest(BaseModel):
    segment_name: str
    segment_characteristics: dict
    channel: str  # email, sms, whatsapp, instagram, linkedin, facebook, website
    goal: str  # attract, convert, nurture, inform
    tone: Optional[str] = "professional"  # professional, friendly, inspiring, urgent


class NewsContentRequest(BaseModel):
    news_text: str  # Custom achievement/news to promote
    channel: str  # email, sms, whatsapp, instagram, linkedin, facebook, website
    target_audience: Optional[str] = "prospective students"  # prospective students, current students, parents, alumni
    tone: Optional[str] = "exciting"  # exciting, professional, inspiring, urgent


class ChannelSuggestionRequest(BaseModel):
    news_text: str
    target_audience: str


class ChannelSuggestion(BaseModel):
    recommended_channel: str
    reason: str
    alternatives: List[dict]  # [{channel: str, reason: str}]


class ContentVariant(BaseModel):
    title: str
    content: str
    cta: str  # Call to action
    hashtags: Optional[List[str]] = None


class ContentResponse(BaseModel):
    segment: str
    channel: str
    variants: List[ContentVariant]
    metadata: dict


def load_college_data():
    """Load BIT college information from JSON file"""
    try:
        with open("BIT_Info.json", "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading college data: {str(e)}")
        return None


def build_prompt(request: ContentRequest, college_data: dict) -> str:
    """Build comprehensive prompt for Gemini API"""
    
    # Extract relevant college highlights
    placements = college_data.get("placements", {})
    
    prompt = f"""Create 3 marketing content variants for BIT Sathy college.

COLLEGE HIGHLIGHTS:
- 95% placement, ₹44L max package (Virtusa), avg ₹6.5L
- Top: Juspay, Swiggy, Informatica, Thoughtworks
- Labs: IoT, AI/ML, Robotics, Cloud Security
- Scholarships: 75% merit, 50% need-based
- Location: Sathyamangalam, Tamil Nadu

TARGET: {request.segment_name}
CHANNEL: {request.channel}
GOAL: {request.goal}
TONE: {request.tone}

SEGMENT TRAITS: {', '.join([f"{k}: {v}" for k, v in list(request.segment_characteristics.items())[:3]])}
"""

    if request.channel == "email":
        prompt += "\nFormat: Subject (60 chars) | Body (150 words) | CTA button"
    elif request.channel in ["sms", "whatsapp"]:
        prompt += "\nFormat: Short message (160 chars max), 1 emoji, include link"
    elif request.channel == "instagram":
        prompt += "\nFormat: Caption (150 chars) | 5 hashtags"
    elif request.channel == "linkedin":
        prompt += "\nFormat: Professional headline | Post (200 words) | CTA"
    elif request.channel == "facebook":
        prompt += "\nFormat: Engaging headline | Post (150 words)"
    elif request.channel == "website":
        prompt += "\nFormat: Banner headline (50 chars) | Subtext (100 chars) | Button CTA"

    prompt += """

Return ONLY this JSON (no markdown, no extra text):
{
  "variant_1": {
    "title": "headline here",
    "content": "body text here",
    "cta": "action text",
    "hashtags": ["tag1", "tag2"]
  },
  "variant_2": {
    "title": "different headline",
    "content": "different body",
    "cta": "different action",
    "hashtags": ["tag3", "tag4"]
  },
  "variant_3": {
    "title": "third headline",
    "content": "third body",
    "cta": "third action",
    "hashtags": ["tag5", "tag6"]
  }
}

Make content specific to the target segment. Use college data. Be creative.
"""
    
    return prompt


@router.post("/generate", response_model=ContentResponse)
async def generate_personalized_content(request: ContentRequest):
    """
    Generate personalized marketing content for a specific student segment
    
    Args:
        request: ContentRequest with segment info, channel, goal, tone
    
    Returns:
        ContentResponse with 3 content variants
    """
    try:
        # Load college data
        college_data = load_college_data()
        if not college_data:
            raise HTTPException(status_code=500, detail="Failed to load college data")
        
        # Check API key
        if not GEMINI_API_KEY:
            raise HTTPException(status_code=500, detail="Gemini API key not configured")
        
        # Build prompt
        prompt = build_prompt(request, college_data)
        
        # Call Gemini API
        model = genai.GenerativeModel(
            model_name="gemini-2.5-flash",
            generation_config={
                "temperature": 0.8,  # Higher for creativity
                "top_p": 0.95,
                "top_k": 40,
                "max_output_tokens": 2048,
            }
        )
        
        response = model.generate_content(prompt)
        
        if not response or not response.text:
            raise HTTPException(status_code=500, detail="Empty response from Gemini API")
        
        # Parse JSON response
        response_text = response.text.strip()
        
        # Clean up markdown code blocks if present
        if response_text.startswith("```json"):
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif response_text.startswith("```"):
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        # Try to parse JSON with error recovery
        try:
            generated_data = json.loads(response_text)
        except json.JSONDecodeError:
            # If JSON parsing fails, try to extract JSON from text
            import re
            json_match = re.search(r'\{[\s\S]*\}', response_text)
            if json_match:
                try:
                    generated_data = json.loads(json_match.group(0))
                except:
                    raise HTTPException(
                        status_code=500, 
                        detail=f"Failed to parse Gemini response. Raw response saved for debugging."
                    )
            else:
                raise HTTPException(
                    status_code=500, 
                    detail="No valid JSON found in Gemini response"
                )
        
        # Convert to ContentVariant objects
        variants = []
        for i in range(1, 4):
            variant_key = f"variant_{i}"
            if variant_key in generated_data:
                variant_data = generated_data[variant_key]
                variants.append(ContentVariant(
                    title=variant_data.get("title", ""),
                    content=variant_data.get("content", ""),
                    cta=variant_data.get("cta", ""),
                    hashtags=variant_data.get("hashtags", None)
                ))
        
        if not variants:
            raise HTTPException(status_code=500, detail="No valid variants generated")
        
        # Build metadata
        metadata = {
            "model": "gemini-2.5-flash",
            "college": college_data.get("name", "BIT Sathy"),
            "generated_at": college_data.get("scraped_date", "2025-12-12"),
            "segment_characteristics": request.segment_characteristics
        }
        
        return ContentResponse(
            segment=request.segment_name,
            channel=request.channel,
            variants=variants,
            metadata=metadata
        )
        
    except json.JSONDecodeError as e:
        print(f"JSON Parse Error: {str(e)}")
        print(f"Response text: {response_text[:500]}")  # Print first 500 chars
        raise HTTPException(status_code=500, detail=f"Failed to parse Gemini response: {str(e)}")
    except Exception as e:
        print(f"Error generating content: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error generating content: {str(e)}")


@router.get("/segments")
async def get_available_segments():
    """Get list of available student segments with their characteristics"""
    return {
        "segments": [
            {
                "name": "Urban High-Achievers",
                "characteristics": {
                    "location": "Urban/Metro cities",
                    "academic_performance": "90%+ marks",
                    "interests": ["Research", "Competitions", "Top placements"],
                    "decision_factors": ["Rankings", "Placements", "Innovation labs"]
                }
            },
            {
                "name": "Rural Scholarship Seekers",
                "characteristics": {
                    "location": "Rural/Semi-urban",
                    "academic_performance": "75-85% marks",
                    "interests": ["Scholarships", "Financial aid", "Hostel facilities"],
                    "decision_factors": ["Cost", "Scholarships", "Support systems"]
                }
            },
            {
                "name": "Parent-Influenced Students",
                "characteristics": {
                    "decision_maker": "Parents primarily",
                    "interests": ["Safety", "Reputation", "Value for money"],
                    "decision_factors": ["Brand", "Faculty", "Infrastructure", "Alumni success"]
                }
            },
            {
                "name": "Social Media Active",
                "characteristics": {
                    "platform_usage": "High Instagram/LinkedIn activity",
                    "interests": ["Campus life", "Events", "Peer community"],
                    "decision_factors": ["Campus culture", "Student testimonials", "Activities"]
                }
            },
            {
                "name": "Distance Learners",
                "characteristics": {
                    "location": "500+ km from college",
                    "interests": ["Hostel quality", "Transport", "Food", "Safety"],
                    "decision_factors": ["Accommodation", "Connectivity", "Home-like environment"]
                }
            },
            {
                "name": "Tech Enthusiasts",
                "characteristics": {
                    "interests": ["Coding", "Hackathons", "Startups", "AI/ML"],
                    "academic_performance": "85%+ marks",
                    "decision_factors": ["Labs", "Industry partnerships", "Innovation ecosystem"]
                }
            },
            {
                "name": "Career-Focused Pragmatists",
                "characteristics": {
                    "interests": ["Job security", "Skill development", "Internships"],
                    "decision_factors": ["Placement rate", "Training programs", "Industry connect"]
                }
            }
        ]
    }


@router.get("/channels")
async def get_available_channels():
    """Get list of available content channels"""
    return {
        "channels": [
            {"id": "email", "name": "Email Campaign", "description": "Personalized email with subject and body"},
            {"id": "sms", "name": "SMS", "description": "Short text message (160 chars)"},
            {"id": "whatsapp", "name": "WhatsApp", "description": "Rich text message with emojis"},
            {"id": "instagram", "name": "Instagram", "description": "Visual post with caption and hashtags"},
            {"id": "linkedin", "name": "LinkedIn", "description": "Professional post for career-focused audience"},
            {"id": "facebook", "name": "Facebook", "description": "Community-focused post for broader reach"},
            {"id": "website", "name": "Website Banner", "description": "Hero banner with headline and CTA"}
        ]
    }


@router.post("/suggest-channel", response_model=ChannelSuggestion)
async def suggest_best_channel(request: ChannelSuggestionRequest):
    """
    AI analyzes content and suggests the most appropriate marketing channel
    
    Args:
        request: ChannelSuggestionRequest with news text and target audience
    
    Returns:
        ChannelSuggestion with recommended channel, reason, and alternatives
    """
    try:
        # Check API key
        if not GEMINI_API_KEY:
            raise HTTPException(status_code=500, detail="Gemini API key not configured")
        
        prompt = f"""Analyze this achievement/news and recommend the BEST marketing channel to promote it.

NEWS/ACHIEVEMENT:
{request.news_text}

TARGET AUDIENCE: {request.target_audience}

AVAILABLE CHANNELS:
1. Email - Detailed information, formal communication, direct to inbox
2. SMS - Urgent, brief, high open rate, immediate attention
3. WhatsApp - Personal, conversational, rich media, instant
4. Instagram - Visual, engaging, youth-focused, viral potential
5. LinkedIn - Professional, career-oriented, credibility, networking
6. Facebook - Broad reach, community, shareable, parent-friendly
7. Website Banner - High visibility, first impression, traffic capture

ANALYSIS CRITERIA:
- Urgency of the news (breaking vs evergreen)
- Length and complexity of message
- Target audience preferences (students, parents, professionals)
- Visual appeal potential
- Shareability and viral potential
- Formality required

Return ONLY this JSON:
{{
  "recommended_channel": "channel_id",
  "reason": "2-3 sentence explanation of why this is the best channel",
  "alternatives": [
    {{"channel": "alternative1", "reason": "why this is second best"}},
    {{"channel": "alternative2", "reason": "why this is third best"}}
  ]
}}

Be strategic and data-driven in your recommendation.
"""
        
        model = genai.GenerativeModel(
            model_name="gemini-2.5-flash",
            generation_config={
                "temperature": 0.4,  # Lower for more consistent recommendations
                "top_p": 0.9,
                "max_output_tokens": 512,
            }
        )
        
        response = model.generate_content(prompt)
        
        if not response or not response.text:
            raise HTTPException(status_code=500, detail="Empty response from AI")
        
        # Parse JSON
        response_text = response.text.strip()
        if response_text.startswith("```json"):
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif response_text.startswith("```"):
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        try:
            data = json.loads(response_text)
        except json.JSONDecodeError:
            import re
            json_match = re.search(r'\{[\s\S]*\}', response_text)
            if json_match:
                data = json.loads(json_match.group(0))
            else:
                raise HTTPException(status_code=500, detail="Failed to parse AI response")
        
        return ChannelSuggestion(
            recommended_channel=data.get("recommended_channel", "instagram"),
            reason=data.get("reason", "Instagram is great for visual engagement"),
            alternatives=data.get("alternatives", [])
        )
        
    except Exception as e:
        print(f"Error suggesting channel: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@router.post("/generate-from-news", response_model=ContentResponse)
async def generate_content_from_news(request: NewsContentRequest):
    """
    Generate marketing content from breaking news/achievement
    
    Args:
        request: NewsContentRequest with custom news text, channel, audience
    
    Returns:
        ContentResponse with 3 content variants
    """
    try:
        # Load college data for context
        college_data = load_college_data()
        
        # Check API key
        if not GEMINI_API_KEY:
            raise HTTPException(status_code=500, detail="Gemini API key not configured")
        
        # Build prompt for news-based content
        prompt = f"""Create 3 marketing content variants to promote this achievement/news for BIT Sathy college.

BREAKING NEWS/ACHIEVEMENT:
{request.news_text}

COLLEGE CONTEXT:
- Bannari Amman Institute of Technology (BIT Sathy)
- Location: Sathyamangalam, Tamil Nadu
- Known for: 95% placements, ₹44L max package, AI/ML/IoT labs
- Top recruiters: Juspay, Swiggy, Informatica, Thoughtworks

TARGET AUDIENCE: {request.target_audience}
CHANNEL: {request.channel}
TONE: {request.tone}
"""

        if request.channel == "email":
            prompt += "\nFormat: Exciting subject (60 chars) | Email body (150 words) | CTA"
        elif request.channel in ["sms", "whatsapp"]:
            prompt += "\nFormat: Short celebratory message (160 chars), 1 emoji, link placeholder"
        elif request.channel == "instagram":
            prompt += "\nFormat: Engaging caption (150 chars) | 5-7 hashtags"
        elif request.channel == "linkedin":
            prompt += "\nFormat: Professional headline | Achievement post (200 words) | CTA"
        elif request.channel == "facebook":
            prompt += "\nFormat: Catchy headline | Shareable post (150 words)"
        elif request.channel == "website":
            prompt += "\nFormat: Banner headline (50 chars) | Achievement subtext (100 chars) | Button CTA"

        prompt += """

Return ONLY this JSON (no markdown):
{
  "variant_1": {
    "title": "headline here",
    "content": "body text here",
    "cta": "action text",
    "hashtags": ["tag1", "tag2"]
  },
  "variant_2": {
    "title": "different headline",
    "content": "different body",
    "cta": "different action",
    "hashtags": ["tag3", "tag4"]
  },
  "variant_3": {
    "title": "third headline",
    "content": "third body",
    "cta": "third action",
    "hashtags": ["tag5", "tag6"]
  }
}

Make content exciting and shareable. Highlight the achievement clearly.
"""
        
        # Call Gemini API
        model = genai.GenerativeModel(
            model_name="gemini-2.5-flash",
            generation_config={
                "temperature": 0.9,  # Higher creativity for news content
                "top_p": 0.95,
                "top_k": 40,
                "max_output_tokens": 2048,
            }
        )
        
        response = model.generate_content(prompt)
        
        if not response or not response.text:
            raise HTTPException(status_code=500, detail="Empty response from Gemini API")
        
        # Parse JSON response
        response_text = response.text.strip()
        
        # Clean up markdown code blocks
        if response_text.startswith("```json"):
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif response_text.startswith("```"):
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        # Try to parse JSON with error recovery
        try:
            generated_data = json.loads(response_text)
        except json.JSONDecodeError:
            import re
            json_match = re.search(r'\{[\s\S]*\}', response_text)
            if json_match:
                try:
                    generated_data = json.loads(json_match.group(0))
                except:
                    raise HTTPException(
                        status_code=500, 
                        detail=f"Failed to parse Gemini response"
                    )
            else:
                raise HTTPException(
                    status_code=500, 
                    detail="No valid JSON found in Gemini response"
                )
        
        # Convert to ContentVariant objects
        variants = []
        for i in range(1, 4):
            variant_key = f"variant_{i}"
            if variant_key in generated_data:
                variant_data = generated_data[variant_key]
                variants.append(ContentVariant(
                    title=variant_data.get("title", ""),
                    content=variant_data.get("content", ""),
                    cta=variant_data.get("cta", ""),
                    hashtags=variant_data.get("hashtags", None)
                ))
        
        if not variants:
            raise HTTPException(status_code=500, detail="No valid variants generated")
        
        # Build metadata
        metadata = {
            "model": "gemini-2.5-flash",
            "type": "news_based",
            "college": college_data.get("name", "BIT Sathy") if college_data else "BIT Sathy",
            "target_audience": request.target_audience
        }
        
        return ContentResponse(
            segment=f"News: {request.news_text[:50]}...",
            channel=request.channel,
            variants=variants,
            metadata=metadata
        )
        
    except json.JSONDecodeError as e:
        print(f"JSON Parse Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to parse response: {str(e)}")
    except Exception as e:
        print(f"Error generating news content: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

