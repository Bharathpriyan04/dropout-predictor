import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DashboardView from './components/DashboardView';
import PredictorView from './components/PredictorView';
import WhatIfView from './components/WhatIfView';
import BatchView from './components/BatchView';
import StudentsView from './components/StudentsView';
import ModelGovernanceView from './components/ModelGovernanceView';
import StudentProfileModal from './components/StudentProfileModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedModel, setSelectedModel] = useState('Stacking Ensemble');
  const [availableModels, setAvailableModels] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  // Load initial health and analytics data
  const loadInitialData = async () => {
    try {
      const [healthResp, analyticsResp] = await Promise.all([
        fetch('http://localhost:8000/api/health'),
        fetch('http://localhost:8000/api/analytics/overview')
      ]);

      if (healthResp.ok) {
        const health = await healthResp.json();
        setAvailableModels(health.available_models || ['Stacking Ensemble', 'LightGBM', 'XGBoost', 'Random Forest', 'Extra Trees', 'MLP Neural Net']);
      }

      if (analyticsResp.ok) {
        const analyticsData = await analyticsResp.json();
        setAnalytics(analyticsData);
      }
    } catch (err) {
      console.error("Initial data load error:", err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      const resp = await fetch('http://localhost:8000/api/export/pdf-report', {
        method: 'POST'
      });
      if (resp.ok) {
        const blob = await resp.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Student_Dropout_Risk_Executive_Report_${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error("Export PDF error:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="app-container">
      {/* Top Enterprise Navbar */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        availableModels={availableModels}
        onExportPdf={handleExportPdf}
        isExporting={isExporting}
      />

      {/* Main Module Content */}
      <main className="main-content">
        {activeTab === 'dashboard' && (
          <DashboardView 
            analytics={analytics} 
            onSelectStudent={(id) => setSelectedStudentId(id)}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'predictor' && (
          <PredictorView 
            selectedModel={selectedModel}
            onSaveStudent={() => loadInitialData()}
          />
        )}

        {activeTab === 'whatif' && (
          <WhatIfView 
            selectedModel={selectedModel}
          />
        )}

        {activeTab === 'batch' && (
          <BatchView 
            selectedModel={selectedModel}
            onSelectStudent={(id) => setSelectedStudentId(id)}
          />
        )}

        {activeTab === 'students' && (
          <StudentsView 
            onSelectStudent={(id) => setSelectedStudentId(id)}
          />
        )}

        {activeTab === 'governance' && (
          <ModelGovernanceView 
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
          />
        )}
      </main>

      {/* Student 360 Case Modal */}
      {selectedStudentId && (
        <StudentProfileModal 
          studentId={selectedStudentId}
          onClose={() => setSelectedStudentId(null)}
          onInterventionAdded={() => loadInitialData()}
        />
      )}
    </div>
  );
}
