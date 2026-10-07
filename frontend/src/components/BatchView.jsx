import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, Upload, Download, Search, Filter, 
  AlertTriangle, CheckCircle2, RefreshCw, Eye, ArrowUpDown, Sparkles
} from 'lucide-react';

export default function BatchView({ selectedModel, onSelectStudent }) {
  const [batchData, setBatchData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [sortField, setSortField] = useState('dropout_risk_score');
  const [sortAsc, setSortAsc] = useState(false);

  // Load sample benchmark cohort on mount
  const loadSampleCohort = async () => {
    setLoading(true);
    try {
      const resp = await fetch('http://localhost:8000/api/sample-cohort');
      if (resp.ok) {
        const json = await resp.json();
        setBatchData(json);
      }
    } catch (err) {
      console.error("Batch load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSampleCohort();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    if (selectedModel) formData.append('model_name', selectedModel);

    try {
      const resp = await fetch('http://localhost:8000/api/predict/batch', {
        method: 'POST',
        body: formData
      });
      if (resp.ok) {
        const json = await resp.json();
        setBatchData(json);
      }
    } catch (err) {
      console.error("File upload error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCsv = () => {
    if (!batchData || !batchData.students) return;
    
    const headers = ["Student_ID", "Student_Name", "Course_Name", "Predicted_Outcome", "Dropout_Risk_Score", "Risk_Tier", "Avg_Grade", "Approval_Rate", "Financial_Hold", "Recommended_Action"];
    const rows = batchData.students.map(s => [
      s.student_id,
      `"${s.student_name}"`,
      `"${s.course_name}"`,
      s.predicted_outcome,
      s.dropout_risk_score,
      s.risk_tier,
      s.avg_grade,
      s.approval_rate,
      s.financial_hold,
      `"${s.top_recommendation}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Student_Dropout_Risk_Cohort_Analysis_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const summary = batchData?.summary || {
    critical_high_risk_count: 0,
    critical_high_risk_percentage: 0,
    moderate_warning_count: 0,
    moderate_warning_percentage: 0,
    low_safe_count: 0,
    low_safe_percentage: 0,
    average_cohort_risk: 0,
    average_graduation_forecast: 0
  };

  let filteredStudents = batchData?.students || [];
  if (riskFilter !== 'ALL') {
    filteredStudents = filteredStudents.filter(s => s.risk_tier === riskFilter);
  }
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredStudents = filteredStudents.filter(s => 
      s.student_name.toLowerCase().includes(q) || 
      s.student_id.toLowerCase().includes(q) ||
      s.course_name.toLowerCase().includes(q)
    );
  }

  // Sort
  filteredStudents.sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    if (typeof valA === 'number') {
      return sortAsc ? valA - valB : valB - valA;
    }
    return sortAsc ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* View Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, marginBottom: '4px' }}>
            Batch Cohort Risk Analyzer
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Upload semester grade rosters (CSV / Excel) or evaluate institutional sample cohorts with high-throughput ensemble scoring.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" onClick={loadSampleCohort} disabled={loading}>
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>Reload Sample Cohort</span>
          </button>
          
          <label className="btn-primary" style={{ cursor: 'pointer' }}>
            <Upload size={15} />
            <span>{loading ? 'Processing...' : 'Upload Student CSV'}</span>
            <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>

          <button className="btn-secondary" onClick={handleDownloadCsv} disabled={!batchData}>
            <Download size={15} />
            <span>Export CSV Report</span>
          </button>
        </div>
      </div>

      {/* Cohort Summary KPI Cards */}
      <div className="kpi-grid">
        <div className="glass-panel kpi-card">
          <div className="kpi-label">
            <span>Total Cohort Students</span>
            <FileSpreadsheet size={18} color="var(--brand-primary)" />
          </div>
          <div className="kpi-value">{batchData?.total_students || 0}</div>
          <div className="kpi-subtext">Active student records processed</div>
        </div>

        <div className="glass-panel kpi-card kpi-danger">
          <div className="kpi-label">
            <span>Critical At-Risk</span>
            <AlertTriangle size={18} color="#EF4444" />
          </div>
          <div className="kpi-value" style={{ color: '#EF4444' }}>
            {summary.critical_high_risk_count} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>({summary.critical_high_risk_percentage}%)</span>
          </div>
          <div className="kpi-subtext">Urgent outreach required</div>
        </div>

        <div className="glass-panel kpi-card kpi-warning">
          <div className="kpi-label">
            <span>Moderate Attention</span>
            <Filter size={18} color="#F59E0B" />
          </div>
          <div className="kpi-value" style={{ color: '#F59E0B' }}>
            {summary.moderate_warning_count} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>({summary.moderate_warning_percentage}%)</span>
          </div>
          <div className="kpi-subtext">Progress monitoring list</div>
        </div>

        <div className="glass-panel kpi-card kpi-success">
          <div className="kpi-label">
            <span>Safe / On Track</span>
            <CheckCircle2 size={18} color="#10B981" />
          </div>
          <div className="kpi-value" style={{ color: '#10B981' }}>
            {summary.low_safe_count} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>({summary.low_safe_percentage}%)</span>
          </div>
          <div className="kpi-subtext">Satisfactory progression</div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        
        {/* Search Bar */}
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search by ID, name, or course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '36px' }}
          />
        </div>

        {/* Risk Filter Tabs */}
        <div style={{ display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <button 
            className={`btn-secondary ${riskFilter === 'ALL' ? 'active' : ''}`} 
            style={{ padding: '5px 12px', fontSize: '0.78rem', background: riskFilter === 'ALL' ? 'var(--brand-primary)' : 'transparent', color: riskFilter === 'ALL' ? '#FFF' : 'var(--text-secondary)' }}
            onClick={() => setRiskFilter('ALL')}
          >
            All Students ({batchData?.total_students || 0})
          </button>
          
          <button 
            className={`btn-secondary ${riskFilter === 'CRITICAL_HIGH' ? 'active' : ''}`} 
            style={{ padding: '5px 12px', fontSize: '0.78rem', background: riskFilter === 'CRITICAL_HIGH' ? '#EF4444' : 'transparent', color: riskFilter === 'CRITICAL_HIGH' ? '#FFF' : '#F87171' }}
            onClick={() => setRiskFilter('CRITICAL_HIGH')}
          >
            Critical Risk ({summary.critical_high_risk_count})
          </button>

          <button 
            className={`btn-secondary ${riskFilter === 'MODERATE_WARNING' ? 'active' : ''}`} 
            style={{ padding: '5px 12px', fontSize: '0.78rem', background: riskFilter === 'MODERATE_WARNING' ? '#F59E0B' : 'transparent', color: riskFilter === 'MODERATE_WARNING' ? '#FFF' : '#FBBF24' }}
            onClick={() => setRiskFilter('MODERATE_WARNING')}
          >
            Moderate ({summary.moderate_warning_count})
          </button>

          <button 
            className={`btn-secondary ${riskFilter === 'LOW_SAFE' ? 'active' : ''}`} 
            style={{ padding: '5px 12px', fontSize: '0.78rem', background: riskFilter === 'LOW_SAFE' ? '#10B981' : 'transparent', color: riskFilter === 'LOW_SAFE' ? '#FFF' : '#34D399' }}
            onClick={() => setRiskFilter('LOW_SAFE')}
          >
            Safe ({summary.low_safe_count})
          </button>
        </div>

      </div>

      {/* Main Student Data Table */}
      <div className="custom-table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th onClick={() => { setSortField('student_id'); setSortAsc(!sortAsc); }} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Student ID</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th>Student Name</th>
              <th>Program / Degree</th>
              <th onClick={() => { setSortField('dropout_risk_score'); setSortAsc(!sortAsc); }} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Dropout Risk</span>
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th>Risk Tier</th>
              <th>Sem 2 Avg</th>
              <th>Credit Approval</th>
              <th>Financial Hold</th>
              <th>Primary Recommendation</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents && filteredStudents.length > 0 ? (
              filteredStudents.map((s, idx) => (
                <tr key={idx}>
                  <td className="mono" style={{ color: 'var(--brand-primary-hover)', fontWeight: 600 }}>{s.student_id}</td>
                  <td style={{ fontWeight: 700 }}>{s.student_name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{s.course_name}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 800, color: s.risk_color, minWidth: '42px' }}>
                        {s.dropout_risk_score}%
                      </span>
                      <div style={{ width: '50px', height: '5px', background: 'rgba(255,255,255,0.1)', borderRadius: '99px', overflow: 'hidden' }}>
                        <div style={{ width: `${s.dropout_risk_score}%`, height: '100%', background: s.risk_color }}></div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={s.risk_tier === 'CRITICAL_HIGH' ? 'risk-badge-high' : s.risk_tier === 'MODERATE_WARNING' ? 'risk-badge-moderate' : 'risk-badge-safe'}>
                      {s.risk_badge}
                    </span>
                  </td>
                  <td className="mono">{s.avg_grade}/20</td>
                  <td className="mono">{s.approval_rate}%</td>
                  <td>
                    <span style={{ color: s.financial_hold === 'Yes' ? '#F87171' : '#34D399', fontWeight: 600 }}>
                      {s.financial_hold === 'Yes' ? '⚠️ Hold' : '✅ Clear'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', maxWidth: '200px' }}>
                    {s.top_recommendation}
                  </td>
                  <td>
                    <button 
                      className="btn-secondary" 
                      style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                      onClick={() => onSelectStudent(s.student_id)}
                    >
                      <Eye size={12} />
                      <span>360 Profile</span>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                  No students found matching current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
