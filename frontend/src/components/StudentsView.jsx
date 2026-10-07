import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, Plus, Eye, ChevronRight, 
  AlertTriangle, ShieldCheck, Clock, BookOpen, DollarSign, UserPlus
} from 'lucide-react';

export default function StudentsView({ onSelectStudent }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Student Form State
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    department: 'Computer Science & Engineering',
    age: 20,
    gender: 1,
    attendance: 1,
    scholarship: 0,
    tuition_ok: 1,
    debtor: 0,
    displaced: 0,
    admission_grade: 130,
    prev_grade: 125,
    sem1_enrolled: 6,
    sem1_approved: 5,
    sem1_grade: 12.5,
    sem1_evals: 6,
    sem2_enrolled: 6,
    sem2_approved: 4,
    sem2_grade: 11.5,
    sem2_evals: 7
  });

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const resp = await fetch('http://localhost:8000/api/students');
      if (resp.ok) {
        const json = await resp.json();
        setStudents(json);
      }
    } catch (err) {
      console.error("Students load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    try {
      const resp = await fetch('http://localhost:8000/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudent)
      });
      if (resp.ok) {
        setShowAddModal(false);
        fetchStudents();
      }
    } catch (err) {
      console.error("Create student error:", err);
    }
  };

  let filtered = students;
  if (deptFilter !== 'ALL') {
    filtered = filtered.filter(s => s.department === deptFilter);
  }
  if (riskFilter !== 'ALL') {
    filtered = filtered.filter(s => s.prediction?.risk_tier === riskFilter);
  }
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(s => 
      s.name.toLowerCase().includes(q) || 
      s.id.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.department.toLowerCase().includes(q)
    );
  }

  const departments = Array.from(new Set(students.map(s => s.department)));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, marginBottom: '4px' }}>
            Institutional Student Directory & Case Registry
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Comprehensive longitudinal tracking, early warning classifications, and multi-department case management.
          </p>
        </div>

        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          <UserPlus size={15} />
          <span>Register New Student</span>
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        
        {/* Search */}
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search students, IDs, departments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '36px' }}
          />
        </div>

        {/* Department and Risk Filter Dropdowns */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select 
            className="form-control" 
            value={deptFilter} 
            onChange={(e) => setDeptFilter(e.target.value)}
            style={{ width: '220px', fontSize: '0.82rem' }}
          >
            <option value="ALL">All Departments</option>
            {departments.map((d, i) => (
              <option key={i} value={d}>{d}</option>
            ))}
          </select>

          <select 
            className="form-control" 
            value={riskFilter} 
            onChange={(e) => setRiskFilter(e.target.value)}
            style={{ width: '180px', fontSize: '0.82rem' }}
          >
            <option value="ALL">All Risk Tiers</option>
            <option value="CRITICAL_HIGH">🔴 Critical High Risk</option>
            <option value="MODERATE_WARNING">🟡 Moderate Warning</option>
            <option value="LOW_SAFE">🟢 Safe / On Track</option>
          </select>
        </div>

      </div>

      {/* Student Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '16px' }}>
        {filtered && filtered.length > 0 ? (
          filtered.map((s) => {
            const pred = s.prediction;
            const riskScore = pred?.dropout_risk_score || 0;
            const borderCol = riskScore >= 55 ? 'var(--risk-critical)' : riskScore >= 25 ? 'var(--risk-warning)' : 'var(--border-card)';

            return (
              <div 
                key={s.id} 
                className="glass-panel glass-card-interactive" 
                style={{ padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: `3px solid ${borderCol}` }}
                onClick={() => onSelectStudent(s.id)}
              >
                <div>
                  {/* Top Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <img 
                        src={s.avatar} 
                        alt={s.name} 
                        style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.96rem' }}>{s.name}</div>
                        <div className="mono" style={{ fontSize: '0.74rem', color: 'var(--brand-primary-hover)' }}>{s.id}</div>
                      </div>
                    </div>

                    <span className={riskScore >= 55 ? 'risk-badge-high' : riskScore >= 25 ? 'risk-badge-moderate' : 'risk-badge-safe'} style={{ fontSize: '0.72rem' }}>
                      {riskScore}% Risk
                    </span>
                  </div>

                  {/* Department & Cohort */}
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                    {s.department}
                  </div>

                  {/* Mini Metrics */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Sem 1 Grade</div>
                      <div style={{ fontWeight: 700, fontSize: '0.84rem' }}>{s.sem1_grade} / 20</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Sem 2 Grade</div>
                      <div style={{ fontWeight: 700, fontSize: '0.84rem', color: s.sem2_grade < 10 ? '#F87171' : 'var(--text-primary)' }}>
                        {s.sem2_grade} / 20
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Tuition Hold</div>
                      <div style={{ fontWeight: 700, fontSize: '0.84rem', color: s.tuition_ok === 1 ? '#34D399' : '#F87171' }}>
                        {s.tuition_ok === 1 ? 'Clear' : 'Hold'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)', fontSize: '0.76rem' }}>
                  <span style={{ color: 'var(--brand-teal)', fontWeight: 600 }}>
                    {s.interventions?.length || 0} Cases Logged
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--brand-primary-hover)', fontWeight: 700 }}>
                    <span>Open Case</span>
                    <ChevronRight size={14} />
                  </div>
                </div>

              </div>
            );
          })
        ) : (
          <div style={{ gridColumn: '1 / -1', padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No students found matching current filters.
          </div>
        )}
      </div>

      {/* Register New Student Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '14px' }}>Register New Student into System</h3>
            
            <form onSubmit={handleCreateStudent} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">Student Full Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">University Email</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    required 
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">Faculty / Department</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    value={newStudent.department}
                    onChange={(e) => setNewStudent({ ...newStudent, department: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Age at Enrollment</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={newStudent.age}
                    onChange={(e) => setNewStudent({ ...newStudent, age: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="form-label">Sem 1 Grade</label>
                  <input 
                    type="number" step="0.1" className="form-control" 
                    value={newStudent.sem1_grade}
                    onChange={(e) => setNewStudent({ ...newStudent, sem1_grade: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="form-label">Sem 1 Approved</label>
                  <input 
                    type="number" className="form-control" 
                    value={newStudent.sem1_approved}
                    onChange={(e) => setNewStudent({ ...newStudent, sem1_approved: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="form-label">Sem 2 Grade</label>
                  <input 
                    type="number" step="0.1" className="form-control" 
                    value={newStudent.sem2_grade}
                    onChange={(e) => setNewStudent({ ...newStudent, sem2_grade: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="form-label">Sem 2 Approved</label>
                  <input 
                    type="number" className="form-control" 
                    value={newStudent.sem2_approved}
                    onChange={(e) => setNewStudent({ ...newStudent, sem2_approved: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">Tuition Status</label>
                  <select 
                    className="form-control"
                    value={newStudent.tuition_ok}
                    onChange={(e) => setNewStudent({ ...newStudent, tuition_ok: parseFloat(e.target.value) })}
                  >
                    <option value={1}>✅ Up to Date (No Hold)</option>
                    <option value={0}>❌ Arrears / Unpaid Hold</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Scholarship Status</label>
                  <select 
                    className="form-control"
                    value={newStudent.scholarship}
                    onChange={(e) => setNewStudent({ ...newStudent, scholarship: parseFloat(e.target.value) })}
                  >
                    <option value={0}>No Scholarship</option>
                    <option value={1}>🎓 Active Scholarship Holder</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Register Student</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
