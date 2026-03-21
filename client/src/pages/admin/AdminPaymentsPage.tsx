import { useState, useEffect } from 'react';
import { CreditCard, Search, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { AdminLayout } from '../../components/admin/AdminLayout';
import api from "../../utils/api";
import { DataTable } from '../../components/DataTable';
import { Pagination } from '../../components/Pagination';
import { ConfirmModal } from '../../components/ConfirmModal';

interface PaymentData {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    avatarURL?: string;
  };
  tripId: {
    _id: string;
    title: string;
    destination: string;
  };
  amount: number;
  status: string;
  paymentType: string;
  transactionId?: string;
  refundReason?: string;
  createdAt: string;
}

export const AdminPaymentsPage = () => {
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<{id: string, status: string} | null>(null);
  const limit = 3;

  useEffect(() => {
    fetchPayments();
  }, [currentPage, searchTerm]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/admin/payments', {
        params: { page: currentPage, limit, search: searchTerm }
      });
      setPayments(data.data.payments);
      // Calculating totalPages based on backend response (assuming backend doesn't provide it yet)
      setTotalPages(Math.ceil(data.data.total / limit));
    } catch (error) {
      toast.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedPayment) return;
    try {
      await api.patch(`/api/admin/payments/${selectedPayment.id}/status`, { status: selectedPayment.status });
      toast.success(`Payment status updated to ${selectedPayment.status}`);
      setPayments(payments.map(p => p._id === selectedPayment.id ? { ...p, status: selectedPayment.status } : p));
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setIsModalOpen(false);
      setSelectedPayment(null);
    }
  };

  const columns = [
    {
      header: "User",
      key: "userId",
      render: (payment: PaymentData) => (
        <div className="flex items-center gap-3 max-w-[200px]">
          {payment.userId?.avatarURL ? (
              <img
                  src={payment.userId.avatarURL.startsWith('http') ? payment.userId.avatarURL : `${api.defaults.baseURL}/${payment.userId.avatarURL}`}
                  alt={payment.userId.name}
                  className="w-8 h-8 rounded-full object-cover shrink-0"
              />
          ) : (
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-bold shrink-0">
                  {payment.userId?.name?.charAt(0) || 'U'}
              </div>
          )}
          <div className="truncate">
            <div className="font-medium text-gray-800 text-sm truncate">{payment.userId?.name || 'Unknown'}</div>
            <div className="text-xs text-gray-500 truncate">{payment.userId?.email || 'N/A'}</div>
          </div>
        </div>
      )
    },
    {
      header: "Trip",
      key: "tripId",
      render: (payment: PaymentData) => (
        <div className="max-w-[180px]">
          <div className="font-medium text-gray-800 text-sm break-words line-clamp-2">{payment.tripId?.title || 'Unknown Trip'}</div>
          <div className="text-xs text-gray-400 truncate">{payment.tripId?.destination || 'N/A'}</div>
        </div>
      )
    },
    {
      header: "Amount",
      key: "amount",
      className: "text-right",
      render: (payment: PaymentData) => (
        <span className="font-bold text-gray-900">
          ₹{payment.amount.toLocaleString()}
        </span>
      )
    },
    {
      header: "Type",
      key: "paymentType",
      className: "text-center hidden md:table-cell",
      render: (payment: PaymentData) => (
        <span className="capitalize text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
          {payment.paymentType.replace('_', ' ')}
        </span>
      )
    },
    {
      header: "Status",
      key: "status",
      className: "text-center",
      render: (payment: PaymentData) => (
        <div className="flex flex-col items-center gap-1">
          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            payment.status === 'released' || payment.status === 'escrowed' ? 'bg-emerald-100 text-emerald-700' :
            payment.status === 'pending' ? 'bg-amber-100 text-amber-700' :
            payment.status === 'failed' ? 'bg-red-100 text-red-700' :
            payment.status === 'refunded' ? 'bg-purple-100 text-purple-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {payment.status}
          </span>
          {payment.status === 'refunded' && payment.refundReason && (
            <span className="text-[10px] text-purple-500 italic max-w-[120px] truncate" title={payment.refundReason}>
              {payment.refundReason}
            </span>
          )}
        </div>
      )
    },
    {
      header: "Transaction ID",
      key: "transactionId",
      className: "text-left hidden lg:table-cell", // Ready the alignment to left
      render: (payment: PaymentData) => (
        <span 
          className="text-[10px] font-mono text-gray-500 bg-gray-50 px-2 py-1 rounded block max-w-[100px] truncate"
          title={payment.transactionId}
        >
          {payment.transactionId || 'N/A'}
        </span>
      )
    },
    {
      header: "Date",
      key: "createdAt",
      className: "text-right hidden sm:table-cell",
      render: (payment: PaymentData) => (
        <div className="text-xs text-gray-500">
          {new Date(payment.createdAt).toLocaleDateString()}
          <br />
          {new Date(payment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      )
    },
    {
      header: "Actions",
      key: "actions",
      className: "text-right",
      render: (payment: PaymentData) => (
        <div className="flex justify-end gap-2">
          {payment.status === 'escrowed' && (
            <button
              onClick={() => { setSelectedPayment({id: payment._id, status: 'released'}); setIsModalOpen(true); }}
              className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition"
              title="Release Escrow"
            >
              <CheckCircle size={16} />
            </button>
          )}
          {(payment.status === 'escrowed' || payment.status === 'released') && (
            <button
              onClick={() => { setSelectedPayment({id: payment._id, status: 'refunded'}); setIsModalOpen(true); }}
              className="p-1.5 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition"
              title="Refund"
            >
              <RotateCcw size={16} />
            </button>
          )}
          {payment.status === 'pending' && (
             <button
             onClick={() => { setSelectedPayment({id: payment._id, status: 'failed'}); setIsModalOpen(true); }}
             className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
             title="Mark as Failed"
           >
             <XCircle size={16} />
           </button>
          )}
        </div>
      )
    }
  ];

  return (
    <AdminLayout>
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Payment Management</h2>
            <p className="text-sm text-gray-500">Monitor and manage all platform transactions</p>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto">
             <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="Search payments..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#5537ee] text-sm"
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
            </div>
            <div className="bg-[#f0f9ff] p-2.5 rounded-xl text-[#5537ee] hidden sm:block">
              <CreditCard size={20} />
            </div>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={payments}
          loading={loading}
          emptyMessage="No payments found."
        />

        <div className="p-4 border-t bg-gray-50/50">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </div>
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleUpdateStatus}
        title="Update Payment Status"
        message={`Are you sure you want to change the status to ${selectedPayment?.status}?`}
        confirmText="Confirm Update"
        type={selectedPayment?.status === 'refunded' ? 'warning' : 'info'}
      />
    </AdminLayout>
  );
};
