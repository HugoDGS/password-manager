import { useState } from 'react';

export default function EntryCard({ entry, onEdit, onDelete }) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState('');

  const copy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(''), 1500);
  };

  const domain = entry.url ? (() => { try { return new URL(entry.url).hostname; } catch { return entry.url; } })() : null;

  return (
    <div className="entry-card">
      <div className="entry-header">
        <div className="entry-icon">{entry.title[0].toUpperCase()}</div>
        <div className="entry-info">
          <span className="entry-title">{entry.title}</span>
          {domain && <span className="entry-domain">{domain}</span>}
        </div>
      </div>

      <div className="entry-field">
        <span className="field-label">Username</span>
        <div className="field-row">
          <span className="field-value">{entry.username}</span>
          <button className="btn-copy" onClick={() => copy(entry.username, 'user')}>
            {copied === 'user' ? '✓' : 'Copy'}
          </button>
        </div>
      </div>

      <div className="entry-field">
        <span className="field-label">Password</span>
        <div className="field-row">
          <span className="field-value">{visible ? entry.password : '••••••••••••'}</span>
          <button className="btn-copy" onClick={() => setVisible(!visible)}>{visible ? 'Hide' : 'Show'}</button>
          <button className="btn-copy" onClick={() => copy(entry.password, 'pass')}>
            {copied === 'pass' ? '✓' : 'Copy'}
          </button>
        </div>
      </div>

      <div className="entry-actions">
        <button className="btn-ghost sm" onClick={onEdit}>Edit</button>
        <button className="btn-danger sm" onClick={onDelete}>Delete</button>
      </div>
    </div>
  );
}
