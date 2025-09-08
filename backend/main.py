from fastapi import FastAPI, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import fitz  # PyMuPDF
from groq import Groq
from dotenv import load_dotenv
import os
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

    Respond in JSON with fields: skills, projects, certifications, objective.
    """

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",   # balanced, structured output
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
    )

    return {"summary": response.choices[0].message.content}


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

    Respond in JSON with:
    - existing_skills: list of skills already present in resume
    - missing_skills: list of gaps between JD and resume
    - roadmap: step-by-step 3–6 month plan to close those gaps
    """

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
    )

    return {"analysis": response.choices[0].message.content}
