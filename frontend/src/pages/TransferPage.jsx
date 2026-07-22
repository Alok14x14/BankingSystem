import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAccounts, createTransaction } from '../api/api';
import Navbar from '../components/Navbar';

export default function TransferPage() {
  const [accounts, setAccounts] = useState([]);
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingAccounts, setFetchingAccounts] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const result = await getAccounts();
        setAccounts(result.data || []);
        if (result.data?.length > 0) {
          setFromAccount(result.data[0]._id);
        }
      } catch (err) {
        setError('Failed to load your accounts');
      } finally {
        setFetchingAccounts(false);
      }
    }
    load();
  }, []);

  const generateIdempotencyKey = () => {
    return `txn_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!fromAccount || !toAccount || !amount) {
      setError('Please fill in all fields');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    if (fromAccount === toAccount) {
      setError('Cannot transfer to the same account');
      return;
    }

    setLoading(true);

    try {
      await createTransaction({
        fromAccount,
        toAccount,
        amount: numericAmount,
        idempotencyKey: generateIdempotencyKey(),
      });
      setSuccess(`Successfully transferred ₹${numericAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}!`);
      setAmount('');
      setToAccount('');
    } catch (err) {
      setError(err.message || 'Transfer failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const truncateId = (id) => {
    if (!id) return '';
    return `${id.slice(0, 6)}...${id.slice(-4)}`;
  };

  return (
    <>
      <Navbar />
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Transfer Funds</h1>
          <p className="page-subtitle">Send money securely to any account</p>
        </div>

        <div className="glass-card transfer-card fade-in-up" id="transfer-card">
          {fetchingAccounts ? (
            <div className="loading-container">
              <div className="spinner spinner-large" style={{ borderTopColor: 'var(--color-primary)' }}></div>
            </div>
          ) : accounts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">💸</div>
              <h3 className="empty-state-title">No accounts found</h3>
              <p className="empty-state-text">
                You need at least one account to make transfers
              </p>
              <button className="btn btn-primary" onClick={() => navigate('/')} id="go-to-dashboard-btn">
                Go to Dashboard
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div className="alert alert-error" id="transfer-error-alert" style={{ marginBottom: 'var(--space-lg)' }}>
                  {error}
                </div>
              )}

              {success && (
                <div className="alert alert-success" id="transfer-success-alert" style={{ marginBottom: 'var(--space-lg)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="transfer-form" id="transfer-form">
                <div className="form-group">
                  <label className="form-label" htmlFor="from-account-select">From Account</label>
                  <select
                    id="from-account-select"
                    className="form-select"
                    value={fromAccount}
                    onChange={(e) => setFromAccount(e.target.value)}
                    required
                  >
                    {accounts.map((acc) => (
                      <option key={acc._id} value={acc._id}>
                        {acc.currency} — {truncateId(acc._id)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="to-account-input">To Account ID</label>
                  <input
                    id="to-account-input"
                    type="text"
                    className="form-input"
                    placeholder="Paste the recipient's Account ID"
                    value={toAccount}
                    onChange={(e) => setToAccount(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="amount-input">Amount</label>
                  <input
                    id="amount-input"
                    type="number"
                    className="form-input transfer-amount-input"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    min="0.01"
                    step="0.01"
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-full"
                  disabled={loading}
                  id="transfer-submit-btn"
                  style={{ marginTop: 'var(--space-sm)', padding: '14px 24px', fontSize: 'var(--font-size-base)' }}
                >
                  {loading ? (
                    <div className="spinner"></div>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                      Send Transfer
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}
