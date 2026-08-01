import { useState, useEffect, useCallback } from 'react';
import { getAccounts, getTransactionHistory } from '../api/api';
import Navbar from '../components/Navbar';

export default function TransactionHistoryPage() {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingAccounts, setFetchingAccounts] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('newest');

  useEffect(() => {
    async function loadAccounts() {
      try {
        const result = await getAccounts();
        const accs = result.data || [];
        setAccounts(accs);
        if (accs.length > 0) {
          setSelectedAccount(accs[0]._id);
        }
      } catch (err) {
        setError('Failed to load accounts');
      } finally {
        setFetchingAccounts(false);
      }
    }
    loadAccounts();
  }, []);

  const fetchHistory = useCallback(async () => {
    if (!selectedAccount) return;
    setLoading(true);
    setError('');
    try {
      const result = await getTransactionHistory(selectedAccount);
      setTransactions(result.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load transaction history');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [selectedAccount]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const truncateId = (id) => {
    if (!id) return '—';
    return `${id.slice(0, 6)}…${id.slice(-4)}`;
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '—';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const getTransactionType = (txn) => {
    if (txn.fromAccount === selectedAccount && txn.toAccount === selectedAccount) return 'SELF';
    if (txn.fromAccount === selectedAccount) return 'SENT';
    return 'RECEIVED';
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'SUCCESSFUL': return 'txn-badge-success';
      case 'PENDING': return 'txn-badge-pending';
      case 'FAILED': return 'txn-badge-failed';
      case 'REFUNDED': return 'txn-badge-refunded';
      default: return '';
    }
  };

  const getTypeBadgeClass = (type) => {
    switch (type) {
      case 'SENT': return 'txn-type-sent';
      case 'RECEIVED': return 'txn-type-received';
      default: return 'txn-type-self';
    }
  };

  // Apply filters
  const filteredTransactions = transactions.filter((txn) => {
    if (statusFilter !== 'ALL' && txn.status !== statusFilter) return false;
    if (typeFilter !== 'ALL' && getTransactionType(txn) !== typeFilter) return false;
    return true;
  });

  // Apply sort
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    const da = new Date(a.createdAt).getTime();
    const db = new Date(b.createdAt).getTime();
    return sortOrder === 'newest' ? db - da : da - db;
  });

  const totalSent = sortedTransactions
    .filter((t) => getTransactionType(t) === 'SENT' && t.status === 'SUCCESSFUL')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalReceived = sortedTransactions
    .filter((t) => getTransactionType(t) === 'RECEIVED' && t.status === 'SUCCESSFUL')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <>
      <Navbar />
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Transaction History</h1>
          <p className="page-subtitle">
            Track all incoming and outgoing transactions
          </p>
        </div>

        {fetchingAccounts ? (
          <div className="loading-container">
            <div className="spinner spinner-large" style={{ borderTopColor: 'var(--color-primary)' }}></div>
          </div>
        ) : accounts.length === 0 ? (
          <div className="glass-card empty-state" id="no-accounts-history-state">
            <div className="empty-state-icon">📊</div>
            <h3 className="empty-state-title">No accounts found</h3>
            <p className="empty-state-text">
              Create an account first to view transaction history
            </p>
          </div>
        ) : (
          <>
            {/* Account selector & filters */}
            <div className="txn-controls" id="txn-controls">
              <div className="txn-controls-row">
                <div className="form-group" style={{ flex: 2, minWidth: 200 }}>
                  <label className="form-label" htmlFor="history-account-select">Account</label>
                  <select
                    id="history-account-select"
                    className="form-select"
                    value={selectedAccount}
                    onChange={(e) => setSelectedAccount(e.target.value)}
                  >
                    {accounts.map((acc) => (
                      <option key={acc._id} value={acc._id}>
                        {acc.currency} — {truncateId(acc._id)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ flex: 1, minWidth: 140 }}>
                  <label className="form-label" htmlFor="status-filter-select">Status</label>
                  <select
                    id="status-filter-select"
                    className="form-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="ALL">All</option>
                    <option value="SUCCESSFUL">Successful</option>
                    <option value="PENDING">Pending</option>
                    <option value="FAILED">Failed</option>
                    <option value="REFUNDED">Refunded</option>
                  </select>
                </div>

                <div className="form-group" style={{ flex: 1, minWidth: 140 }}>
                  <label className="form-label" htmlFor="type-filter-select">Type</label>
                  <select
                    id="type-filter-select"
                    className="form-select"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <option value="ALL">All</option>
                    <option value="SENT">Sent</option>
                    <option value="RECEIVED">Received</option>
                  </select>
                </div>

                <div className="form-group" style={{ flex: 1, minWidth: 140 }}>
                  <label className="form-label" htmlFor="sort-order-select">Sort</label>
                  <select
                    id="sort-order-select"
                    className="form-select"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Summary cards */}
            {sortedTransactions.length > 0 && (
              <div className="txn-summary-row" id="txn-summary">
                <div className="glass-card txn-summary-card">
                  <div className="txn-summary-label">Total Transactions</div>
                  <div className="txn-summary-value">{sortedTransactions.length}</div>
                </div>
                <div className="glass-card txn-summary-card txn-summary-sent">
                  <div className="txn-summary-label">Total Sent</div>
                  <div className="txn-summary-value">{formatCurrency(totalSent)}</div>
                </div>
                <div className="glass-card txn-summary-card txn-summary-received">
                  <div className="txn-summary-label">Total Received</div>
                  <div className="txn-summary-value">{formatCurrency(totalReceived)}</div>
                </div>
              </div>
            )}

            {error && (
              <div className="alert alert-error" id="history-error-alert" style={{ marginBottom: 'var(--space-lg)' }}>
                {error}
              </div>
            )}

            {loading ? (
              <div className="loading-container">
                <div className="spinner spinner-large" style={{ borderTopColor: 'var(--color-primary)' }}></div>
              </div>
            ) : sortedTransactions.length === 0 ? (
              <div className="glass-card empty-state fade-in-up" id="no-transactions-state">
                <div className="empty-state-icon">📭</div>
                <h3 className="empty-state-title">No transactions found</h3>
                <p className="empty-state-text">
                  {statusFilter !== 'ALL' || typeFilter !== 'ALL'
                    ? 'Try adjusting your filters'
                    : 'Transactions will appear here once you make a transfer'}
                </p>
              </div>
            ) : (
              <div className="txn-list fade-in-up" id="transactions-list">
                {sortedTransactions.map((txn, index) => {
                  const type = getTransactionType(txn);
                  const isSent = type === 'SENT';

                  return (
                    <div
                      className="glass-card txn-row"
                      key={txn._id || index}
                      id={`txn-row-${txn._id}`}
                      style={{ animationDelay: `${index * 0.04}s` }}
                    >
                      {/* Icon */}
                      <div className={`txn-icon ${isSent ? 'txn-icon-sent' : 'txn-icon-received'}`}>
                        {isSent ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <polyline points="5 12 12 5 19 12" />
                          </svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <polyline points="19 12 12 19 5 12" />
                          </svg>
                        )}
                      </div>

                      {/* Details */}
                      <div className="txn-details">
                        <div className="txn-details-top">
                          <span className={`txn-type-badge ${getTypeBadgeClass(type)}`}>
                            {type}
                          </span>
                          <span className={`txn-status-badge ${getStatusBadgeClass(txn.status)}`}>
                            {txn.status}
                          </span>
                        </div>
                        <div className="txn-details-bottom">
                          <span className="txn-counterparty" title={isSent ? txn.toAccount : txn.fromAccount}>
                            {isSent ? 'To' : 'From'}: {truncateId(isSent ? txn.toAccount : txn.fromAccount)}
                          </span>
                          <span className="txn-separator">•</span>
                          <span className="txn-date">
                            {formatDate(txn.createdAt)}
                          </span>
                          <span className="txn-separator">•</span>
                          <span className="txn-time">
                            {formatTime(txn.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className={`txn-amount ${isSent ? 'txn-amount-sent' : 'txn-amount-received'}`}>
                        {isSent ? '−' : '+'}{formatCurrency(txn.amount)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
