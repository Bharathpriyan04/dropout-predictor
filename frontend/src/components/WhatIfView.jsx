import React, { useState, useEffect } from 'react';
import { 
  Sliders, ArrowRight, TrendingDown, CheckCircle2, 
  Sparkles, DollarSign, BookOpen, AlertTriangle, ShieldCheck, RefreshCw
} from 'lucide-react';

export default function WhatIfView({ selectedModel }) {
  // Baseline student configuration (At-risk case)
  const [baseline, setBaseline] = useState({
    age: 23, gender: 1, attendance: 1, scholarship: 0,
    tuition_ok: 0, debtor: 1, displaced: 1,
    admission_grade: 118, prev_grade: 115,
    sem1_enrolled: 6, sem1_approved: 3, sem1_grade: 9.2, sem1_evals: 8,
    sem2_enrolled: 6, sem2_approved: 1, sem2_grade: 7.0, sem2_evals: 9,
    unemployment: 13.9, inflation: 2.8, gdp: -1.0, course: 9500
  });

  // Policy Intervention Adjustments
  const [gradeBoost, setGradeBoost] = useState(5.0); // +5.0 grade in Sem 2 from tutoring
  const [unitsApprovedBoost, setUnitsApprovedBoost] = useState(4); // +4 approved units in Sem 2
  const [clearTuitionDebt, setClearTuitionDebt] = useState(true); // Bursar emergency grant
  const [grantScholarship, setGrantScholarship] = useState(false); // Award retention scholarship
  const [reduceCourseLoad, setReduceCourseLoad] = useState(false); // Reduce overload

  const [simulationResult, setSimulationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const adjustments = {
        sem2_grade: Math.min(20, baseline.sem2_grade + gradeBoost),
        sem2_approved: Math.min(baseline.sem2_enrolled, baseline.sem2_approved + unitsApprovedBoost),
        tuition_ok: clearTuitionDebt ? 1 : baseline.tuition_ok,
        debtor: clearTuitionDebt ? 0 : baseline.debtor,
        scholarship: grantScholarship ? 1 : baseline.scholarship,
        sem2_enrolled: reduceCourseLoad ? Math.max(4, baseline.sem2_enrolled - 1) : baseline.sem2_enrolled
      };

      const resp = await fetch('http://localhost:8000/api/simulate-what-if', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseline: { ...baseline, model_name: selectedModel },
          adjustments: adjustments
        })
      });

      if (resp.ok) {
        const json = await resp.json();
        setSimulationResult(json);
      }
    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, [gradeBoost, unitsApprovedBoost, clearTuitionDebt, grantScholarship, reduceCourseLoad, selectedModel]);

  const baseRisk = simulationResult?.baseline?.dropout_risk_score || 0;
  const simRisk = simulationResult?.simulated?.dropout_risk_score || 0;
  const deltaRisk = simulationResult?.delta?.dropout_risk_delta || 0;
  const isReduced = deltaRisk < 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* View Header */}
      <div>
        <h2 style={{ fontSize: '1.65rem', fontWeight: 800, marginBottom: '4px' }}>
          Interactive "What-If" Intervention Sandbox
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Simulate strategic academic and financial policy interventions to forecast their exact mathematical impact on student retention.
        </p>
      </div>

      {/* Main Sandbox Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.3fr 1.2fr', gap: '20px' }}>
        
        {/* COLUMN 1: Baseline Student Profile */}
        <div className="glass-panel" style={{ padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>1. Baseline Status Quo</h3>
              <span className="risk-badge-high" style={{ fontSize: '0.72rem' }}>High Friction</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.84rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>Semester 2 Academic Standing</div>
                <div style={{ fontWeight: 700, marginTop: '2px' }}>Grade: <b>{baseline.sem2_grade.toFixed(1)} / 20</b> (Failing)</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>Approved: <b>{baseline.sem2_approved} of {baseline.sem2_enrolled} units</b></div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>Financial Account Status</div>
                <div style={{ fontWeight: 700, color: '#F87171', marginTop: '2px' }}>❌ Tuition Unpaid / Debtor</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>No active scholarship</div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>Enrollment Trajectory</div>
                <div style={{ fontWeight: 700, marginTop: '2px' }}>Computer Science • Age {baseline.age}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>Displaced student status</div>
              </div>
            </div>
          </div>

          {/* Baseline Risk Readout */}
          <div style={{ marginTop: '20px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', padding: '14px', borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#F87171', fontWeight: 700 }}>
              Status Quo Dropout Risk
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#EF4444' }}>
              {baseRisk}%
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Graduation Likelihood: <b>{simulationResult?.baseline?.graduation_likelihood || 0}%</b>
            </div>
          </div>

        </div>

        {/* COLUMN 2: Interactive Policy Intervention Controls */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sliders size={18} color="var(--brand-primary)" />
              <span>2. Strategic Policy Levers</span>
            </h3>
            <span style={{ fontSize: '0.74rem', color: 'var(--brand-primary-hover)', fontWeight: 600 }}>
              Live Simulating
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Lever 1: Peer Tutoring Grade Boost */}
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="slider-header">
                <span style={{ fontWeight: 700, fontSize: '0.84rem' }}>📚 Peer Tutoring Grade Improvement</span>
                <span className="slider-val">+{gradeBoost.toFixed(1)} pts</span>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '4px 0 8px 0' }}>
                Simulates assigning a bi-weekly peer mentor in struggling subjects.
              </p>
              <input 
                type="range" min="0" max="10" step="0.5" 
                value={gradeBoost} 
                onChange={(e) => setGradeBoost(parseFloat(e.target.value))} 
              />
              <div style={{ fontSize: '0.74rem', color: 'var(--brand-primary-hover)', textAlign: 'right' }}>
                Target Sem 2 Grade: <b>{(baseline.sem2_grade + gradeBoost).toFixed(1)} / 20</b>
              </div>
            </div>

            {/* Lever 2: Credit Recovery / Approved Units Boost */}
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="slider-header">
                <span style={{ fontWeight: 700, fontSize: '0.84rem' }}>🎯 Additional Course Units Passed</span>
                <span className="slider-val">+{unitsApprovedBoost} units</span>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '4px 0 8px 0' }}>
                Simulates retake exam pass rate and assignment completion.
              </p>
              <input 
                type="range" min="0" max="5" step="1" 
                value={unitsApprovedBoost} 
                onChange={(e) => setUnitsApprovedBoost(parseInt(e.target.value))} 
              />
              <div style={{ fontSize: '0.74rem', color: 'var(--brand-teal)', textAlign: 'right' }}>
                Target Approved Units: <b>{Math.min(baseline.sem2_enrolled, baseline.sem2_approved + unitsApprovedBoost)} / {baseline.sem2_enrolled}</b>
              </div>
            </div>

            {/* Lever 3: Financial Relief Toggles */}
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.84rem', marginBottom: '10px' }}>
                💵 Financial Aid & Bursar Interventions
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.82rem' }}>
                  <input 
                    type="checkbox" 
                    checked={clearTuitionDebt} 
                    onChange={(e) => setClearTuitionDebt(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#0EA5E9' }}
                  />
                  <span>Approve Emergency Tuition Grant (Clear Debt & Holds)</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.82rem' }}>
                  <input 
                    type="checkbox" 
                    checked={grantScholarship} 
                    onChange={(e) => setGrantScholarship(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#0EA5E9' }}
                  />
                  <span>Nominate for Department Merit/Need Scholarship</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.82rem' }}>
                  <input 
                    type="checkbox" 
                    checked={reduceCourseLoad} 
                    onChange={(e) => setReduceCourseLoad(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#0EA5E9' }}
                  />
                  <span>Recalibrate Overload (Drop 1 High-Friction Elective)</span>
                </label>
              </div>
            </div>

          </div>
        </div>

        {/* COLUMN 3: Simulated Live Impact & Delta Meter */}
        <div className="glass-panel" style={{ padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>3. Simulated Impact Forecast</h3>
              <span className="risk-badge-safe" style={{ fontSize: '0.72rem' }}>Post-Intervention</span>
            </div>

            {/* Big Delta Comparison Meter */}
            <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)', padding: '18px', borderRadius: '12px', textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#34D399', fontWeight: 700 }}>
                Forecasted Dropout Risk
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: simRisk < 25 ? '#10B981' : simRisk < 50 ? '#F59E0B' : '#EF4444', margin: '4px 0' }}>
                {simRisk}%
              </div>
              
              {/* Delta Tag */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: isReduced ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', padding: '4px 12px', borderRadius: '99px', color: isReduced ? '#34D399' : '#F87171', fontWeight: 700, fontSize: '0.84rem' }}>
                <TrendingDown size={15} />
                <span>{deltaRisk > 0 ? `+${deltaRisk}%` : `${deltaRisk}%`} Risk Reduction</span>
              </div>
            </div>

            {/* Comparison Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Graduation Likelihood:</span>
                <span style={{ fontWeight: 700, color: '#10B981' }}>
                  {simulationResult?.simulated?.graduation_likelihood || 0}% 
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}> (from {simulationResult?.baseline?.graduation_likelihood || 0}%)</span>
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Credit Approval Rate:</span>
                <span style={{ fontWeight: 700 }}>
                  {simulationResult?.simulated?.summary_metrics?.overall_approval_rate || 0}%
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Risk Classification:</span>
                <span className={simRisk < 25 ? 'risk-badge-safe' : simRisk < 50 ? 'risk-badge-moderate' : 'risk-badge-high'} style={{ fontSize: '0.72rem' }}>
                  {simulationResult?.simulated?.risk_badge || 'On Track'}
                </span>
              </div>
            </div>

          </div>

          {/* AI Advisor Prescription Summary */}
          <div style={{ marginTop: '16px', background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.2)', padding: '12px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38BDF8', fontWeight: 700, fontSize: '0.8rem', marginBottom: '4px' }}>
              <Sparkles size={14} />
              <span>Retention Advisor Recommendation</span>
            </div>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Combining <b>Peer Tutoring (+{gradeBoost.toFixed(1)} pts)</b> with <b>Tuition Debt Clearance</b> successfully shifts this student from the <b>Critical Dropout Risk tier into the Safe / On-Track cohort</b>.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
