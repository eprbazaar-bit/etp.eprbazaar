import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Bell,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Cpu,
  CreditCard,
  FileSpreadsheet,
  FileText,
  FolderKanban,
  Handshake,
  IndianRupee,
  LayoutDashboard,
  Lock,
  MessageSquare,
  PackageCheck,
  Receipt,
  Settings,
  Shield,
  Sliders,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { PortalShell, SidebarNavItem } from './PortalShell';
import {
  Button,
  ConfirmModal,
  CsvExportButton,
  EmptyState,
  formatINR,
  MetricCard,
  Modal,
  SimpleBarChart,
  StatusBadge,
} from '../ui/DesignSystem';
import { DocumentsView, NotificationsView, PaymentsView } from './SharedPortalViews';
import { AdminTab, BuyerRequirement, EPRCategory, SellerListing, formatTime } from '../../types';

export const AdminPortal: React.FC = () => {
  const {
    adminTab,
    setAdminTab,
    currentAdmin,
    categories,
    subcategories,
    marketRates,
    transactions,
    buyers,
    sellers,
    facilitators,
    admins,
    requirements,
    listings,
    matches,
    negotiations,
    orders,
    payments,
    auditLogs,
    notifications,
    platformSettings,
    adminApproveListing,
    adminApproveRequirement,
    adminVerifyUser,
    adminSaveCategory,
    adminToggleCategory,
    adminCreateStaffRecord,
    adminSavePlatformSettings,
    recordPayment,
    addToast,
  } = useMarketplace();

  const unreadNotifs = notifications.filter((n) => n.targetRole === 'admin' && !n.read).length;

  const [approvalConfirm, setApprovalConfirm] = useState<{
    kind: 'listing' | 'requirement';
    listing?: SellerListing;
    requirement?: BuyerRequirement;
    id: string;
    decision: 'Active' | 'Rejected';
  } | null>(null);

  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editCat, setEditCat] = useState<EPRCategory | null>(null);
  const [catName, setCatName] = useState('');
  const [catShortName, setCatShortName] = useState('');
  const [catCode, setCatCode] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catUnit, setCatUnit] = useState<'MT' | 'KL' | 'Units'>('MT');
  const [catSubcats, setCatSubcats] = useState('');
  const [savingCat, setSavingCat] = useState(false);

  const [staffModalRole, setStaffModalRole] = useState<'facilitator' | 'admin' | null>(null);
  const [staffUid, setStaffUid] = useState('');
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffExtra, setStaffExtra] = useState('');
  const [savingStaff, setSavingStaff] = useState(false);

  const [reportType, setReportType] = useState('Order-wise');
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payOrderId, setPayOrderId] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payRef, setPayRef] = useState('');
  const [payType, setPayType] = useState<'Advance' | 'Balance' | 'Settlement'>('Balance');
  const [payMethod, setPayMethod] = useState<'NEFT' | 'RTGS' | 'IMPS'>('RTGS');

  const [brokeragePct, setBrokeragePct] = useState(String(platformSettings.defaultBrokeragePercent));
  const [gstPct, setGstPct] = useState(String(platformSettings.gstPercent));
  const [tolerancePct, setTolerancePct] = useState(String(platformSettings.matchingRateTolerancePercent));
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    setBrokeragePct(String(platformSettings.defaultBrokeragePercent));
    setGstPct(String(platformSettings.gstPercent));
    setTolerancePct(String(platformSettings.matchingRateTolerancePercent));
  }, [platformSettings]);

  const getBuyerName = (uid: string) => buyers.find((b) => b.uid === uid)?.companyName || uid;
  const getSellerName = (uid: string) => sellers.find((s) => s.uid === uid)?.companyName || uid;
  const getCategoryAvailQty = (catId: string) =>
    marketRates.filter((r) => r.categoryId === catId).reduce((s, r) => s + r.availableQty, 0);

  const totalAvailQty = marketRates.reduce((s, r) => s + r.availableQty, 0);
  const totalRevenue = orders.reduce((s, o) => s + o.brokerageAmount, 0);

  const txByCategory = categories
    .map((c) => ({
      label: c.shortName || c.name,
      value: transactions.filter((t) => t.categoryId === c.id).reduce((s, t) => s + t.quantity, 0),
    }))
    .filter((d) => d.value > 0);

  const navItems: SidebarNavItem[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'buyers', label: 'Buyers', icon: Users },
    { id: 'sellers', label: 'Sellers', icon: Building2 },
    { id: 'facilitators', label: 'Facilitators', icon: UserCheck },
    { id: 'admin-users', label: 'Admin Users', icon: Shield },
    { id: 'categories', label: 'Categories', icon: FolderKanban },
    {
      id: 'listing-approval',
      label: 'Listing Approval',
      icon: ClipboardCheck,
      badge: listings.filter((l) => l.status === 'Pending Approval').length,
    },
    {
      id: 'requirement-approval',
      label: 'Requirement Approval',
      icon: CheckCircle2,
      badge: requirements.filter((r) => r.status === 'Pending Approval').length,
    },
    { id: 'inventory', label: 'Marketplace Inventory', icon: PackageCheck },
    { id: 'rate-board', label: 'Rate Management', icon: TrendingUp },
    { id: 'matching-engine', label: 'Matching Engine', icon: Cpu },
    { id: 'negotiations', label: 'Negotiations', icon: MessageSquare },
    { id: 'orders', label: 'Order Management', icon: Handshake },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'gst-invoices', label: 'GST & Invoices', icon: Receipt },
    { id: 'brokerage', label: 'Brokerage & Revenue', icon: IndianRupee },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'audit-logs', label: 'Audit Logs', icon: FileSpreadsheet },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifs },
    { id: 'settings', label: 'Platform Settings', icon: Settings },
    { id: 'permissions', label: 'Permissions', icon: Lock },
  ];

  const openCategoryEditor = (c?: EPRCategory) => {
    if (c) {
      setEditCat(c);
      setCatName(c.name);
      setCatShortName(c.shortName || c.name);
      setCatCode(c.code);
      setCatDesc(c.description || '');
      setCatUnit(c.unit);
      const existingSubs = subcategories.filter((s) => s.categoryId === c.id).map((s) => s.name);
      setCatSubcats(existingSubs.join(', '));
    } else {
      setEditCat(null);
      setCatName('');
      setCatShortName('');
      setCatCode('');
      setCatDesc('');
      setCatUnit('MT');
      setCatSubcats('Category I, Category II');
    }
    setCatModalOpen(true);
  };

  const buildReportDataset = (): { headers: string[]; rows: (string | number)[][] } => {
    switch (reportType) {
      case 'Buyer-wise':
        return {
          headers: ['UID', 'Company', 'Contact', 'Mobile', 'Email', 'GSTIN', 'Verification', 'Status'],
          rows: buyers.map((b) => [b.uid, b.companyName, b.contactPerson, b.mobile, b.email, b.gstin, b.verification, b.status]),
        };
      case 'Seller-wise':
        return {
          headers: ['UID', 'Company', 'Type', 'Mobile', 'Email', 'GSTIN', 'Verification', 'Status'],
          rows: sellers.map((s) => [s.uid, s.companyName, s.recyclerType, s.mobile, s.email, s.gstin, s.verification, s.status]),
        };
      case 'Category-wise':
        return {
          headers: ['Category Code', 'Category Name', 'Unit', 'Available Qty', 'Active'],
          rows: categories.map((c) => [c.code, c.name, c.unit, getCategoryAvailQty(c.id), c.active ? 'Yes' : 'No']),
        };
      case 'Listing-wise':
        return {
          headers: ['Listing ID', 'Seller', 'Category', 'Subcategory', 'FY', 'Listed Qty', 'Remaining Qty', 'Asking Rate', 'Status'],
          rows: listings.map((l) => [l.id, getSellerName(l.sellerUid), l.categoryName, l.subcategory, l.financialYear, l.listedQty, l.remainingQty, l.askingRate, l.status]),
        };
      case 'Requirement-wise':
        return {
          headers: ['Req ID', 'Buyer', 'Category', 'Subcategory', 'FY', 'Required Qty', 'Remaining Qty', 'Max Rate', 'Status'],
          rows: requirements.map((r) => [r.id, getBuyerName(r.buyerUid), r.categoryName, r.subcategory, r.financialYear, r.requiredQty, r.remainingQty, r.maxBuyingRate, r.status]),
        };
      case 'Match-wise':
        return {
          headers: ['Match ID', 'Category', 'FY', 'Qty', 'Buyer Rate', 'Seller Rate', 'Indicative Rate', 'Status'],
          rows: matches.map((m) => [m.id, m.categoryName, m.financialYear, m.matchingQty, m.buyerTargetRate, m.sellerAskingRate, m.indicativeRate, m.status]),
        };
      case 'Negotiation-wise':
        return {
          headers: ['Entry ID', 'Match ID', 'Actor', 'Action', 'Rate', 'Quantity', 'Message'],
          rows: negotiations.map((n) => [n.id, n.matchId, n.actor, n.actionType, n.rate ?? '', n.quantity ?? '', n.message]),
        };
      case 'Payment-wise':
        return {
          headers: ['Payment ID', 'Order ID', 'Party Type', 'Amount INR', 'Type', 'Method', 'Ref', 'Date', 'Status'],
          rows: payments.map((p) => [p.id, p.orderId, p.partyType, p.amount, p.paymentType, p.paymentMethod, p.referenceNumber, p.paymentDate, p.status]),
        };
      case 'Monthly transaction report':
      case 'Financial year-wise':
        return {
          headers: ['Transaction ID', 'Order ID', 'Category', 'FY', 'Qty', 'Unit', 'Traded Rate', 'Total Value INR'],
          rows: transactions.map((t) => [t.id, t.orderId, t.categoryName, t.financialYear, t.quantity, t.unit, t.tradedRate, t.totalValue]),
        };
      default:
        return {
          headers: ['Order ID', 'Invoice', 'Buyer', 'Seller', 'Category', 'FY', 'Qty', 'Agreed Rate', 'Total INR', 'Brokerage'],
          rows: orders.map((o) => [
            o.id,
            o.invoiceNumber,
            getBuyerName(o.buyerUid),
            getSellerName(o.sellerUid),
            o.categoryName,
            o.financialYear,
            o.quantity,
            o.agreedRate,
            o.totalAmount,
            o.brokerageAmount,
          ]),
        };
    }
  };

  const activeReport = buildReportDataset();

  return (
    <PortalShell
      portalTitle="Super Admin Portal"
      userTitle={currentAdmin?.name || 'Platform Administrator'}
      userSubtitle={
        currentAdmin ? `${currentAdmin.roleTitle} · ${currentAdmin.email}` : 'Admin Console'
      }
      navItems={navItems}
      activeTab={adminTab}
      onSelectTab={(t) => setAdminTab(t as AdminTab)}
      onOpenNotifications={() => setAdminTab('notifications')}
    >
      {adminTab === 'overview' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold text-[#0A172A]">Marketplace Control Tower</h1>
              <p className="text-xs text-[#64748B]">
                Live Firestore governance across users, approvals, inventory, matching, and revenue.
              </p>
            </div>
            <Button variant="primary" size="sm" onClick={() => setAdminTab('reports')}>
              Open Reports & CSV Export
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            <MetricCard label="Total Buyers" value={buyers.length} onClick={() => setAdminTab('buyers')} />
            <MetricCard label="Total Sellers" value={sellers.length} onClick={() => setAdminTab('sellers')} />
            <MetricCard
              label="Active Listings"
              value={listings.filter((l) => l.status === 'Active' || l.status === 'Partially Allocated').length}
              onClick={() => setAdminTab('inventory')}
            />
            <MetricCard
              label="Available EPR Qty"
              value={totalAvailQty.toLocaleString('en-IN')}
              accent="emerald"
              onClick={() => setAdminTab('inventory')}
            />
            <MetricCard
              label="Active Requirements"
              value={requirements.filter((r) => r.status === 'Active' || r.status === 'Partially Matched').length}
              onClick={() => setAdminTab('requirement-approval')}
            />
            <MetricCard label="Matching Opps" value={matches.length} onClick={() => setAdminTab('matching-engine')} />
            <MetricCard
              label="Active Negotiations"
              value={matches.filter((m) => m.status !== 'Order Created' && m.status !== 'Closed').length}
              accent="amber"
              onClick={() => setAdminTab('negotiations')}
            />
            <MetricCard
              label="Active Orders"
              value={orders.filter((o) => o.orderStatus !== 'Transaction Completed').length}
              onClick={() => setAdminTab('orders')}
            />
            <MetricCard
              label="Completed Txns"
              value={transactions.length}
              accent="emerald"
              onClick={() => setAdminTab('orders')}
            />
            <MetricCard
              label="Pending Payments"
              value={orders.filter((o) => o.paymentStatus !== 'Fully Paid').length}
              accent="amber"
              onClick={() => setAdminTab('payments')}
            />
            <MetricCard
              label="Brokerage Revenue"
              value={formatINR(totalRevenue)}
              accent="emerald"
              onClick={() => setAdminTab('brokerage')}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-[#E2E8F0] rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-sm font-semibold text-[#0A172A]">
                  Category-Wise Available Inventory
                </h2>
                <span className="font-mono text-[11px] text-[#64748B]">Live Firestore</span>
              </div>
              <SimpleBarChart
                data={categories
                  .map((c) => ({ label: c.shortName || c.name, value: getCategoryAvailQty(c.id) }))
                  .filter((d) => d.value > 0)}
                color="#10233F"
              />
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-sm font-semibold text-[#0A172A]">
                  Completed Traded Volume by Category
                </h2>
                <span className="font-mono text-[11px] text-[#16A36A]">Verified Transactions</span>
              </div>
              <SimpleBarChart data={txByCategory} color="#16A36A" />
            </div>
          </div>
        </div>
      )}

      {adminTab === 'buyers' && (
        <div className="space-y-4">
          <h1 className="font-display text-xl font-bold text-[#0A172A]">Buyer Account Management</h1>
          {buyers.length === 0 ? (
            <EmptyState
              title="No buyer accounts registered yet."
              description="Buyers who complete Google Sign-In and company onboarding will appear here."
            />
          ) : (
            <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                    <th className="py-3 px-4">Company</th>
                    <th className="py-3 px-4">Mobile / Email</th>
                    <th className="py-3 px-4">GSTIN</th>
                    <th className="py-3 px-4">Registered</th>
                    <th className="py-3 px-4">Verification</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] text-xs">
                  {buyers.map((b) => (
                    <tr key={b.uid} className="hover:bg-[#F8FAFC]">
                      <td className="py-3 px-4 font-medium text-[#0A172A]">{b.companyName}</td>
                      <td className="py-3 px-4 font-mono text-[#475569]">
                        <div>{b.mobile}</div>
                        <div>{b.email}</div>
                      </td>
                      <td className="py-3 px-4 font-mono">{b.gstin}</td>
                      <td className="py-3 px-4 font-mono">{formatTime(b.createdAt)}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={b.verification} />
                      </td>
                      <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                        <Button
                          variant="emerald"
                          size="sm"
                          onClick={() => void adminVerifyUser('buyer', b.uid, 'Verified')}
                        >
                          Verify
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => void adminVerifyUser('buyer', b.uid, 'Action Required')}
                        >
                          Flag
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {adminTab === 'sellers' && (
        <div className="space-y-4">
          <h1 className="font-display text-xl font-bold text-[#0A172A]">Seller Account Management</h1>
          {sellers.length === 0 ? (
            <EmptyState
              title="No seller accounts registered yet."
              description="Sellers who complete Google Sign-In and company onboarding will appear here."
            />
          ) : (
            <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                    <th className="py-3 px-4">Company</th>
                    <th className="py-3 px-4">Mobile / Email</th>
                    <th className="py-3 px-4">GSTIN</th>
                    <th className="py-3 px-4">Registered</th>
                    <th className="py-3 px-4">Verification</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] text-xs">
                  {sellers.map((s) => (
                    <tr key={s.uid} className="hover:bg-[#F8FAFC]">
                      <td className="py-3 px-4 font-medium text-[#0A172A]">{s.companyName}</td>
                      <td className="py-3 px-4 font-mono text-[#475569]">
                        <div>{s.mobile}</div>
                        <div>{s.email}</div>
                      </td>
                      <td className="py-3 px-4 font-mono">{s.gstin}</td>
                      <td className="py-3 px-4 font-mono">{formatTime(s.createdAt)}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={s.verification} />
                      </td>
                      <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                        <Button
                          variant="emerald"
                          size="sm"
                          onClick={() => void adminVerifyUser('seller', s.uid, 'Verified')}
                        >
                          Verify
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => void adminVerifyUser('seller', s.uid, 'Action Required')}
                        >
                          Flag
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {adminTab === 'facilitators' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-xl font-bold text-[#0A172A]">Facilitator Staff Management</h1>
              <p className="text-xs text-[#64748B]">
                Only authorised @eprbazaar.com Firebase Auth UIDs provisioned here can access the Facilitator portal.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setStaffUid('');
                setStaffName('');
                setStaffEmail('');
                setStaffExtra('Trading Desk');
                setStaffModalRole('facilitator');
              }}
            >
              + Add Facilitator Access
            </Button>
          </div>
          {facilitators.length === 0 ? (
            <EmptyState
              title="No facilitators provisioned yet."
              description="Create an @eprbazaar.com user in Firebase Authentication and link their UID here."
            />
          ) : (
            <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                    <th className="py-3 px-4">Employee ID</th>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Company Email</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] text-sm">
                  {facilitators.map((f) => (
                    <tr key={f.uid} className="hover:bg-[#F8FAFC]">
                      <td className="py-3 px-4 font-mono text-xs font-semibold">{f.employeeId}</td>
                      <td className="py-3 px-4 font-medium">{f.name}</td>
                      <td className="py-3 px-4 font-mono text-xs">{f.email}</td>
                      <td className="py-3 px-4 text-xs">{f.department || 'Trading Desk'}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={f.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {adminTab === 'admin-users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-xl font-bold text-[#0A172A]">Admin User Management</h1>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setStaffUid('');
                setStaffName('');
                setStaffEmail('');
                setStaffExtra('Operations Administrator');
                setStaffModalRole('admin');
              }}
            >
              + Add Admin Access
            </Button>
          </div>
          {admins.length === 0 ? (
            <EmptyState
              title="No additional admin records in Firestore."
              description="The primary platform administrator is active via verified email; add co-admins here."
            />
          ) : (
            <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                    <th className="py-3 px-4">UID</th>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] text-xs">
                  {admins.map((a) => (
                    <tr key={a.uid} className="hover:bg-[#F8FAFC]">
                      <td className="py-3 px-4 font-mono font-semibold">{a.uid}</td>
                      <td className="py-3 px-4 font-medium text-[#0A172A]">{a.name}</td>
                      <td className="py-3 px-4 font-mono">{a.email}</td>
                      <td className="py-3 px-4 text-[#475569]">{a.roleTitle}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={a.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {adminTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-xl font-bold text-[#0A172A]">EPR Category & Subcategory Management</h1>
            <Button variant="primary" size="sm" onClick={() => openCategoryEditor()}>
              + Add Category
            </Button>
          </div>
          {categories.length === 0 ? (
            <EmptyState
              title="No EPR categories configured yet."
              description="Add EPR categories and subcategories so buyers and sellers can submit real requirements and credit listings."
              actionLabel="+ Add Category"
              onAction={() => openCategoryEditor()}
            />
          ) : (
            <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                      <th className="py-3 px-4">Code</th>
                      <th className="py-3 px-4">Category Name</th>
                      <th className="py-3 px-4">Subcategories</th>
                      <th className="py-3 px-4">Unit</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9] text-xs">
                    {categories.map((c) => {
                      const subs = subcategories.filter((s) => s.categoryId === c.id).map((s) => s.name);
                      return (
                        <tr key={c.id} className="hover:bg-[#F8FAFC]">
                          <td className="py-3 px-4 font-mono font-semibold">{c.code}</td>
                          <td className="py-3 px-4 font-semibold text-[#0A172A]">{c.name}</td>
                          <td className="py-3 px-4 text-[#475569]">{subs.join(', ') || '—'}</td>
                          <td className="py-3 px-4 font-mono">{c.unit}</td>
                          <td className="py-3 px-4">
                            <StatusBadge status={c.active ? 'Active' : 'Paused'} />
                          </td>
                          <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                            <Button variant="ghost" size="sm" onClick={() => openCategoryEditor(c)}>
                              Edit
                            </Button>
                            <Button variant="secondary" size="sm" onClick={() => void adminToggleCategory(c)}>
                              {c.active ? 'Disable' : 'Enable'}
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <Modal
            open={catModalOpen}
            onClose={() => setCatModalOpen(false)}
            title={editCat ? `Edit Category — ${editCat.name}` : 'Add New EPR Category'}
          >
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                setSavingCat(true);
                try {
                  await adminSaveCategory({
                    id: editCat?.id,
                    code: catCode,
                    name: catName,
                    shortName: catShortName || catName.slice(0, 24),
                    description: catDesc || `${catName} EPR credit category.`,
                    unit: catUnit,
                    financialYears: ['FY 2024-25', 'FY 2025-26', 'FY 2026-27'],
                    subcategories: catSubcats
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean),
                    active: editCat?.active ?? true,
                  });
                  setCatModalOpen(false);
                } finally {
                  setSavingCat(false);
                }
              }}
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#334155] mb-1">Category Name *</label>
                  <input
                    required
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    placeholder="e.g. Plastic Packaging EPR"
                    className="w-full h-10 px-3 text-sm border border-[#CBD5E1] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#334155] mb-1">Code *</label>
                  <input
                    required
                    value={catCode}
                    onChange={(e) => setCatCode(e.target.value)}
                    placeholder="e.g. PWM-01"
                    className="w-full h-10 px-3 text-sm font-mono border border-[#CBD5E1] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#334155] mb-1">Short Label</label>
                  <input
                    value={catShortName}
                    onChange={(e) => setCatShortName(e.target.value)}
                    placeholder="e.g. Plastic EPR"
                    className="w-full h-10 px-3 text-sm border border-[#CBD5E1] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#334155] mb-1">Unit</label>
                  <select
                    value={catUnit}
                    onChange={(e) => setCatUnit(e.target.value as 'MT' | 'KL' | 'Units')}
                    className="w-full h-10 px-3 text-sm border border-[#CBD5E1] rounded-lg bg-white"
                  >
                    <option value="MT">MT</option>
                    <option value="KL">KL</option>
                    <option value="Units">Units</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1">Subcategories (comma-separated)</label>
                <input
                  value={catSubcats}
                  onChange={(e) => setCatSubcats(e.target.value)}
                  className="w-full h-10 px-3 text-sm border border-[#CBD5E1] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  className="w-full p-2.5 text-sm border border-[#CBD5E1] rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setCatModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={savingCat}>
                  {savingCat ? 'Saving...' : 'Save Category'}
                </Button>
              </div>
            </form>
          </Modal>
        </div>
      )}

      {adminTab === 'listing-approval' && (
        <div className="space-y-4">
          <h1 className="font-display text-xl font-bold text-[#0A172A]">Seller Listing Approval Queue</h1>
          {listings.length === 0 ? (
            <EmptyState
              title="No seller listings available."
              description="Seller EPR credit listings submitted for approval will appear here."
            />
          ) : (
            <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                      <th className="py-3 px-4">Listing ID</th>
                      <th className="py-3 px-4">Seller</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4 text-right">Qty</th>
                      <th className="py-3 px-4 text-right">Rate</th>
                      <th className="py-3 px-4">FY</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9] text-xs">
                    {listings.map((l) => (
                      <tr key={l.id} className="hover:bg-[#F8FAFC]">
                        <td className="py-3 px-4 font-mono font-semibold">{l.id}</td>
                        <td className="py-3 px-4">{getSellerName(l.sellerUid)}</td>
                        <td className="py-3 px-4 font-medium">{l.categoryName}</td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums">
                          {l.listedQty} {l.unit}
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums">{formatINR(l.askingRate)}</td>
                        <td className="py-3 px-4 font-mono">{l.financialYear}</td>
                        <td className="py-3 px-4">
                          <StatusBadge status={l.status} />
                        </td>
                        <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                          <Button
                            variant="emerald"
                            size="sm"
                            onClick={() =>
                              setApprovalConfirm({ kind: 'listing', listing: l, id: l.id, decision: 'Active' })
                            }
                          >
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() =>
                              setApprovalConfirm({ kind: 'listing', listing: l, id: l.id, decision: 'Rejected' })
                            }
                          >
                            Reject
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {adminTab === 'requirement-approval' && (
        <div className="space-y-4">
          <h1 className="font-display text-xl font-bold text-[#0A172A]">Buyer Requirement Governance</h1>
          {requirements.length === 0 ? (
            <EmptyState
              title="No buyer requirements yet."
              description="Buyer EPR requirements will appear here once submitted."
            />
          ) : (
            <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                      <th className="py-3 px-4">Requirement ID</th>
                      <th className="py-3 px-4">Buyer</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4 text-right">Qty</th>
                      <th className="py-3 px-4 text-right">Target Rate</th>
                      <th className="py-3 px-4">FY</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9] text-xs">
                    {requirements.map((r) => (
                      <tr key={r.id} className="hover:bg-[#F8FAFC]">
                        <td className="py-3 px-4 font-mono font-semibold">{r.id}</td>
                        <td className="py-3 px-4">{getBuyerName(r.buyerUid)}</td>
                        <td className="py-3 px-4 font-medium">{r.categoryName}</td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums">
                          {r.requiredQty} {r.unit}
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums">{formatINR(r.maxBuyingRate)}</td>
                        <td className="py-3 px-4 font-mono">{r.financialYear}</td>
                        <td className="py-3 px-4">
                          <StatusBadge status={r.status} />
                        </td>
                        <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                          <Button
                            variant="emerald"
                            size="sm"
                            onClick={() =>
                              setApprovalConfirm({
                                kind: 'requirement',
                                requirement: r,
                                id: r.id,
                                decision: 'Active',
                              })
                            }
                          >
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() =>
                              setApprovalConfirm({
                                kind: 'requirement',
                                requirement: r,
                                id: r.id,
                                decision: 'Rejected',
                              })
                            }
                          >
                            Reject
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {(adminTab === 'inventory' || adminTab === 'rate-board') && (
        <div className="space-y-4">
          <h1 className="font-display text-xl font-bold text-[#0A172A]">
            {adminTab === 'rate-board' ? 'Live Market Rate Board' : 'Marketplace Inventory'}
          </h1>
          {marketRates.length === 0 ? (
            <EmptyState
              title="No market rate records yet."
              description="Market rate entries are automatically computed from active approved seller listings and completed trades."
            />
          ) : (
            <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">FY</th>
                    <th className="py-3 px-4 text-right">Available Qty</th>
                    <th className="py-3 px-4 text-right">Lowest Ask</th>
                    <th className="py-3 px-4 text-right">Highest Ask</th>
                    <th className="py-3 px-4 text-right">Indicative Rate</th>
                    <th className="py-3 px-4 text-right">Last Traded</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] text-sm">
                  {marketRates.map((mr) => (
                    <tr key={mr.id} className="hover:bg-[#F8FAFC]">
                      <td className="py-3 px-4 font-semibold">{mr.categoryName}</td>
                      <td className="py-3 px-4 font-mono text-xs">{mr.financialYear}</td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums">
                        {mr.availableQty.toLocaleString('en-IN')} {mr.unit}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums">
                        {mr.lowestAskingRate ? formatINR(mr.lowestAskingRate) : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums">
                        {mr.highestAskingRate ? formatINR(mr.highestAskingRate) : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-[#1E3A8A] tabular-nums">
                        {mr.indicativeRate ? formatINR(mr.indicativeRate) : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#16A36A] tabular-nums">
                        {mr.lastTradedRate ? formatINR(mr.lastTradedRate) : 'No Trades'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {(adminTab === 'matching-engine' || adminTab === 'negotiations') && (
        <div className="space-y-4">
          <h1 className="font-display text-xl font-bold text-[#0A172A]">
            {adminTab === 'matching-engine' ? 'ETP Matching Engine Monitor' : 'Negotiation Overview'}
          </h1>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <MetricCard label="Requirements" value={requirements.length} />
            <MetricCard label="Listings" value={listings.length} />
            <MetricCard label="Total Matches" value={matches.length} accent="emerald" />
            <MetricCard label="Orders Confirmed" value={orders.length} accent="emerald" />
          </div>
          {matches.length === 0 ? (
            <EmptyState
              title="No matching opportunities found."
              description="Valid matches between compatible buyer requirements and seller listings will appear here."
            />
          ) : (
            <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                    <th className="py-3 px-4">Match ID</th>
                    <th className="py-3 px-4">Buyer</th>
                    <th className="py-3 px-4">Seller</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right">Qty</th>
                    <th className="py-3 px-4 text-right">Buyer Rate</th>
                    <th className="py-3 px-4 text-right">Seller Rate</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] text-xs">
                  {matches.map((m) => (
                    <tr key={m.id} className="hover:bg-[#F8FAFC]">
                      <td className="py-3 px-4 font-mono font-semibold">{m.id}</td>
                      <td className="py-3 px-4">{getBuyerName(m.buyerUid)}</td>
                      <td className="py-3 px-4">{getSellerName(m.sellerUid)}</td>
                      <td className="py-3 px-4 font-medium">{m.categoryName}</td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums">
                        {m.matchingQty} {m.unit}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums">{formatINR(m.buyerTargetRate)}</td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums">{formatINR(m.sellerAskingRate)}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={m.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {(adminTab === 'orders' || adminTab === 'gst-invoices' || adminTab === 'brokerage') && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="font-display text-xl font-bold text-[#0A172A]">
              {adminTab === 'gst-invoices'
                ? 'GST & Tax Invoice Management'
                : adminTab === 'brokerage'
                ? 'Brokerage & Revenue Ledger'
                : 'Order Management'}
            </h1>
            {orders.length > 0 && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setPayOrderId(orders[0].id);
                  setPayAmount(String(orders[0].totalAmount));
                  setPayModalOpen(true);
                }}
              >
                + Record Payment Entry
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <MetricCard
              label="Total Transaction Value"
              value={formatINR(orders.reduce((s, o) => s + o.totalAmount, 0))}
            />
            <MetricCard
              label={`Total GST (${platformSettings.gstPercent}%)`}
              value={formatINR(orders.reduce((s, o) => s + o.gstAmount, 0))}
            />
            <MetricCard label="Brokerage Revenue" value={formatINR(totalRevenue)} accent="emerald" />
            <MetricCard label="Verified Payments" value={payments.length} />
          </div>

          {orders.length === 0 ? (
            <EmptyState
              title="No orders available."
              description="Orders confirmed by facilitators will appear here with GST and brokerage breakdowns."
            />
          ) : (
            <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                      <th className="py-3 px-4">Order / Invoice</th>
                      <th className="py-3 px-4">Buyer</th>
                      <th className="py-3 px-4">Seller</th>
                      <th className="py-3 px-4 text-right">Basic</th>
                      <th className="py-3 px-4 text-right">GST</th>
                      <th className="py-3 px-4 text-right">Total</th>
                      <th className="py-3 px-4 text-right">Brokerage</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9] text-xs">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-[#F8FAFC]">
                        <td className="py-3 px-4 font-mono">
                          <div className="font-semibold text-[#0A172A]">{o.id}</div>
                          <div className="text-[#64748B]">{o.invoiceNumber}</div>
                        </td>
                        <td className="py-3 px-4">{getBuyerName(o.buyerUid)}</td>
                        <td className="py-3 px-4">{getSellerName(o.sellerUid)}</td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums">{formatINR(o.basicAmount)}</td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums">{formatINR(o.gstAmount)}</td>
                        <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums">
                          {formatINR(o.totalAmount)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-semibold text-[#16A36A] tabular-nums">
                          {formatINR(o.brokerageAmount)}
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={o.orderStatus} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <Modal
            open={payModalOpen}
            onClose={() => setPayModalOpen(false)}
            title="Record Advance / Balance Payment"
            maxWidth="max-w-md"
          >
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                const ord = orders.find((o) => o.id === payOrderId) || orders[0];
                if (!ord) return;
                await recordPayment({
                  order: ord,
                  partyType: 'Buyer Receivable',
                  amount: Number(payAmount),
                  paymentType: payType,
                  paymentMethod: payMethod,
                  referenceNumber: payRef,
                  paymentDate: new Date().toISOString().slice(0, 10),
                });
                setPayModalOpen(false);
              }}
            >
              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1">Order</label>
                <select
                  value={payOrderId}
                  onChange={(e) => setPayOrderId(e.target.value)}
                  className="w-full h-10 px-3 text-sm border border-[#CBD5E1] rounded-lg bg-white"
                >
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.id} — {getBuyerName(o.buyerUid)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#334155] mb-1">Payment Type</label>
                  <select
                    value={payType}
                    onChange={(e) => setPayType(e.target.value as 'Advance' | 'Balance' | 'Settlement')}
                    className="w-full h-10 px-3 text-sm border border-[#CBD5E1] rounded-lg bg-white"
                  >
                    <option value="Advance">Advance</option>
                    <option value="Balance">Balance</option>
                    <option value="Settlement">Settlement</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#334155] mb-1">Method</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value as 'NEFT' | 'RTGS' | 'IMPS')}
                    className="w-full h-10 px-3 text-sm border border-[#CBD5E1] rounded-lg bg-white"
                  >
                    <option value="RTGS">RTGS</option>
                    <option value="NEFT">NEFT</option>
                    <option value="IMPS">IMPS</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1">Amount (INR)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full h-10 px-3 text-sm font-mono border border-[#CBD5E1] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#334155] mb-1">UTR / Bank Reference *</label>
                <input
                  required
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  placeholder="Enter NEFT/RTGS UTR number"
                  className="w-full h-10 px-3 text-sm font-mono border border-[#CBD5E1] rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setPayModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Verify & Save
                </Button>
              </div>
            </form>
          </Modal>
        </div>
      )}

      {adminTab === 'reports' && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-xl font-bold text-[#0A172A]">Reports & Analytics</h1>
              <p className="text-xs text-[#64748B]">
                Export live Firestore marketplace datasets to CSV / Excel-compatible formats.
              </p>
            </div>
            <CsvExportButton
              label="Export CSV Report"
              filename={`EPR_Bazaar_${reportType.replace(/\s+/g, '_')}_Report.csv`}
              headers={activeReport.headers}
              rows={activeReport.rows}
              onExported={() => addToast({ type: 'success', title: `${reportType} CSV exported` })}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              'Buyer-wise',
              'Seller-wise',
              'Category-wise',
              'Financial year-wise',
              'Listing-wise',
              'Requirement-wise',
              'Match-wise',
              'Negotiation-wise',
              'Order-wise',
              'Payment-wise',
              'Brokerage-wise',
              'Monthly transaction report',
            ].map((rt) => (
              <button
                key={rt}
                type="button"
                onClick={() => setReportType(rt)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer ${
                  reportType === rt
                    ? 'bg-[#10233F] text-white border-[#10233F]'
                    : 'bg-white text-[#475569] border-[#CBD5E1] hover:bg-[#F8FAFC]'
                }`}
              >
                {rt}
              </button>
            ))}
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-lg p-5 space-y-3">
            <div className="text-sm font-semibold text-[#0A172A]">
              {reportType} Preview ({activeReport.rows.length} records)
            </div>
            {activeReport.rows.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#64748B]">
                No database records found for {reportType} yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                      {activeReport.headers.map((h) => (
                        <th key={h} className="py-2.5 px-3">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9] text-xs">
                    {activeReport.rows.slice(0, 15).map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#F8FAFC]">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="py-2.5 px-3 font-mono text-[#334155]">
                            {String(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {adminTab === 'audit-logs' && (
        <div className="space-y-4">
          <h1 className="font-display text-xl font-bold text-[#0A172A]">Platform Audit Logs</h1>
          {auditLogs.length === 0 ? (
            <EmptyState
              title="No audit logs recorded yet."
              description="System actions across onboarding, approvals, offers, and orders are recorded here."
            />
          ) : (
            <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                    <th className="py-3 px-4">Log ID</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Target</th>
                    <th className="py-3 px-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] text-xs">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#F8FAFC]">
                      <td className="py-3 px-4 font-mono font-semibold">{log.id}</td>
                      <td className="py-3 px-4 font-mono text-[#64748B]">{formatTime(log.createdAt)}</td>
                      <td className="py-3 px-4 font-medium">
                        {log.actorEmail} ({log.role})
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={log.action} />
                      </td>
                      <td className="py-3 px-4 font-mono">{log.target}</td>
                      <td className="py-3 px-4 text-[#475569]">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {(adminTab === 'settings' || adminTab === 'permissions') && (
        <div className="bg-white border border-[#E2E8F0] rounded-lg p-6 max-w-2xl space-y-5">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#10233F]" />
            <h1 className="font-display text-xl font-bold text-[#0A172A]">
              {adminTab === 'permissions' ? 'Role & Permission Matrix' : 'Platform Configuration'}
            </h1>
          </div>
          {adminTab === 'settings' ? (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#334155] mb-1">Default Brokerage (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min={0}
                    value={brokeragePct}
                    onChange={(e) => setBrokeragePct(e.target.value)}
                    className="w-full h-10 px-3 font-mono border border-[#CBD5E1] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#334155] mb-1">Applicable GST (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    min={0}
                    value={gstPct}
                    onChange={(e) => setGstPct(e.target.value)}
                    className="w-full h-10 px-3 font-mono border border-[#CBD5E1] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#334155] mb-1">Match Rate Tolerance (%)</label>
                  <input
                    type="number"
                    step="1"
                    min={0}
                    max={50}
                    value={tolerancePct}
                    onChange={(e) => setTolerancePct(e.target.value)}
                    className="w-full h-10 px-3 font-mono border border-[#CBD5E1] rounded-lg"
                  />
                </div>
              </div>
              <Button
                variant="primary"
                size="sm"
                disabled={savingSettings}
                onClick={async () => {
                  setSavingSettings(true);
                  try {
                    await adminSavePlatformSettings({
                      defaultBrokeragePercent: Number(brokeragePct) || 2.5,
                      gstPercent: Number(gstPct) || 18,
                      matchingRateTolerancePercent: Number(tolerancePct) || 10,
                    });
                  } finally {
                    setSavingSettings(false);
                  }
                }}
              >
                {savingSettings ? 'Saving...' : 'Save Configuration'}
              </Button>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              {[
                ['Buyer', 'Google Login Only · Submit Requirements · View Anonymized Matches · Respond to Offers'],
                ['Seller', 'Google Login Only · Create Listings · Manage Inventory · Respond to Offers'],
                [
                  'Facilitator',
                  'Email/Password Login (@eprbazaar.com) · View Private Buyer/Seller Panels · Dispatch Bilateral Offers · Confirm Deals',
                ],
                ['Super Admin', 'Protected Access · Approvals · Category/Rate Control · Staff Provisioning · Audit Logs'],
              ].map(([roleName, perms]) => (
                <div key={roleName} className="p-3 bg-[#F4F7FB] border border-[#E2E8F0] rounded-lg">
                  <div className="font-semibold text-[#0A172A]">{roleName}</div>
                  <div className="text-[#475569] mt-0.5">{perms}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {adminTab === 'payments' && <PaymentsView />}
      {adminTab === 'documents' && <DocumentsView ownerFilterRole="admin" />}
      {adminTab === 'notifications' && <NotificationsView />}

      <Modal
        open={staffModalRole !== null}
        onClose={() => setStaffModalRole(null)}
        title={staffModalRole === 'facilitator' ? 'Provision Facilitator Access' : 'Provision Administrator Access'}
        maxWidth="max-w-md"
      >
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!staffModalRole) return;
            setSavingStaff(true);
            try {
              await adminCreateStaffRecord({
                roleType: staffModalRole,
                uid: staffUid.trim(),
                name: staffName.trim(),
                email: staffEmail.trim(),
                department: staffExtra.trim(),
                roleTitle: staffExtra.trim(),
              });
              setStaffModalRole(null);
            } catch (err) {
              addToast({
                type: 'error',
                title: 'Provisioning failed',
                description: err instanceof Error ? err.message : 'Check UID and email format.',
              });
            } finally {
              setSavingStaff(false);
            }
          }}
        >
          <p className="text-xs text-[#475569]">
            Create the user in Firebase Console Authentication first, then register their Firebase UID here.
          </p>
          <div>
            <label className="block text-xs font-semibold text-[#334155] mb-1">Firebase Auth UID *</label>
            <input
              required
              value={staffUid}
              onChange={(e) => setStaffUid(e.target.value)}
              placeholder="Paste Firebase Auth UID"
              className="w-full h-10 px-3 text-sm font-mono border border-[#CBD5E1] rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#334155] mb-1">Full Name *</label>
            <input
              required
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              className="w-full h-10 px-3 text-sm border border-[#CBD5E1] rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#334155] mb-1">
              {staffModalRole === 'facilitator' ? 'Authorised @eprbazaar.com Email *' : 'Administrator Email *'}
            </label>
            <input
              type="email"
              required
              value={staffEmail}
              onChange={(e) => setStaffEmail(e.target.value)}
              placeholder={staffModalRole === 'facilitator' ? 'name@eprbazaar.com' : 'admin@company.com'}
              className="w-full h-10 px-3 text-sm font-mono border border-[#CBD5E1] rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#334155] mb-1">
              {staffModalRole === 'facilitator' ? 'Trading Desk / Department' : 'Admin Role Title'}
            </label>
            <input
              value={staffExtra}
              onChange={(e) => setStaffExtra(e.target.value)}
              className="w-full h-10 px-3 text-sm border border-[#CBD5E1] rounded-lg"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setStaffModalRole(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={savingStaff}>
              {savingStaff ? 'Saving...' : 'Grant Access'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={approvalConfirm !== null}
        onClose={() => setApprovalConfirm(null)}
        onConfirm={() => {
          if (!approvalConfirm) return;
          if (approvalConfirm.kind === 'listing' && approvalConfirm.listing) {
            void adminApproveListing(approvalConfirm.listing, approvalConfirm.decision);
          } else if (approvalConfirm.kind === 'requirement' && approvalConfirm.requirement) {
            void adminApproveRequirement(approvalConfirm.requirement, approvalConfirm.decision);
          }
        }}
        title={`Confirm ${approvalConfirm?.decision === 'Active' ? 'Approval' : 'Rejection'}`}
        description={`Proceed with marking ${approvalConfirm?.id} as ${approvalConfirm?.decision}?`}
        confirmLabel={approvalConfirm?.decision === 'Active' ? 'Approve & Activate' : 'Confirm Reject'}
        variant={approvalConfirm?.decision === 'Active' ? 'emerald' : 'danger'}
      />
    </PortalShell>
  );
};
