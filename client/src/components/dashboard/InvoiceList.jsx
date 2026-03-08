import { FiEye, FiEdit2, FiTrash2, FiCopy } from 'react-icons/fi';

const statusStyles = {
  paid: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  sent: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  draft: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

function StatusBadge({ status }) {
  const label = status?.charAt(0).toUpperCase() + status?.slice(1);
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
        statusStyles[status] || statusStyles.draft
      }`}
    >
      {label}
    </span>
  );
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function InvoiceList({ invoices = [], onView, onEdit, onDelete, onDuplicate }) {
  if (invoices.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <svg className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
        <p className="text-lg font-medium">No invoices yet</p>
        <p className="text-sm mt-1">Create your first bill to get started!</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop table view */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="pb-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Invoice #</th>
              <th className="pb-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Buyer</th>
              <th className="pb-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
              <th className="pb-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Amount</th>
              <th className="pb-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Status</th>
              <th className="pb-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
            {invoices.map((inv) => (
              <tr key={inv._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <td className="py-3 text-sm font-medium text-gray-900 dark:text-white">{inv.invoiceNumber || '-'}</td>
                <td className="py-3 text-sm text-gray-600 dark:text-gray-300">{inv.buyer?.name || '-'}</td>
                <td className="py-3 text-sm text-gray-500 dark:text-gray-400">{formatDate(inv.invoiceDate || inv.createdAt)}</td>
                <td className="py-3 text-sm font-semibold text-gray-900 dark:text-white text-right">{formatCurrency(inv.grandTotal || inv.totalAmount)}</td>
                <td className="py-3 text-center"><StatusBadge status={inv.status || 'draft'} /></td>
                <td className="py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => onView?.(inv)} title="View" className="p-2 rounded-lg text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                      <FiEye size={16} />
                    </button>
                    <button onClick={() => onEdit?.(inv)} title="Edit" className="p-2 rounded-lg text-gray-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors">
                      <FiEdit2 size={16} />
                    </button>
                    <button onClick={() => onDuplicate?.(inv)} title="Duplicate" className="p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                      <FiCopy size={16} />
                    </button>
                    <button onClick={() => onDelete?.(inv)} title="Delete" className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {invoices.map((inv) => (
          <div key={inv._id} className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{inv.invoiceNumber || '-'}</span>
              <StatusBadge status={inv.status || 'draft'} />
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400 text-xs">Buyer</span>
                <p className="text-gray-800 dark:text-gray-200 font-medium truncate">{inv.buyer?.name || '-'}</p>
              </div>
              <div className="text-right">
                <span className="text-gray-500 dark:text-gray-400 text-xs">Amount</span>
                <p className="text-gray-800 dark:text-gray-200 font-bold">{formatCurrency(inv.grandTotal || inv.totalAmount)}</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
              <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(inv.invoiceDate || inv.createdAt)}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => onView?.(inv)} title="View" className="p-2 rounded-lg text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"><FiEye size={16} /></button>
                <button onClick={() => onEdit?.(inv)} title="Edit" className="p-2 rounded-lg text-gray-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"><FiEdit2 size={16} /></button>
                <button onClick={() => onDuplicate?.(inv)} title="Duplicate" className="p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"><FiCopy size={16} /></button>
                <button onClick={() => onDelete?.(inv)} title="Delete" className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><FiTrash2 size={16} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
