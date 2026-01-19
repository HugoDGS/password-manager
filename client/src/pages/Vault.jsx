import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import EntryCard from '../components/EntryCard';
import EntryForm from '../components/EntryForm';
import PasswordGenerator from '../components/PasswordGenerator';

export default function Vault() {
  const { token, masterPassword, logout } = useAuth();
  const [entries, setEntries] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editEntry, setEditEntry] = useState(null);
  const [showGen, setShowGen] = useState(false);
  const [loading, setLoading] = useState(true);

  const headers = { Authorization: `Bearer ${token}` };

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/vault?master_password=${encodeURIComponent(masterPassword)}`, { headers });
      setEntries(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (masterPassword) load(); }, [masterPassword]);

  const onSaved = () => { setShowForm(false); setEditEntry(null); load(); };

  const onDelete = async (id) => {
    if (!confirm('Delete this entry?')) return;
    await axios.delete(`/api/vault/${id}`, { headers });
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const filtered = entries.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="vault-page">
      <header className="vault-header">
        <div>
          <h1>🔐 Vault</h1>
          <span className="entry-count">{entries.length} entries</span>
        </div>
        <div className="header-actions">
          <button className="btn-ghost" onClick={() => setShowGen(true)}>Generate</button>
          <button className="btn-primary" onClick={() => { setEditEntry(null); setShowForm(true); }}>+ New</button>
          <button className="btn-ghost" onClick={logout}>Lock</button>
        </div>
      </header>

      <div className="vault-content">
        <input className="search-input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search entries..." />

        {loading ? (
          <p className="empty">Loading vault...</p>
        ) : filtered.length === 0 ? (
          <p className="empty">{search ? 'No results' : 'Your vault is empty — add your first entry'}</p>
        ) : (
          <div className="entries-grid">
            {filtered.map((e) => (
              <EntryCard
                key={e.id}
                entry={e}
                onEdit={() => { setEditEntry(e); setShowForm(true); }}
                onDelete={() => onDelete(e.id)}
              />
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <EntryForm
          entry={editEntry}
          token={token}
          masterPassword={masterPassword}
          onSaved={onSaved}
          onClose={() => { setShowForm(false); setEditEntry(null); }}
        />
      )}

      {showGen && <PasswordGenerator onClose={() => setShowGen(false)} />}
    </div>
  );
}
