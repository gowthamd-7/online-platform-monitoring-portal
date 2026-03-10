from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from database import engine, get_db, Base
from models import User, LeetCodeProfile, GitHubProfile, HackerRankProfile
from scrapers.leetcode_scraper import LeetCodeScraper
from scrapers import github_scraper, hackerrank_scraper
from scheduler import start_scheduler
from dotenv import load_dotenv
import pathlib

# Load environment variables from backend/.env if present
_env_path = pathlib.Path(__file__).resolve().parent / '.env'
load_dotenv(dotenv_path=str(_env_path))

# Import routers after loading env so modules can read env vars at import time
from app.routes import ai_suggestions, segmentation, personalized_content

# Create tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(title="Online Platform Monitoring Portal API")

# Start background scheduler
scheduler = start_scheduler()

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:3004"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include AI suggestions router
app.include_router(ai_suggestions.router, prefix="/api/ai", tags=["AI Suggestions"])

# Include segmentation router
app.include_router(segmentation.router, prefix="/api/segmentation", tags=["Student Segmentation"])

# Include personalized content router
app.include_router(personalized_content.router, prefix="/api/content", tags=["Personalized Content"])

# Pydantic models for request/response
class LeetCodeConnectRequest(BaseModel):
    username: str
    profile_url: str

class LeetCodeProfileResponse(BaseModel):
    leetcode_username: str
    profile_url: str
    real_name: Optional[str]
    avatar: Optional[str]
    ranking: Optional[int]
    total_solved: int
    easy_solved: int
    medium_solved: int
    hard_solved: int
    current_streak: int
    max_streak: int
    total_active_days: int
    contest_rating: Optional[float]
    contest_ranking: Optional[str]
    contests_attended: int
    last_updated: str


class GitHubConnectRequest(BaseModel):
    username: str
    profile_url: str

class GitHubProfileResponse(BaseModel):
    github_username: str
    profile_url: str
    name: Optional[str]
    bio: Optional[str]
    avatar_url: Optional[str]
    company: Optional[str]
    location: Optional[str]
    public_repos: int
    public_gists: int
    followers: int
    following: int
    total_stars: int
    total_forks: int
    top_languages: list
    last_updated: str


class HackerRankConnectRequest(BaseModel):
    username: str
    profile_url: str

class HackerRankProfileResponse(BaseModel):
    hackerrank_username: str
    profile_url: str
    name: Optional[str]
    country: Optional[str]
    avatar: Optional[str]
    level: int
    total_score: float
    total_badges: int
    python_score: float
    java_score: float
    problem_solving_score: float
    python_stars: int
    java_stars: int
    problem_solving_stars: int
    sql_stars: int
    last_updated: str


# Initialize scraper
scraper = LeetCodeScraper()


@app.get("/")
def read_root():
    return {"message": "Online Platform Monitoring Portal API", "status": "running"}


@app.post("/api/leetcode/connect", response_model=LeetCodeProfileResponse)
async def connect_leetcode(request: LeetCodeConnectRequest, db: Session = Depends(get_db)):
    """Connect LeetCode account and scrape profile data"""
    try:
        # Scrape LeetCode profile
        scraped_data = scraper.scrape_profile(request.profile_url)
        
        if "error" in scraped_data:
            raise HTTPException(status_code=400, detail=scraped_data["error"])
        
        # Check if profile already exists
        existing_profile = db.query(LeetCodeProfile).filter(
            LeetCodeProfile.username == request.username
        ).first()
        
        if existing_profile:
            # Update existing profile
            existing_profile.leetcode_username = scraped_data['username']
            existing_profile.profile_url = request.profile_url
            existing_profile.real_name = scraped_data['profile']['real_name']
            existing_profile.avatar = scraped_data['profile']['avatar']
            existing_profile.ranking = scraped_data['profile']['ranking']
            existing_profile.reputation = scraped_data['profile']['reputation']
            existing_profile.country = scraped_data['profile']['country']
            existing_profile.total_solved = scraped_data['statistics']['problems_solved']['total']
            existing_profile.easy_solved = scraped_data['statistics']['problems_solved']['easy']
            existing_profile.medium_solved = scraped_data['statistics']['problems_solved']['medium']
            existing_profile.hard_solved = scraped_data['statistics']['problems_solved']['hard']
            existing_profile.current_streak = scraped_data['statistics']['current_streak']
            existing_profile.max_streak = scraped_data['statistics']['max_streak']
            existing_profile.total_active_days = scraped_data['statistics']['total_active_days']
            
            if scraped_data.get('contests'):
                existing_profile.contest_rating = scraped_data['contests'].get('rating')
                existing_profile.contest_ranking = str(scraped_data['contests'].get('global_ranking', 'N/A'))
                existing_profile.contests_attended = scraped_data['contests'].get('attended_contests', 0)
            
            existing_profile.full_data = scraped_data
            existing_profile.last_updated = datetime.utcnow()
            profile = existing_profile
        else:
            # Create new profile
            profile = LeetCodeProfile(
                username=request.username,
                leetcode_username=scraped_data['username'],
                profile_url=request.profile_url,
                real_name=scraped_data['profile']['real_name'],
                avatar=scraped_data['profile']['avatar'],
                ranking=scraped_data['profile']['ranking'],
                reputation=scraped_data['profile']['reputation'],
                country=scraped_data['profile']['country'],
                total_solved=scraped_data['statistics']['problems_solved']['total'],
                easy_solved=scraped_data['statistics']['problems_solved']['easy'],
                medium_solved=scraped_data['statistics']['problems_solved']['medium'],
                hard_solved=scraped_data['statistics']['problems_solved']['hard'],
                current_streak=scraped_data['statistics']['current_streak'],
                max_streak=scraped_data['statistics']['max_streak'],
                total_active_days=scraped_data['statistics']['total_active_days'],
                contest_rating=scraped_data.get('contests', {}).get('rating'),
                contest_ranking=str(scraped_data.get('contests', {}).get('global_ranking', 'N/A')),
                contests_attended=scraped_data.get('contests', {}).get('attended_contests', 0),
                full_data=scraped_data
            )
            db.add(profile)
        
        db.commit()
        db.refresh(profile)
        
        return LeetCodeProfileResponse(
            leetcode_username=profile.leetcode_username,
            profile_url=profile.profile_url,
            real_name=profile.real_name,
            avatar=profile.avatar,
            ranking=profile.ranking,
            total_solved=profile.total_solved,
            easy_solved=profile.easy_solved,
            medium_solved=profile.medium_solved,
            hard_solved=profile.hard_solved,
            current_streak=profile.current_streak,
            max_streak=profile.max_streak,
            total_active_days=profile.total_active_days,
            contest_rating=profile.contest_rating,
            contest_ranking=profile.contest_ranking,
            contests_attended=profile.contests_attended,
            last_updated=profile.last_updated.isoformat()
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/leetcode/profile/{username}", response_model=LeetCodeProfileResponse)
async def get_leetcode_profile(username: str, db: Session = Depends(get_db)):
    """Get LeetCode profile data for a student"""
    profile = db.query(LeetCodeProfile).filter(LeetCodeProfile.username == username).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="LeetCode profile not connected")
    
    return LeetCodeProfileResponse(
        leetcode_username=profile.leetcode_username,
        profile_url=profile.profile_url,
        real_name=profile.real_name,
        avatar=profile.avatar,
        ranking=profile.ranking,
        total_solved=profile.total_solved,
        easy_solved=profile.easy_solved,
        medium_solved=profile.medium_solved,
        hard_solved=profile.hard_solved,
        current_streak=profile.current_streak,
        max_streak=profile.max_streak,
        total_active_days=profile.total_active_days,
        contest_rating=profile.contest_rating,
        contest_ranking=profile.contest_ranking,
        contests_attended=profile.contests_attended,
        last_updated=profile.last_updated.isoformat()
    )


@app.delete("/api/leetcode/disconnect/{username}")
async def disconnect_leetcode(username: str, db: Session = Depends(get_db)):
    """Disconnect LeetCode account"""
    profile = db.query(LeetCodeProfile).filter(LeetCodeProfile.username == username).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="LeetCode profile not found")
    
    db.delete(profile)
    db.commit()
    
    return {"message": "LeetCode account disconnected successfully"}


@app.put("/api/leetcode/update/{username}")
async def update_leetcode_profile(username: str, db: Session = Depends(get_db)):
    """Manually update LeetCode profile"""
    profile = db.query(LeetCodeProfile).filter(LeetCodeProfile.username == username).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="LeetCode profile not found")
    
    try:
        # Scrape latest data
        scraped_data = scraper.scrape_profile(profile.profile_url)
        
        if "error" in scraped_data:
            raise HTTPException(status_code=400, detail=scraped_data["error"])
        
        # Update profile
        profile.real_name = scraped_data['profile']['real_name']
        profile.avatar = scraped_data['profile']['avatar']
        profile.ranking = scraped_data['profile']['ranking']
        profile.reputation = scraped_data['profile']['reputation']
        profile.total_solved = scraped_data['statistics']['problems_solved']['total']
        profile.easy_solved = scraped_data['statistics']['problems_solved']['easy']
        profile.medium_solved = scraped_data['statistics']['problems_solved']['medium']
        profile.hard_solved = scraped_data['statistics']['problems_solved']['hard']
        profile.current_streak = scraped_data['statistics']['current_streak']
        profile.max_streak = scraped_data['statistics']['max_streak']
        profile.total_active_days = scraped_data['statistics']['total_active_days']
        
        if scraped_data.get('contests'):
            profile.contest_rating = scraped_data['contests'].get('rating')
            profile.contest_ranking = str(scraped_data['contests'].get('global_ranking', 'N/A'))
            profile.contests_attended = scraped_data['contests'].get('attended_contests', 0)
        
        profile.full_data = scraped_data
        profile.last_updated = datetime.utcnow()
        
        db.commit()
        db.refresh(profile)
        
        return {"message": "Profile updated successfully", "last_updated": profile.last_updated.isoformat()}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== GITHUB ENDPOINTS ====================

@app.post("/api/github/connect", response_model=GitHubProfileResponse)
async def connect_github(request: GitHubConnectRequest, db: Session = Depends(get_db)):
    """Connect GitHub account and scrape profile data"""
    try:
        # Scrape GitHub profile
        scraped_data = github_scraper.scrape_profile(request.profile_url)
        
        # Check if profile already exists
        existing_profile = db.query(GitHubProfile).filter(
            GitHubProfile.username == request.username
        ).first()
        
        if existing_profile:
            # Update existing profile
            existing_profile.github_username = scraped_data['github_username']
            existing_profile.profile_url = scraped_data['profile_url']
            existing_profile.name = scraped_data.get('name')
            existing_profile.bio = scraped_data.get('bio')
            existing_profile.avatar_url = scraped_data.get('avatar_url')
            existing_profile.company = scraped_data.get('company')
            existing_profile.location = scraped_data.get('location')
            existing_profile.email = scraped_data.get('email')
            existing_profile.blog = scraped_data.get('blog')
            existing_profile.twitter_username = scraped_data.get('twitter_username')
            existing_profile.public_repos = scraped_data.get('public_repos', 0)
            existing_profile.public_gists = scraped_data.get('public_gists', 0)
            existing_profile.followers = scraped_data.get('followers', 0)
            existing_profile.following = scraped_data.get('following', 0)
            existing_profile.total_stars = scraped_data.get('total_stars', 0)
            existing_profile.total_forks = scraped_data.get('total_forks', 0)
            existing_profile.top_languages = scraped_data.get('top_languages', [])
            existing_profile.full_data = scraped_data.get('full_data')
            existing_profile.last_updated = datetime.utcnow()
            profile = existing_profile
        else:
            # Create new profile
            profile = GitHubProfile(
                username=request.username,
                github_username=scraped_data['github_username'],
                profile_url=scraped_data['profile_url'],
                name=scraped_data.get('name'),
                bio=scraped_data.get('bio'),
                avatar_url=scraped_data.get('avatar_url'),
                company=scraped_data.get('company'),
                location=scraped_data.get('location'),
                email=scraped_data.get('email'),
                blog=scraped_data.get('blog'),
                twitter_username=scraped_data.get('twitter_username'),
                public_repos=scraped_data.get('public_repos', 0),
                public_gists=scraped_data.get('public_gists', 0),
                followers=scraped_data.get('followers', 0),
                following=scraped_data.get('following', 0),
                total_stars=scraped_data.get('total_stars', 0),
                total_forks=scraped_data.get('total_forks', 0),
                top_languages=scraped_data.get('top_languages', []),
                full_data=scraped_data.get('full_data')
            )
            db.add(profile)
        
        db.commit()
        db.refresh(profile)
        
        return GitHubProfileResponse(
            github_username=profile.github_username,
            profile_url=profile.profile_url,
            name=profile.name,
            bio=profile.bio,
            avatar_url=profile.avatar_url,
            company=profile.company,
            location=profile.location,
            public_repos=profile.public_repos,
            public_gists=profile.public_gists,
            followers=profile.followers,
            following=profile.following,
            total_stars=profile.total_stars,
            total_forks=profile.total_forks,
            top_languages=profile.top_languages or [],
            last_updated=profile.last_updated.isoformat()
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/github/profile/{username}", response_model=GitHubProfileResponse)
async def get_github_profile(username: str, db: Session = Depends(get_db)):
    """Get GitHub profile data for a student"""
    profile = db.query(GitHubProfile).filter(GitHubProfile.username == username).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="GitHub profile not connected")
    
    return GitHubProfileResponse(
        github_username=profile.github_username,
        profile_url=profile.profile_url,
        name=profile.name,
        bio=profile.bio,
        avatar_url=profile.avatar_url,
        company=profile.company,
        location=profile.location,
        public_repos=profile.public_repos,
        public_gists=profile.public_gists,
        followers=profile.followers,
        following=profile.following,
        total_stars=profile.total_stars,
        total_forks=profile.total_forks,
        top_languages=profile.top_languages or [],
        last_updated=profile.last_updated.isoformat()
    )


@app.delete("/api/github/disconnect/{username}")
async def disconnect_github(username: str, db: Session = Depends(get_db)):
    """Disconnect GitHub account"""
    profile = db.query(GitHubProfile).filter(GitHubProfile.username == username).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="GitHub profile not found")
    
    db.delete(profile)
    db.commit()
    
    return {"message": "GitHub account disconnected successfully"}


@app.put("/api/github/update/{username}")
async def update_github_profile(username: str, db: Session = Depends(get_db)):
    """Manually update GitHub profile"""
    profile = db.query(GitHubProfile).filter(GitHubProfile.username == username).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="GitHub profile not found")
    
    try:
        # Scrape latest data
        scraped_data = github_scraper.scrape_profile(profile.profile_url)
        
        # Update profile
        for key, value in scraped_data.items():
            if hasattr(profile, key):
                setattr(profile, key, value)
        profile.last_updated = datetime.utcnow()
        
        db.commit()
        db.refresh(profile)
        
        return {"message": "Profile updated successfully", "last_updated": profile.last_updated.isoformat()}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== HACKERRANK ENDPOINTS ====================

@app.post("/api/hackerrank/connect", response_model=HackerRankProfileResponse)
async def connect_hackerrank(request: HackerRankConnectRequest, db: Session = Depends(get_db)):
    """Connect HackerRank account and scrape profile data"""
    try:
        # Scrape HackerRank profile
        scraped_data = hackerrank_scraper.scrape_profile(request.profile_url)
        
        # Check if profile already exists
        existing_profile = db.query(HackerRankProfile).filter(
            HackerRankProfile.username == request.username
        ).first()
        
        if existing_profile:
            # Update existing profile
            existing_profile.hackerrank_username = scraped_data['hackerrank_username']
            existing_profile.profile_url = scraped_data['profile_url']
            existing_profile.name = scraped_data.get('name')
            existing_profile.country = scraped_data.get('country')
            existing_profile.avatar = scraped_data.get('avatar')
            existing_profile.school = scraped_data.get('school')
            existing_profile.level = scraped_data.get('level', 0)
            existing_profile.total_score = scraped_data.get('total_score', 0)
            existing_profile.total_badges = scraped_data.get('total_badges', 0)
            existing_profile.python_score = scraped_data.get('python_score', 0)
            existing_profile.java_score = scraped_data.get('java_score', 0)
            existing_profile.cpp_score = scraped_data.get('cpp_score', 0)
            existing_profile.problem_solving_score = scraped_data.get('problem_solving_score', 0)
            existing_profile.algorithms_score = scraped_data.get('algorithms_score', 0)
            existing_profile.data_structures_score = scraped_data.get('data_structures_score', 0)
            existing_profile.python_stars = scraped_data.get('python_stars', 0)
            existing_profile.java_stars = scraped_data.get('java_stars', 0)
            existing_profile.problem_solving_stars = scraped_data.get('problem_solving_stars', 0)
            existing_profile.sql_stars = scraped_data.get('sql_stars', 0)
            existing_profile.full_data = scraped_data.get('full_data')
            existing_profile.last_updated = datetime.utcnow()
            profile = existing_profile
        else:
            # Create new profile
            profile = HackerRankProfile(
                username=request.username,
                hackerrank_username=scraped_data['hackerrank_username'],
                profile_url=scraped_data['profile_url'],
                name=scraped_data.get('name'),
                country=scraped_data.get('country'),
                avatar=scraped_data.get('avatar'),
                school=scraped_data.get('school'),
                level=scraped_data.get('level', 0),
                total_score=scraped_data.get('total_score', 0),
                total_badges=scraped_data.get('total_badges', 0),
                python_score=scraped_data.get('python_score', 0),
                java_score=scraped_data.get('java_score', 0),
                cpp_score=scraped_data.get('cpp_score', 0),
                problem_solving_score=scraped_data.get('problem_solving_score', 0),
                algorithms_score=scraped_data.get('algorithms_score', 0),
                data_structures_score=scraped_data.get('data_structures_score', 0),
                python_stars=scraped_data.get('python_stars', 0),
                java_stars=scraped_data.get('java_stars', 0),
                problem_solving_stars=scraped_data.get('problem_solving_stars', 0),
                sql_stars=scraped_data.get('sql_stars', 0),
                full_data=scraped_data.get('full_data')
            )
            db.add(profile)
        
        db.commit()
        db.refresh(profile)
        
        return HackerRankProfileResponse(
            hackerrank_username=profile.hackerrank_username,
            profile_url=profile.profile_url,
            name=profile.name,
            country=profile.country,
            avatar=profile.avatar,
            level=profile.level,
            total_score=profile.total_score,
            total_badges=profile.total_badges,
            python_score=profile.python_score,
            java_score=profile.java_score,
            problem_solving_score=profile.problem_solving_score,
            python_stars=profile.python_stars,
            java_stars=profile.java_stars,
            problem_solving_stars=profile.problem_solving_stars,
            sql_stars=profile.sql_stars,
            last_updated=profile.last_updated.isoformat()
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/hackerrank/profile/{username}", response_model=HackerRankProfileResponse)
async def get_hackerrank_profile(username: str, db: Session = Depends(get_db)):
    """Get HackerRank profile data for a student"""
    profile = db.query(HackerRankProfile).filter(HackerRankProfile.username == username).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="HackerRank profile not connected")
    
    return HackerRankProfileResponse(
        hackerrank_username=profile.hackerrank_username,
        profile_url=profile.profile_url,
        name=profile.name,
        country=profile.country,
        avatar=profile.avatar,
        level=profile.level,
        total_score=profile.total_score,
        total_badges=profile.total_badges,
        python_score=profile.python_score,
        java_score=profile.java_score,
        problem_solving_score=profile.problem_solving_score,
        python_stars=profile.python_stars,
        java_stars=profile.java_stars,
        problem_solving_stars=profile.problem_solving_stars,
        sql_stars=profile.sql_stars,
        last_updated=profile.last_updated.isoformat()
    )


@app.delete("/api/hackerrank/disconnect/{username}")
async def disconnect_hackerrank(username: str, db: Session = Depends(get_db)):
    """Disconnect HackerRank account"""
    profile = db.query(HackerRankProfile).filter(HackerRankProfile.username == username).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="HackerRank profile not found")
    
    db.delete(profile)
    db.commit()
    
    return {"message": "HackerRank account disconnected successfully"}


@app.put("/api/hackerrank/update/{username}")
async def update_hackerrank_profile(username: str, db: Session = Depends(get_db)):
    """Manually update HackerRank profile"""
    profile = db.query(HackerRankProfile).filter(HackerRankProfile.username == username).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="HackerRank profile not found")
    
    try:
        # Scrape latest data
        scraped_data = hackerrank_scraper.scrape_profile(profile.profile_url)
        
        # Update profile
        for key, value in scraped_data.items():
            if hasattr(profile, key):
                setattr(profile, key, value)
        profile.last_updated = datetime.utcnow()
        
        db.commit()
        db.refresh(profile)
        
        return {"message": "Profile updated successfully", "last_updated": profile.last_updated.isoformat()}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
