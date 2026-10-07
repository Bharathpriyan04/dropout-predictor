import React from 'react';
import { 
  GraduationCap, LayoutDashboard, Target, Sliders, 
  FileSpreadsheet, Users, Cpu, FileText, Download
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, selectedModel, setSelectedModel, availableModels, onExportPdf, isExporting }) {
  return (
    <header className="navbar">
      {/* Brand Identity */}
      <div className="brand-badge">
        <div className="brand-logo-icon">
          <GraduationCap size={22} />
        </div>
        <div>
          <h1 className="brand-title">AEGIS RETENTION</h1>
          <div className="brand-sub">Early Warning Intelligence Suite</div>
        </div>
      </div>

      {/* Navigation Modules */}
      <nav className="nav-tabs">
        <button 
          className={`nav-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <LayoutDashboard size={15} />
          <span>Dashboard</span>
        </button>

        <button 
          className={`nav-tab-btn ${activeTab === 'predictor' ? 'active' : ''}`}
          onClick={() => setActiveTab('predictor')}
        >
          <Target size={15} />
          <span>Risk Evaluator</span>
        </button>

        <button 
          className={`nav-tab-btn ${activeTab === 'whatif' ? 'active' : ''}`}
          onClick={() => setActiveTab('whatif')}
        >
          <Sliders size={15} />
          <span>What-If Sandbox</span>
        </button>

        <button 
          className={`nav-tab-btn ${activeTab === 'batch' ? 'active' : ''}`}
          onClick={() => setActiveTab('batch')}
        >
          <FileSpreadsheet size={15} />
          <span>Batch Cohort</span>
        </button>

        <button 
          className={`nav-tab-btn ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          <Users size={15} />
          <span>Student Cases</span>
        </button>

        <button 
          className={`nav-tab-btn ${activeTab === 'governance' ? 'active' : ''}`}
          onClick={() => setActiveTab('governance')}
        >
          <Cpu size={15} />
          <span>ML Models (97.97%)</span>
        </button>
      </nav>

      {/* Top Right Actions & Model Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Model Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.04)', padding: '5px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>MODEL:</span>
          <select 
            value={selectedModel} 
            onChange={(e) => setSelectedModel(e.target.value)}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'var(--brand-primary-hover)', 
              fontSize: '0.82rem', 
              fontWeight: 700,
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {availableModels && availableModels.length > 0 ? (
              availableModels.map(m => (
                <option key={m} value={m} style={{ background: '#0F172A', color: '#FFF' }}>
                  {m} {m === 'Stacking Ensemble' ? '⭐ (Champion)' : ''}
                </option>
              ))
            ) : (
              <option value="Stacking Ensemble" style={{ background: '#0F172A', color: '#FFF' }}>Stacking Ensemble ⭐</option>
            )}
          </select>
        </div>

        {/* Live System Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          <div className="pulse-dot"></div>
          <span style={{ fontWeight: 600 }}>Online</span>
        </div>

        {/* Export PDF Button */}
        <button 
          className="btn-primary" 
          onClick={onExportPdf}
          disabled={isExporting}
          style={{ padding: '7px 14px', fontSize: '0.82rem' }}
        >
          <Download size={14} />
          <span>{isExporting ? 'Generating...' : 'Export Report'}</span>
        </button>
      </div>
    </header>
  );
}
