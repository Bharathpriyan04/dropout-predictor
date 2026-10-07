import React, { useState, useEffect } from 'react';
import { 
  X, User, Mail, GraduationCap, DollarSign, BookOpen, 
  Calendar, CheckCircle, AlertTriangle, Plus, ShieldCheck, Sparkles, Send
} from 'lucide-react';

export default function StudentProfileModal({ studentId, onClose, onInterventionAdded }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Academic Advising');
  const [newNotes, setNewNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const fetchProfile = async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const resp = await fetch(`http://localhost:8000/api/students/${studentId}`);
      if (resp.ok) {
        const json = await resp.json();
        setProfile(json);
      }
    } catch (err) {
      console.error("Profile load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [studentId]);

  const handleAddIntervention = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setSubmitting(true);
    try {
      const resp = await fetch(`http://localhost:8000/api/students/${studentId}/interventions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          category: newCategory,
          notes: newNotes,
          author: "Academic Advisor",
          status: "In Progress"
        })
      });

      if (resp.ok) {
        setNewTitle('');
        setNewNotes('');
        setSuccessMsg(true);
        setTimeout(() => setSuccessMsg(false), 3000);
        fetchProfile();
        if (onInterventionAdded) onInterventionAdded();
      }
    } catch (err) {
      console.error("Intervention submit error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!studentId) return null;

  const stu = profile?.student;
  const pred = profile?.prediction;
  const riskScore = pred?.dropout_risk_score || 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <img 
              src={stu?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"} 
              alt={stu?.name} 
              style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-card)' }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{stu?.name || 'Loading Student...'}</h3>
                <span className="mono" style={{ fontSize: '0.78rem', color: 'var(--brand-primary-hover)', background: 'rgba(14,165,233,0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                  {stu?.id}
                </span>
              </div>
              <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {stu?.department} • Cohort {stu?.cohort_year || '2024'} • Semester {stu?.current_semester || 3}
              </div>
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Live Evaluation Risk Card */}
        <div style={{ background: riskScore >= 55 ? 'rgba(239,68,68,0.08)' : riskScore >= 25 ? 'rgba(245,158,11,0.08)' : 'rgba(16,185,129,0.08)', border: `1px solid ${pred?.risk_color || 'rgba(255,255,255,0.1)'}`, padding: '16px', borderRadius: '12px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
              Early Warning Classification
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: pred?.risk_color, margin: '2px 0' }}>
              {pred?.dropout_risk_score}% Dropout Probability
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Graduation Forecast: <b>{pred?.graduation_likelihood}%</b> • Status: <b>{pred?.risk_badge}</b>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span className={riskScore >= 55 ? 'risk-badge-high' : riskScore >= 25 ? 'risk-badge-moderate' : 'risk-badge-safe'} style={{ fontSize: '0.84rem', padding: '6px 12px' }}>
              {pred?.predicted_outcome}
            </span>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Model: {pred?.model_used}
            </div>
          </div>
        </div>

        {/* Academic & Financial Telemetry Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Semester 1 Grade</div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', marginTop: '2px' }}>{stu?.sem1_grade || 0} / 20</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Approved: {stu?.sem1_approved || 0}/{stu?.sem1_enrolled || 6} units</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Semester 2 Grade</div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', marginTop: '2px' }}>{stu?.sem2_grade || 0} / 20</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Approved: {stu?.sem2_approved || 0}/{stu?.sem2_enrolled || 6} units</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Financial Account</div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: stu?.tuition_ok === 1 ? '#34D399' : '#F87171', marginTop: '2px' }}>
              {stu?.tuition_ok === 1 ? '✅ Paid In Full' : '⚠️ Tuition Arrears'}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              Scholarship: {stu?.scholarship === 1 ? 'Active' : 'None'}
            </div>
          </div>
        </div>

        {/* Existing Interventions History */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={16} color="var(--brand-primary)" />
            <span>Logged Retention Interventions & Case Notes</span>
          </h4>

          {stu?.interventions && stu.interventions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {stu.interventions.map((inv, idx) => (
                <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', borderLeft: '3px solid var(--brand-primary)', padding: '10px 14px', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.84rem' }}>{inv.title}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{inv.date} • {inv.author}</span>
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>{inv.notes}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--brand-teal)', marginTop: '4px', fontWeight: 600 }}>Status: {inv.status}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '14px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
              No previous advisor interventions logged yet.
            </div>
          )}
        </div>

        {/* Log New Intervention Form */}
        <div style={{ background: 'rgba(15,23,42,0.8)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-card)' }}>
          <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px', color: '#38BDF8' }}>
            <Plus size={15} />
            <span>Log New Retention Action / Advisor Note</span>
          </h4>

          <form onSubmit={handleAddIntervention} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '10px' }}>
              <input 
                type="text" 
                className="form-control"
                placeholder="Intervention Title (e.g., Peer Tutoring Scheduled)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
              />
              <select 
                className="form-control"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              >
                <option value="Academic Advising">Academic Advising</option>
                <option value="Peer Tutoring">Peer Tutoring</option>
                <option value="Financial Aid Grant">Financial Aid Grant</option>
                <option value="Mental Wellbeing">Mental Wellbeing</option>
                <option value="Schedule Recalibration">Schedule Recalibration</option>
              </select>
            </div>

            <textarea 
              className="form-control"
              placeholder="Case details, agreed action items, and next check-in milestone..."
              rows={2}
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: '#10B981' }}>
                {successMsg ? '✅ Intervention logged to student record!' : ''}
              </span>
              <button 
                type="submit" 
                className="btn-primary" 
                disabled={submitting || !newTitle.trim()}
                style={{ padding: '7px 16px', fontSize: '0.82rem' }}
              >
                <Send size={13} />
                <span>{submitting ? 'Saving...' : 'Log Intervention'}</span>
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
