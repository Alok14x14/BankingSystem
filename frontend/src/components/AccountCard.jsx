import { useState, useEffect } from 'react';
import { getBalance } from '../api/api';

export default function AccountCard({ account, style }) {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchBalance() {
      try {
        const result = await getBalance(account._id);
        if (!cancelled) {
          setBalance(result.data.balance);
        }
      } catch {
        if (!cancelled) {
          setBalance(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchBalance();
    return () => { cancelled = true; };
  }, [account._id]);

  const statusBadgeClass =
    account.status === 'ACTIVE'
      ? 'badge-active'
      : account.status === 'FROZEN'
      ? 'badge-frozen'
      : 'badge-closed';

  const formatCurrency = (value, currency) => {
    if (value === null || value === undefined) return '—';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const truncateId = (id) => {
    if (!id) return '';
    return `${id.slice(0, 6)}...${id.slice(-4)}`;
  };

  return (
    <div className="glass-card account-card fade-in-up" style={style} id={`account-card-${account._id}`}>
      <div className="account-card-header">
        <span className="account-currency">{account.currency || 'INR'}</span>
        <span className={`account-type-badge ${statusBadgeClass}`}>
          {account.status}
        </span>
      </div>

      <div className="account-balance-label">Available Balance</div>
      <div className="account-balance-value">
        {loading ? (
          <span style={{ display: 'inline-flex' }}>
            <div className="spinner" style={{ borderTopColor: 'var(--color-primary-light)', width: 28, height: 28 }}></div>
          </span>
        ) : (
          formatCurrency(balance, account.currency)
        )}
      </div>

      <div className="account-id" title={account._id}>
        ID: {truncateId(account._id)}
        <button
          onClick={() => navigator.clipboard.writeText(account._id)}
          style={{
            marginLeft: 8,
            background: 'none',
            border: 'none',
            color: 'var(--color-primary-light)',
            cursor: 'pointer',
            fontSize: 'var(--font-size-xs)',
          }}
          title="Copy full Account ID"
        >
          📋 Copy
        </button>
      </div>
    </div>
  );
}
