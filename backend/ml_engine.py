"""
ml_engine.py
============
Production-ready ML Inference & Explainability Engine for Student Dropout Risk Prediction.
Supports multi-model scoring (Stacking Super-Learner, LightGBM, XGBoost, Random Forest, Extra Trees, MLP),
local feature driver attribution (SHAP-style positive/negative impact),
dynamic What-If scenario simulations, and automated intervention recommendations.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd

BUNDLE_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "dropout_model_bundle_advanced.pkl")
BUNDLE_GZ_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "dropout_model_bundle_advanced.pkl.gz")
FALLBACK_BUNDLE = os.path.join(os.path.dirname(__file__), "..", "dropout_model_bundle.pkl")
METRICS_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "model_metrics.json")

class DropoutMLEngine:
    def __init__(self):
        self.bundle = None
        self.metrics = {}
        self.load_models()

    def load_models(self):
        path = None
        for candidate in [BUNDLE_PATH, BUNDLE_GZ_PATH, FALLBACK_BUNDLE]:
            if os.path.exists(candidate):
                path = candidate
                break
        if not path:
            raise FileNotFoundError(f"Model bundle not found. Checked: {BUNDLE_PATH}, {BUNDLE_GZ_PATH}, {FALLBACK_BUNDLE}. Run train_advanced_models.py first.")
        
        self.bundle = joblib.load(path)
        self.champion_name = self.bundle.get("champion_name", "Stacking Ensemble")
        self.all_models = self.bundle.get("all_models", {})
        self.champion_model = self.bundle.get("champion_model", self.bundle.get("model"))
        self.scaler = self.bundle["scaler"]
        self.label_encoder = self.bundle["label_encoder"]
        self.class_names = list(self.bundle["class_names"])
        self.feature_names = list(self.bundle["feature_names"])
        self.feature_defaults = dict(self.bundle["feature_defaults"])
        self.feature_importance_df = self.bundle.get("feature_importance", pd.DataFrame())

        if os.path.exists(METRICS_PATH):
            with open(METRICS_PATH, "r") as f:
                self.metrics = json.load(f)

    def extract_features(self, raw_input: dict) -> pd.DataFrame:
        """
        Takes raw student attributes, populates defaults, and computes all 18 engineered features.
        """
        row = self.feature_defaults.copy()

        # Direct map with safe numeric conversion
        skip_keys = {'student_id', 'student_name', 'course_name', 'avatar', 'email', 'name', 'id', 'department', 'advisor_name', 'lms_login_frequency', 'interventions', 'model_name', 'predicted_outcome', 'risk_tier', 'risk_badge', 'risk_color', 'top_recommendation'}
        for k, v in raw_input.items():
            if k.lower() in skip_keys:
                continue
            try:
                num_v = float(v)
                if k in row:
                    row[k] = num_v
                else:
                    for f in self.feature_names:
                        if k.lower() == f.lower():
                            row[f] = num_v
            except (ValueError, TypeError):
                continue

        # Standard inputs extraction
        sem1_enrolled = float(raw_input.get("sem1_enrolled", raw_input.get("Curricular units 1st sem (enrolled)", 6)))
        sem1_approved = float(raw_input.get("sem1_approved", raw_input.get("Curricular units 1st sem (approved)", 5)))
        sem1_grade = float(raw_input.get("sem1_grade", raw_input.get("Curricular units 1st sem (grade)", 12.0)))
        sem1_evals = float(raw_input.get("sem1_evals", raw_input.get("Curricular units 1st sem (evaluations)", 7)))

        sem2_enrolled = float(raw_input.get("sem2_enrolled", raw_input.get("Curricular units 2nd sem (enrolled)", 6)))
        sem2_approved = float(raw_input.get("sem2_approved", raw_input.get("Curricular units 2nd sem (approved)", 5)))
        sem2_grade = float(raw_input.get("sem2_grade", raw_input.get("Curricular units 2nd sem (grade)", 12.0)))
        sem2_evals = float(raw_input.get("sem2_evals", raw_input.get("Curricular units 2nd sem (evaluations)", 7)))

        debtor = float(raw_input.get("debtor", raw_input.get("Debtor", 0)))
        tuition_ok = float(raw_input.get("tuition_ok", raw_input.get("Tuition fees up to date", 1)))
        scholarship = float(raw_input.get("scholarship", raw_input.get("Scholarship holder", 0)))
        age = float(raw_input.get("age", raw_input.get("Age at enrollment", 20)))
        admission_grade = float(raw_input.get("admission_grade", raw_input.get("Admission grade", 120.0)))
        prev_grade = float(raw_input.get("prev_grade", raw_input.get("Previous qualification (grade)", 120.0)))
        unemployment = float(raw_input.get("unemployment", raw_input.get("Unemployment rate", 10.8)))
        inflation = float(raw_input.get("inflation", raw_input.get("Inflation rate", 1.4)))
        gdp = float(raw_input.get("gdp", raw_input.get("GDP", 1.74)))
        gender = float(raw_input.get("gender", raw_input.get("Gender", 1)))
        attendance = float(raw_input.get("attendance", raw_input.get("Daytime/evening attendance", 1)))
        displaced = float(raw_input.get("displaced", raw_input.get("Displaced", 0)))
        course = float(raw_input.get("course", raw_input.get("Course", 9500)))

        # Update base features
        for f in self.feature_names:
            fl = f.lower()
            if "1st sem" in fl and "enrolled" in fl: row[f] = sem1_enrolled
            elif "1st sem" in fl and "approved" in fl: row[f] = sem1_approved
            elif "1st sem" in fl and "(grade)" in fl: row[f] = sem1_grade
            elif "1st sem" in fl and "evaluations" in fl: row[f] = sem1_evals
            elif "2nd sem" in fl and "enrolled" in fl: row[f] = sem2_enrolled
            elif "2nd sem" in fl and "approved" in fl: row[f] = sem2_approved
            elif "2nd sem" in fl and "(grade)" in fl: row[f] = sem2_grade
            elif "2nd sem" in fl and "evaluations" in fl: row[f] = sem2_evals
            elif "debtor" in fl: row[f] = debtor
            elif "tuition fees" in fl: row[f] = tuition_ok
            elif "scholarship" in fl: row[f] = scholarship
            elif "age at enrollment" in fl: row[f] = age
            elif "admission grade" in fl: row[f] = admission_grade
            elif "previous qualification (grade)" in fl: row[f] = prev_grade
            elif "gender" in fl: row[f] = gender
            elif "daytime/evening" in fl: row[f] = attendance
            elif "displaced" in fl: row[f] = displaced
            elif f == "Course": row[f] = course
            elif "unemployment" in fl: row[f] = unemployment
            elif "inflation" in fl: row[f] = inflation
            elif "gdp" in fl: row[f] = gdp

        # Calculate Engineered Features
        row["Academic_Success_Rate_Sem1"] = sem1_approved / (sem1_enrolled + 1e-4)
        row["Academic_Success_Rate_Sem2"] = sem2_approved / (sem2_enrolled + 1e-4)
        row["Total_Units_Enrolled"] = sem1_enrolled + sem2_enrolled
        row["Total_Units_Approved"] = sem1_approved + sem2_approved
        row["Overall_Approval_Rate"] = row["Total_Units_Approved"] / (row["Total_Units_Enrolled"] + 1e-4)
        row["Grade_Progression"] = sem2_grade - sem1_grade
        row["Avg_Grade_Combined"] = (sem1_grade + sem2_grade) / 2.0
        row["Admission_to_College_Grade_Ratio"] = (row["Avg_Grade_Combined"] * 10.0) / (admission_grade + 1e-4)
        row["Failed_Units_Sem1"] = max(0.0, sem1_enrolled - sem1_approved)
        row["Failed_Units_Sem2"] = max(0.0, sem2_enrolled - sem2_approved)
        row["Total_Failed_Units"] = row["Failed_Units_Sem1"] + row["Failed_Units_Sem2"]
        row["Eval_Pass_Ratio_Sem1"] = sem1_approved / (sem1_evals + 1e-4)
        row["Eval_Pass_Ratio_Sem2"] = sem2_approved / (sem2_evals + 1e-4)
        row["Financial_Stress_Score"] = (debtor * 3.0) + ((1.0 - tuition_ok) * 4.0) - (scholarship * 2.0)
        row["Macro_Economic_Stress"] = (unemployment * inflation) / (abs(gdp) + 5.0)
        row["Mature_Student_Flag"] = 1.0 if age >= 25 else 0.0
        row["Academic_Momentum_Index"] = (row["Avg_Grade_Combined"] / 20.0) * row["Overall_Approval_Rate"]
        row["Course_Load_Ratio"] = row["Total_Units_Enrolled"] / 12.0
        row["Early_Warning_Index"] = (
            (1 if row["Financial_Stress_Score"] >= 2.0 else 0) * 3 +
            (1 if row["Overall_Approval_Rate"] < 0.50 else 0) * 4 +
            (1 if row["Total_Failed_Units"] >= 3 else 0) * 3 +
            (1 if row["Grade_Progression"] < -1.5 else 0) * 2 +
            (1 if row["Avg_Grade_Combined"] < 10.0 else 0) * 3
        )

        df = pd.DataFrame([row], columns=self.feature_names)
        return df

    def predict_single(self, student_data: dict, model_name: str = None) -> dict:
        """
        Runs comprehensive prediction, probability distribution, risk tier assignment,
        local feature driver attribution, and generates tailored interventions.
        """
        clf = self.all_models.get(model_name, self.champion_model) if model_name else self.champion_model
        active_model_name = model_name if (model_name and model_name in self.all_models) else self.champion_name

        X_df = self.extract_features(student_data)
        X_scaled = self.scaler.transform(X_df)

        pred_idx = int(clf.predict(X_scaled)[0])
        pred_label = self.label_encoder.inverse_transform([pred_idx])[0]

        if hasattr(clf, "predict_proba"):
            probs = clf.predict_proba(X_scaled)[0]
            prob_dict = {self.class_names[i]: round(float(probs[i]) * 100, 2) for i in range(len(self.class_names))}
            dropout_prob = prob_dict.get("Dropout", 0.0)
            enrolled_prob = prob_dict.get("Enrolled", 0.0)
            graduate_prob = prob_dict.get("Graduate", 0.0)
        else:
            dropout_prob = 100.0 if pred_label == "Dropout" else 0.0
            enrolled_prob = 100.0 if pred_label == "Enrolled" else 0.0
            graduate_prob = 100.0 if pred_label == "Graduate" else 0.0
            prob_dict = {"Dropout": dropout_prob, "Enrolled": enrolled_prob, "Graduate": graduate_prob}

        # Determine Risk Tier
        if dropout_prob >= 55.0 or (pred_label == "Dropout" and dropout_prob >= 40.0):
            risk_tier = "CRITICAL_HIGH"
            risk_badge = "High Dropout Risk"
            risk_color = "#EF4444"
        elif dropout_prob >= 25.0 or pred_label == "Enrolled":
            risk_tier = "MODERATE_WARNING"
            risk_badge = "Moderate Attention Needed"
            risk_color = "#F59E0B"
        else:
            risk_tier = "LOW_SAFE"
            risk_badge = "On Track / Safe"
            risk_color = "#10B981"

        # Local Risk Factors (Contribution analysis)
        drivers = self._compute_local_drivers(X_df.iloc[0], dropout_prob)

        # Actionable Prescriptions / Interventions
        interventions = self._generate_interventions(X_df.iloc[0], dropout_prob, risk_tier)

        return {
            "predicted_outcome": pred_label,
            "dropout_risk_score": round(dropout_prob, 1),
            "graduation_likelihood": round(graduate_prob, 1),
            "enrolled_progression": round(enrolled_prob, 1),
            "probabilities": prob_dict,
            "risk_tier": risk_tier,
            "risk_badge": risk_badge,
            "risk_color": risk_color,
            "model_used": active_model_name,
            "key_drivers": drivers,
            "recommended_interventions": interventions,
            "summary_metrics": {
                "overall_approval_rate": round(float(X_df.iloc[0].get("Overall_Approval_Rate", 0.0)) * 100, 1),
                "total_failed_units": int(X_df.iloc[0].get("Total_Failed_Units", 0)),
                "grade_progression": round(float(X_df.iloc[0].get("Grade_Progression", 0.0)), 2),
                "avg_grade": round(float(X_df.iloc[0].get("Avg_Grade_Combined", 0.0)), 1),
                "early_warning_index": int(X_df.iloc[0].get("Early_Warning_Index", 0)),
                "financial_stress_score": round(float(X_df.iloc[0].get("Financial_Stress_Score", 0.0)), 1)
            }
        }

    def _compute_local_drivers(self, feature_row: pd.Series, dropout_risk: float) -> dict:
        """
        Analyzes individual student metrics against institutional baselines
        to identify primary risk aggravating and mitigating factors.
        """
        risk_aggravating = []
        protective_factors = []

        # Academic Performance
        sem2_grade = feature_row.get("Curricular units 2nd sem (grade)", 12.0)
        sem1_grade = feature_row.get("Curricular units 1st sem (grade)", 12.0)
        approval_rate = feature_row.get("Overall_Approval_Rate", 0.8)
        failed_units = feature_row.get("Total_Failed_Units", 0)
        grade_prog = feature_row.get("Grade_Progression", 0.0)

        if approval_rate < 0.50:
            risk_aggravating.append({
                "factor": "Severe Course Credit Deficit",
                "detail": f"Overall credit approval rate is only {approval_rate*100:.0f}%.",
                "severity": "High",
                "impact": -35
            })
        elif approval_rate >= 0.85:
            protective_factors.append({
                "factor": "High Credit Completion",
                "detail": f"Successfully approved {approval_rate*100:.0f}% of enrolled units.",
                "strength": "High",
                "impact": +30
            })

        if failed_units >= 3:
            risk_aggravating.append({
                "factor": f"High Failed Course Burden ({int(failed_units)} units)",
                "detail": "Accumulated multiple failed units across Semesters 1 & 2.",
                "severity": "High",
                "impact": -25
            })

        if grade_prog <= -2.0:
            risk_aggravating.append({
                "factor": "Downward Grade Momentum",
                "detail": f"Grade dropped by {abs(grade_prog):.1f} points in Semester 2.",
                "severity": "Medium",
                "impact": -18
            })
        elif grade_prog >= 1.5:
            protective_factors.append({
                "factor": "Positive Academic Momentum",
                "detail": f"Semester 2 grade improved by +{grade_prog:.1f} points over Sem 1.",
                "strength": "Medium",
                "impact": +20
            })

        if sem2_grade < 10.0:
            risk_aggravating.append({
                "factor": f"Sub-threshold Sem 2 Average ({sem2_grade:.1f}/20)",
                "detail": "Academic performance is currently below passing threshold.",
                "severity": "High",
                "impact": -28
            })
        elif sem2_grade >= 14.0:
            protective_factors.append({
                "factor": f"Strong Academic Honors ({sem2_grade:.1f}/20)",
                "detail": "Consistently maintaining above-average academic performance.",
                "strength": "High",
                "impact": +25
            })

        # Financial Status
        tuition_ok = feature_row.get("Tuition fees up to date", 1)
        debtor = feature_row.get("Debtor", 0)
        scholarship = feature_row.get("Scholarship holder", 0)

        if tuition_ok == 0:
            risk_aggravating.append({
                "factor": "Tuition Fees Arrears / Unpaid",
                "detail": "Student has pending tuition fee holds preventing enrollment.",
                "severity": "Critical",
                "impact": -40
            })
        else:
            protective_factors.append({
                "factor": "Tuition Up to Date",
                "detail": "No administrative or fee payment holds on account.",
                "strength": "Low",
                "impact": +10
            })

        if debtor == 1:
            risk_aggravating.append({
                "factor": "Institutional Financial Debt Status",
                "detail": "Active outstanding debt recorded with university bursar.",
                "severity": "High",
                "impact": -25
            })

        if scholarship == 1:
            protective_factors.append({
                "factor": "Active Scholarship Recipient",
                "detail": "Receiving institutional financial aid support.",
                "strength": "High",
                "impact": +25
            })

        # Demographics
        age = feature_row.get("Age at enrollment", 20)
        if age >= 30:
            risk_aggravating.append({
                "factor": f"Mature Student Transition ({int(age)} yrs)",
                "detail": "Balancing external work/family commitments with coursework.",
                "severity": "Low",
                "impact": -10
            })

        # Fallbacks if empty
        if not risk_aggravating:
            risk_aggravating.append({
                "factor": "Nominal Academic Friction",
                "detail": "Minor variance in semester coursework evaluations.",
                "severity": "Low",
                "impact": -5
            })
        if not protective_factors:
            protective_factors.append({
                "factor": "Course Enrollment Maintained",
                "detail": "Active enrollment in current degree program.",
                "strength": "Low",
                "impact": +10
            })

        return {
            "aggravating_factors": risk_aggravating,
            "protective_factors": protective_factors
        }

    def _generate_interventions(self, feature_row: pd.Series, dropout_risk: float, risk_tier: str) -> list:
        """
        Creates actionable institutional prescriptions with estimated risk reduction impact.
        """
        prescriptions = []

        tuition_ok = feature_row.get("Tuition fees up to date", 1)
        debtor = feature_row.get("Debtor", 0)
        failed_units = feature_row.get("Total_Failed_Units", 0)
        sem2_grade = feature_row.get("Curricular units 2nd sem (grade)", 12.0)
        scholarship = feature_row.get("Scholarship holder", 0)
        approval_rate = feature_row.get("Overall_Approval_Rate", 0.8)

        if tuition_ok == 0 or debtor == 1:
            prescriptions.append({
                "id": "FIN_AID_GRANT",
                "category": "Financial Support",
                "title": "Emergency Tuition Relief & Payment Restructuring",
                "description": "Connect student with Financial Aid Office to clear registration hold and establish income-contingent payment schedule.",
                "priority": "Immediate (Within 48h)",
                "estimated_risk_reduction": "25% - 35%",
                "icon": "DollarSign"
            })

        if failed_units >= 2 or sem2_grade < 11.0:
            prescriptions.append({
                "id": "PEER_TUTORING",
                "category": "Academic Remediation",
                "title": "Mandatory Peer Tutoring & Supplemental Instruction",
                "description": "Assign dedicated subject-matter peer tutor for struggling curricular units with bi-weekly progress checks.",
                "priority": "High Priority",
                "estimated_risk_reduction": "20% - 30%",
                "icon": "BookOpen"
            })

        if approval_rate < 0.60:
            prescriptions.append({
                "id": "LOAD_CALIBRATION",
                "category": "Curricular Planning",
                "title": "Course Load Recalibration & Recovery Plan",
                "description": "Meet with academic advisor to adjust semester credit load, drop high-friction overload modules, and establish retake roadmap.",
                "priority": "High Priority",
                "estimated_risk_reduction": "15% - 25%",
                "icon": "Compass"
            })

        if risk_tier in ["CRITICAL_HIGH", "MODERATE_WARNING"]:
            prescriptions.append({
                "id": "ADVISOR_CHECKIN",
                "category": "Mentorship & Retention",
                "title": "Proactive Academic Advisor Bi-Weekly Mentoring",
                "description": "Schedule recurring 1-on-1 retention counseling sessions to track attendance, assignment completion, and mental wellbeing.",
                "priority": "Standard Priority",
                "estimated_risk_reduction": "10% - 15%",
                "icon": "UserCheck"
            })

        if scholarship == 0 and (debtor == 1 or tuition_ok == 0):
            prescriptions.append({
                "id": "SCHOLARSHIP_APP",
                "category": "Scholarship Assistance",
                "title": "Institutional Merit/Need Scholarship Nomination",
                "description": "Fast-track student application for departmental need-based emergency retention grants.",
                "priority": "Medium Priority",
                "estimated_risk_reduction": "15% - 20%",
                "icon": "Award"
            })

        if not prescriptions:
            prescriptions.append({
                "id": "HONORS_ACCELERATION",
                "category": "Student Success",
                "title": "Dean's List & Undergraduate Research Acceleration",
                "description": "Encourage participation in departmental research initiatives and career mentorship workshops.",
                "priority": "Optional / Development",
                "estimated_risk_reduction": "N/A (Student On Track)",
                "icon": "Sparkles"
            })

        return prescriptions

    def simulate_what_if(self, baseline_input: dict, adjustments: dict) -> dict:
        """
        Runs dual-pass prediction: Baseline vs Simulated adjusted state.
        Calculates exact delta in risk score and probability distributions.
        """
        baseline_res = self.predict_single(baseline_input)

        # Merge adjustments into modified input
        simulated_input = baseline_input.copy()
        for k, v in adjustments.items():
            simulated_input[k] = v

        simulated_res = self.predict_single(simulated_input)

        delta_risk = round(simulated_res["dropout_risk_score"] - baseline_res["dropout_risk_score"], 1)
        delta_grad = round(simulated_res["graduation_likelihood"] - baseline_res["graduation_likelihood"], 1)

        return {
            "baseline": baseline_res,
            "simulated": simulated_res,
            "delta": {
                "dropout_risk_delta": delta_risk,
                "graduation_likelihood_delta": delta_grad,
                "risk_reduced": delta_risk < 0,
                "percentage_change": round((abs(delta_risk) / (baseline_res["dropout_risk_score"] + 1e-4)) * 100, 1)
            }
        }

    def predict_batch_csv(self, df: pd.DataFrame, model_name: str = None) -> dict:
        """
        High-performance vectorized batch predictor.
        """
        df_clean = df.copy()
        df_clean.columns = [c.strip() for c in df_clean.columns]
        total_students = len(df_clean)
        if total_students == 0:
            return {"total_students": 0, "summary": {}, "students": []}

        clf = self.all_models.get(model_name, self.champion_model) if model_name else self.champion_model

        # Build DataFrame of all engineered features in bulk
        rows = []
        for idx, r in df_clean.iterrows():
            row_dict = r.to_dict()
            rows.append(self.extract_features(row_dict).iloc[0])

        X_batch_df = pd.DataFrame(rows, columns=self.feature_names)
        X_scaled = self.scaler.transform(X_batch_df)

        preds = clf.predict(X_scaled)
        pred_labels = self.label_encoder.inverse_transform(preds)

        if hasattr(clf, "predict_proba"):
            probs = clf.predict_proba(X_scaled)
        else:
            probs = np.zeros((total_students, len(self.class_names)))
            for i, p in enumerate(preds):
                probs[i, p] = 1.0

        results_list = []
        risk_counts = {"CRITICAL_HIGH": 0, "MODERATE_WARNING": 0, "LOW_SAFE": 0}
        outcome_counts = {"Dropout": 0, "Enrolled": 0, "Graduate": 0}

        dropout_col_idx = self.class_names.index("Dropout") if "Dropout" in self.class_names else 0
        enrolled_col_idx = self.class_names.index("Enrolled") if "Enrolled" in self.class_names else 1
        graduate_col_idx = self.class_names.index("Graduate") if "Graduate" in self.class_names else 2

        for i in range(total_students):
            pred_outcome = pred_labels[i]
            d_risk = round(float(probs[i, dropout_col_idx]) * 100, 1)
            g_prob = round(float(probs[i, graduate_col_idx]) * 100, 1)
            e_prob = round(float(probs[i, enrolled_col_idx]) * 100, 1)

            if d_risk >= 55.0 or (pred_outcome == "Dropout" and d_risk >= 40.0):
                risk_tier = "CRITICAL_HIGH"
                risk_badge = "High Dropout Risk"
                risk_color = "#EF4444"
            elif d_risk >= 25.0 or pred_outcome == "Enrolled":
                risk_tier = "MODERATE_WARNING"
                risk_badge = "Moderate Attention Needed"
                risk_color = "#F59E0B"
            else:
                risk_tier = "LOW_SAFE"
                risk_badge = "On Track / Safe"
                risk_color = "#10B981"

            risk_counts[risk_tier] = risk_counts.get(risk_tier, 0) + 1
            outcome_counts[pred_outcome] = outcome_counts.get(pred_outcome, 0) + 1

            r_series = X_batch_df.iloc[i]
            orig_row = df_clean.iloc[i]

            s_id = orig_row.get("Student_ID", f"STU-{1000 + i}")
            s_name = orig_row.get("Student_Name", f"Student {i + 1}")
            c_name = orig_row.get("Course_Name", "General Studies")

            tuition_ok = orig_row.get("Tuition fees up to date", 1)
            debtor = orig_row.get("Debtor", 0)

            # Recommendations
            recs = self._generate_interventions(r_series, d_risk, risk_tier)
            top_rec = recs[0]["title"] if recs else "Monitor Progress"

            results_list.append({
                "student_id": str(s_id),
                "student_name": str(s_name),
                "course_name": str(c_name),
                "predicted_outcome": pred_outcome,
                "dropout_risk_score": d_risk,
                "graduation_likelihood": g_prob,
                "risk_tier": risk_tier,
                "risk_badge": risk_badge,
                "risk_color": risk_color,
                "avg_grade": round(float(r_series.get("Avg_Grade_Combined", 12.0)), 1),
                "approval_rate": round(float(r_series.get("Overall_Approval_Rate", 0.8)) * 100, 1),
                "failed_units": int(r_series.get("Total_Failed_Units", 0)),
                "financial_hold": "Yes" if tuition_ok == 0 or debtor == 1 else "No",
                "top_recommendation": top_rec
            })

        results_list.sort(key=lambda x: x["dropout_risk_score"], reverse=True)
        avg_dropout_risk = round(sum(s["dropout_risk_score"] for s in results_list) / max(1, total_students), 1)
        avg_grad_likelihood = round(sum(s["graduation_likelihood"] for s in results_list) / max(1, total_students), 1)

        return {
            "total_students": total_students,
            "summary": {
                "critical_high_risk_count": risk_counts["CRITICAL_HIGH"],
                "critical_high_risk_percentage": round((risk_counts["CRITICAL_HIGH"] / max(1, total_students)) * 100, 1),
                "moderate_warning_count": risk_counts["MODERATE_WARNING"],
                "moderate_warning_percentage": round((risk_counts["MODERATE_WARNING"] / max(1, total_students)) * 100, 1),
                "low_safe_count": risk_counts["LOW_SAFE"],
                "low_safe_percentage": round((risk_counts["LOW_SAFE"] / max(1, total_students)) * 100, 1),
                "average_cohort_risk": avg_dropout_risk,
                "average_graduation_forecast": avg_grad_likelihood,
                "outcome_breakdown": outcome_counts
            },
            "students": results_list
        }

# Global singleton
ml_engine = DropoutMLEngine()
