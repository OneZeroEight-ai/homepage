# Claude Code Directive: PR Agent Implementation

## Overview

Build a PR Agent that generates press materials and handles media outreach for artists on the OneZeroEight.ai platform. The agent uses Claude to generate content and Resend for email delivery.

**Goal:** When an artist has a placement or milestone, the PR Agent generates press releases, pitches, and one-sheets, then sends personalized outreach to relevant media outlets.

---

## Architecture

Follow existing patterns in the codebase:
- Agent pattern: `app/services/agents/` (see sutra_service.py, dharma_service.py)
- Email pattern: `app/services/email_service.py`
- Router pattern: `app/routers/workflow.py`
- Background tasks: FastAPI BackgroundTasks

---

## Phase 1: PR Agent Service

**Create:** `app/services/agents/pr_agent_service.py`

```python
"""
PR Agent Service - Generates press materials and handles media outreach
"""
import os
import anthropic
from datetime import datetime
from typing import List, Dict, Optional
from sqlalchemy.orm import Session

from app.models.database import Campaign, Artist, Placement, OutreachMessage
from app.services.email_service import EmailServiceWrapper

# Initialize Anthropic client (follow existing pattern)
client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

class PRAgentService:
    """
    PR Agent - Handles press releases, media pitches, and journalist outreach
    """
    
    def __init__(self, db: Session):
        self.db = db
        self.email_service = EmailServiceWrapper()
        self.model = "claude-sonnet-4-20250514"  # Match existing agent pattern
    
    async def generate_press_release(
        self,
        campaign: Campaign,
        placement: Optional[Placement] = None,
        milestone: Optional[str] = None
    ) -> Dict:
        """
        Generate a full press release for a placement or milestone.
        
        Returns:
            {
                "press_release": str,      # Full press release text
                "headline": str,           # Headline
                "subheadline": str,        # Subheadline
                "boilerplate": str,        # About the artist
                "contact_info": str        # Press contact
            }
        """
        # Build context
        context = self._build_campaign_context(campaign, placement, milestone)
        
        prompt = f"""You are a music PR professional writing a press release.

CONTEXT:
{context}

Write a professional press release with:
1. Attention-grabbing headline
2. Subheadline with key details
3. Opening paragraph (who, what, when, where, why)
4. Quote from the artist (create a believable quote)
5. Background on the artist/track
6. Boilerplate "About [Artist]" section
7. Press contact information (use: press@onezeroeight.ai)

Format the response as JSON:
{{
    "headline": "...",
    "subheadline": "...",
    "press_release": "... (full formatted press release)",
    "boilerplate": "...",
    "contact_info": "For press inquiries: press@onezeroeight.ai"
}}

Keep it professional, newsworthy, and under 500 words."""

        response = client.messages.create(
            model=self.model,
            max_tokens=2000,
            messages=[{"role": "user", "content": prompt}]
        )
        
        # Parse JSON response
        import json
        try:
            result = json.loads(response.content[0].text)
        except json.JSONDecodeError:
            result = {
                "press_release": response.content[0].text,
                "headline": f"{campaign.artist_name} Releases New Track",
                "subheadline": campaign.track_title,
                "boilerplate": "",
                "contact_info": "press@onezeroeight.ai"
            }
        
        return result
    
    async def generate_journalist_pitch(
        self,
        campaign: Campaign,
        outlet_type: str = "blog",  # blog, magazine, podcast, radio
        outlet_name: Optional[str] = None
    ) -> Dict:
        """
        Generate a personalized pitch for a specific outlet type.
        
        Returns:
            {
                "subject": str,     # Email subject line
                "pitch": str,       # Pitch body
                "one_liner": str,   # Quick hook
                "call_to_action": str
            }
        """
        context = self._build_campaign_context(campaign)
        
        prompt = f"""You are a music publicist writing a pitch email to a {outlet_type}.

CONTEXT:
{context}

TARGET: {outlet_name or f"A {outlet_type} covering {campaign.genres or 'independent music'}"}

Write a personalized pitch that:
1. Has a compelling subject line (short, intriguing)
2. Opens with a hook relevant to the outlet
3. Briefly describes the artist and track
4. Explains why their audience would care
5. Includes a clear call-to-action
6. Is concise (under 200 words)

DO NOT be overly salesy or use hyperbole. Be professional and genuine.

Format as JSON:
{{
    "subject": "...",
    "pitch": "...",
    "one_liner": "... (one sentence hook)",
    "call_to_action": "..."
}}"""

        response = client.messages.create(
            model=self.model,
            max_tokens=1000,
            messages=[{"role": "user", "content": prompt}]
        )
        
        import json
        try:
            result = json.loads(response.content[0].text)
        except json.JSONDecodeError:
            result = {
                "subject": f"New Release: {campaign.track_title} by {campaign.artist_name}",
                "pitch": response.content[0].text,
                "one_liner": f"Check out {campaign.track_title} by {campaign.artist_name}",
                "call_to_action": "Would you be interested in featuring this track?"
            }
        
        return result
    
    async def generate_one_sheet(self, campaign: Campaign) -> Dict:
        """
        Generate an artist one-sheet / EPK summary.
        
        Returns:
            {
                "artist_bio": str,        # Short bio
                "track_description": str, # About the track
                "key_facts": list,        # Bullet points
                "social_links": dict,     # Platform links
                "press_quotes": list,     # Placeholder for quotes
                "contact": str
            }
        """
        context = self._build_campaign_context(campaign)
        
        prompt = f"""You are creating a one-sheet (EPK) for an artist.

CONTEXT:
{context}

Create a concise one-sheet with:
1. Artist bio (2-3 sentences)
2. Track description (2-3 sentences)
3. 4-5 key facts as bullet points
4. Genre tags
5. Placeholder for press quotes

Format as JSON:
{{
    "artist_bio": "...",
    "track_description": "...",
    "key_facts": ["fact 1", "fact 2", ...],
    "genre_tags": ["tag1", "tag2"],
    "press_quotes": [],
    "contact": "press@onezeroeight.ai"
}}"""

        response = client.messages.create(
            model=self.model,
            max_tokens=1000,
            messages=[{"role": "user", "content": prompt}]
        )
        
        import json
        try:
            result = json.loads(response.content[0].text)
        except json.JSONDecodeError:
            result = {
                "artist_bio": f"{campaign.artist_name} is an independent artist.",
                "track_description": campaign.sales_pitch or f"New release: {campaign.track_title}",
                "key_facts": [],
                "genre_tags": campaign.genres.split(",") if campaign.genres else [],
                "press_quotes": [],
                "contact": "press@onezeroeight.ai"
            }
        
        return result
    
    async def generate_media_list(self, campaign: Campaign, limit: int = 10) -> List[Dict]:
        """
        Generate a list of relevant media outlets based on genre.
        
        Returns list of:
            {
                "name": str,
                "type": str,      # blog, magazine, podcast, radio, playlist
                "genre_match": str,
                "email": str,     # May be placeholder
                "priority": int   # 1-3, 1 being highest
            }
        """
        from app.data.media_outlets import get_outlets_by_genre
        
        genres = campaign.genres.split(",") if campaign.genres else ["indie"]
        outlets = []
        
        for genre in genres:
            genre_outlets = get_outlets_by_genre(genre.strip().lower())
            outlets.extend(genre_outlets)
        
        # Deduplicate and limit
        seen = set()
        unique_outlets = []
        for outlet in outlets:
            if outlet["name"] not in seen:
                seen.add(outlet["name"])
                unique_outlets.append(outlet)
        
        return unique_outlets[:limit]
    
    async def send_pr_outreach(
        self,
        campaign: Campaign,
        outlets: List[Dict],
        pitch_template: Optional[Dict] = None
    ) -> Dict:
        """
        Send PR pitches to a list of outlets.
        
        Returns:
            {
                "sent": int,
                "failed": int,
                "outreach_ids": list
            }
        """
        results = {"sent": 0, "failed": 0, "outreach_ids": []}
        
        for outlet in outlets:
            # Skip outlets without email
            if not outlet.get("email") or "@" not in outlet.get("email", ""):
                continue
            
            # Generate personalized pitch if not provided
            if not pitch_template:
                pitch = await self.generate_journalist_pitch(
                    campaign, 
                    outlet_type=outlet.get("type", "blog"),
                    outlet_name=outlet.get("name")
                )
            else:
                pitch = pitch_template
            
            # Create outreach record
            outreach = OutreachMessage(
                campaign_id=campaign.id,
                to_email=outlet["email"],
                subject=pitch["subject"],
                body=pitch["pitch"],
                channel="pr_pitch",
                outreach_type="journalist",
                status="pending",
                metadata={
                    "outlet_name": outlet.get("name"),
                    "outlet_type": outlet.get("type"),
                    "one_liner": pitch.get("one_liner")
                }
            )
            self.db.add(outreach)
            self.db.commit()
            
            # Send email
            try:
                await self.email_service.send_journalist_pitch(
                    to_email=outlet["email"],
                    subject=pitch["subject"],
                    pitch_content=pitch["pitch"],
                    artist_name=campaign.artist_name,
                    track_title=campaign.track_title,
                    spotify_url=campaign.spotify_url
                )
                
                outreach.status = "sent"
                outreach.sent_at = datetime.utcnow()
                results["sent"] += 1
                results["outreach_ids"].append(outreach.id)
                
            except Exception as e:
                outreach.status = "failed"
                outreach.metadata["error"] = str(e)
                results["failed"] += 1
            
            self.db.commit()
        
        return results
    
    async def generate_all_materials(self, campaign: Campaign) -> Dict:
        """
        Generate all PR materials for a campaign.
        
        Returns:
            {
                "press_release": dict,
                "blog_pitch": dict,
                "podcast_pitch": dict,
                "one_sheet": dict,
                "media_list": list
            }
        """
        press_release = await self.generate_press_release(campaign)
        blog_pitch = await self.generate_journalist_pitch(campaign, "blog")
        podcast_pitch = await self.generate_journalist_pitch(campaign, "podcast")
        one_sheet = await self.generate_one_sheet(campaign)
        media_list = await self.generate_media_list(campaign)
        
        return {
            "press_release": press_release,
            "blog_pitch": blog_pitch,
            "podcast_pitch": podcast_pitch,
            "one_sheet": one_sheet,
            "media_list": media_list,
            "generated_at": datetime.utcnow().isoformat()
        }
    
    def _build_campaign_context(
        self, 
        campaign: Campaign,
        placement: Optional[Placement] = None,
        milestone: Optional[str] = None
    ) -> str:
        """Build context string for Claude prompts."""
        context = f"""
ARTIST: {campaign.artist_name}
TRACK: {campaign.track_title}
SPOTIFY: {campaign.spotify_url}
GENRES: {campaign.genres or "Independent"}
"""
        
        if campaign.sales_pitch:
            context += f"DESCRIPTION: {campaign.sales_pitch}\n"
        
        if placement:
            context += f"""
PLACEMENT:
- Playlist: {placement.playlist_name}
- Followers: {placement.playlist_followers:,}
- Position: #{placement.position or "Featured"}
"""
        
        if milestone:
            context += f"MILESTONE: {milestone}\n"
        
        return context.strip()
```

---

## Phase 2: PR Router

**Create:** `app/routers/pr_agent.py`

```python
"""
PR Agent Router - API endpoints for PR materials and outreach
"""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Optional, List
from pydantic import BaseModel

from app.database import get_db
from app.models.database import Campaign, OutreachMessage
from app.services.agents.pr_agent_service import PRAgentService

router = APIRouter(prefix="/api/pr", tags=["PR Agent"])

# Request/Response Models
class GenerateMaterialsRequest(BaseModel):
    campaign_id: str
    include_media_list: bool = True

class SendOutreachRequest(BaseModel):
    campaign_id: str
    outlet_emails: Optional[List[str]] = None  # If None, use generated media list
    custom_pitch: Optional[dict] = None

class MaterialsResponse(BaseModel):
    campaign_id: str
    press_release: dict
    blog_pitch: dict
    podcast_pitch: dict
    one_sheet: dict
    media_list: list
    generated_at: str

class OutreachStatusResponse(BaseModel):
    campaign_id: str
    total_sent: int
    total_opened: int
    total_replied: int
    outreach: list


@router.post("/generate", response_model=MaterialsResponse)
async def generate_pr_materials(
    request: GenerateMaterialsRequest,
    db: Session = Depends(get_db)
):
    """
    Generate all PR materials for a campaign.
    Returns press release, pitches, one-sheet, and media list.
    """
    campaign = db.query(Campaign).filter(Campaign.id == request.campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    pr_service = PRAgentService(db)
    materials = await pr_service.generate_all_materials(campaign)
    
    return MaterialsResponse(
        campaign_id=request.campaign_id,
        **materials
    )


@router.post("/send")
async def send_pr_outreach(
    request: SendOutreachRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Send PR outreach emails to media outlets.
    Can specify outlets or use auto-generated media list.
    """
    campaign = db.query(Campaign).filter(Campaign.id == request.campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    pr_service = PRAgentService(db)
    
    # Get outlets
    if request.outlet_emails:
        outlets = [{"email": email, "type": "custom", "name": "Custom"} for email in request.outlet_emails]
    else:
        outlets = await pr_service.generate_media_list(campaign)
    
    # Send in background
    async def send_outreach():
        return await pr_service.send_pr_outreach(
            campaign, 
            outlets, 
            request.custom_pitch
        )
    
    background_tasks.add_task(send_outreach)
    
    return {
        "status": "queued",
        "campaign_id": request.campaign_id,
        "outlet_count": len(outlets),
        "message": "PR outreach queued for sending"
    }


@router.get("/{campaign_id}/materials")
async def get_pr_materials(
    campaign_id: str,
    regenerate: bool = False,
    db: Session = Depends(get_db)
):
    """
    Get generated PR materials for a campaign.
    Set regenerate=true to create fresh materials.
    """
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    # Check if materials exist in campaign metadata
    if not regenerate and campaign.metadata and campaign.metadata.get("pr_materials"):
        return campaign.metadata["pr_materials"]
    
    # Generate fresh materials
    pr_service = PRAgentService(db)
    materials = await pr_service.generate_all_materials(campaign)
    
    # Store in campaign metadata
    if not campaign.metadata:
        campaign.metadata = {}
    campaign.metadata["pr_materials"] = materials
    db.commit()
    
    return materials


@router.get("/{campaign_id}/outreach", response_model=OutreachStatusResponse)
async def get_outreach_status(
    campaign_id: str,
    db: Session = Depends(get_db)
):
    """
    Get PR outreach status for a campaign.
    Shows sent, opened, replied counts.
    """
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    outreach = db.query(OutreachMessage).filter(
        OutreachMessage.campaign_id == campaign_id,
        OutreachMessage.channel == "pr_pitch"
    ).all()
    
    return OutreachStatusResponse(
        campaign_id=campaign_id,
        total_sent=len([o for o in outreach if o.status == "sent"]),
        total_opened=len([o for o in outreach if o.opened_at]),
        total_replied=len([o for o in outreach if o.replied_at]),
        outreach=[{
            "id": o.id,
            "to_email": o.to_email,
            "subject": o.subject,
            "status": o.status,
            "sent_at": o.sent_at.isoformat() if o.sent_at else None,
            "opened_at": o.opened_at.isoformat() if o.opened_at else None,
            "replied_at": o.replied_at.isoformat() if o.replied_at else None,
            "outlet_name": o.metadata.get("outlet_name") if o.metadata else None
        } for o in outreach]
    )


@router.post("/{campaign_id}/press-release")
async def generate_press_release(
    campaign_id: str,
    milestone: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Generate just a press release for a campaign.
    Optionally include a milestone (e.g., "10,000 streams").
    """
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    pr_service = PRAgentService(db)
    press_release = await pr_service.generate_press_release(campaign, milestone=milestone)
    
    return {
        "campaign_id": campaign_id,
        "press_release": press_release
    }


@router.post("/{campaign_id}/pitch")
async def generate_pitch(
    campaign_id: str,
    outlet_type: str = "blog",
    outlet_name: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Generate a pitch for a specific outlet type.
    Types: blog, magazine, podcast, radio, playlist
    """
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    pr_service = PRAgentService(db)
    pitch = await pr_service.generate_journalist_pitch(campaign, outlet_type, outlet_name)
    
    return {
        "campaign_id": campaign_id,
        "outlet_type": outlet_type,
        "pitch": pitch
    }
```

---

## Phase 3: Email Templates

**Extend:** `app/services/email_templates.py`

Add these functions to the existing file:

```python
def journalist_pitch_email(
    pitch_content: str,
    artist_name: str,
    track_title: str,
    spotify_url: str = None
) -> str:
    """
    Clean, professional pitch email template for journalists/bloggers.
    """
    spotify_button = ""
    if spotify_url:
        spotify_button = f'''
        <p style="margin-top: 24px;">
            <a href="{spotify_url}" style="display: inline-block; background: #1DB954; color: white; padding: 12px 24px; border-radius: 50px; text-decoration: none; font-weight: 600;">
                ▶ Listen on Spotify
            </a>
        </p>
        '''
    
    return f'''
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        
        <div style="white-space: pre-wrap;">{pitch_content}</div>
        
        {spotify_button}
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="font-size: 13px; color: #666;">
            <strong>{artist_name}</strong> — "{track_title}"<br>
            Press Contact: <a href="mailto:press@onezeroeight.ai" style="color: #667eea;">press@onezeroeight.ai</a>
        </p>
        
        <p style="font-size: 11px; color: #999; margin-top: 20px;">
            Sent via OneZeroEight.ai — AI-powered music promotion<br>
            <a href="{{{{unsubscribe_url}}}}" style="color: #999;">Unsubscribe from press emails</a>
        </p>
    </body>
    </html>
    '''


def press_release_email(
    press_release: dict,
    artist_name: str,
    track_title: str
) -> str:
    """
    Formal press release email template.
    """
    return f'''
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Georgia, 'Times New Roman', serif; line-height: 1.8; color: #333; max-width: 650px; margin: 0 auto; padding: 20px;">
        
        <p style="text-align: center; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 30px;">
            FOR IMMEDIATE RELEASE
        </p>
        
        <h1 style="font-size: 28px; line-height: 1.3; margin-bottom: 10px; color: #1a1a1a;">
            {press_release.get("headline", f"{artist_name} Releases New Track")}
        </h1>
        
        <p style="font-size: 16px; color: #666; font-style: italic; margin-bottom: 30px;">
            {press_release.get("subheadline", track_title)}
        </p>
        
        <div style="white-space: pre-wrap; font-size: 15px;">
{press_release.get("press_release", "")}
        </div>
        
        <hr style="border: none; border-top: 2px solid #667eea; margin: 40px 0;">
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
            <p style="font-weight: bold; margin-top: 0;">Press Contact</p>
            <p style="margin-bottom: 0;">
                OneZeroEight.ai<br>
                Email: <a href="mailto:press@onezeroeight.ai" style="color: #667eea;">press@onezeroeight.ai</a><br>
                Web: <a href="https://onezeroeight.ai" style="color: #667eea;">onezeroeight.ai</a>
            </p>
        </div>
        
        <p style="font-size: 11px; color: #999; margin-top: 30px; text-align: center;">
            ###
        </p>
    </body>
    </html>
    '''
```

---

## Phase 4: Media Outlets Data

**Create:** `app/data/media_outlets.py`

```python
"""
Media Outlets Database - Seed data for PR outreach
Initially hardcoded, can be moved to database later
"""

MEDIA_OUTLETS = {
    "electronic": [
        {"name": "EDM.com", "type": "blog", "email": "submissions@edm.com", "priority": 1},
        {"name": "Dancing Astronaut", "type": "blog", "email": "submissions@dancingastronaut.com", "priority": 1},
        {"name": "Your EDM", "type": "blog", "email": "submissions@youredm.com", "priority": 2},
        {"name": "EDM Sauce", "type": "blog", "email": "submissions@edmsauce.com", "priority": 2},
        {"name": "Run The Trap", "type": "blog", "email": "submissions@runthetrap.com", "priority": 2},
        {"name": "This Song Is Sick", "type": "blog", "email": "submissions@thissongissick.com", "priority": 3},
    ],
    "classical": [
        {"name": "Gramophone", "type": "magazine", "email": "editorial@gramophone.co.uk", "priority": 1},
        {"name": "BBC Music Magazine", "type": "magazine", "email": "music.magazine@bbc.com", "priority": 1},
        {"name": "Classical Music Magazine", "type": "magazine", "email": "submissions@classicalmusicmagazine.org", "priority": 2},
        {"name": "I Care If You Listen", "type": "blog", "email": "submissions@icareifyoulisten.com", "priority": 2},
        {"name": "Second Inversion", "type": "blog", "email": "tips@secondinversion.org", "priority": 3},
    ],
    "hip-hop": [
        {"name": "HotNewHipHop", "type": "blog", "email": "submissions@hotnewhiphop.com", "priority": 1},
        {"name": "2DopeBoyz", "type": "blog", "email": "submissions@2dopeboyz.com", "priority": 1},
        {"name": "Rap Radar", "type": "blog", "email": "tips@rapradar.com", "priority": 2},
        {"name": "Pigeons & Planes", "type": "blog", "email": "submissions@pigeonsandplanes.com", "priority": 1},
        {"name": "The Source", "type": "magazine", "email": "submissions@thesource.com", "priority": 2},
    ],
    "indie": [
        {"name": "Pitchfork", "type": "magazine", "email": "tips@pitchfork.com", "priority": 1},
        {"name": "Stereogum", "type": "blog", "email": "tips@stereogum.com", "priority": 1},
        {"name": "Consequence of Sound", "type": "blog", "email": "tips@consequence.net", "priority": 1},
        {"name": "The Line of Best Fit", "type": "blog", "email": "submissions@thelineofbestfit.com", "priority": 2},
        {"name": "DIY Magazine", "type": "magazine", "email": "submissions@diymag.com", "priority": 2},
        {"name": "Indie Shuffle", "type": "blog", "email": "submissions@indieshuffle.com", "priority": 3},
    ],
    "r&b": [
        {"name": "Rated R&B", "type": "blog", "email": "submissions@ratedrnb.com", "priority": 1},
        {"name": "Soul Bounce", "type": "blog", "email": "submissions@soulbounce.com", "priority": 2},
        {"name": "Singersroom", "type": "blog", "email": "submissions@singersroom.com", "priority": 2},
        {"name": "ThisIsRnB", "type": "blog", "email": "submissions@thisisrnb.com", "priority": 2},
    ],
    "pop": [
        {"name": "Pop Crave", "type": "blog", "email": "tips@popcrave.com", "priority": 1},
        {"name": "Idolator", "type": "blog", "email": "tips@idolator.com", "priority": 2},
        {"name": "Pop Dust", "type": "blog", "email": "submissions@popdust.com", "priority": 2},
        {"name": "Headline Planet", "type": "blog", "email": "submissions@headlineplanet.com", "priority": 3},
    ],
    "rock": [
        {"name": "Loudwire", "type": "blog", "email": "tips@loudwire.com", "priority": 1},
        {"name": "Kerrang!", "type": "magazine", "email": "submissions@kerrang.com", "priority": 1},
        {"name": "Alternative Press", "type": "magazine", "email": "submissions@altpress.com", "priority": 1},
        {"name": "BrooklynVegan", "type": "blog", "email": "tips@brooklynvegan.com", "priority": 2},
        {"name": "The PRP", "type": "blog", "email": "submissions@theprp.com", "priority": 3},
    ],
    "jazz": [
        {"name": "JazzTimes", "type": "magazine", "email": "submissions@jazztimes.com", "priority": 1},
        {"name": "DownBeat", "type": "magazine", "email": "submissions@downbeat.com", "priority": 1},
        {"name": "All About Jazz", "type": "blog", "email": "submissions@allaboutjazz.com", "priority": 2},
        {"name": "Jazz Weekly", "type": "blog", "email": "submissions@jazzweekly.com", "priority": 3},
    ],
    "ambient": [
        {"name": "Ambient Blog", "type": "blog", "email": "submissions@ambientblog.net", "priority": 2},
        {"name": "A Closer Listen", "type": "blog", "email": "submissions@acloserlisten.com", "priority": 2},
        {"name": "Headphone Commute", "type": "blog", "email": "submissions@headphonecommute.com", "priority": 2},
    ],
    "world": [
        {"name": "Afropop Worldwide", "type": "blog", "email": "submissions@afropop.org", "priority": 1},
        {"name": "Songlines", "type": "magazine", "email": "submissions@songlines.co.uk", "priority": 1},
        {"name": "World Music Central", "type": "blog", "email": "submissions@worldmusiccentral.org", "priority": 2},
    ],
    "country": [
        {"name": "Saving Country Music", "type": "blog", "email": "submissions@savingcountrymusic.com", "priority": 2},
        {"name": "The Boot", "type": "blog", "email": "tips@theboot.com", "priority": 2},
        {"name": "Whiskey Riff", "type": "blog", "email": "submissions@whiskeyriff.com", "priority": 2},
    ],
    "default": [
        {"name": "Hype Machine Blogs", "type": "aggregator", "email": "submissions@hypem.com", "priority": 2},
        {"name": "SubmitHub", "type": "platform", "email": "support@submithub.com", "priority": 3},
    ]
}


def get_outlets_by_genre(genre: str) -> list:
    """
    Get media outlets for a specific genre.
    Falls back to default if genre not found.
    """
    # Normalize genre
    genre = genre.lower().strip()
    
    # Handle common variations
    genre_map = {
        "electronic": ["electronic", "edm", "house", "techno", "dance"],
        "hip-hop": ["hip-hop", "hip hop", "hiphop", "rap", "trap"],
        "r&b": ["r&b", "rnb", "soul", "neo-soul"],
        "indie": ["indie", "indie rock", "indie pop", "alternative"],
        "rock": ["rock", "metal", "punk", "alternative rock"],
        "classical": ["classical", "orchestral", "cinematic", "piano"],
        "jazz": ["jazz", "blues", "fusion"],
        "pop": ["pop", "synth-pop", "electropop"],
        "ambient": ["ambient", "drone", "experimental", "soundscape"],
        "world": ["world", "global", "afrobeat", "latin", "reggae"],
        "country": ["country", "americana", "folk", "bluegrass"],
    }
    
    # Find matching genre category
    for category, variations in genre_map.items():
        if genre in variations:
            return MEDIA_OUTLETS.get(category, []) + MEDIA_OUTLETS.get("default", [])
    
    # Return default outlets if no match
    return MEDIA_OUTLETS.get("default", [])


def get_all_outlets() -> list:
    """Get all outlets across all genres (deduplicated)."""
    all_outlets = []
    seen = set()
    
    for genre_outlets in MEDIA_OUTLETS.values():
        for outlet in genre_outlets:
            if outlet["name"] not in seen:
                seen.add(outlet["name"])
                all_outlets.append(outlet)
    
    return all_outlets
```

---

## Phase 5: Register Router

**Update:** `app/main.py`

Add to imports:
```python
from app.routers import pr_agent
```

Add to router registration:
```python
app.include_router(pr_agent.router)
```

---

## Phase 6: Email Service Extension

**Extend:** `app/services/email_service.py`

Add this method to `EmailServiceWrapper` class:

```python
async def send_journalist_pitch(
    self,
    to_email: str,
    subject: str,
    pitch_content: str,
    artist_name: str,
    track_title: str,
    spotify_url: str = None
) -> bool:
    """
    Send a PR pitch to a journalist/blogger.
    """
    from app.services.email_templates import journalist_pitch_email
    
    html_content = journalist_pitch_email(
        pitch_content=pitch_content,
        artist_name=artist_name,
        track_title=track_title,
        spotify_url=spotify_url
    )
    
    return await self.email_service.send_email(
        to_email=to_email,
        subject=subject,
        html_content=html_content,
        from_email="press@onezeroeight.ai"  # Use press@ for PR outreach
    )
```

---

## Verification Checklist

After implementation, verify:

- [ ] `POST /api/pr/generate` returns press release, pitches, one-sheet, media list
- [ ] `POST /api/pr/send` queues outreach emails
- [ ] `GET /api/pr/{campaign_id}/materials` returns stored materials
- [ ] `GET /api/pr/{campaign_id}/outreach` shows outreach status
- [ ] OutreachMessage records created with `channel="pr_pitch"`
- [ ] Email templates render correctly
- [ ] Media outlets load by genre
- [ ] Router registered in main.py

---

## Usage Examples

### Generate PR Materials
```bash
curl -X POST "https://api.onezeroeight.ai/api/pr/generate" \
  -H "Content-Type: application/json" \
  -d '{"campaign_id": "abc123"}'
```

### Send PR Outreach
```bash
curl -X POST "https://api.onezeroeight.ai/api/pr/send" \
  -H "Content-Type: application/json" \
  -d '{"campaign_id": "abc123"}'
```

### Check Outreach Status
```bash
curl "https://api.onezeroeight.ai/api/pr/abc123/outreach"
```

---

## Future Enhancements (Not in this phase)

- [ ] Webhook for email opens/clicks (Resend webhooks)
- [ ] Coverage tracking (when articles are published)
- [ ] Journalist relationship scoring
- [ ] Auto follow-up emails
- [ ] PR Agent performance dashboard
- [ ] MediaOutlet database table (instead of hardcoded)

---

*Directive for Claude Code — PR Agent Implementation*
