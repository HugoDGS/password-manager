import { useState } from 'react';
import axios from 'axios';

export default function EntryForm({ entry, token, masterPassword, onSaved, onClose }) {
  const [form, setForm] = useState({
    title: entry?.title || '',
    username: entry?.username || '',
    password: entry?.password || '',
    url: entry?.url || '',
    notes: entry?.notes || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const headers = { Authorization: `Bearer ${token}` };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = { ...form, master_password: masterPassword };
      if (entry) await axios.put(`/api/vault/${entry.id}`, payload, { headers });
      else await axios.post('/api/vault', payload, { headers });
      onSaved();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save entry');
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{entry ? 'Edit entry' : 'New entry'}</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={submit}>
          <div className="form-group"><label>Title *</label><input value={form.title} onChange={set('title')} required /></div>
          <div className="form-group"><label>Username *</label><input value={form.username} onChange={set('username')} required /></div>
          <div className="form-group"><label>Password *</label><input type="password" value={form.password} onChange={set('password')} required /></div>
          <div className="form-group"><label>URL</label><input type="url" value={form.url} onChange={set('url')} /></div>
          <div className="form-group"><label>Notes</label><textarea value={form.notes} onChange={set('notes')} rows={3} /></div>
          {error && <p className="form-error">{error}</p>}
          <div className="modal-footer">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
