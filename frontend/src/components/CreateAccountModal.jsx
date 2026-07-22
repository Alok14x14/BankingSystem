import { useState } from 'react';
import { createAccount } from '../api/api';

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD'];

export default function CreateAccountModal({ onClose, onCreated }) {
  const [currency, setCurrency] = useState('INR');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await createAccount({ currency });
      onCreated(result.data);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} id="create-account-modal">
      <div className="glass-card modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Create New Account</h2>
          <button className="modal-close" onClick={onClose} id="modal-close-btn">&times;</button>
        </div>

        {error && <div className="alert alert-error" id="modal-error-alert">{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="currency-select">Currency</label>
            <select
              id="currency-select"
              className="form-select"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-sm)' }}>
            <button type="button" className="btn btn-secondary btn-full" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading} id="create-account-submit">
              {loading ? <div className="spinner"></div> : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
