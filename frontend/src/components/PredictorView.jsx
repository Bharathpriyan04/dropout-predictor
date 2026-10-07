import React, { useState, useEffect } from 'react';
import { 
  Target, Sparkles, RefreshCw, AlertCircle, CheckCircle, 
  HelpCircle, UserCheck, DollarSign, BookOpen, Compass, Award, BookmarkPlus
} from 'lucide-react';

const PRESETS = {
  highRisk: {
    name: "High Dropout Risk Preset",
    data: {
      age: 23, gender: 1, attendance: 1, scholarship: 0,
      tuition_ok: 0, debtor: 1, displaced: 1,
      admission_grade: 118, prev_grade: 115,
      sem1_enrolled: 6, sem1_approved: 3, sem1_grade: 9.2, sem1_evals: 8,
      sem2_enrolled: 6, sem2_approved: 1, sem2_grade: 7.0, sem2_evals: 9,
      unemployment: 13.9, inflation: 2.8, gdp: -1.0, course: 9500
    }
  },
  moderateRisk: {
    name: "Moderate / Friction Preset",
    data: {
      age: 21, gender: 0, attendance: 1, scholarship: 0,
      tuition_ok: 1, debtor: 0, displaced: 0,
      admission_grade: 128, prev_grade: 126,
      sem1_enrolled: 6, sem1_approved: 4, sem1_grade: 11.2, sem1_evals: 7,
      sem2_enrolled: 6, sem2_approved: 3, sem2_grade: 10.4, sem2_evals: 8,
      unemployment: 11.0, inflation: 1.4, gdp: 0.5, course: 9147
    }
  },
  honorStudent: {
    name: "Honor Graduate Preset",
    data: {
      age: 19, gender: 0, attendance: 1, scholarship: 1,
      tuition_ok: 1, debtor: 0, displaced: 0,
      admission_grade: 165, prev_grade: 160,
      sem1_enrolled: 6, sem1_approved: 6, sem1_grade: 16.0, sem1_evals: 6,
      sem2_enrolled: 6, sem2_approved: 6, sem2_grade: 16.8, sem2_evals: 6,
      unemployment: 9.4, inflation: 1.1, gdp: 1.74, course: 9070
    }
  }
};

export default function PredictorView({ selectedModel, onSaveStudent }) {
  const [formData, setFormData] = useState(PRESETS.highRisk.data);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [studentName, setStudentName] = useState("Jonathan Sterling");
  const [studentEmail, setStudentEmail] = useState("j.sterling@university.edu");
  const [department, setDepartment] = useState("Computer Science & Engineering");

  const runPrediction = async (data = formData) => {
    setLoading(true);
    try {
      const resp = await fetch('http://localhost:8000/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, model_name: selectedModel })
      });
      if (resp.ok) {
        const json = await resp.json();
        setPrediction(json);
      }
    } catch (err) {
      console.error("Prediction API error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runPrediction(formData);
  }, [selectedModel]);

  const handleChange = (field, value) => {
    const updated = { ...formData, [field]: parseFloat(value) };
    setFormData(updated);
    runPrediction(updated);
  };

  const applyPreset = (presetKey) => {
    const p = PRESETS[presetKey].data;
    setFormData(p);
    runPrediction(p);
  };

  const handleSaveToRegistry = async () => {
    try {
      const resp = await fetch('http://localhost:8000/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: studentName,
          email: studentEmail,
          department: department,
          ...formData
        })
      });
      if (resp.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        if (onSaveStudent) onSaveStudent();
      }
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const riskScore = prediction?.dropout_risk_score || 0;
  const strokeColor = riskScore >= 55 ? '#EF4444' : riskScore >= 25 ? '#F59E0B' : '#10B981';
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (riskScore / 100) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Title & Presets Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, marginBottom: '4px' }}>
            Individual Student 360 Risk Evaluator
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Input academic trajectories and socio-economic variables to generate instant dropout probability and personalized intervention plans.
          </p>
        </div>

        {/* Quick Archetype Preset Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>PRESETS:</span>
          <button 
            className="btn-secondary" 
            style={{ padding: '6px 12px', fontSize: '0.78rem', border: '1px solid rgba(239,68,68,0.4)', color: '#F87171' }}
            onClick={() => applyPreset('highRisk')}
          >
            ⚠️ High Risk Case
          </button>
          <button 
            className="btn-secondary" 
            style={{ padding: '6px 12px', fontSize: '0.78rem', border: '1px solid rgba(245,158,11,0.4)', color: '#FBBF24' }}
            onClick={() => applyPreset('moderateRisk')}
          >
            🟡 Moderate Friction
          </button>
          <button 
            className="btn-secondary" 
            style={{ padding: '6px 12px', fontSize: '0.78rem', border: '1px solid rgba(16,185,129,0.4)', color: '#34D399' }}
            onClick={() => applyPreset('honorStudent')}
          >
            ✅ Honor Graduate
          </button>
        </div>
      </div>

      {/* Main Grid: Left Form (3 Columns) vs Right Live ML Gauge & Drivers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.45fr 1fr', gap: '24px' }}>
        
        {/* LEFT: Multi-Section Intake Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Card 1: Academic Trajectory & Semester 1/2 Marks */}
          <div className="glass-panel" style={{ padding: '22px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={18} color="var(--brand-primary)" />
              <span>Academic Performance & Semester Coursework</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              
              {/* Semester 1 Box */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--brand-primary-hover)', marginBottom: '10px' }}>
                  📘 Semester 1 Curriculum
                </div>
                
                <div className="slider-container" style={{ marginBottom: '10px' }}>
                  <div className="slider-header">
                    <span>Average Grade (0 - 20)</span>
                    <span className="slider-val">{formData.sem1_grade.toFixed(1)} / 20</span>
                  </div>
                  <input 
                    type="range" min="0" max="20" step="0.1" 
                    value={formData.sem1_grade} 
                    onChange={(e) => handleChange('sem1_grade', e.target.value)} 
                  />
                </div>

                <div className="slider-container" style={{ marginBottom: '10px' }}>
                  <div className="slider-header">
                    <span>Units Approved / Enrolled</span>
                    <span className="slider-val">{formData.sem1_approved} of {formData.sem1_enrolled}</span>
                  </div>
                  <input 
                    type="range" min="0" max="8" step="1" 
                    value={formData.sem1_approved} 
                    onChange={(e) => handleChange('sem1_approved', e.target.value)} 
                  />
                </div>

                <div className="slider-container">
                  <div className="slider-header">
                    <span>Total Evaluations Taken</span>
                    <span className="slider-val">{formData.sem1_evals}</span>
                  </div>
                  <input 
                    type="range" min="0" max="15" step="1" 
                    value={formData.sem1_evals} 
                    onChange={(e) => handleChange('sem1_evals', e.target.value)} 
                  />
                </div>
              </div>

              {/* Semester 2 Box */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--brand-teal)', marginBottom: '10px' }}>
                  📗 Semester 2 Curriculum
                </div>
                
                <div className="slider-container" style={{ marginBottom: '10px' }}>
                  <div className="slider-header">
                    <span>Average Grade (0 - 20)</span>
                    <span className="slider-val">{formData.sem2_grade.toFixed(1)} / 20</span>
                  </div>
                  <input 
                    type="range" min="0" max="20" step="0.1" 
                    value={formData.sem2_grade} 
                    onChange={(e) => handleChange('sem2_grade', e.target.value)} 
                  />
                </div>

                <div className="slider-container" style={{ marginBottom: '10px' }}>
                  <div className="slider-header">
                    <span>Units Approved / Enrolled</span>
                    <span className="slider-val">{formData.sem2_approved} of {formData.sem2_enrolled}</span>
                  </div>
                  <input 
                    type="range" min="0" max="8" step="1" 
                    value={formData.sem2_approved} 
                    onChange={(e) => handleChange('sem2_approved', e.target.value)} 
                  />
                </div>

                <div className="slider-container">
                  <div className="slider-header">
                    <span>Total Evaluations Taken</span>
                    <span className="slider-val">{formData.sem2_evals}</span>
                  </div>
                  <input 
                    type="range" min="0" max="15" step="1" 
                    value={formData.sem2_evals} 
                    onChange={(e) => handleChange('sem2_evals', e.target.value)} 
                  />
                </div>
              </div>

            </div>

            {/* Admission and Prior Qualifications */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
              <div className="slider-container">
                <div className="slider-header">
                  <span>Admission Grade (0 - 200)</span>
                  <span className="slider-val">{formData.admission_grade.toFixed(0)}</span>
                </div>
                <input 
                  type="range" min="80" max="200" step="1" 
                  value={formData.admission_grade} 
                  onChange={(e) => handleChange('admission_grade', e.target.value)} 
                />
              </div>

              <div className="slider-container">
                <div className="slider-header">
                  <span>Prior Qualification Grade (0 - 200)</span>
                  <span className="slider-val">{formData.prev_grade.toFixed(0)}</span>
                </div>
                <input 
                  type="range" min="80" max="200" step="1" 
                  value={formData.prev_grade} 
                  onChange={(e) => handleChange('prev_grade', e.target.value)} 
                />
              </div>
            </div>

          </div>

          {/* Card 2: Financial, Bursar & Economic Vulnerability */}
          <div className="glass-panel" style={{ padding: '22px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DollarSign size={18} color="var(--brand-teal)" />
              <span>Financial Standing & Bursar Account</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
              
              <div>
                <label className="form-label">Tuition Fees Status</label>
                <select 
                  className="form-control"
                  value={formData.tuition_ok}
                  onChange={(e) => handleChange('tuition_ok', e.target.value)}
                >
                  <option value={1}>✅ Up to Date (No Hold)</option>
                  <option value={0}>❌ Arrears / Unpaid Hold</option>
                </select>
              </div>

              <div>
                <label className="form-label">Bursar Debtor Status</label>
                <select 
                  className="form-control"
                  value={formData.debtor}
                  onChange={(e) => handleChange('debtor', e.target.value)}
                >
                  <option value={0}>✅ No Debt Recorded</option>
                  <option value={1}>⚠️ Active Bursar Debtor</option>
                </select>
              </div>

              <div>
                <label className="form-label">Scholarship Holder</label>
                <select 
                  className="form-control"
                  value={formData.scholarship}
                  onChange={(e) => handleChange('scholarship', e.target.value)}
                >
                  <option value={1}>🎓 Yes (Scholarship Active)</option>
                  <option value={0}>No Scholarship</option>
                </select>
              </div>

            </div>
          </div>

          {/* Card 3: Demographics & Enrollment Attributes */}
          <div className="glass-panel" style={{ padding: '22px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserCheck size={18} color="var(--brand-indigo)" />
              <span>Student Demographics & Program Enrollment</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
              
              <div className="slider-container">
                <div className="slider-header">
                  <span>Age at Enrollment</span>
                  <span className="slider-val">{formData.age} yrs</span>
                </div>
                <input 
                  type="range" min="17" max="60" step="1" 
                  value={formData.age} 
                  onChange={(e) => handleChange('age', e.target.value)} 
                />
              </div>

              <div>
                <label className="form-label">Gender</label>
                <select 
                  className="form-control"
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                >
                  <option value={1}>Male</option>
                  <option value={0}>Female</option>
                </select>
              </div>

              <div>
                <label className="form-label">Attendance Shift</label>
                <select 
                  className="form-control"
                  value={formData.attendance}
                  onChange={(e) => handleChange('attendance', e.target.value)}
                >
                  <option value={1}>Daytime Standard</option>
                  <option value={0}>Evening / Part-time</option>
                </select>
              </div>

              <div>
                <label className="form-label">Displaced Student</label>
                <select 
                  className="form-control"
                  value={formData.displaced}
                  onChange={(e) => handleChange('displaced', e.target.value)}
                >
                  <option value={1}>Yes (Relocated/Commuter)</option>
                  <option value={0}>No (Local Resident)</option>
                </select>
              </div>

            </div>
          </div>

        </div>

        {/* RIGHT: Live Risk Gauge, Probability Breakdown, Drivers & Prescriptions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Main Live ML Prediction Card */}
          <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 700 }}>
                Machine Learning Prediction
              </span>
              <span style={{ fontSize: '0.74rem', color: 'var(--brand-primary-hover)', fontWeight: 600 }}>
                Model: {prediction?.model_used || selectedModel}
              </span>
            </div>

            {/* Circular Gauge */}
            <div style={{ position: 'relative', width: '150px', height: '150px', margin: '10px auto' }}>
              <svg width="150" height="150" className="gauge-svg">
                <circle 
                  cx="75" cy="75" r={radius} 
                  stroke="rgba(255, 255, 255, 0.08)" 
                  strokeWidth="12" 
                  fill="transparent" 
                />
                <circle 
                  cx="75" cy="75" r={radius} 
                  stroke={strokeColor} 
                  strokeWidth="12" 
                  fill="transparent" 
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.4s ease' }}
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '2.1rem', fontWeight: 800, color: strokeColor, letterSpacing: '-0.03em' }}>
                  {riskScore}%
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Dropout Risk
                </span>
              </div>
            </div>

            {/* Risk Tier Badge */}
            <div style={{ margin: '8px 0 16px 0' }}>
              <span 
                className={riskScore >= 55 ? 'risk-badge-high' : riskScore >= 25 ? 'risk-badge-moderate' : 'risk-badge-safe'}
                style={{ fontSize: '0.88rem', padding: '6px 14px' }}
              >
                {prediction?.risk_badge || 'Calculating...'}
              </span>
            </div>

            {/* Probabilities Breakdown */}
            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '14px', borderRadius: '10px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '3px' }}>
                  <span style={{ color: '#F87171', fontWeight: 600 }}>Dropout Probability</span>
                  <span style={{ fontWeight: 700 }}>{prediction?.probabilities?.Dropout || 0}%</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ width: `${prediction?.probabilities?.Dropout || 0}%`, height: '100%', background: '#EF4444', transition: 'width 0.4s ease' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '3px' }}>
                  <span style={{ color: '#FBBF24', fontWeight: 600 }}>Enrolled Progression</span>
                  <span style={{ fontWeight: 700 }}>{prediction?.probabilities?.Enrolled || 0}%</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ width: `${prediction?.probabilities?.Enrolled || 0}%`, height: '100%', background: '#F59E0B', transition: 'width 0.4s ease' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '3px' }}>
                  <span style={{ color: '#34D399', fontWeight: 600 }}>Graduation Likelihood</span>
                  <span style={{ fontWeight: 700 }}>{prediction?.probabilities?.Graduate || 0}%</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ width: `${prediction?.probabilities?.Graduate || 0}%`, height: '100%', background: '#10B981', transition: 'width 0.4s ease' }}></div>
                </div>
              </div>
            </div>

            {/* Quick Register / Save Student Form */}
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', textAlign: 'left' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Save Evaluation to Registry
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px', marginBottom: '8px' }}>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Student Full Name"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  style={{ fontSize: '0.82rem', padding: '6px 10px' }}
                />
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Department / Program"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  style={{ fontSize: '0.82rem', padding: '6px 10px' }}
                />
              </div>
              <button 
                className="btn-primary" 
                style={{ width: '100%', padding: '8px', fontSize: '0.84rem' }}
                onClick={handleSaveToRegistry}
              >
                <BookmarkPlus size={15} />
                <span>{saveSuccess ? 'Saved to Registry!' : 'Save Student Evaluation'}</span>
              </button>
            </div>

          </div>

          {/* Key Contributing Drivers (SHAP-style explainability) */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} color="var(--brand-primary)" />
              <span>Key Decision Drivers (Explainability)</span>
            </h4>

            {/* Aggravating Factors */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#F87171', marginBottom: '6px' }}>
                🔴 Primary Risk Aggravators:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {prediction?.key_drivers?.aggravating_factors?.map((item, idx) => (
                  <div key={idx} style={{ background: 'rgba(239,68,68,0.06)', borderLeft: '3px solid #EF4444', padding: '6px 10px', borderRadius: '4px' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FCA5A5' }}>{item.factor}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{item.detail}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Protective Factors */}
            <div>
              <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#34D399', marginBottom: '6px' }}>
                🟢 Protective Strengths:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {prediction?.key_drivers?.protective_factors?.map((item, idx) => (
                  <div key={idx} style={{ background: 'rgba(16,185,129,0.06)', borderLeft: '3px solid #10B981', padding: '6px 10px', borderRadius: '4px' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#6EE7B7' }}>{item.factor}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{item.detail}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actionable Interventions Checklist */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Compass size={16} color="var(--brand-teal)" />
              <span>Recommended Institutional Interventions</span>
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {prediction?.recommended_interventions?.map((rec, idx) => (
                <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#38BDF8' }}>{rec.title}</span>
                    <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: 700 }}>Est. Risk Cut: {rec.estimated_risk_reduction}</span>
                  </div>
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{rec.description}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
