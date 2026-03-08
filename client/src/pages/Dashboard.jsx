import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiSearch, FiFileText, FiDollarSign, FiCheckCircle, FiClock, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import invoiceApi from '../api/invoice.api';
import StatsCard from '../components/dashboard/StatsCard';
import InvoiceList from '../components/dashboard/InvoiceList';
import RevenueChart from '../components/dashboard/RevenueChart';
import LoadingSpinner from '../components/shared/LoadingSpinner';

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'paid', label: 'Paid' },
  { value: 'cancelled', label: 'Cancelled' },
];

function formatIndianCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export default function Dashboard() {
  const navigate = useNavigate();

  // Data state
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalRevenue: 0,
    paidCount: 0,
    pendingCount: 0,
    revenueByMonth: [],
  });
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters and pagination
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch data on mount
  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      try {
        const [statsRes, invoicesRes] = await Promise.all([
          invoiceApi.getStats(),
          invoiceApi.getAll(),
        ]);
        setStats(statsRes.data || statsRes.data?.data || {
          totalInvoices: 0,
          totalRevenue: 0,
          paidCount: 0,
          pendingCount: 0,
          revenueByMonth: [],
        });
        const invoiceList = invoicesRes.data?.invoices || invoicesRes.data?.data || invoicesRes.data || [];
        setInvoices(Array.isArray(invoiceList) ? invoiceList : []);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    let filtered = [...invoices];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (inv) =>
          (inv.invoiceNumber || '').toLowerCase().includes(q) ||
          (inv.buyer?.name || inv.buyerName || '').toLowerCase().includes(q)
      );
    }

    if (statusFilter) {
      filtered = filtered.filter((inv) => inv.status === statusFilter);
    }

    return filtered;
  }, [invoices, search, statusFilter]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / PAGE_SIZE));
  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredInvoices.slice(start, start + PAGE_SIZE);
  }, [filteredInvoices, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  // Action handlers
  const handleView = useCallback(
    (inv) => {
      navigate(`/bill-preview/${inv._id}`);
    },
    [navigate]
  );

  const handleEdit = useCallback(
    (inv) => {
      navigate(`/edit-bill/${inv._id}`);
    },
    [navigate]
  );

  const handleDelete = useCallback(
    async (inv) => {
      if (!window.confirm(`Delete invoice ${inv.invoiceNumber || ''}? This cannot be undone.`)) {
        return;
      }
      try {
        await invoiceApi.delete(inv._id);
        setInvoices((prev) => prev.filter((i) => i._id !== inv._id));
        toast.success('Invoice deleted');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete invoice');
      }
    },
    []
  );

  const handleDuplicate = useCallback(
    async (inv) => {
      try {
        const res = await invoiceApi.duplicate(inv._id);
        const newInvoice = res.data?.invoice || res.data?.data || res.data;
        if (newInvoice && newInvoice._id) {
          setInvoices((prev) => [newInvoice, ...prev]);
          toast.success('Invoice duplicated');
        } else {
          toast.success('Invoice duplicated');
          // Refetch all invoices to stay in sync
          const invoicesRes = await invoiceApi.getAll();
          const invoiceList = invoicesRes.data?.invoices || invoicesRes.data?.data || invoicesRes.data || [];
          setInvoices(Array.isArray(invoiceList) ? invoiceList : []);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to duplicate invoice');
      }
    },
    []
  );

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="h-8 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded mt-2" />
          </div>
          <div className="h-10 w-28 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-7 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="card">
          <div className="h-5 w-36 bg-gray-200 dark:bg-gray-700 rounded mb-5" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 py-3">
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="flex-1" />
              <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Overview of your invoices and revenue
          </p>
        </div>
        <Link
          to="/new-bill"
          className="btn-primary inline-flex items-center gap-2 self-start sm:self-auto"
        >
          <FiPlus size={18} />
          New Bill
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Invoices"
          value={stats.totalInvoices ?? 0}
          icon={FiFileText}
          color="blue"
        />
        <StatsCard
          title="Total Revenue"
          value={formatIndianCurrency(stats.totalRevenue)}
          icon={FiDollarSign}
          color="green"
        />
        <StatsCard
          title="Paid"
          value={stats.paidCount ?? 0}
          icon={FiCheckCircle}
          color="green"
        />
        <StatsCard
          title="Pending"
          value={stats.pendingCount ?? 0}
          icon={FiClock}
          color="yellow"
        />
      </div>

      {/* Revenue Chart */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Revenue Overview
        </h2>
        <RevenueChart data={stats.revenueByMonth || []} />
      </div>

      {/* Recent Invoices */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Invoices
          </h2>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Bar */}
            <div className="relative">
              <FiSearch
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search invoices..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-9 !py-2 text-sm w-full sm:w-56"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field !py-2 text-sm w-full sm:w-40"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Invoice Table */}
        <InvoiceList
          invoices={paginatedInvoices}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
        />

        {/* Pagination */}
        {filteredInvoices.length > PAGE_SIZE && (
          <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {(currentPage - 1) * PAGE_SIZE + 1}
              {' - '}
              {Math.min(currentPage * PAGE_SIZE, filteredInvoices.length)} of{' '}
              {filteredInvoices.length}
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <FiChevronLeft size={16} />
              </button>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[80px] text-center">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <FiChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
