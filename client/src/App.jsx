import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Pencil, Trash2, Users, X, BriefcaseBusiness, Menu, ChevronDown } from "lucide-react";

const emptyLead = { name: "", email: "", phone: "", company: "", source: "Website", status: "New" };
const statuses = ["New", "Contacted", "Qualified", "Lost"];
const sources = ["Website", "Referral", "LinkedIn", "Cold Call", "Other"];

function App() {
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyLead);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [apiError, setApiError] = useState("");

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (filterStatus) params.set("status", filterStatus);
    return params.toString();
  }, [search, filterStatus]);

  async function loadLeads() {
    setLoading(true);
    try {
      const response = await fetch(`/api/leads${query ? `?${query}` : ""}`);
      if (!response.ok) throw new Error("Could not load leads. Is the API running?");
      setLeads(await response.json());
      setApiError("");
    } catch (error) { setApiError(error.message); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    const timer = setTimeout(loadLeads, 220);
    return () => clearTimeout(timer);
  }, [query]);

  function openAdd() {
    setEditing(null); setForm(emptyLead); setErrors({}); setModalOpen(true);
  }
  function openEdit(lead) {
    setEditing(lead.id);
    setForm({ name: lead.name, email: lead.email, phone: lead.phone, company: lead.company, source: lead.source, status: lead.status });
    setErrors({}); setModalOpen(true);
  }
  function validate() {
    const next = {};
    ["name", "email", "phone", "company", "source", "status"].forEach((key) => {
      if (!String(form[key] || "").trim()) next[key] = "This field is required";
    });
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = "Enter a valid email";
    setErrors(next);
    return Object.keys(next).length === 0;
  }
  async function saveLead(event) {
    event.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const response = await fetch(editing ? `/api/leads/${editing}` : "/api/leads", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = response.status === 204 ? null : await response.json();
      if (!response.ok) {
        setErrors(data.errors || {});
        throw new Error(data.message || "Unable to save lead");
      }
      setModalOpen(false);
      setNotice(editing ? "Lead updated successfully" : "Lead added successfully");
      setTimeout(() => setNotice(""), 2600);
      await loadLeads();
    } catch (error) { if (!Object.keys(errors).length) setApiError(error.message); }
    finally { setSaving(false); }
  }
  async function deleteLead(lead) {
    if (!window.confirm(`Delete ${lead.name}? This action cannot be undone.`)) return;
    try {
      const response = await fetch(`/api/leads/${lead.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Could not delete this lead");
      setNotice("Lead deleted successfully");
      setTimeout(() => setNotice(""), 2600);
      await loadLeads();
    } catch (error) { setApiError(error.message); }
  }
  const field = (key, label, type = "text") => (
    <label className="field" key={key}>
      <span>{label}<b> *</b></span>
      <input type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className={errors[key] ? "invalid" : ""} placeholder={`Enter ${label.toLowerCase()}`} />
      {errors[key] && <small>{errors[key]}</small>}
    </label>
  );

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-icon"><BriefcaseBusiness size={21}/></div><span>Lead<span className="brand-light">Flow</span></span></div>
      <div className="side-label">WORKSPACE</div>
      <div className="nav-item active"><Users size={18}/> <span>All Leads</span><span className="nav-count">{leads.length}</span></div>
      <div className="sidebar-bottom"><div className="help-card"><div className="help-icon">✦</div><strong>Keep your pipeline moving</strong><p>Track every conversation and turn prospects into customers.</p></div><div className="version">LeadFlow · v1.0</div></div>
    </aside>

    <main className="main">
      <header className="topbar"><div className="crumb">Workspace <span>/</span> <strong>All Leads</strong></div><div className="profile"><div className="avatar">S</div><div><strong>Sales Workspace</strong><small>Lead Manager</small></div><ChevronDown size={15}/></div></header>
      <section className="content">
        <div className="page-heading"><div><div className="eyebrow">SALES OVERVIEW</div><h1>Lead Management</h1><p>Manage and keep track of all your potential customers.</p></div><button className="primary-btn" onClick={openAdd}><Plus size={18}/> Add New Lead</button></div>
        <div className="summary-row"><div className="summary-card"><div className="summary-icon purple"><Users size={19}/></div><div><span>Total leads</span><strong>{leads.length}</strong></div><small>Matching your filters</small></div><div className="summary-card note-card"><div className="summary-icon blue"><BriefcaseBusiness size={19}/></div><div><span>Lead workspace</span><strong>Organized</strong></div><small>All your prospects in one place</small></div></div>

        <section className="table-panel">
          <div className="table-heading"><div><h2>All Leads</h2><p>View, search, edit and manage your leads</p></div><span className="result-count">{leads.length} {leads.length === 1 ? "lead" : "leads"}</span></div>
          <div className="toolbar"><div className="search-box"><Search size={17}/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by lead name..." /></div><select aria-label="Filter by status" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}><option value="">All statuses</option>{statuses.map(s => <option key={s}>{s}</option>)}</select></div>
          {apiError && <div className="error-banner">{apiError}<button onClick={() => {setApiError(""); loadLeads();}}>Retry</button></div>}
          <div className="table-wrap"><table><thead><tr><th>LEAD NAME</th><th>COMPANY</th><th>CONTACT</th><th>SOURCE</th><th>STATUS</th><th className="actions-head">ACTIONS</th></tr></thead>
            <tbody>{loading ? <tr><td colSpan="6" className="empty-state">Loading leads...</td></tr> : leads.length === 0 ? <tr><td colSpan="6" className="empty-state"><div className="empty-icon"><Users size={25}/></div><strong>No leads found</strong><span>{search || filterStatus ? "Try changing your search or filter." : "Add your first lead to get started."}</span>{!search && !filterStatus && <button className="text-btn" onClick={openAdd}>Add a lead</button>}</td></tr> : leads.map(lead => <tr key={lead.id}>
              <td><div className="person-cell"><div className="person-avatar">{lead.name.charAt(0).toUpperCase()}</div><div><strong>{lead.name}</strong><small>{lead.email}</small></div></div></td>
              <td><span className="company-name">{lead.company}</span></td><td><span className="phone">{lead.phone}</span></td><td><span className="source-tag">{lead.source}</span></td><td><span className={`status status-${lead.status.toLowerCase()}`}><i/>{lead.status}</span></td>
              <td><div className="actions"><button title="Edit lead" onClick={() => openEdit(lead)}><Pencil size={16}/></button><button title="Delete lead" className="delete-action" onClick={() => deleteLead(lead)}><Trash2 size={16}/></button></div></td>
            </tr>)}</tbody></table></div>
          <div className="table-footer"><span>Showing {leads.length} {leads.length === 1 ? "lead" : "leads"}</span><span>Lead Manager</span></div>
        </section>
        <footer className="footer">Built to keep your sales pipeline clear and moving.</footer>
      </section>
    </main>

    {notice && <div className="toast">✓ &nbsp;{notice}</div>}
    {modalOpen && <div className="modal-backdrop" onMouseDown={(e) => {if (e.target === e.currentTarget) setModalOpen(false);}}><section className="modal">
      <div className="modal-header"><div><div className="eyebrow">{editing ? "UPDATE RECORD" : "NEW RECORD"}</div><h2>{editing ? "Edit lead" : "Add new lead"}</h2><p>Fill in the details below to {editing ? "update this lead." : "add a prospect to your pipeline."}</p></div><button className="close-btn" onClick={() => setModalOpen(false)}><X size={20}/></button></div>
      <form onSubmit={saveLead} noValidate><div className="form-grid">
        {field("name", "Full name")}{field("email", "Email address", "email")}{field("phone", "Phone number", "tel")}{field("company", "Company")}
        <label className="field"><span>Lead source <b>*</b></span><select value={form.source} onChange={(e) => setForm({...form, source:e.target.value})}>{sources.map(s=><option key={s}>{s}</option>)}</select>{errors.source && <small>{errors.source}</small>}</label>
        <label className="field"><span>Status <b>*</b></span><select value={form.status} onChange={(e) => setForm({...form, status:e.target.value})}>{statuses.map(s=><option key={s}>{s}</option>)}</select>{errors.status && <small>{errors.status}</small>}</label>
      </div><div className="modal-actions"><button type="button" className="secondary-btn" onClick={() => setModalOpen(false)}>Cancel</button><button type="submit" className="primary-btn" disabled={saving}>{saving ? "Saving..." : editing ? "Save changes" : <><Plus size={17}/> Add lead</>}</button></div></form>
    </section></div>}
  </div>;
}
export default App;
