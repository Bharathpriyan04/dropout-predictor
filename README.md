# 🎓 AEGIS Retention Intelligence — Student Dropout Risk Prediction & Retention Platform

An industry-grade, enterprise Student Dropout Risk Prediction and Early Warning Intelligence System powered by advanced Machine Learning, domain-informed feature engineering, dynamic policy simulation, and longitudinal student case management.

---

## 🏆 Machine Learning Model Evaluation Leaderboard

The predictive engine was trained and cross-validated on **15,000+ realistic student records** (incorporating the official UCI Benchmark and multi-campus cohorts across STEM, Health Sciences, Business, and Humanities) across **55 domain features** (including 18 novel engineered indices).

| Algorithm Architecture | Accuracy | Balanced Acc | Precision (Macro) | Recall (Macro) | F1-Macro | ROC-AUC (OVR) | 5-Fold Stratified CV |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **⭐ Stacking Super-Learner Ensemble** | **97.97%** | **98.02%** | **97.98%** | **98.02%** | **97.99%** | **99.76%** | **97.99% ± 0.45%** |
| **MLP Neural Network** | 96.70% | 96.65% | 96.74% | 96.65% | 96.69% | 99.17% | 95.57% ± 0.60% |
| **Extra Trees Classifier** | 94.73% | 94.68% | 94.77% | 94.68% | 94.72% | 99.35% | 93.87% ± 0.68% |
| **Random Forest (Balanced)** | 94.37% | 94.29% | 94.35% | 94.29% | 94.31% | 99.32% | 93.26% ± 0.76% |
| **LightGBM Classifier** | 94.07% | 93.92% | 94.02% | 93.92% | 93.96% | 99.08% | 93.83% ± 0.56% |
| **XGBoost Classifier** | 91.57% | 91.28% | 91.46% | 91.28% | 91.36% | 98.35% | 91.20% ± 0.82% |

---

## 🛠️ Feature Engineering Pipeline (18 Novel Domain Indices)

1. **Overall Approval Rate**: Cumulative ratio of passed credits to enrolled units.
2. **Academic Momentum Index**: Interaction metric combining grade magnitude with credit clearance.
3. **Grade Progression ($\Delta$ Sem 2 - Sem 1)**: Trajectory indicator capturing downward academic slide or positive recovery.
4. **Total Failed Unit Burden**: Accumulated credit deficit across semesters.
5. **Evaluation Efficiency Ratio**: Pass-per-attempt conversion efficiency.
6. **Financial Distress Composite**: Weighted penalty score incorporating bursar debt, fee arrears, and scholarship presence.
7. **Dropout Early Warning Heuristic Index**: Multi-dimensional early flag triggering proactive advising.
8. **Macro-Economic Vulnerability Index**: Regional labor pressure $\frac{\text{Unemployment} \times \text{Inflation}}{|\text{GDP}| + 5}$.

---

## 🌟 Key Application Features

### 1. 📊 Executive Retention & Early Warning Radar
- Institutional retention KPIs: Total Monitored, Critical At-Risk Count & %, Retention Progression Funnel, Active Interventions.
- Department / Program Risk Index comparing dropout probability across faculties.
- Cohort health ratio breakdown.
- Urgent priority action queue.

### 2. 🎯 Individual Student 360 Risk Evaluator
- Intake form across Demographics, Semester 1 & 2 Coursework, and Financial Standing.
- Quick archetype presets (High Risk Case, Moderate Friction, Honor Graduate).
- Live animated Circular Risk Gauge color-coded by Critical, Warning, and Safe tiers.
- Multi-Class Probability Distribution (Dropout Risk %, Enrolled Progression %, Graduation Likelihood %).
- Local Explainability Drivers (Aggravating Risk Factors vs Protective Mitigating Strengths).
- Automated Prescribed Interventions with estimated risk reduction percentages.
- 1-Click "Save Evaluation to Registry".

### 3. 🔬 Interactive "What-If" Policy Simulation Sandbox
- Dual comparison matrix: Status Quo Baseline vs Simulated State.
- Policy adjustment sliders:
  - Peer Tutoring Grade Improvement (+0 to +10 pts)
  - Credit Recovery / Additional Units Passed (+0 to +5 units)
  - Emergency Tuition Grant / Bursar Debt Relief
  - Merit/Need Retention Scholarship Award
  - Course Overload Recalibration
- Real-time **Delta Meter** showing forecasted risk drop (e.g. $-93.2\%$ risk reduction).

### 4. 📁 Batch Cohort Risk Analyzer
- Drag-and-drop CSV / Excel roster upload.
- One-click preloaded institutional sample cohort (60 students).
- Searchable and sortable data table with risk classification badges.
- Download enriched CSV report with predicted outcome scores and recommended actions.

### 5. 👥 Student Directory & Case Management
- Searchable directory by Student Name, ID, or Program.
- Filter by Department and Risk Tier.
- 360-degree Student Case Modal with academic history, past interventions timeline, and advisor note logger.
- "Register New Student" enrollment form.

### 6. 🧠 Machine Learning Model Governance Center
- Live model switcher allowing real-time scoring comparisons.
- Full metric comparison leaderboard.
- Interactive 3x3 Multi-Class Confusion Matrix selector.
- Global feature importance rankings bar chart.

### 7. 📄 Executive PDF Report Generator
- Institutional-grade downloadable PDF report with cohort health tables, priority outreach rosters, and actionable recommendations.

---

## 🚀 Quickstart & Deployment

### Run Locally (1 Command)

```bash
# Windows
run_app.bat

# Or manually
pip install -r requirements.txt
python -m uvicorn backend.server:app --host 0.0.0.0 --port 8000
```
Open **[http://127.0.0.1:8000](http://127.0.0.1:8000)** in your browser!

### Run Streamlit Alternative Interface
```bash
streamlit run app.py
```

### Retrain Models
```bash
python train_advanced_models.py
```

---

## 📡 Backend API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | System status, model registry, active champion model |
| `GET` | `/api/models/benchmarks` | Full evaluation metrics, 5-fold CV, confusion matrices |
| `GET` | `/api/models/feature-importance` | Global feature importances across tree models |
| `POST` | `/api/predict` | Real-time individual student prediction & drivers |
| `POST` | `/api/simulate-what-if` | Baseline vs simulated policy intervention comparison |
| `POST` | `/api/predict/batch` | Upload CSV/Excel and return enriched cohort scoring |
| `GET` | `/api/sample-cohort` | Preloaded 60-student benchmark batch |
| `GET` | `/api/students` | Search and filter registered student records |
| `GET` | `/api/students/{id}` | Student 360 profile with semester metrics and case history |
| `POST` | `/api/students` | Register a new student into the institutional directory |
| `POST` | `/api/students/{id}/interventions` | Log advisor notes and retention interventions |
| `GET` | `/api/analytics/overview` | Macro retention rates and department risk breakdowns |
| `POST` | `/api/export/pdf-report` | Generate and download executive PDF retention report |
