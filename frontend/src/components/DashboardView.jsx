import React, { useState, useEffect } from 'react';
import { 
  Users, AlertTriangle, ShieldCheck, TrendingUp, 
  ArrowUpRight, Building2, Clock, CheckCircle2, ChevronRight, Activity, Award
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid 
} from 'recharts';

export default function DashboardView({ analytics, onSelectStudent, setActiveTab }) {
  const kpis = analytics?.kpis || {
    total_students_monitored: 8,
    critical_at_risk_count: 2,
    critical_at_risk_rate: 25.0,
    moderate_attention_count: 2,
    moderate_attention_rate: 25.0,
    on_track_count: 4,
    on_track_rate: 50.0,
    average_institutional_retention_rate: 75.0,
    active_interventions_count: 5
  };

  const departments = analytics?.departments || [
    { department: "Mechanical Engineering", total_students: 1, at_risk_students: 1, at_risk_percentage: 100.0, average_risk_score: 98.2 },
    { department: "Computer Science & Engineering", total_students: 1, at_risk_students: 1, at_risk_percentage: 100.0, average_risk_score: 96.5 },
    { department: "Psychology & Cognitive Science", total_students: 1, at_risk_students: 0, at_risk_percentage: 0.0, average_risk_score: 38.0 },
    { department: "Business Administration", total_students: 1, at_risk_students: 0, at_risk_percentage: 0.0, average_risk_score: 28.5 },
    { department: "Biomedical & Health Sciences", total_students: 1, at_risk_students: 0, at_risk_percentage: 0.0, average_risk_score: 2.4 }
  ];

  const riskDistributionData = [
    { name: 'Critical High Risk', value: kpis.critical_at_risk_count, color: '#EF4444' },
    { name: 'Moderate Warning', value: kpis.moderate_attention_count, color: '#F59E0B' },
    { name: 'On Track / Safe', value: kpis.on_track_count, color: '#10B981' },
  ];

  const retentionProgressionData = [
    { semester: 'Sem 1 Start', retentionRate: 100, enrolledStudents: 1000 },
    { semester: 'Sem 1 Midterm', retentionRate: 96, enrolledStudents: 960 },
    { semester: 'Sem 1 Finals', retentionRate: 91, enrolledStudents: 910 },
    { semester: 'Sem 2 Start', retentionRate: 88, enrolledStudents: 880 },
    { semester: 'Sem 2 Midterm', retentionRate: 84, enrolledStudents: 840 },
    { semester: 'Sem 2 Finals (Forecast)', retentionRate: 82.5, enrolledStudents: 825 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Banner / Header Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, marginBottom: '4px' }}>
            Executive Retention & Early Warning Radar
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Real-time machine learning monitoring across campus cohorts, faculty departments, and financial risk vectors.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" onClick={() => setActiveTab('predictor')}>
            <TrendingUp size={15} />
            <span>Run New Prediction</span>
          </button>
          <button className="btn-primary" onClick={() => setActiveTab('batch')}>
            <Users size={15} />
            <span>Process Batch Cohort</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        <div className="glass-panel kpi-card kpi-danger">
          <div className="kpi-label">
            <span>Critical At-Risk</span>
            <AlertTriangle size={18} color="#EF4444" />
          </div>
          <div className="kpi-value" style={{ color: '#EF4444' }}>
            {kpis.critical_at_risk_count} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>({kpis.critical_at_risk_rate}%)</span>
          </div>
          <div className="kpi-subtext">Immediate retention intervention required</div>
        </div>

        <div className="glass-panel kpi-card kpi-warning">
          <div className="kpi-label">
            <span>Moderate Attention</span>
            <Clock size={18} color="#F59E0B" />
          </div>
          <div className="kpi-value" style={{ color: '#F59E0B' }}>
            {kpis.moderate_attention_count} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>({kpis.moderate_attention_rate}%)</span>
          </div>
          <div className="kpi-subtext">Credit deficit or downward grade momentum</div>
        </div>

        <div className="glass-panel kpi-card kpi-success">
          <div className="kpi-label">
            <span>On Track / Safe</span>
            <ShieldCheck size={18} color="#10B981" />
          </div>
          <div className="kpi-value" style={{ color: '#10B981' }}>
            {kpis.on_track_count} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>({kpis.on_track_rate}%)</span>
          </div>
          <div className="kpi-subtext">Satisfactory academic and financial standing</div>
        </div>

        <div className="glass-panel kpi-card">
          <div className="kpi-label">
            <span>Active Interventions</span>
            <Award size={18} color="#0EA5E9" />
          </div>
          <div className="kpi-value" style={{ color: '#38BDF8' }}>
            {kpis.active_interventions_count}
          </div>
          <div className="kpi-subtext">Tutoring, bursar grants & counseling cases</div>
        </div>
      </div>

      {/* Charts Section: Department Risk Matrix + Risk Distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        
        {/* Department At-Risk Comparison Bar Chart */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Faculty / Department Risk Index</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Mean predicted dropout probability (%) by academic program</p>
            </div>
            <span className="risk-badge-moderate" style={{ fontSize: '0.72rem' }}>Live Model Sync</span>
          </div>

          <div style={{ height: '260px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departments} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} stroke="#64748B" tickFormatter={(v) => `${v}%`} />
                <YAxis dataKey="department" type="category" stroke="#94A3B8" width={160} tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#FFF' }}
                  formatter={(val) => [`${val}%`, 'Avg Dropout Risk']}
                />
                <Bar dataKey="average_risk_score" fill="#0EA5E9" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cohort Risk Breakdown Doughnut */}
        <div className="glass-panel" style={{ padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '4px' }}>Cohort Health Ratio</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Distribution of evaluated students</p>
          </div>

          <div style={{ height: '180px', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#FFF' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 800 }}>{kpis.total_students_monitored}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Students</span>
            </div>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem' }}>
            {riskDistributionData.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }}></div>
                  <span style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
                </div>
                <span style={{ fontWeight: 700 }}>{item.value} ({roundPct(item.value, kpis.total_students_monitored)}%)</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Retention Attrition Funnel + High Priority Flagged Students */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* Retention Funnel Progression */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Semester Retention Progression Curve</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Historical & forecasted cohort persistence (%)</p>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--brand-teal)', fontWeight: 600 }}>+4.2% vs Last Year</span>
          </div>

          <div style={{ height: '220px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={retentionProgressionData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="semester" stroke="#64748B" tick={{ fontSize: 10 }} />
                <YAxis domain={[75, 100]} stroke="#64748B" tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#FFF' }}
                  formatter={(val) => [`${val}%`, 'Retention Rate']}
                />
                <Line type="monotone" dataKey="retentionRate" stroke="#0EA5E9" strokeWidth={3} dot={{ fill: '#38BDF8', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Intervention Radar Feed */}
        <div className="glass-panel" style={{ padding: '22px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>High Priority Action Queue</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Students flagged by Champion Ensemble</p>
            </div>
            <button 
              className="btn-secondary" 
              style={{ padding: '4px 10px', fontSize: '0.74rem' }}
              onClick={() => setActiveTab('students')}
            >
              View All Cases
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Marcus Vance */}
            <div 
              className="glass-panel glass-card-interactive" 
              style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '4px solid #EF4444' }}
              onClick={() => onSelectStudent('STU-8041')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#EF444420', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.82rem' }}>
                  MV
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>Marcus Vance (STU-8041)</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Computer Science • Tuition Hold + Grade Deficit (7.2/20)</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="risk-badge-high">96.5% Risk</span>
                <ChevronRight size={16} color="var(--text-muted)" />
              </div>
            </div>

            {/* Lucas Santos */}
            <div 
              className="glass-panel glass-card-interactive" 
              style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '4px solid #EF4444' }}
              onClick={() => onSelectStudent('STU-8045')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#EF444420', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.82rem' }}>
                  LS
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>Lucas Santos (STU-8045)</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Mechanical Eng. • 0 Sem 2 Approvals + Bursar Debt</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="risk-badge-high">98.2% Risk</span>
                <ChevronRight size={16} color="var(--text-muted)" />
              </div>
            </div>

            {/* Devon Miller */}
            <div 
              className="glass-panel glass-card-interactive" 
              style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '4px solid #F59E0B' }}
              onClick={() => onSelectStudent('STU-8043')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#F59E0B20', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.82rem' }}>
                  DM
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>Devon Miller (STU-8043)</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Business Admin • Evening Attendance • 3/6 Units Passed</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="risk-badge-moderate">38.0% Risk</span>
                <ChevronRight size={16} color="var(--text-muted)" />
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}

function roundPct(count, total) {
  if (!total) return 0;
  return Math.round((count / total) * 100);
}
