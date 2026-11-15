import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  User as FirebaseUser,
  sendPasswordResetEmail,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  Unsubscribe,
} from 'firebase/firestore';
import {
  auth,
  db,
  firebaseConfigError,
  firebaseConfigured,
  googleProvider,
  handleFirestoreError,
  OperationType,
  testFirestoreConnection,
} from '../firebase';
import {
  AdminAccount,
  AdminTab,
  AuditLogEntry,
  BuyerAccount,
  BuyerRequirement,
  BuyerTab,
  DocumentRecord,
  EPRCategory,
  EPRSubcategory,
  EmailDeliveryLog,
  FacilitatorAccount,
  FacilitatorTab,
  InvoiceRecord,
  MarketRateRecord,
  MarketplaceOffer,
  MarketplaceOrder,
  MatchOpportunity,
  NegotiationEntry,
  NotificationItem,
  OrderStatus,
  PaymentRecord,
  PlatformSettingsRecord,
  PublicPage,
  SellerAccount,
  SellerListing,
  SellerTab,
  ToastMessage,
  TransactionRecord,
  UserRecord,
  UserRole,
} from '../types';
import {
  completeCompanyOnboarding,
  confirmMatchAndCreateOrderDoc,
  createBuyerRequirementDoc,
  createNotificationIfUnique,
  createSellerListingDoc,
  dispatchCategoryEmailNotificationsApi,
  facilitatorSendOfferDoc,
  recomputeMarketRate,
  respondToOfferDoc,
  retryFailedEmailsApi,
  runMatchingForListing,
  runMatchingForRequirement,
  saveCategoryWithSubcategories,
  updateOrderStatusDoc,
  uploadProtectedDocument,
  writeAuditLog,
} from '../services/firestoreService';

const BOOTSTRAPPED_ADMIN_EMAIL = 'ajaykumartiwari609@gmail.com';

interface MarketplaceContextValue {
  firebaseReady: boolean;
  connectionError: string | null;
  permissionError: string | null;
  authLoading: boolean;
  dataLoading: boolean;
  authUser: FirebaseUser | null;
  userRecord: UserRecord | null;
  pendingOnboardingRole: 'buyer' | 'seller' | null;
  role: UserRole;
  publicPage: PublicPage;
  selectedCategoryId: string;
  buyerTab: BuyerTab;
  sellerTab: SellerTab;
  facilitatorTab: FacilitatorTab;
  adminTab: AdminTab;
  selectedRequirementId: string | null;
  selectedListingId: string | null;
  selectedMatchId: string | null;
  selectedOfferId: string | null;
  selectedOrderId: string | null;
  currentBuyer: BuyerAccount | null;
  currentSeller: SellerAccount | null;
  currentFacilitator: FacilitatorAccount | null;
  currentAdmin: AdminAccount | null;
  categories: EPRCategory[];
  subcategories: EPRSubcategory[];
  marketRates: MarketRateRecord[];
  transactions: TransactionRecord[];
  buyers: BuyerAccount[];
  sellers: SellerAccount[];
  facilitators: FacilitatorAccount[];
  admins: AdminAccount[];
  requirements: BuyerRequirement[];
  listings: SellerListing[];
  publicListings: SellerListing[];
  matches: MatchOpportunity[];
  offers: MarketplaceOffer[];
  negotiations: NegotiationEntry[];
  orders: MarketplaceOrder[];
  payments: PaymentRecord[];
  invoices: InvoiceRecord[];
  documents: DocumentRecord[];
  notifications: NotificationItem[];
  emailDeliveryLogs: EmailDeliveryLog[];
  auditLogs: AuditLogEntry[];
  platformSettings: PlatformSettingsRecord;
  toasts: ToastMessage[];
  navigatePublic: (page: PublicPage, categoryId?: string) => void;
  setBuyerTab: (tab: BuyerTab, id?: string) => void;
  setSellerTab: (tab: SellerTab, id?: string) => void;
  setFacilitatorTab: (tab: FacilitatorTab, id?: string) => void;
  setAdminTab: (tab: AdminTab) => void;
  signInGoogleForRole: (targetRole: 'buyer' | 'seller' | 'admin') => Promise<void>;
  signInStaffEmailPassword: (email: string, password: string, expectedRole: 'facilitator' | 'admin') => Promise<void>;
  sendFacilitatorPasswordReset: (email: string) => Promise<void>;
  submitOnboardingProfile: (data: {
    companyName: string;
    contactPerson: string;
    mobile: string;
    gstin: string;
    cin?: string;
    eprRegNo: string;
    city: string;
    state: string;
    recyclerType?: string;
    dealingCategories?: string[];
  }) => Promise<void>;
  logout: () => Promise<void>;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  dismissToast: (id: string) => void;
  submitBuyerRequirement: (
    params: {
      category: EPRCategory;
      subcategory: string;
      financialYear: string;
      requiredQty: number;
      maxBuyingRate: number;
      requiredDate?: string;
      additionalNotes?: string;
    },
    asDraft?: boolean
  ) => Promise<string>;
  withdrawRequirement: (id: string) => Promise<void>;
  submitSellerListing: (
    params: {
      category: EPRCategory;
      subcategory: string;
      financialYear: string;
      listedQty: number;
      askingRate: number;
      certificateRef?: string;
      additionalInfo?: string;
    },
    asDraft?: boolean
  ) => Promise<string>;
  updateListingStatus: (id: string, status: SellerListing['status']) => Promise<void>;
  editListing: (id: string, qty: number, askingRate: number, additionalInfo: string) => Promise<void>;
  respondToOffer: (
    offer: MarketplaceOffer,
    action: 'accept' | 'reject' | 'counter',
    counterRate?: number,
    counterQty?: number,
    message?: string
  ) => Promise<void>;
  facilitatorSendOffer: (
    match: MatchOpportunity,
    targetParty: 'buyer' | 'seller',
    rate: number,
    qty: number,
    expiryDate: string,
    message: string
  ) => Promise<void>;
  facilitatorAddNote: (match: MatchOpportunity, note: string) => Promise<void>;
  facilitatorConfirmAgreement: (match: MatchOpportunity, agreedRate: number) => Promise<void>;
  updateOrderStatus: (
    order: MarketplaceOrder,
    orderStatus: OrderStatus,
    paymentStatus?: MarketplaceOrder['paymentStatus'],
    transferStatus?: MarketplaceOrder['transferStatus']
  ) => Promise<void>;
  adminApproveListing: (listing: SellerListing, decision: 'Active' | 'Rejected') => Promise<void>;
  adminApproveRequirement: (req: BuyerRequirement, decision: 'Active' | 'Rejected') => Promise<void>;
  adminVerifyUser: (type: 'buyer' | 'seller', uid: string, verification: 'Verified' | 'Action Required') => Promise<void>;
  adminSaveCategory: (params: {
    id?: string;
    code: string;
    name: string;
    shortName: string;
    description: string;
    unit: 'MT' | 'KL' | 'Units';
    financialYears: string[];
    subcategories: string[];
    active: boolean;
  }) => Promise<void>;
  adminToggleCategory: (cat: EPRCategory) => Promise<void>;
  adminCreateStaffRecord: (params: {
    roleType: 'facilitator' | 'admin';
    uid: string;
    name: string;
    email: string;
    employeeId?: string;
    department?: string;
    roleTitle?: string;
  }) => Promise<void>;
  adminSavePlatformSettings: (settings: Omit<PlatformSettingsRecord, 'id' | 'updatedAt'>) => Promise<void>;
  recordPayment: (params: {
    order: MarketplaceOrder;
    partyType: 'Buyer Receivable' | 'Seller Payable';
    amount: number;
    paymentType: 'Advance' | 'Balance' | 'Settlement';
    paymentMethod: 'NEFT' | 'RTGS' | 'IMPS';
    referenceNumber: string;
    paymentDate: string;
  }) => Promise<void>;
  uploadDocumentFile: (
    category: DocumentRecord['category'],
    file: File,
    relatedId?: string
  ) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  retryFailedEmails: (notificationId?: string) => Promise<void>;
}

const MarketplaceContext = createContext<MarketplaceContextValue | null>(null);

const DEFAULT_SETTINGS: PlatformSettingsRecord = {
  id: 'default',
  defaultBrokeragePercent: 2.5,
  gstPercent: 18,
  matchingRateTolerancePercent: 10,
};

export const MarketplaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseReady, setFirebaseReady] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(firebaseConfigError);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);

  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [userRecord, setUserRecord] = useState<UserRecord | null>(null);
  const [pendingOnboardingRole, setPendingOnboardingRole] = useState<'buyer' | 'seller' | null>(null);

  const initialSearchParams =
    typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const initialPageParam = initialSearchParams?.get('page');
  const initialListingParam = initialSearchParams?.get('listing') || null;

  const [role, setRole] = useState<UserRole>('public');
  const [publicPage, setPublicPage] = useState<PublicPage>(
    initialPageParam === 'login' ? 'login' : 'home'
  );
  const [pendingListingDeepLink, setPendingListingDeepLink] = useState<string | null>(initialListingParam);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [buyerTab, setBuyerTabState] = useState<BuyerTab>('overview');
  const [sellerTab, setSellerTabState] = useState<SellerTab>('overview');
  const [facilitatorTab, setFacilitatorTabState] = useState<FacilitatorTab>('overview');
  const [adminTab, setAdminTab] = useState<AdminTab>('overview');

  const [selectedRequirementId, setSelectedRequirementId] = useState<string | null>(null);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const [currentBuyer, setCurrentBuyer] = useState<BuyerAccount | null>(null);
  const [currentSeller, setCurrentSeller] = useState<SellerAccount | null>(null);
  const [currentFacilitator, setCurrentFacilitator] = useState<FacilitatorAccount | null>(null);
  const [currentAdmin, setCurrentAdmin] = useState<AdminAccount | null>(null);

  const [categories, setCategories] = useState<EPRCategory[]>([]);
  const [subcategories, setSubcategories] = useState<EPRSubcategory[]>([]);
  const [marketRates, setMarketRates] = useState<MarketRateRecord[]>([]);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [buyers, setBuyers] = useState<BuyerAccount[]>([]);
  const [sellers, setSellers] = useState<SellerAccount[]>([]);
  const [facilitators, setFacilitators] = useState<FacilitatorAccount[]>([]);
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [requirements, setRequirements] = useState<BuyerRequirement[]>([]);
  const [listings, setListings] = useState<SellerListing[]>([]);
  const [publicListings, setPublicListings] = useState<SellerListing[]>([]);
  const [matches, setMatches] = useState<MatchOpportunity[]>([]);
  const [offers, setOffers] = useState<MarketplaceOffer[]>([]);
  const [negotiations, setNegotiations] = useState<NegotiationEntry[]>([]);
  const [orders, setOrders] = useState<MarketplaceOrder[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [emailDeliveryLogs, setEmailDeliveryLogs] = useState<EmailDeliveryLog[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettingsRecord>(DEFAULT_SETTINGS);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const navigatePublic = (page: PublicPage, categoryId?: string) => {
    if (role !== 'public' && page !== 'login') {
      // keep authenticated unless explicitly logging out, or allow navigating back
      setRole('public');
    }
    setPublicPage(page);
    if (categoryId) setSelectedCategoryId(categoryId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setBuyerTab = (tab: BuyerTab, id?: string) => {
    setBuyerTabState(tab);
    if (id) {
      if (tab === 'requirement-details') setSelectedRequirementId(id);
      if (tab === 'offer-details') setSelectedOfferId(id);
      if (tab === 'order-details') setSelectedOrderId(id);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setSellerTab = (tab: SellerTab, id?: string) => {
    setSellerTabState(tab);
    if (id) {
      if (tab === 'listing-details') setSelectedListingId(id);
      if (tab === 'offer-details') setSelectedOfferId(id);
      if (tab === 'order-details') setSelectedOrderId(id);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setFacilitatorTab = (tab: FacilitatorTab, id?: string) => {
    setFacilitatorTabState(tab);
    if (id && tab === 'match-details') setSelectedMatchId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 1. Boot Connection Test
  useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await testFirestoreConnection();
      if (!mounted) return;
      if (!res.ok) {
        setConnectionError(res.error || 'Failed to connect to Firebase.');
      } else {
        setConnectionError(null);
        setFirebaseReady(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // 2. Public Real-Time Listeners (categories, subcategories, market_rates, transactions, anonymized active listings)
  useEffect(() => {
    if (!firebaseReady || !db) return;
    const unsubs: Unsubscribe[] = [];

    const onErr = (path: string) => (err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err);
      setPermissionError(`Firestore access error on ${path}: ${msg}`);
      try {
        handleFirestoreError(err, OperationType.LIST, path);
      } catch {
        // already logged
      }
    };

    if (role !== 'admin') {
      unsubs.push(
        onSnapshot(
          query(collection(db, 'categories'), where('active', '==', true)),
          (snap) => {
            const list = snap.docs.map((d) => d.data() as EPRCategory);
            setCategories(list);
            if (list.length > 0 && !selectedCategoryId) {
              setSelectedCategoryId(list[0].id);
            }
          },
          onErr('categories')
        )
      );

      unsubs.push(
        onSnapshot(
          query(collection(db, 'subcategories'), where('active', '==', true)),
          (snap) => setSubcategories(snap.docs.map((d) => d.data() as EPRSubcategory)),
          onErr('subcategories')
        )
      );
    }

    unsubs.push(
      onSnapshot(
        collection(db, 'market_rates'),
        (snap) => setMarketRates(snap.docs.map((d) => d.data() as MarketRateRecord)),
        onErr('market_rates')
      )
    );

    unsubs.push(
      onSnapshot(
        collection(db, 'transactions'),
        (snap) => setTransactions(snap.docs.map((d) => d.data() as TransactionRecord)),
        onErr('transactions')
      )
    );

    unsubs.push(
      onSnapshot(
        query(collection(db, 'seller_listings'), where('status', 'in', ['Active', 'Partially Allocated'])),
        (snap) => setPublicListings(snap.docs.map((d) => d.data() as SellerListing)),
        onErr('seller_listings')
      )
    );

    return () => unsubs.forEach((u) => u());
  }, [firebaseReady, role]);

  // 3. Auth State Listener
  useEffect(() => {
    if (!firebaseConfigured || !auth) {
      setAuthLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setAuthUser(fbUser);
      setPermissionError(null);
      if (!fbUser) {
        setUserRecord(null);
        setCurrentBuyer(null);
        setCurrentSeller(null);
        setCurrentFacilitator(null);
        setCurrentAdmin(null);
        setRole('public');
        setAuthLoading(false);
        return;
      }

      if (!fbUser.emailVerified) {
        setPermissionError(
          'Your Firebase Auth email address is not verified yet. Please verify your email address in Firebase Authentication before signing in.'
        );
        setRole('public');
        setAuthLoading(false);
        return;
      }

      try {
        // Check admin record or bootstrapped admin email
        const adminDoc = await getDoc(doc(db, 'admins', fbUser.uid));
        if (adminDoc.exists() || (fbUser.email === BOOTSTRAPPED_ADMIN_EMAIL && fbUser.emailVerified)) {
          const adm: AdminAccount = adminDoc.exists()
            ? (adminDoc.data() as AdminAccount)
            : {
                uid: fbUser.uid,
                name: fbUser.displayName || 'Platform Administrator',
                email: fbUser.email || BOOTSTRAPPED_ADMIN_EMAIL,
                roleTitle: 'Super Administrator',
                status: 'Active',
              };
          setCurrentAdmin(adm);
          setRole('admin');
          setAuthLoading(false);
          return;
        }

        // Check facilitator record
        const facDoc = await getDoc(doc(db, 'facilitators', fbUser.uid));
        if (facDoc.exists()) {
          const fac = facDoc.data() as FacilitatorAccount;
          if (fac.status !== 'Active') {
            setPublicPage('access-denied');
            setRole('public');
            setAuthLoading(false);
            return;
          }
          setCurrentFacilitator(fac);
          setRole('facilitator');
          setAuthLoading(false);
          return;
        }

        // Check user record (buyer or seller)
        const userSnap = await getDoc(doc(db, 'users', fbUser.uid));
        if (!userSnap.exists()) {
          // Signed in via Google for first time -> require profile completion
          setUserRecord(null);
          setRole('public');
          setPublicPage('profile-completion');
          setAuthLoading(false);
          return;
        }

        const uRec = userSnap.data() as UserRecord;
        setUserRecord(uRec);
        if (!uRec.profileCompleted) {
          setPendingOnboardingRole(uRec.role === 'seller' ? 'seller' : 'buyer');
          setRole('public');
          setPublicPage('profile-completion');
          setAuthLoading(false);
          return;
        }

        if (uRec.role === 'buyer') {
          const bSnap = await getDoc(doc(db, 'buyers', fbUser.uid));
          setCurrentBuyer(bSnap.exists() ? (bSnap.data() as BuyerAccount) : null);
          setRole('buyer');
        } else if (uRec.role === 'seller') {
          const sSnap = await getDoc(doc(db, 'sellers', fbUser.uid));
          setCurrentSeller(sSnap.exists() ? (sSnap.data() as SellerAccount) : null);
          setRole('seller');
        } else {
          setPublicPage('access-denied');
          setRole('public');
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setPermissionError(msg);
      } finally {
        setAuthLoading(false);
      }
    });

    return () => unsub();
  }, []);

  // 4. Role-Specific Real-Time Firestore Listeners (Only active when authenticated & role resolved!)
  useEffect(() => {
    if (!firebaseReady || !db || !authUser || role === 'public') return;
    setDataLoading(true);
    const uid = authUser.uid;
    const unsubs: Unsubscribe[] = [];

    const onErr = (path: string) => (err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err);
      setPermissionError(`Permission or network error loading ${path}: ${msg}`);
      setDataLoading(false);
      try {
        handleFirestoreError(err, OperationType.LIST, path);
      } catch {
        // logged
      }
    };

    const done = () => setDataLoading(false);

    if (role === 'buyer') {
      unsubs.push(
        onSnapshot(doc(db, 'buyers', uid), (s) => {
          if (s.exists()) setCurrentBuyer(s.data() as BuyerAccount);
          done();
        }, onErr(`buyers/${uid}`))
      );
      unsubs.push(
        onSnapshot(query(collection(db, 'buyer_requirements'), where('buyerUid', '==', uid)), (s) => {
          setRequirements(s.docs.map((d) => d.data() as BuyerRequirement));
        }, onErr('buyer_requirements'))
      );
      unsubs.push(
        onSnapshot(query(collection(db, 'matches'), where('buyerUid', '==', uid)), (s) => {
          setMatches(s.docs.map((d) => d.data() as MatchOpportunity));
        }, onErr('matches'))
      );
      unsubs.push(
        onSnapshot(query(collection(db, 'offers'), where('partyUid', '==', uid)), (s) => {
          setOffers(s.docs.map((d) => d.data() as MarketplaceOffer));
        }, onErr('offers'))
      );
      unsubs.push(
        onSnapshot(
          query(collection(db, 'negotiations'), where('buyerUid', '==', uid), where('visibleToBuyer', '==', true)),
          (s) => setNegotiations(s.docs.map((d) => d.data() as NegotiationEntry)),
          onErr('negotiations')
        )
      );
      unsubs.push(
        onSnapshot(query(collection(db, 'orders'), where('buyerUid', '==', uid)), (s) => {
          setOrders(s.docs.map((d) => d.data() as MarketplaceOrder));
        }, onErr('orders'))
      );
      unsubs.push(
        onSnapshot(query(collection(db, 'payments'), where('buyerUid', '==', uid)), (s) => {
          setPayments(s.docs.map((d) => d.data() as PaymentRecord));
        }, onErr('payments'))
      );
      unsubs.push(
        onSnapshot(query(collection(db, 'invoices'), where('buyerUid', '==', uid)), (s) => {
          setInvoices(s.docs.map((d) => d.data() as InvoiceRecord));
        }, onErr('invoices'))
      );
      unsubs.push(
        onSnapshot(query(collection(db, 'documents'), where('ownerUid', '==', uid)), (s) => {
          setDocuments(s.docs.map((d) => d.data() as DocumentRecord));
        }, onErr('documents'))
      );
      unsubs.push(
        onSnapshot(query(collection(db, 'notifications'), where('recipientUid', '==', uid)), (s) => {
          setNotifications(s.docs.map((d) => d.data() as NotificationItem));
        }, onErr('notifications'))
      );
    } else if (role === 'seller') {
      unsubs.push(
        onSnapshot(doc(db, 'sellers', uid), (s) => {
          if (s.exists()) setCurrentSeller(s.data() as SellerAccount);
          done();
        }, onErr(`sellers/${uid}`))
      );
      unsubs.push(
        onSnapshot(query(collection(db, 'seller_listings'), where('sellerUid', '==', uid)), (s) => {
          setListings(s.docs.map((d) => d.data() as SellerListing));
        }, onErr('seller_listings'))
      );
      unsubs.push(
        onSnapshot(query(collection(db, 'matches'), where('sellerUid', '==', uid)), (s) => {
          setMatches(s.docs.map((d) => d.data() as MatchOpportunity));
        }, onErr('matches'))
      );
      unsubs.push(
        onSnapshot(query(collection(db, 'offers'), where('partyUid', '==', uid)), (s) => {
          setOffers(s.docs.map((d) => d.data() as MarketplaceOffer));
        }, onErr('offers'))
      );
      unsubs.push(
        onSnapshot(
          query(collection(db, 'negotiations'), where('sellerUid', '==', uid), where('visibleToSeller', '==', true)),
          (s) => setNegotiations(s.docs.map((d) => d.data() as NegotiationEntry)),
          onErr('negotiations')
        )
      );
      unsubs.push(
        onSnapshot(query(collection(db, 'orders'), where('sellerUid', '==', uid)), (s) => {
          setOrders(s.docs.map((d) => d.data() as MarketplaceOrder));
        }, onErr('orders'))
      );
      unsubs.push(
        onSnapshot(query(collection(db, 'payments'), where('sellerUid', '==', uid)), (s) => {
          setPayments(s.docs.map((d) => d.data() as PaymentRecord));
        }, onErr('payments'))
      );
      unsubs.push(
        onSnapshot(query(collection(db, 'invoices'), where('sellerUid', '==', uid)), (s) => {
          setInvoices(s.docs.map((d) => d.data() as InvoiceRecord));
        }, onErr('invoices'))
      );
      unsubs.push(
        onSnapshot(query(collection(db, 'documents'), where('ownerUid', '==', uid)), (s) => {
          setDocuments(s.docs.map((d) => d.data() as DocumentRecord));
        }, onErr('documents'))
      );
      unsubs.push(
        onSnapshot(query(collection(db, 'notifications'), where('recipientUid', '==', uid)), (s) => {
          setNotifications(s.docs.map((d) => d.data() as NotificationItem));
        }, onErr('notifications'))
      );
    } else if (role === 'facilitator' || role === 'admin') {
      unsubs.push(onSnapshot(collection(db, 'buyers'), (s) => { setBuyers(s.docs.map((d) => d.data() as BuyerAccount)); done(); }, onErr('buyers')));
      unsubs.push(onSnapshot(collection(db, 'sellers'), (s) => setSellers(s.docs.map((d) => d.data() as SellerAccount)), onErr('sellers')));
      unsubs.push(onSnapshot(collection(db, 'buyer_requirements'), (s) => setRequirements(s.docs.map((d) => d.data() as BuyerRequirement)), onErr('buyer_requirements')));
      unsubs.push(onSnapshot(collection(db, 'seller_listings'), (s) => setListings(s.docs.map((d) => d.data() as SellerListing)), onErr('seller_listings')));
      unsubs.push(onSnapshot(collection(db, 'matches'), (s) => setMatches(s.docs.map((d) => d.data() as MatchOpportunity)), onErr('matches')));
      unsubs.push(onSnapshot(collection(db, 'offers'), (s) => setOffers(s.docs.map((d) => d.data() as MarketplaceOffer)), onErr('offers')));
      unsubs.push(onSnapshot(collection(db, 'negotiations'), (s) => setNegotiations(s.docs.map((d) => d.data() as NegotiationEntry)), onErr('negotiations')));
      unsubs.push(onSnapshot(collection(db, 'orders'), (s) => setOrders(s.docs.map((d) => d.data() as MarketplaceOrder)), onErr('orders')));
      unsubs.push(onSnapshot(collection(db, 'payments'), (s) => setPayments(s.docs.map((d) => d.data() as PaymentRecord)), onErr('payments')));
      unsubs.push(onSnapshot(collection(db, 'invoices'), (s) => setInvoices(s.docs.map((d) => d.data() as InvoiceRecord)), onErr('invoices')));
      unsubs.push(onSnapshot(collection(db, 'documents'), (s) => setDocuments(s.docs.map((d) => d.data() as DocumentRecord)), onErr('documents')));
      unsubs.push(onSnapshot(query(collection(db, 'notifications'), where('recipientUid', '==', uid)), (s) => setNotifications(s.docs.map((d) => d.data() as NotificationItem)), onErr('notifications')));
      unsubs.push(onSnapshot(collection(db, 'email_delivery_logs'), (s) => setEmailDeliveryLogs(s.docs.map((d) => d.data() as EmailDeliveryLog)), onErr('email_delivery_logs')));

      if (role === 'admin') {
        unsubs.push(onSnapshot(collection(db, 'categories'), (s) => setCategories(s.docs.map((d) => d.data() as EPRCategory)), onErr('categories')));
        unsubs.push(onSnapshot(collection(db, 'subcategories'), (s) => setSubcategories(s.docs.map((d) => d.data() as EPRSubcategory)), onErr('subcategories')));
        unsubs.push(onSnapshot(collection(db, 'facilitators'), (s) => setFacilitators(s.docs.map((d) => d.data() as FacilitatorAccount)), onErr('facilitators')));
        unsubs.push(onSnapshot(collection(db, 'admins'), (s) => setAdmins(s.docs.map((d) => d.data() as AdminAccount)), onErr('admins')));
        unsubs.push(onSnapshot(collection(db, 'audit_logs'), (s) => setAuditLogs(s.docs.map((d) => d.data() as AuditLogEntry)), onErr('audit_logs')));
        unsubs.push(
          onSnapshot(doc(db, 'platform_settings', 'default'), (s) => {
            if (s.exists()) setPlatformSettings(s.data() as PlatformSettingsRecord);
          }, onErr('platform_settings/default'))
        );
      }
    }

    return () => unsubs.forEach((u) => u());
  }, [firebaseReady, authUser, role]);

  // Handle post-login deep link (?listing=...)
  useEffect(() => {
    if (!pendingListingDeepLink || role === 'public') return;
    const refId = pendingListingDeepLink;
    if (role === 'buyer') {
      if (refId.startsWith('REQ-')) {
        setBuyerTabState('requirement-details');
        setSelectedRequirementId(refId);
      } else {
        setBuyerTabState('notifications');
      }
      setPendingListingDeepLink(null);
    } else if (role === 'seller') {
      if (refId.startsWith('LST-')) {
        setSellerTabState('listing-details');
        setSelectedListingId(refId);
      } else {
        setSellerTabState('notifications');
      }
      setPendingListingDeepLink(null);
    } else if (role === 'facilitator') {
      setFacilitatorTabState(refId.startsWith('REQ-') ? 'buyer-requirements' : 'seller-listings');
      setPendingListingDeepLink(null);
    } else if (role === 'admin') {
      setAdminTab(refId.startsWith('REQ-') ? 'requirement-approval' : 'listing-approval');
      setPendingListingDeepLink(null);
    }
  }, [pendingListingDeepLink, role]);

  const signInGoogleForRole = async (targetRole: 'buyer' | 'seller' | 'admin') => {
    if (!auth) throw new Error('Firebase Auth is not initialized.');
    if (targetRole === 'buyer' || targetRole === 'seller') {
      setPendingOnboardingRole(targetRole);
    }
    const cred = await signInWithPopup(auth, googleProvider);
    if (targetRole === 'admin') {
      const admDoc = await getDoc(doc(db, 'admins', cred.user.uid));
      if (!admDoc.exists() && cred.user.email !== BOOTSTRAPPED_ADMIN_EMAIL) {
        await signOut(auth);
        setPublicPage('access-denied');
        throw new Error('This Google account is not authorised for Admin access.');
      }
    }
  };

  const signInStaffEmailPassword = async (
    email: string,
    password: string,
    expectedRole: 'facilitator' | 'admin'
  ) => {
    if (!auth) throw new Error('Firebase Auth is not initialized.');
    if (expectedRole === 'facilitator' && !email.trim().toLowerCase().endsWith('@eprbazaar.com')) {
      throw new Error('Facilitator access requires an authorised @eprbazaar.com email address.');
    }
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    if (!cred.user.emailVerified) {
      await signOut(auth);
      throw new Error(
        'This staff account email is not marked verified in Firebase Authentication. Verify the email before signing in.'
      );
    }
    if (expectedRole === 'facilitator') {
      const facSnap = await getDoc(doc(db, 'facilitators', cred.user.uid));
      if (!facSnap.exists()) {
        await signOut(auth);
        setPublicPage('access-denied');
        throw new Error('No active facilitator record found for this account.');
      }
    } else {
      const admSnap = await getDoc(doc(db, 'admins', cred.user.uid));
      if (!admSnap.exists() && cred.user.email !== BOOTSTRAPPED_ADMIN_EMAIL) {
        await signOut(auth);
        setPublicPage('access-denied');
        throw new Error('No active administrator record found for this account.');
      }
    }
  };

  const sendFacilitatorPasswordReset = async (email: string) => {
    if (!auth) throw new Error('Firebase Auth is not initialized.');
    if (!email.trim().toLowerCase().endsWith('@eprbazaar.com')) {
      throw new Error('Only authorised @eprbazaar.com facilitator accounts can reset password here.');
    }
    await sendPasswordResetEmail(auth, email.trim());
    addToast({ type: 'success', title: 'Password reset email sent via Firebase Auth' });
  };

  const submitOnboardingProfile = async (data: {
    companyName: string;
    contactPerson: string;
    mobile: string;
    gstin: string;
    cin?: string;
    eprRegNo: string;
    city: string;
    state: string;
    recyclerType?: string;
    dealingCategories?: string[];
  }) => {
    if (!authUser) throw new Error('Authenticated session required.');
    const chosenRole = pendingOnboardingRole || 'buyer';
    await completeCompanyOnboarding({
      uid: authUser.uid,
      email: authUser.email || '',
      displayName: authUser.displayName || data.contactPerson,
      role: chosenRole,
      ...data,
    });
    await writeAuditLog(
      authUser.uid,
      authUser.email || '',
      chosenRole,
      'Completed Onboarding Profile',
      data.companyName,
      `Registered ${chosenRole} account with GSTIN ${data.gstin}`
    );
    setRole(chosenRole);
    addToast({ type: 'success', title: 'Company profile completed' });
  };

  const logout = async () => {
    if (auth) await signOut(auth);
    setRole('public');
    setPublicPage('home');
    setPendingOnboardingRole(null);
    setBuyers([]);
    setSellers([]);
    setFacilitators([]);
    setAdmins([]);
    setRequirements([]);
    setListings([]);
    setMatches([]);
    setOffers([]);
    setNegotiations([]);
    setOrders([]);
    setPayments([]);
    setInvoices([]);
    setDocuments([]);
    setNotifications([]);
    setEmailDeliveryLogs([]);
    setAuditLogs([]);
    addToast({ type: 'info', title: 'Signed out' });
  };

  const triggerListingEmailDispatch = async (
    listingId: string,
    notificationType: 'buyer_requirement' | 'seller_listing'
  ) => {
    if (!authUser) return;
    try {
      const idToken = await authUser.getIdToken();
      const emailRes = await dispatchCategoryEmailNotificationsApi(idToken, listingId, notificationType);
      if (emailRes.ok) {
        if ((emailRes.dispatchedCount || 0) > 0) {
          addToast({
            type: 'success',
            title: `Email alerts sent to ${emailRes.dispatchedCount} matched ${
              notificationType === 'buyer_requirement' ? 'seller(s)' : 'buyer(s)'
            }`,
          });
        } else if ((emailRes.failedCount || 0) > 0) {
          addToast({
            type: 'warning',
            title: `${emailRes.failedCount} email alert(s) failed & logged for retry`,
            description: emailRes.providerConfigured === false
              ? 'Email provider credentials are not configured on the backend server yet.'
              : undefined,
          });
        }
      } else if (emailRes.error) {
        addToast({
          type: 'warning',
          title: 'Email notification dispatch skipped',
          description: emailRes.error,
        });
      }
    } catch {
      // Do not block Firestore listing save if notification endpoint is unavailable
    }
  };

  const submitBuyerRequirement = async (
    params: {
      category: EPRCategory;
      subcategory: string;
      financialYear: string;
      requiredQty: number;
      maxBuyingRate: number;
      requiredDate?: string;
      additionalNotes?: string;
    },
    asDraft = false
  ) => {
    if (!authUser) throw new Error('Authentication required');
    const id = await createBuyerRequirementDoc(
      {
        buyerUid: authUser.uid,
        ...params,
        asDraft,
      },
      platformSettings.matchingRateTolerancePercent
    );
    await writeAuditLog(
      authUser.uid,
      authUser.email || '',
      'Buyer',
      asDraft ? 'Saved Requirement Draft' : 'Submitted Requirement',
      id,
      `${params.requiredQty} ${params.category.unit} ${params.category.name}`
    );
    addToast({
      type: 'success',
      title: asDraft ? `Draft ${id} saved` : `Requirement ${id} published`,
    });
    if (!asDraft) {
      await triggerListingEmailDispatch(id, 'buyer_requirement');
    }
    return id;
  };

  const withdrawRequirement = async (id: string) => {
    try {
      await updateDoc(doc(db, 'buyer_requirements', id), {
        status: 'Withdrawn',
        updatedAt: serverTimestamp(),
      });
      addToast({ type: 'warning', title: `Requirement ${id} withdrawn` });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `buyer_requirements/${id}`);
    }
  };

  const submitSellerListing = async (
    params: {
      category: EPRCategory;
      subcategory: string;
      financialYear: string;
      listedQty: number;
      askingRate: number;
      certificateRef?: string;
      additionalInfo?: string;
    },
    asDraft = false
  ) => {
    if (!authUser) throw new Error('Authentication required');
    const isVerifiedSeller = currentSeller?.verification === 'Verified';
    const { id, status } = await createSellerListingDoc(
      {
        sellerUid: authUser.uid,
        ...params,
        asDraft,
        isVerifiedSeller,
      },
      platformSettings.matchingRateTolerancePercent
    );
    await writeAuditLog(
      authUser.uid,
      authUser.email || '',
      'Seller',
      asDraft ? 'Saved Listing Draft' : status === 'Active' ? 'Published Active Listing' : 'Submitted Listing for Approval',
      id,
      `${params.listedQty} ${params.category.unit} ${params.category.name}`
    );
    addToast({
      type: 'success',
      title: asDraft
        ? `Draft ${id} saved`
        : status === 'Active'
          ? `Listing ${id} published live`
          : `Listing ${id} submitted for Admin approval`,
    });
    if (!asDraft && status === 'Active') {
      await triggerListingEmailDispatch(id, 'seller_listing');
    }
    return id;
  };

  const updateListingStatus = async (id: string, status: SellerListing['status']) => {
    try {
      await updateDoc(doc(db, 'seller_listings', id), {
        status,
        updatedAt: serverTimestamp(),
      });
      if (role === 'admin' || role === 'facilitator') {
        const targetListing = listings.find((l) => l.id === id);
        const cat = categories.find((c) => c.id === targetListing?.categoryId);
        if (cat && targetListing) {
          await recomputeMarketRate(cat, targetListing.financialYear);
        }
      }
      addToast({ type: 'info', title: `Listing ${id} updated to ${status}` });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `seller_listings/${id}`);
    }
  };

  const editListing = async (id: string, qty: number, askingRate: number, additionalInfo: string) => {
    const existing = listings.find((l) => l.id === id);
    if (!existing) return;
    try {
      await updateDoc(doc(db, 'seller_listings', id), {
        listedQty: qty,
        remainingQty: Math.max(0, qty - existing.allocatedQty),
        askingRate,
        additionalInfo: additionalInfo.slice(0, 1000),
        updatedAt: serverTimestamp(),
      });
      if (role === 'admin' || role === 'facilitator') {
        const cat = categories.find((c) => c.id === existing.categoryId);
        if (cat) await recomputeMarketRate(cat, existing.financialYear);
      }
      addToast({ type: 'success', title: `Listing ${id} updated` });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `seller_listings/${id}`);
    }
  };

  const respondToOffer = async (
    offer: MarketplaceOffer,
    action: 'accept' | 'reject' | 'counter',
    counterRate?: number,
    counterQty?: number,
    message?: string
  ) => {
    if (!authUser) return;
    const match = matches.find((m) => m.id === offer.matchId);
    if (!match) return;
    await respondToOfferDoc({
      offer,
      match,
      actorUid: authUser.uid,
      action,
      counterRate,
      counterQty,
      message,
    });
    if (match.assignedFacilitatorUid) {
      await createNotificationIfUnique(
        match.assignedFacilitatorUid,
        'facilitator',
        'Offers',
        `Offer ${offer.id} ${action.toUpperCase()}`,
        `${offer.targetParty} responded to offer ${offer.id} on match ${match.id}.`,
        `offer_resp_${offer.id}_${action}_${Date.now()}`
      );
    }
    addToast({ type: 'success', title: `Offer ${offer.id} response recorded` });
  };

  const facilitatorSendOffer = async (
    match: MatchOpportunity,
    targetParty: 'buyer' | 'seller',
    rate: number,
    qty: number,
    expiryDate: string,
    message: string
  ) => {
    if (!authUser) return;
    const offerId = await facilitatorSendOfferDoc({
      match,
      facilitatorUid: authUser.uid,
      targetParty,
      rate,
      quantity: qty,
      expiryDate,
      message,
      gstPercent: platformSettings.gstPercent,
    });
    await writeAuditLog(
      authUser.uid,
      authUser.email || '',
      'Facilitator',
      'Issued Offer',
      offerId,
      `Sent to ${targetParty} @ ₹${rate}/${match.unit}`
    );
    addToast({ type: 'success', title: `Offer ${offerId} sent to ${targetParty}` });
  };

  const facilitatorAddNote = async (match: MatchOpportunity, note: string) => {
    if (!authUser) return;
    const negId = `NEG-${Date.now()}`;
    try {
      await setDoc(doc(db, 'negotiations', negId), {
        id: negId,
        matchId: match.id,
        buyerUid: match.buyerUid,
        sellerUid: match.sellerUid,
        actor: 'Facilitator',
        actorUid: authUser.uid,
        actionType: 'Facilitator Note',
        message: note.slice(0, 1000),
        visibleToBuyer: false,
        visibleToSeller: false,
        createdAt: serverTimestamp(),
      });
      addToast({ type: 'info', title: 'Facilitator note recorded' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `negotiations/${negId}`);
    }
  };

  const facilitatorConfirmAgreement = async (match: MatchOpportunity, agreedRate: number) => {
    if (!authUser) return;
    const orderId = await confirmMatchAndCreateOrderDoc({
      match,
      facilitatorUid: authUser.uid,
      agreedRate,
      settings: platformSettings,
    });
    await writeAuditLog(
      authUser.uid,
      authUser.email || '',
      'Facilitator',
      'Confirmed Deal & Created Order',
      orderId,
      `Match ${match.id} agreed @ ₹${agreedRate}`
    );
    addToast({ type: 'success', title: `Order ${orderId} created` });
  };

  const updateOrderStatus = async (
    order: MarketplaceOrder,
    orderStatus: OrderStatus,
    paymentStatus?: MarketplaceOrder['paymentStatus'],
    transferStatus?: MarketplaceOrder['transferStatus']
  ) => {
    const cat = categories.find((c) => c.id === order.categoryId);
    await updateOrderStatusDoc({
      order,
      orderStatus,
      paymentStatus,
      transferStatus,
      category: cat,
    });
    addToast({ type: 'success', title: `Order ${order.id} updated to ${orderStatus}` });
  };

  const adminApproveListing = async (listing: SellerListing, decision: 'Active' | 'Rejected') => {
    if (!authUser) return;
    try {
      await updateDoc(doc(db, 'seller_listings', listing.id), {
        status: decision,
        updatedAt: serverTimestamp(),
      });
      const cat = categories.find((c) => c.id === listing.categoryId);
      if (cat) await recomputeMarketRate(cat, listing.financialYear);
      if (decision === 'Active') {
        await runMatchingForListing({ ...listing, status: 'Active' }, platformSettings.matchingRateTolerancePercent);
        await triggerListingEmailDispatch(listing.id, 'seller_listing');
      }
      await writeAuditLog(
        authUser.uid,
        authUser.email || '',
        'Admin',
        `Listing ${decision}`,
        listing.id,
        `${listing.categoryName} (${listing.listedQty} ${listing.unit})`
      );
      addToast({ type: decision === 'Active' ? 'success' : 'warning', title: `Listing ${listing.id} marked ${decision}` });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `seller_listings/${listing.id}`);
    }
  };

  const adminApproveRequirement = async (req: BuyerRequirement, decision: 'Active' | 'Rejected') => {
    if (!authUser) return;
    try {
      await updateDoc(doc(db, 'buyer_requirements', req.id), {
        status: decision,
        updatedAt: serverTimestamp(),
      });
      if (decision === 'Active') {
        await runMatchingForRequirement({ ...req, status: 'Active' }, platformSettings.matchingRateTolerancePercent);
        await triggerListingEmailDispatch(req.id, 'buyer_requirement');
      }
      await writeAuditLog(
        authUser.uid,
        authUser.email || '',
        'Admin',
        `Requirement ${decision}`,
        req.id,
        `${req.categoryName} (${req.requiredQty} ${req.unit})`
      );
      addToast({ type: decision === 'Active' ? 'success' : 'warning', title: `Requirement ${req.id} marked ${decision}` });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `buyer_requirements/${req.id}`);
    }
  };

  const adminVerifyUser = async (type: 'buyer' | 'seller', uid: string, verification: 'Verified' | 'Action Required') => {
    if (!authUser) return;
    const col = type === 'buyer' ? 'buyers' : 'sellers';
    try {
      await updateDoc(doc(db, col, uid), {
        verification,
        updatedAt: serverTimestamp(),
      });
      await writeAuditLog(authUser.uid, authUser.email || '', 'Admin', `KYC ${verification}`, uid, `Updated ${type}`);
      addToast({ type: 'success', title: `Participant ${uid} marked ${verification}` });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${col}/${uid}`);
    }
  };

  const adminSaveCategory = async (params: {
    id?: string;
    code: string;
    name: string;
    shortName: string;
    description: string;
    unit: 'MT' | 'KL' | 'Units';
    financialYears: string[];
    subcategories: string[];
    active: boolean;
  }) => {
    await saveCategoryWithSubcategories(params);
    addToast({ type: 'success', title: `Category ${params.name} saved` });
  };

  const adminToggleCategory = async (cat: EPRCategory) => {
    try {
      await updateDoc(doc(db, 'categories', cat.id), { active: !cat.active });
      addToast({ type: 'info', title: `${cat.name} ${cat.active ? 'disabled' : 'enabled'}` });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `categories/${cat.id}`);
    }
  };

  const adminCreateStaffRecord = async (params: {
    roleType: 'facilitator' | 'admin';
    uid: string;
    name: string;
    email: string;
    employeeId?: string;
    department?: string;
    roleTitle?: string;
  }) => {
    if (!authUser) return;
    const cleanUid = params.uid.trim();
    if (!/^[a-zA-Z0-9_-]{1,128}$/.test(cleanUid)) {
      throw new Error('Firebase Auth UID must contain only letters, numbers, hyphens, or underscores.');
    }
    if (params.roleType === 'facilitator' && !params.email.trim().toLowerCase().endsWith('@eprbazaar.com')) {
      throw new Error('Facilitator email must belong to @eprbazaar.com');
    }
    const targetCol = params.roleType === 'facilitator' ? 'facilitators' : 'admins';
    try {
      if (params.roleType === 'facilitator') {
        await setDoc(doc(db, 'facilitators', cleanUid), {
          uid: cleanUid,
          employeeId: params.employeeId || `EMP-${Date.now().toString().slice(-4)}`,
          name: params.name,
          email: params.email.trim().toLowerCase(),
          department: params.department || 'Trading Desk',
          status: 'Active',
          createdAt: serverTimestamp(),
        });
      } else {
        await setDoc(doc(db, 'admins', cleanUid), {
          uid: cleanUid,
          name: params.name,
          email: params.email.trim().toLowerCase(),
          roleTitle: params.roleTitle || 'Operations Admin',
          status: 'Active',
          createdAt: serverTimestamp(),
        });
      }
      await writeAuditLog(authUser.uid, authUser.email || '', 'Admin', `Created ${params.roleType}`, cleanUid, params.email);
      addToast({ type: 'success', title: `${params.roleType} access provisioned in Firestore` });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `${targetCol}/${cleanUid}`);
    }
  };

  const adminSavePlatformSettings = async (settings: Omit<PlatformSettingsRecord, 'id' | 'updatedAt'>) => {
    try {
      await setDoc(doc(db, 'platform_settings', 'default'), {
        id: 'default',
        ...settings,
        updatedAt: serverTimestamp(),
      });
      addToast({ type: 'success', title: 'Platform settings saved' });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'platform_settings/default');
    }
  };

  const recordPayment = async (params: {
    order: MarketplaceOrder;
    partyType: 'Buyer Receivable' | 'Seller Payable';
    amount: number;
    paymentType: 'Advance' | 'Balance' | 'Settlement';
    paymentMethod: 'NEFT' | 'RTGS' | 'IMPS';
    referenceNumber: string;
    paymentDate: string;
  }) => {
    const id = `PAY-${Date.now().toString().slice(-6)}`;
    try {
      await setDoc(doc(db, 'payments', id), {
        id,
        orderId: params.order.id,
        buyerUid: params.order.buyerUid,
        sellerUid: params.order.sellerUid,
        partyType: params.partyType,
        amount: params.amount,
        paymentType: params.paymentType,
        paymentDate: params.paymentDate,
        paymentMethod: params.paymentMethod,
        referenceNumber: params.referenceNumber,
        status: 'Verified',
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, 'orders', params.order.id), {
        paymentStatus: params.paymentType === 'Balance' ? 'Fully Paid' : 'Advance Paid',
        orderStatus: params.paymentType === 'Balance' ? 'Payment Completed' : 'Advance Received',
        updatedAt: serverTimestamp(),
      });
      addToast({ type: 'success', title: `Payment ${id} recorded` });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `payments/${id}`);
    }
  };

  const uploadDocumentFile = async (
    category: DocumentRecord['category'],
    file: File,
    relatedId?: string
  ) => {
    if (!authUser) throw new Error('Authentication required');
    const ownerRole: 'buyer' | 'seller' | 'admin' =
      role === 'seller' ? 'seller' : role === 'admin' ? 'admin' : 'buyer';
    await uploadProtectedDocument({
      ownerUid: authUser.uid,
      ownerRole,
      category,
      file,
      relatedId,
    });
    addToast({ type: 'success', title: `Uploaded ${file.name} to Firebase Storage` });
  };

  const markNotificationRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `notifications/${id}`);
    }
  };

  const markAllNotificationsRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    await Promise.all(unread.map((n) => updateDoc(doc(db, 'notifications', n.id), { read: true })));
    addToast({ type: 'info', title: 'All notifications marked read' });
  };

  const retryFailedEmails = async (notificationId?: string) => {
    if (!authUser) return;
    const idToken = await authUser.getIdToken();
    const res = await retryFailedEmailsApi(idToken, notificationId);
    if (!res.ok) {
      addToast({ type: 'error', title: 'Retry failed', description: res.error || 'Server error' });
      return;
    }
    addToast({
      type: (res.sentCount || 0) > 0 ? 'success' : (res.failedCount || 0) > 0 ? 'warning' : 'info',
      title: `Retried ${res.retriedCount || 0} email(s): ${res.sentCount || 0} sent, ${res.failedCount || 0} failed`,
    });
  };

  return (
    <MarketplaceContext.Provider
      value={{
        firebaseReady,
        connectionError,
        permissionError,
        authLoading,
        dataLoading,
        authUser,
        userRecord,
        pendingOnboardingRole,
        role,
        publicPage,
        selectedCategoryId,
        buyerTab,
        sellerTab,
        facilitatorTab,
        adminTab,
        selectedRequirementId,
        selectedListingId,
        selectedMatchId,
        selectedOfferId,
        selectedOrderId,
        currentBuyer,
        currentSeller,
        currentFacilitator,
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
        publicListings,
        matches,
        offers,
        negotiations,
        orders,
        payments,
        invoices,
        documents,
        notifications,
        emailDeliveryLogs,
        auditLogs,
        platformSettings,
        toasts,
        navigatePublic,
        setBuyerTab,
        setSellerTab,
        setFacilitatorTab,
        setAdminTab,
        signInGoogleForRole,
        signInStaffEmailPassword,
        sendFacilitatorPasswordReset,
        submitOnboardingProfile,
        logout,
        addToast,
        dismissToast,
        submitBuyerRequirement,
        withdrawRequirement,
        submitSellerListing,
        updateListingStatus,
        editListing,
        respondToOffer,
        facilitatorSendOffer,
        facilitatorAddNote,
        facilitatorConfirmAgreement,
        updateOrderStatus,
        adminApproveListing,
        adminApproveRequirement,
        adminVerifyUser,
        adminSaveCategory,
        adminToggleCategory,
        adminCreateStaffRecord,
        adminSavePlatformSettings,
        recordPayment,
        uploadDocumentFile,
        markNotificationRead,
        markAllNotificationsRead,
        retryFailedEmails,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
};

export const useMarketplace = () => {
  const ctx = useContext(MarketplaceContext);
  if (!ctx) throw new Error('useMarketplace must be used within MarketplaceProvider');
  return ctx;
};
