import { useState, useEffect } from 'react';
import axios from 'axios';

const STRENGTH_COLORS = { 'very-weak': '#ef4444', weak: '#f97316', fair: '#eab308', good: '#22c55e', strong: '#16a34a', 'very-strong': '#15803d' };

export default function PasswordGenerator({ onClose }) {
  const [length, setLength] = useState(16);
  const [useUpper, setUseUpper] = useState(true);
  const [useDigits, setUseDigits] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    const { data } = await axios.post('/api/generator/generate', {
      length, use_upper: useUpper, use_digits: useDigits, use_symbols: useSymbols,
    });
    setResult(data);
    setCopied(false);
  };

  useEffect(() => { generate(); }, []);

  const copy = () => {
    navigator.clipboard.writeText(result.password);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Password Generator</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        {result && (
          <div className="gen-result">
            <code className="gen-password">{result.password}</code>
            <button className="btn-copy-lg" onClick={copy}>{copied ? '✓ Copied' : 'Copy'}</button>
            <div className="strength-bar-wrap">
              <div className="strength-bar" style={{ width: `${(result.strength.score / 5) * 100}%`, background: STRENGTH_COLORS[result.strength.level] }} />
            </div>
            <span className="strength-label" style={{ color: STRENGTH_COLORS[result.strength.level] }}>
              {result.strength.level.replace('-', ' ')}
            </span>
          </div>
        )}

        <div className="gen-options">
          <div className="gen-option-row">
            <label>Length: {length}</label>
            <input type="range" min={8} max={64} value={length} onChange={(e) => setLength(+e.target.value)} />
          </div>
          {[['Uppercase (A-Z)', useUpper, setUseUpper], ['Numbers (0-9)', useDigits, setUseDigits], ['Symbols (!@#...)', useSymbols, setUseSymbols]].map(([label, val, set]) => (
            <label key={label} className="gen-checkbox">
              <input type="checkbox" checked={val} onChange={(e) => set(e.target.checked)} />
              {label}
            </label>
          ))}
        </div>

        <button className="btn-primary full" onClick={generate}>Generate new</button>
      </div>
    </div>
  );
}
