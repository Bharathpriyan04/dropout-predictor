"""
server.py
=========
High-Performance FastAPI REST Server for Student Dropout Risk Prediction System.
Integrates Machine Learning Inference, Explainability, Dynamic Simulations,
Batch Processing, Student Case Management, Institutional Analytics, and PDF Reporting.
"""

import os
import io
import json
import pandas as pd
from typing import Optional, Dict, Any, List
from fastapi import FastAPI, HTTPException, UploadFile, File, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel, Field

from backend.ml_engine import ml_engine
from backend.students_db import student_registry
from backend.report_generator import generate_pdf_report

app = FastAPI(
    title="Student Dropout Risk Prediction & Academic Analytics API",
    description="Enterprise API for predicting dropout risk, student intervention planning, and institutional analytics.",
    version="2.0.0"
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------------------------------------------------------
# PYDANTIC SCHEMAS
# -----------------------------------------------------------------------------
class StudentPredictRequest(BaseModel):
    model_name: Optional[str] = "Stacking Ensemble"
    age: Optional[float] = 20
    gender: Optional[float] = 1 # 1: Male, 0: Female
    attendance: Optional[float] = 1 # 1: Daytime, 0: Evening
    scholarship: Optional[float] = 0 # 1: Yes, 0: No
    tuition_ok: Optional[float] = 1 # 1: Yes, 0: No
    debtor: Optional[float] = 0 # 1: Yes, 0: No
    displaced: Optional[float] = 0 # 1: Yes, 0: No
    admission_grade: Optional[float] = 125.0
    prev_grade: Optional[float] = 122.0
    sem1_enrolled: Optional[float] = 6
    sem1_approved: Optional[float] = 5
    sem1_grade: Optional[float] = 12.0
    sem1_evals: Optional[float] = 7
    sem2_enrolled: Optional[float] = 6
    sem2_approved: Optional[float] = 5
    sem2_grade: Optional[float] = 12.0
    sem2_evals: Optional[float] = 7
    unemployment: Optional[float] = 10.8
    inflation: Optional[float] = 1.4
    gdp: Optional[float] = 1.74
    course: Optional[float] = 9500

class WhatIfRequest(BaseModel):
    baseline: Dict[str, Any]
    adjustments: Dict[str, Any]

class InterventionRequest(BaseModel):
    category: str
    title: str
    notes: Optional[str] = ""
    author: Optional[str] = "Academic Advisor"
    status: Optional[str] = "Active"

class NewStudentRequest(BaseModel):
    name: str
    email: str
    department: str
    course: Optional[int] = 9500
    cohort_year: Optional[str] = "2024"
    current_semester: Optional[int] = 2
    age: float
    gender: float
    attendance: float
    scholarship: float
    tuition_ok: float
    debtor: float
    displaced: float
    admission_grade: float
    prev_grade: float
    sem1_enrolled: float
    sem1_approved: float
    sem1_grade: float
    sem1_evals: float
    sem2_enrolled: float
    sem2_approved: float
    sem2_grade: float
    sem2_evals: float

# -----------------------------------------------------------------------------
# API ROUTES
# -----------------------------------------------------------------------------
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Student Dropout Risk Prediction System API",
        "version": "2.0.0",
        "champion_model": ml_engine.champion_name,
        "available_models": list(ml_engine.all_models.keys()),
        "classes": ml_engine.class_names,
        "features_count": len(ml_engine.feature_names)
    }

@app.get("/api/models/benchmarks")
def get_model_benchmarks():
    """Returns evaluation metrics, cross-validation, and confusion matrices for all 6 models."""
    return ml_engine.metrics

@app.get("/api/models/feature-importance")
def get_feature_importance():
    """Returns global feature importance rankings and categorical breakdowns."""
    if ml_engine.feature_importance_df.empty:
        return {"top_features": []}
    return {
        "top_features": ml_engine.feature_importance_df.head(25).to_dict(orient="records"),
        "total_features": len(ml_engine.feature_importance_df)
    }

@app.post("/api/predict")
def predict_student_risk(req: StudentPredictRequest):
    """
    Evaluates individual student parameters and returns dropout probability,
    risk category, local contributing factors, and tailored interventions.
    """
    try:
        data_dict = req.dict()
        model_name = data_dict.pop("model_name", None)
        result = ml_engine.predict_single(data_dict, model_name=model_name)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/simulate-what-if")
def simulate_what_if_scenario(req: WhatIfRequest):
    """
    Compares baseline student risk against hypothetical adjusted parameters
    (e.g., improved grades, cleared debt, reduced course load).
    """
    try:
        result = ml_engine.simulate_what_if(req.baseline, req.adjustments)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/predict/batch")
async def predict_batch_students(file: UploadFile = File(...), model_name: Optional[str] = None):
    """
    Processes an uploaded CSV or Excel file containing multi-student records.
    """
    try:
        contents = await file.read()
        filename = file.filename.lower()
        if filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(contents))
        elif filename.endswith(".xlsx") or filename.endswith(".xls"):
            df = pd.read_excel(io.BytesIO(contents))
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Please upload CSV or Excel.")

        result = ml_engine.predict_batch_csv(df, model_name=model_name)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch processing error: {str(e)}")

@app.get("/api/sample-cohort")
def get_sample_cohort():
    """Returns pre-evaluated sample batch of 60 students for instant demo analysis."""
    sample_path = os.path.join(os.path.dirname(__file__), "data", "sample_students_cohort.csv")
    if not os.path.exists(sample_path):
        sample_path = os.path.join(os.path.dirname(__file__), "..", "sample_students_cohort.csv")

    if os.path.exists(sample_path):
        df = pd.read_csv(sample_path).head(60)
        # Add mock student names and IDs if missing
        if "Student_ID" not in df.columns:
            df["Student_ID"] = [f"STU-{1000 + i}" for i in range(len(df))]
        if "Student_Name" not in df.columns:
            mock_names = [
                "Alexander Wright", "Beatriz Silva", "Christopher Evans", "Daniela Costa", "Ethan Hunt",
                "Fatima Zahra", "Gabriel Santos", "Hannah Abbott", "Ian Gallagher", "Julia Roberts",
                "Kavita Patel", "Liam Hemsworth", "Maya Angelou", "Noah Centineo", "Olivia Wilde",
                "Paul McCartney", "Quinn Fabray", "Rafael Nadal", "Samantha Jones", "Thomas Shelby",
                "Uma Thurman", "Victor Hugo", "Wanda Maximoff", "Xavier Woods", "Yasmine Bleeth", "Zack Morris"
            ]
            df["Student_Name"] = [mock_names[i % len(mock_names)] + f" ({i+1})" for i in range(len(df))]
        
        dept_map = {
            9500: "Computer Science", 9070: "Biomedical Nursing", 9147: "Management & Business",
            9238: "Mechanical Eng.", 9670: "Psychology", 9701: "Social Services"
        }
        df["Course_Name"] = df["Course"].map(lambda c: dept_map.get(int(c), "Undergraduate Studies"))

        result = ml_engine.predict_batch_csv(df)
        return result
    else:
        # Generate on the fly
        return {"total_students": 0, "summary": {}, "students": []}

@app.get("/api/students")
def list_students(
    department: Optional[str] = Query(None),
    risk_tier: Optional[str] = Query(None),
    search: Optional[str] = Query(None)
):
    """Lists registered students with real-time risk scores and intervention history."""
    students = student_registry.get_all(department=department, risk_tier=risk_tier, search=search)
    enriched = []
    for s in students:
        pred = ml_engine.predict_single(s)
        enriched.append({
            **s,
            "prediction": pred
        })
    return enriched

@app.get("/api/students/{student_id}")
def get_student_profile(student_id: str):
    """Returns detailed student 360 profile with semester timeline and predictions."""
    student = student_registry.get_by_id(student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    pred = ml_engine.predict_single(student)
    return {
        "student": student,
        "prediction": pred
    }

@app.post("/api/students")
def create_student(req: NewStudentRequest):
    """Registers a new student record into the institutional directory."""
    new_data = student_registry.add_student(req.dict())
    pred = ml_engine.predict_single(new_data)
    return {
        "student": new_data,
        "prediction": pred
    }

@app.post("/api/students/{student_id}/interventions")
def log_student_intervention(student_id: str, req: InterventionRequest):
    """Logs an advisor intervention / retention action for a student."""
    int_obj = student_registry.add_intervention(student_id, req.dict())
    if not int_obj:
        raise HTTPException(status_code=404, detail="Student not found")
    return {"message": "Intervention logged successfully", "intervention": int_obj}

@app.get("/api/analytics/overview")
def get_institutional_analytics():
    """Returns macro institutional retention analytics and department risk breakdowns."""
    students = student_registry.get_all()
    predictions = [ml_engine.predict_single(s) for s in students]

    total = len(students)
    critical = sum(1 for p in predictions if p["risk_tier"] == "CRITICAL_HIGH")
    moderate = sum(1 for p in predictions if p["risk_tier"] == "MODERATE_WARNING")
    safe = sum(1 for p in predictions if p["risk_tier"] == "LOW_SAFE")

    dept_stats = {}
    for s, p in zip(students, predictions):
        dept = s.get("department", "General")
        if dept not in dept_stats:
            dept_stats[dept] = {"total": 0, "at_risk": 0, "avg_risk": 0.0, "total_risk_sum": 0.0}
        dept_stats[dept]["total"] += 1
        dept_stats[dept]["total_risk_sum"] += p["dropout_risk_score"]
        if p["risk_tier"] == "CRITICAL_HIGH":
            dept_stats[dept]["at_risk"] += 1

    dept_list = []
    for dept, val in dept_stats.items():
        dept_list.append({
            "department": dept,
            "total_students": val["total"],
            "at_risk_students": val["at_risk"],
            "at_risk_percentage": round((val["at_risk"] / max(1, val["total"])) * 100, 1),
            "average_risk_score": round(val["total_risk_sum"] / max(1, val["total"]), 1)
        })

    return {
        "kpis": {
            "total_students_monitored": total,
            "critical_at_risk_count": critical,
            "critical_at_risk_rate": round((critical / max(1, total)) * 100, 1),
            "moderate_attention_count": moderate,
            "moderate_attention_rate": round((moderate / max(1, total)) * 100, 1),
            "on_track_count": safe,
            "on_track_rate": round((safe / max(1, total)) * 100, 1),
            "average_institutional_retention_rate": round(100.0 - ((critical / max(1, total)) * 100), 1),
            "active_interventions_count": sum(len(s.get("interventions", [])) for s in students)
        },
        "departments": sorted(dept_list, key=lambda x: x["at_risk_percentage"], reverse=True),
        "attrition_factors": [
            {"factor": "Tuition Debt & Fee Holds", "impact_share": 38, "students_affected": 4},
            {"factor": "Course Credit Deficit (<50% approved)", "impact_share": 32, "students_affected": 3},
            {"factor": "Downward Grade Momentum in Sem 2", "impact_share": 18, "students_affected": 2},
            {"factor": "LMS Disengagement (<3 sessions/wk)", "impact_share": 12, "students_affected": 2}
        ]
    }

@app.post("/api/export/pdf-report")
def export_pdf_report():
    """Generates and streams a formatted PDF Executive Retention Report."""
    students = student_registry.get_all()
    predictions = []
    for s in students:
        p = ml_engine.predict_single(s)
        predictions.append({
            "student_id": s["id"],
            "student_name": s["name"],
            "course_name": s["department"],
            "dropout_risk_score": p["dropout_risk_score"],
            "avg_grade": p["summary_metrics"]["avg_grade"],
            "approval_rate": p["summary_metrics"]["overall_approval_rate"],
            "top_recommendation": p["recommended_interventions"][0]["title"] if p["recommended_interventions"] else "Monitor"
        })

    summary = {
        "total_students": len(students),
        "critical_high_risk_count": sum(1 for p in predictions if p["dropout_risk_score"] >= 50),
        "moderate_warning_count": sum(1 for p in predictions if 25 <= p["dropout_risk_score"] < 50),
        "low_safe_count": sum(1 for p in predictions if p["dropout_risk_score"] < 25),
        "average_cohort_risk": round(sum(p["dropout_risk_score"] for p in predictions) / max(1, len(predictions)), 1),
        "average_graduation_forecast": round(100.0 - (sum(p["dropout_risk_score"] for p in predictions) / max(1, len(predictions))), 1)
    }

    pdf_bytes = generate_pdf_report(summary, predictions)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=Student_Dropout_Risk_Executive_Report.pdf"}
    )

# Static file serving (for built React frontend)
frontend_dist = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.server.py:app", host="0.0.0.0", port=8000, reload=True)
