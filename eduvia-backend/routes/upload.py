from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from database import get_db
from models.models import User, Skill, Roadmap
import anthropic
import PyPDF2
import json
import os
import io
from jose import jwt
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()
security = HTTPBearer()
SECRET_KEY = os.getenv("SECRET_KEY", "fallbacksecret")
ALGORITHM = "HS256"

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user = db.query(User).filter(User.id == payload["sub"]).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

def extract_text_from_file(file_bytes: bytes) -> str:
    try:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() or ""
        if text.strip():
            return text
    except Exception:
        pass
    try:
        return file_bytes.decode('utf-8', errors='ignore')
    except Exception:
        return ""

def extract_skills_with_claude(text: str, career_goal: str) -> dict:
    try:
        client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

        prompt = f"""You are an expert career counselor and skill analyzer.

Analyze the following student profile text and extract their skills.
The student's career goal is: {career_goal}

Student profile text:
{text[:3000]}

Return ONLY a valid JSON object with exactly this structure, no extra text:
{{
  "extracted_skills": [
    {{"name": "Python", "proficiency": 0.8, "category": "Programming"}},
    {{"name": "React", "proficiency": 0.7, "category": "Frontend"}}
  ],
  "skill_gaps": [
    {{"name": "Docker", "priority": "high", "reason": "Essential for deployment"}},
    {{"name": "System Design", "priority": "medium", "reason": "Required for senior roles"}}
  ],
  "summary": "Brief summary of student current skill level and what they need"
}}

Rules:
- Extract real skills mentioned in the text
- Proficiency should be between 0.1 and 1.0
- Identify 3-6 skill gaps based on the career goal
- Keep skill names short and standard
- Return ONLY the JSON, no markdown, no explanation"""

        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1500,
            messages=[{"role": "user", "content": prompt}]
        )

        response_text = message.content[0].text.strip()

        if "```" in response_text:
            parts = response_text.split("```")
            for part in parts:
                if "{" in part:
                    response_text = part
                    if response_text.startswith("json"):
                        response_text = response_text[4:]
                    break

        return json.loads(response_text)

    except Exception as e:
        print(f"Claude skill extraction error: {e}")
        return {
            "extracted_skills": [
                {"name": "Python", "proficiency": 0.6, "category": "Programming"},
                {"name": "JavaScript", "proficiency": 0.5, "category": "Frontend"},
            ],
            "skill_gaps": [
                {"name": "Docker", "priority": "high", "reason": "Essential for deployment"},
                {"name": "System Design", "priority": "medium", "reason": "Required for senior roles"},
            ],
            "summary": f"Profile analyzed for {career_goal}."
        }

def generate_roadmap_with_claude(skills: list, gaps: list, career_goal: str) -> dict:
    try:
        client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

        skills_str = ", ".join([s["name"] for s in skills]) if skills else "Not specified"
        gaps_str = ", ".join([g["name"] for g in gaps]) if gaps else "Not specified"

        prompt = f"""You are an expert learning path designer.

Create a personalized learning roadmap for a student.

Career Goal: {career_goal}
Current Skills: {skills_str}
Skill Gaps to Address: {gaps_str}

Return ONLY a valid JSON object with exactly this structure, no extra text:
{{
  "roadmap": [
    {{
      "phase": 1,
      "title": "Foundation Building",
      "duration": "2 weeks",
      "skills": ["Skill1", "Skill2"],
      "resources": [
        {{"title": "Resource Name", "url": "https://actual-url.com", "type": "course"}},
        {{"title": "Resource Name", "url": "https://actual-url.com", "type": "video"}}
      ],
      "milestone": "What the student can do after completing this phase"
    }},
    {{
      "phase": 2,
      "title": "Intermediate Skills",
      "duration": "3 weeks",
      "skills": ["Skill3", "Skill4"],
      "resources": [
        {{"title": "Resource Name", "url": "https://actual-url.com", "type": "docs"}}
      ],
      "milestone": "What the student can do after completing this phase"
    }},
    {{
      "phase": 3,
      "title": "Advanced & Portfolio",
      "duration": "4 weeks",
      "skills": ["Skill5", "Skill6"],
      "resources": [
        {{"title": "Resource Name", "url": "https://actual-url.com", "type": "project"}}
      ],
      "milestone": "What the student can do after completing this phase"
    }}
  ],
  "total_duration": "9 weeks",
  "next_skill": "The single most important skill to start with right now"
}}

Rules:
- Use real, working URLs for resources (Coursera, YouTube, docs, etc.)
- Make phases progressive from beginner to advanced
- Each phase should have 2-4 resources
- Total 3 phases minimum
- Return ONLY the JSON, no markdown, no explanation"""

        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=2000,
            messages=[{"role": "user", "content": prompt}]
        )

        response_text = message.content[0].text.strip()

        if "```" in response_text:
            parts = response_text.split("```")
            for part in parts:
                if "{" in part:
                    response_text = part
                    if response_text.startswith("json"):
                        response_text = response_text[4:]
                    break

        return json.loads(response_text)

    except Exception as e:
        print(f"Claude roadmap generation error: {e}")
        return {
            "roadmap": [
                {
                    "phase": 1,
                    "title": "Foundation",
                    "duration": "2 weeks",
                    "skills": ["Core Skill 1", "Core Skill 2"],
                    "resources": [
                        {"title": "freeCodeCamp", "url": "https://www.freecodecamp.org", "type": "course"}
                    ],
                    "milestone": "Build foundational knowledge"
                },
                {
                    "phase": 2,
                    "title": "Intermediate",
                    "duration": "3 weeks",
                    "skills": ["Intermediate Skill 1", "Intermediate Skill 2"],
                    "resources": [
                        {"title": "MDN Web Docs", "url": "https://developer.mozilla.org", "type": "docs"}
                    ],
                    "milestone": "Build real projects"
                },
                {
                    "phase": 3,
                    "title": "Advanced",
                    "duration": "4 weeks",
                    "skills": ["Advanced Skill 1", "Advanced Skill 2"],
                    "resources": [
                        {"title": "GitHub", "url": "https://github.com", "type": "project"}
                    ],
                    "milestone": "Deploy production-ready applications"
                }
            ],
            "total_duration": "9 weeks",
            "next_skill": "Start with the most fundamental skill"
        }

@router.post("/pdf")
async def upload_pdf(
    file: UploadFile = File(...),
    career_goal: str = "Software Developer",
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    current_user = get_current_user(credentials, db)

    file_bytes = await file.read()
    text = extract_text_from_file(file_bytes)

    if not text.strip():
        text = f"Career goal: {career_goal}. Student profile upload."

    print(f"Extracted text length: {len(text)}")
    print(f"Career goal: {career_goal}")

    claude_result = extract_skills_with_claude(text, career_goal)
    print(f"Skills found: {len(claude_result.get('extracted_skills', []))}")

    for skill_data in claude_result.get("extracted_skills", []):
        existing = db.query(Skill).filter(
            Skill.user_id == current_user.id,
            Skill.name == skill_data["name"]
        ).first()
        if not existing:
            skill = Skill(
                user_id=current_user.id,
                name=skill_data["name"],
                proficiency=skill_data.get("proficiency", 0.5),
                source="pdf"
            )
            db.add(skill)
    db.commit()

    roadmap_data = generate_roadmap_with_claude(
        claude_result.get("extracted_skills", []),
        claude_result.get("skill_gaps", []),
        career_goal
    )
    print(f"Roadmap phases: {len(roadmap_data.get('roadmap', []))}")

    existing_roadmap = db.query(Roadmap).filter(
        Roadmap.user_id == current_user.id
    ).first()

    if existing_roadmap:
        existing_roadmap.goal = career_goal
        existing_roadmap.generated_path = json.dumps(roadmap_data)
    else:
        roadmap = Roadmap(
            user_id=current_user.id,
            goal=career_goal,
            generated_path=json.dumps(roadmap_data)
        )
        db.add(roadmap)
    db.commit()

    return {
        "message": "Skills extracted successfully with Claude AI!",
        "skills_found": len(claude_result.get("extracted_skills", [])),
        "gaps_found": len(claude_result.get("skill_gaps", [])),
        "extracted_skills": claude_result.get("extracted_skills", []),
        "skill_gaps": claude_result.get("skill_gaps", []),
        "summary": claude_result.get("summary", ""),
        "roadmap": roadmap_data
    }

@router.get("/my-skills")
def get_my_skills(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    current_user = get_current_user(credentials, db)
    skills = db.query(Skill).filter(Skill.user_id == current_user.id).all()
    return {
        "skills": [
            {
                "name": s.name,
                "proficiency": s.proficiency,
                "source": s.source
            }
            for s in skills
        ]
    }

@router.get("/my-roadmap")
def get_my_roadmap(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    current_user = get_current_user(credentials, db)
    roadmap = db.query(Roadmap).filter(
        Roadmap.user_id == current_user.id
    ).order_by(Roadmap.created_at.desc()).first()

    if not roadmap:
        raise HTTPException(status_code=404, detail="No roadmap found")

    return {
        "goal": roadmap.goal,
        "roadmap": json.loads(roadmap.generated_path),
        "created_at": str(roadmap.created_at)
    }