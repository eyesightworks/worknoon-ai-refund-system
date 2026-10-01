import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import './App.css';

const API_URL = 'http://localhost:3000';

type RefundStatus = 'APPROVED' | 'DENIED' | 'ESCALATED';

type Customer = {
  id: string;
  name: string;
  email: string;
};

type Order = {
  id: string;
  customerId: string;
  orderNumber: string;
  orderDate: string;
  totalAmount: number;
  itemName: string;
  finalSale: boolean;
  damaged: boolean;
  incorrectItem: boolean;
  customer: Customer;
};

type AuditLog = {
  id: string;
  event: string;
  details: string;
  createdAt: string;
};

type RefundRequest = {
  id: string;
  customerId: string;
  orderId: string;
  reason: string;
  customerMessage: string;
  status: RefundStatus;
  decisionSource: string;
  decisionReason: string;
  aiResponse: string | null;
  createdAt: string;
  updatedAt: string;
  customer: Customer;
  order: Order;
  auditLogs: AuditLog[];
};

type RefundResult = {
  id: string;
  status: RefundStatus;
  decisionReason: string;
  decisionSource: string;
  aiResponse: string;
  order: {
    orderNumber: string;
    totalAmount: number;
    itemName: string;
  };
};

type View = 'customer' | 'admin';

function App() {
  const [view, setView] = useState<View>('customer');

  const [orders, setOrders] = useState<Order[]>([]);
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);

  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [reason, setReason] = useState('Refund request');
  const [customerMessage, setCustomerMessage] = useState('');

  const [refundResult, setRefundResult] = useState<RefundResult | null>(
    null,
  );

  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingRefunds, setLoadingRefunds] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState('');

  const [statusFilter, setStatusFilter] = useState<
    'ALL' | RefundStatus
  >('ALL');

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId),
    [orders, selectedOrderId],
  );

  const filteredRefunds = useMemo(() => {
    if (statusFilter === 'ALL') {
      return refunds;
    }

    return refunds.filter(
      (refund) => refund.status === statusFilter,
    );
  }, [refunds, statusFilter]);

  const approved = refunds.filter(
    (refund) => refund.status === 'APPROVED',
  ).length;

  const denied = refunds.filter(
    (refund) => refund.status === 'DENIED',
  ).length;

  const escalated = refunds.filter(
    (refund) => refund.status === 'ESCALATED',
  ).length;

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    if (view === 'admin') {
      loadRefunds();
    }
  }, [view]);

  async function loadOrders() {
    try {
      setLoadingOrders(true);
      setError('');

      const response = await fetch(`${API_URL}/refund/orders`);

      if (!response.ok) {
        throw new Error('Failed to load orders');
      }

      const data: Order[] = await response.json();

      setOrders(data);

      if (data.length > 0) {
        setSelectedOrderId(data[0].id);
      }
    } catch (err) {
      console.error(err);
      setError(
        'Unable to connect to the refund API. Make sure the NestJS backend is running on port 3000.',
      );
    } finally {
      setLoadingOrders(false);
    }
  }

  async function loadRefunds() {
    try {
      setLoadingRefunds(true);
      setError('');

      const response = await fetch(`${API_URL}/refund`);

      if (!response.ok) {
        throw new Error('Failed to load refund requests');
      }

      const data: RefundRequest[] = await response.json();

      setRefunds(data);
    } catch (err) {
      console.error(err);
      setError(
        'Unable to load refund requests from the backend.',
      );
    } finally {
      setLoadingRefunds(false);
    }
  }

  async function submitRefund(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedOrder) {
      setError('Please select an order.');
      return;
    }

    if (!customerMessage.trim()) {
      setError('Please explain why you are requesting a refund.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setRefundResult(null);

      const response = await fetch(`${API_URL}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: selectedOrder.customerId,
          orderId: selectedOrder.id,
          reason,
          customerMessage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || 'Unable to submit refund request.',
        );
      }

      setRefundResult(data);
      setCustomerMessage('');
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to submit refund request.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString();
  }

  function formatDateTime(date: string) {
    return new Date(date).toLocaleString();
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">W</div>

          <div>
            <h1>WorkNoon Refund Support</h1>
            <p>AI-assisted customer refund operations</p>
          </div>
        </div>

        <div className="view-switcher">
          <button
            className={
              view === 'customer'
                ? 'nav-button active'
                : 'nav-button'
            }
            onClick={() => setView('customer')}
          >
            Customer Portal
          </button>

          <button
            className={
              view === 'admin'
                ? 'nav-button active'
                : 'nav-button'
            }
            onClick={() => setView('admin')}
          >
            Admin Dashboard
          </button>
        </div>
      </header>

      {error && (
        <div className="error-banner">
          <strong>Something went wrong:</strong> {error}
        </div>
      )}

      {view === 'customer' ? (
        <CustomerPortal
          orders={orders}
          selectedOrderId={selectedOrderId}
          setSelectedOrderId={setSelectedOrderId}
          selectedOrder={selectedOrder}
          reason={reason}
          setReason={setReason}
          customerMessage={customerMessage}
          setCustomerMessage={setCustomerMessage}
          submitting={submitting}
          loadingOrders={loadingOrders}
          refundResult={refundResult}
          onSubmit={submitRefund}
        />
      ) : (
        <AdminDashboard
          refunds={filteredRefunds}
          allRefunds={refunds}
          approved={approved}
          denied={denied}
          escalated={escalated}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          loading={loadingRefunds}
          onRefresh={loadRefunds}
          formatDate={formatDate}
          formatDateTime={formatDateTime}
        />
      )}
    </div>
  );
}

function CustomerPortal({
  orders,
  selectedOrderId,
  setSelectedOrderId,
  selectedOrder,
  reason,
  setReason,
  customerMessage,
  setCustomerMessage,
  submitting,
  loadingOrders,
  refundResult,
  onSubmit,
}: {
  orders: Order[];
  selectedOrderId: string;
  setSelectedOrderId: (value: string) => void;
  selectedOrder?: Order;
  reason: string;
  setReason: (value: string) => void;
  customerMessage: string;
  setCustomerMessage: (value: string) => void;
  submitting: boolean;
  loadingOrders: boolean;
  refundResult: RefundResult | null;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <main className="page">
      <section className="hero">
        <div>
          <span className="eyebrow">CUSTOMER SUPPORT</span>

          <h2>Request a refund</h2>

          <p>
            Select your order and tell us what happened. The system
            checks the refund policy and provides a customer-friendly
            response.
          </p>
        </div>

        <div className="hero-badge">
          <span>Policy engine</span>
          <strong>Active</strong>
        </div>
      </section>

      <div className="customer-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <span className="section-label">REFUND REQUEST</span>
              <h3>Tell us about your order</h3>
            </div>
          </div>

          <form onSubmit={onSubmit} className="refund-form">
            <label>
              Select order

              <select
                value={selectedOrderId}
                onChange={(event) =>
                  setSelectedOrderId(event.target.value)
                }
                disabled={loadingOrders}
              >
                {loadingOrders ? (
                  <option>Loading orders...</option>
                ) : (
                  orders.map((order) => (
                    <option key={order.id} value={order.id}>
                      {order.orderNumber} — {order.itemName} — $
                      {order.totalAmount.toFixed(2)}
                    </option>
                  ))
                )}
              </select>
            </label>

            {selectedOrder && (
              <div className="order-preview">
                <div>
                  <span>Customer</span>
                  <strong>{selectedOrder.customer.name}</strong>
                </div>

                <div>
                  <span>Order</span>
                  <strong>{selectedOrder.orderNumber}</strong>
                </div>

                <div>
                  <span>Item</span>
                  <strong>{selectedOrder.itemName}</strong>
                </div>

                <div>
                  <span>Amount</span>
                  <strong>
                    ${selectedOrder.totalAmount.toFixed(2)}
                  </strong>
                </div>
              </div>
            )}

            <label>
              Reason

              <select
                value={reason}
                onChange={(event) =>
                  setReason(event.target.value)
                }
              >
                <option value="Refund request">
                  General refund request
                </option>

                <option value="Damaged item">
                  Item arrived damaged
                </option>

                <option value="Incorrect item">
                  I received the wrong item
                </option>

                <option value="No longer needed">
                  I no longer need the item
                </option>

                <option value="Other">
                  Other
                </option>
              </select>
            </label>

            <label>
              Explain your request

              <textarea
                value={customerMessage}
                onChange={(event) =>
                  setCustomerMessage(event.target.value)
                }
                placeholder="Tell us what happened with your order..."
                rows={6}
              />
            </label>

            <button
              className="primary-button"
              type="submit"
              disabled={submitting || loadingOrders}
            >
              {submitting
                ? 'Reviewing request...'
                : 'Submit refund request'}
            </button>
          </form>
        </section>

        <section className="panel response-panel">
          <div className="panel-header">
            <div>
              <span className="section-label">
                SUPPORT RESPONSE
              </span>

              <h3>Refund decision</h3>
            </div>
          </div>

          {!refundResult ? (
            <div className="empty-state">
              <div className="empty-icon">AI</div>

              <h3>No request submitted yet</h3>

              <p>
                Your refund decision and support response will
                appear here after you submit a request.
              </p>
            </div>
          ) : (
            <RefundResultCard result={refundResult} />
          )}
        </section>
      </div>
    </main>
  );
}

function RefundResultCard({
  result,
}: {
  result: RefundResult;
}) {
  const statusClass = result.status.toLowerCase();

  return (
    <div className="result-content">
      <div className={`decision-card ${statusClass}`}>
        <div>
          <span className="decision-label">
            DECISION
          </span>

          <h2>{result.status}</h2>
        </div>

        <div className="decision-order">
          {result.order.orderNumber}
        </div>
      </div>

      <div className="response-box">
        <span className="section-label">
          CUSTOMER RESPONSE
        </span>

        <p>{result.aiResponse}</p>
      </div>

      <div className="reason-box">
        <span className="section-label">
          POLICY REASON
        </span>

        <p>{result.decisionReason}</p>
      </div>

      <div className="metadata-grid">
        <div>
          <span>Decision source</span>
          <strong>{result.decisionSource}</strong>
        </div>

        <div>
          <span>Item</span>
          <strong>{result.order.itemName}</strong>
        </div>

        <div>
          <span>Amount</span>
          <strong>
            ${result.order.totalAmount.toFixed(2)}
          </strong>
        </div>
      </div>
    </div>
  );
}

function AdminDashboard({
  refunds,
  allRefunds,
  approved,
  denied,
  escalated,
  statusFilter,
  setStatusFilter,
  loading,
  onRefresh,
  formatDate,
  formatDateTime,
}: {
  refunds: RefundRequest[];
  allRefunds: RefundRequest[];
  approved: number;
  denied: number;
  escalated: number;
  statusFilter: 'ALL' | RefundStatus;
  setStatusFilter: (
    value: 'ALL' | RefundStatus,
  ) => void;
  loading: boolean;
  onRefresh: () => void;
  formatDate: (date: string) => string;
  formatDateTime: (date: string) => string;
}) {
  return (
    <main className="page">
      <section className="hero admin-hero">
        <div>
          <span className="eyebrow">ADMINISTRATION</span>

          <h2>Refund operations dashboard</h2>

          <p>
            Monitor recent refund requests, policy decisions,
            customer messages, and audit information.
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={onRefresh}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh data'}
        </button>
      </section>

      <section className="stats-grid">
        <StatCard
          label="Total requests"
          value={allRefunds.length}
          className="neutral"
        />

        <StatCard
          label="Approved"
          value={approved}
          className="approved"
        />

        <StatCard
          label="Denied"
          value={denied}
          className="denied"
        />

        <StatCard
          label="Escalated"
          value={escalated}
          className="escalated"
        />
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <span className="section-label">
              OPERATIONS
            </span>

            <h3>Recent refund requests</h3>
          </div>

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as
                  | 'ALL'
                  | RefundStatus,
              )
            }
          >
            <option value="ALL">All statuses</option>
            <option value="APPROVED">Approved</option>
            <option value="DENIED">Denied</option>
            <option value="ESCALATED">Escalated</option>
          </select>
        </div>

        {refunds.length === 0 ? (
          <div className="empty-state">
            <h3>No refund requests found</h3>
            <p>
              Submit a refund request from the customer portal
              to see it here.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Order</th>
                  <th>Amount</th>
                  <th>Request</th>
                  <th>Decision</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {refunds.map((refund) => (
                  <RefundRow
                    key={refund.id}
                    refund={refund}
                    formatDate={formatDate}
                    formatDateTime={formatDateTime}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

function RefundRow({
  refund,
  formatDate,
  formatDateTime,
}: {
  refund: RefundRequest;
  formatDate: (date: string) => string;
  formatDateTime: (date: string) => string;
}) {
  return (
    <tr>
      <td>
        <div className="customer-cell">
          <strong>{refund.customer.name}</strong>
          <span>{refund.customer.email}</span>
        </div>
      </td>

      <td>
        <strong>{refund.order.orderNumber}</strong>
        <span className="table-secondary">
          {refund.order.itemName}
        </span>
      </td>

      <td>
        ${refund.order.totalAmount.toFixed(2)}
      </td>

      <td>
        <strong>{refund.reason}</strong>

        <span className="table-secondary message-preview">
          {refund.customerMessage}
        </span>
      </td>

      <td>
        <StatusBadge status={refund.status} />

        <span className="table-secondary">
          {refund.decisionReason}
        </span>
      </td>

      <td>
        <span>{formatDate(refund.createdAt)}</span>

        <span className="table-secondary">
          {formatDateTime(refund.createdAt)}
        </span>
      </td>
    </tr>
  );
}

function StatCard({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className: string;
}) {
  return (
    <div className={`stat-card ${className}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: RefundStatus;
}) {
  return (
    <span className={`status-badge ${status.toLowerCase()}`}>
      {status}
    </span>
  );
}

export default App;