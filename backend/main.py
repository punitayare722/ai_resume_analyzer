from fastapi import FastAPI, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import fitz  # PyMuPDF
from groq import Groq
from dotenv import load_dotenv
import os
import json
from fastapi.responses import FileResponse
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
import io
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER
app = FastAPI()

# Enable frontend calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load environment variables from .env
load_dotenv()

# Get the API key from environment
API_KEY = os.getenv("GROQ_API_KEY")
if not API_KEY:
    raise ValueError("GROQ_API_KEY not found in environment variables!")

client = Groq(api_key=API_KEY)


# ---------- PDF Extraction ----------
def extract_text_from_pdf(file_bytes):
    text = ""
    with fitz.open(stream=file_bytes, filetype="pdf") as doc:
        for page in doc:
            text += page.get_text()
    return text


# ---------- 1. Summarize Resume ----------
@app.post("/summarize_resume")
async def summarize_resume(resume: UploadFile):
    file_bytes = await resume.read()
    resume_text = extract_text_from_pdf(file_bytes)

    prompt = f"""
You are an expert career assistant.
Here is the extracted resume text:

{resume_text}

Summarize the resume into:
1. Key Skills
2. Projects
3. Certifications
4. Career Objective (short version)

Respond in strict JSON format with fields: skills, projects, certifications, objective.
"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
    )

    # Ensure JSON is returned
    try:
        parsed_summary = json.loads(response.choices[0].message.content)
    except json.JSONDecodeError:
        parsed_summary = {"raw_text": response.choices[0].message.content}

    return {"summary": parsed_summary}


# ---------- 2. Compare Resume with Job Description ----------
@app.post("/analyze_resume")
async def analyze_resume(resume: UploadFile, jd: str = Form(...)):
    file_bytes = await resume.read()
    resume_text = extract_text_from_pdf(file_bytes)

    prompt = f"""
You are a career coach.
Compare the following resume and job description.

Resume:
{resume_text}

Job Description:
{jd}

Respond ONLY in valid JSON (no explanations, no markdown) with:
- existing_skills: list of skills already present in resume
- missing_skills: list of skills missing compared to JD
- roadmap: list of objects for 3–6 month plan, each with fields 'month', 'task', 'resource'
- recommendations: list of actionable recommendations
"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
    )

    raw_output = response.choices[0].message.content.strip()

    # Try to clean and parse
    try:
        # If model wraps JSON in ```json ... ```
        if raw_output.startswith("```"):
            raw_output = raw_output.strip("```json").strip("```").strip()
        parsed_analysis = json.loads(raw_output)
    except Exception as e:
        parsed_analysis = {"error": str(e), "raw_text": raw_output}

    return {"analysis": parsed_analysis}


# ---------- 3. Optimize Resume for Job ----------
@app.post("/optimize_resume")
async def optimize_resume(resume: UploadFile, jd: str = Form(...)):
    file_bytes = await resume.read()
    resume_text = extract_text_from_pdf(file_bytes)

    prompt = f"""
You are an expert career assistant.
Rewrite the following resume so it best matches the job description.
Keep it truthful, professional, ATS-friendly, and in clean resume format with sections.

Resume:
{resume_text}

Job Description:
{jd}

Return only the improved resume content in plain text, structured with headings (like 'Summary', 'Skills', 'Experience', 'Projects', 'Certifications', 'Education').
"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",   # ✅ valid model
        messages=[{"role": "user", "content": prompt}],
        temperature=0.4,
    )

    improved_resume = response.choices[0].message.content.strip()

    # ---------- Styled PDF Generation ----------
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4,
                            rightMargin=40, leftMargin=40,
                            topMargin=50, bottomMargin=50)

    styles = getSampleStyleSheet()
    story = []

    # Custom styles
    section_title = ParagraphStyle(
        "SectionTitle",
        parent=styles["Heading2"],
        fontSize=14,
        spaceAfter=10,
        textColor="#003366"
    )
    body_text = styles["Normal"]

    # Split by sections (AI output should use headings)
    for line in improved_resume.split("\n"):
        line = line.strip()
        if not line:
            story.append(Spacer(1, 12))
            continue

        if line.endswith(":") or line.lower() in ["summary", "skills", "experience", "projects", "certifications", "education"]:
            story.append(Paragraph(line, section_title))
        else:
            story.append(Paragraph(line, body_text))

    doc.build(story)
    buffer.seek(0)

    # Save as temporary file
    output_file = "optimized_resume.pdf"
    with open(output_file, "wb") as f:
        f.write(buffer.getvalue())

    return FileResponse(output_file, media_type="application/pdf", filename="optimized_resume.pdf")
