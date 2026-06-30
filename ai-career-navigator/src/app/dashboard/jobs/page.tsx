"use client";

import { useState, useEffect } from "react";

const STATUSES = [
  "Applied",
  "Screening",
  "Technical Interview",
  "HR Interview",
  "Offer",
  "Hired",
  "Rejected",
] as const;

type JobStatus = typeof STATUSES[number];

const STATUS_COLOR: Record<string, string> = {
  Applied: "#6366f1",
  Screening: "#f59e0b",
  "Technical Interview": "#3b82f6",
  "HR Interview": "#8b5cf6",
  Offer: "#10b981",
  Hired: "#059669",
  Rejected: "#ef4444",
};

interface Job {
  id: string;
  company: string;
  position: string;
  status: JobStatus;
  notes?: string;
  appliedDate: string;
  salary?: string;
  location?: string;
  priority: string;
  jobUrl?: string;
}

const PRIORITIES = ["Low", "Medium", "High"];
const PRIORITY_COLOR: Record<string, string> = {
  Low: "#64748b",
  Medium: "#f59e0b",
  High: "#ef4444",
};

function JobCard({ job, onEdit, onDelete, onStatusChange }: {
  job: Job;
  onEdit: (job: Job) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: JobStatus) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className="kanban-card"
      style={{ position: "relative" }}
      draggable
      onDragStart={(e) => e.dataTransfer.setData("jobId", job.id)}
    >
      {/* Priority dot */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: PRIORITY_COLOR[job.priority],
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {job.priority}
          </span>
        </div>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: "none",
            border: "none",
            color: "var(--text-muted)",
            cursor: "pointer",
            fontSize: "16px",
            padding: "0 4px",
            lineHeight: 1,
          }}
        >
          ⋯
        </button>

        {menuOpen && (
          <div
            style={{
              position: "absolute",
              top: "32px",
              right: "8px",
              background: "var(--surface-elevated)",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              padding: "4px",
              zIndex: 10,
              minWidth: "140px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            }}
          >
            <button
              onClick={() => { onEdit(job); setMenuOpen(false); }}
              style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 12px", background: "none", border: "none", color: "var(--text-primary)", fontSize: "13px", cursor: "pointer", borderRadius: "6px" }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-hover)")}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}
            >
              ✏️ Edit
            </button>
            <button
              onClick={() => { onDelete(job.id); setMenuOpen(false); }}
              style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 12px", background: "none", border: "none", color: "#f87171", fontSize: "13px", cursor: "pointer", borderRadius: "6px" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.1)")}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}
            >
              🗑️ Delete
            </button>
          </div>
        )}
      </div>

      <div style={{ fontSize: "14px", fontWeight: 700, marginBottom: "4px", lineHeight: 1.3 }}>
        {job.position}
      </div>
      <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "8px" }}>
        🏢 {job.company}
      </div>

      {job.location && (
        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "6px" }}>
          📍 {job.location}
        </div>
      )}
      {job.salary && (
        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "6px" }}>
          💰 {job.salary}
        </div>
      )}

      <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "8px" }}>
        Applied {new Date(job.appliedDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
      </div>
    </div>
  );
}

function AddJobModal({ onClose, onSave, editJob }: {
  onClose: () => void;
  onSave: (job: Partial<Job>) => void;
  editJob?: Job | null;
}) {
  const [form, setForm] = useState({
    company: editJob?.company || "",
    position: editJob?.position || "",
    status: editJob?.status || "Applied" as JobStatus,
    notes: editJob?.notes || "",
    salary: editJob?.salary || "",
    location: editJob?.location || "",
    jobUrl: editJob?.jobUrl || "",
    priority: editJob?.priority || "Medium",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 700 }}>
            {editJob ? "Edit Application" : "Add Job Application"}
          </h2>
          <button onClick={onClose} className="btn-ghost" style={{ padding: "6px 10px", fontSize: "18px" }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label className="label">Company *</label>
              <input className="input" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="Google" required />
            </div>
            <div>
              <label className="label">Position *</label>
              <input className="input" value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} placeholder="Software Engineer" required />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value as JobStatus })}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Priority</label>
              <select className="input" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label className="label">Location</label>
              <input className="input" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Remote / NYC" />
            </div>
            <div>
              <label className="label">Salary Range</label>
              <input className="input" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} placeholder="$80k - $120k" />
            </div>
          </div>

          <div>
            <label className="label">Job URL</label>
            <input className="input" type="url" value={form.jobUrl} onChange={e => setForm({ ...form, jobUrl: e.target.value })} placeholder="https://..." />
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea className="input" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Recruiter contact, interview notes, follow-up reminders..." rows={3} />
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "8px" }}>
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">
              {editJob ? "Save Changes" : "Add Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editJob, setEditJob] = useState<Job | null>(null);
  const [view, setView] = useState<"kanban" | "list">("kanban");

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetch("/api/jobs");
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData: Partial<Job>) => {
    const url = editJob ? `/api/jobs/${editJob.id}` : "/api/jobs";
    const method = editJob ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      await fetchJobs();
      setShowModal(false);
      setEditJob(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this application?")) return;
    await fetch(`/api/jobs/${id}`, { method: "DELETE" });
    setJobs(jobs.filter(j => j.id !== id));
  };

  const handleStatusChange = async (id: string, status: JobStatus) => {
    const res = await fetch(`/api/jobs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) setJobs(jobs.map(j => j.id === id ? { ...j, status } : j));
  };

  const handleDrop = async (e: React.DragEvent, newStatus: JobStatus) => {
    e.preventDefault();
    const jobId = e.dataTransfer.getData("jobId");
    if (jobId) await handleStatusChange(jobId, newStatus);
  };

  const jobsByStatus = STATUSES.reduce((acc, status) => {
    acc[status] = jobs.filter(j => j.status === status);
    return acc;
  }, {} as Record<string, Job[]>);

  return (
    <div>
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "4px" }}>Job Tracker</h1>
            <p style={{ color: "var(--text-secondary)" }}>
              {jobs.length} application{jobs.length !== 1 ? "s" : ""} tracked
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ display: "flex", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "10px", overflow: "hidden" }}>
              {(["kanban", "list"] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  style={{
                    padding: "8px 16px",
                    background: view === v ? "var(--primary)" : "none",
                    border: "none",
                    color: view === v ? "white" : "var(--text-secondary)",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: 500,
                    transition: "all 0.15s",
                    textTransform: "capitalize",
                  }}
                >
                  {v === "kanban" ? "🗂️" : "📋"} {v}
                </button>
              ))}
            </div>
            <button
              className="btn-primary"
              onClick={() => { setEditJob(null); setShowModal(true); }}
            >
              ➕ Add Application
            </button>
          </div>
        </div>
      </div>

      <div className="page-content">
        {loading ? (
          <div style={{ display: "flex", gap: "16px" }}>
            {STATUSES.slice(0, 5).map(s => (
              <div key={s} style={{ minWidth: "220px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "14px", padding: "16px" }}>
                <div className="skeleton" style={{ height: "16px", width: "80%", marginBottom: "16px" }} />
                {[1, 2].map(i => (
                  <div key={i} className="skeleton" style={{ height: "80px", borderRadius: "10px", marginBottom: "10px" }} />
                ))}
              </div>
            ))}
          </div>
        ) : view === "kanban" ? (
          <div className="kanban-board">
            {STATUSES.map(status => (
              <div
                key={status}
                className="kanban-column"
                onDragOver={e => e.preventDefault()}
                onDrop={e => handleDrop(e, status)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: STATUS_COLOR[status] }} />
                    <span style={{ fontSize: "13px", fontWeight: 600 }}>{status}</span>
                  </div>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      background: `${STATUS_COLOR[status]}22`,
                      color: STATUS_COLOR[status],
                      border: `1px solid ${STATUS_COLOR[status]}44`,
                      borderRadius: "20px",
                      padding: "2px 8px",
                    }}
                  >
                    {jobsByStatus[status].length}
                  </span>
                </div>

                {jobsByStatus[status].length === 0 && (
                  <div
                    style={{
                      border: "2px dashed var(--border)",
                      borderRadius: "10px",
                      padding: "24px",
                      textAlign: "center",
                      color: "var(--text-muted)",
                      fontSize: "12px",
                    }}
                  >
                    Drop here
                  </div>
                )}

                {jobsByStatus[status].map(job => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onEdit={(j) => { setEditJob(j); setShowModal(true); }}
                    onDelete={handleDelete}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            ))}
          </div>
        ) : (
          /* List view */
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Position</th>
                  <th>Company</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Location</th>
                  <th>Applied</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)" }}>
                      No applications yet. Click "Add Application" to get started.
                    </td>
                  </tr>
                ) : (
                  jobs.map(job => (
                    <tr key={job.id}>
                      <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{job.position}</td>
                      <td>{job.company}</td>
                      <td>
                        <span style={{
                          padding: "3px 10px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: 500,
                          background: `${STATUS_COLOR[job.status]}22`,
                          color: STATUS_COLOR[job.status],
                          border: `1px solid ${STATUS_COLOR[job.status]}44`,
                        }}>
                          {job.status}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: "12px", color: PRIORITY_COLOR[job.priority], fontWeight: 600 }}>
                          {job.priority}
                        </span>
                      </td>
                      <td>{job.location || "—"}</td>
                      <td>{new Date(job.appliedDate).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button onClick={() => { setEditJob(job); setShowModal(true); }} className="btn-ghost" style={{ padding: "4px 10px", fontSize: "12px" }}>Edit</button>
                          <button onClick={() => handleDelete(job.id)} className="btn-ghost" style={{ padding: "4px 10px", fontSize: "12px", color: "var(--danger)" }}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <AddJobModal
          onClose={() => { setShowModal(false); setEditJob(null); }}
          onSave={handleSave}
          editJob={editJob}
        />
      )}
    </div>
  );
}
