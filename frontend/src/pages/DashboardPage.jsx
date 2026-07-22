import { useState, useEffect, useCallback } from 'react';
import { getAccounts } from '../api/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import AccountCard from '../components/AccountCard';
import CreateAccountModal from '../components/CreateAccountModal';

export default function DashboardPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getAccounts();
      setAccounts(result.data || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleAccountCreated = (newAccount) => {
    setAccounts((prev) => [...prev, newAccount]);
  };

  return (
    <>
      <Navbar />
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">
            Welcome back, {user?.name?.split(' ')[0] || 'User'} 👋
          </h1>
          <p className="page-subtitle">
            Manage your accounts and track your finances
          </p>
        </div>

        <div className="dashboard-actions">
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
            id="create-account-btn"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Account
          </button>
          <button className="btn btn-secondary" onClick={fetchAccounts} id="refresh-accounts-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10" />
              <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14" />
            </svg>
            Refresh
          </button>
        </div>

        {error && (
          <div className="alert alert-error" id="dashboard-error-alert" style={{ marginBottom: 'var(--space-lg)' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div className="loading-container">
            <div className="spinner spinner-large" style={{ borderTopColor: 'var(--color-primary)' }}></div>
          </div>
        ) : accounts.length === 0 ? (
          <div className="glass-card empty-state" id="no-accounts-state">
            <div className="empty-state-icon">🏦</div>
            <h3 className="empty-state-title">No accounts yet</h3>
            <p className="empty-state-text">
              Create your first bank account to get started with NexBank
            </p>
            <button
              className="btn btn-primary"
              onClick={() => setShowCreateModal(true)}
              id="empty-create-account-btn"
            >
              Create Your First Account
            </button>
          </div>
        ) : (
          <div className="dashboard-grid" id="accounts-grid">
            {accounts.map((account, index) => (
              <AccountCard
                key={account._id}
                account={account}
                style={{ animationDelay: `${index * 0.1}s` }}
              />
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateAccountModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleAccountCreated}
        />
      )}
    </>
  );
}
