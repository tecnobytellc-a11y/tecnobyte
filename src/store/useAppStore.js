import { create } from 'zustand';
import { INITIAL_RATE_BS, DEFAULT_CONTACT_INFO } from '../config/constants';

const useAppStore = create((set) => ({
    // Application View State
    view: 'home',
    setView: (view) => set({ view }),

    // Cart State
    cart: [],
    setCart: (cart) => set({ cart }),
    addToCart: (item) => set((state) => ({ cart: [...state.cart, item] })),
    removeFromCart: (index) => set((state) => {
        const newCart = [...state.cart];
        newCart.splice(index, 1);
        return { cart: newCart };
    }),

    // UI Toggles
    isCartOpen: false,
    setIsCartOpen: (isCartOpen) => set({ isCartOpen }),
    activeCategory: 'All',
    setActiveCategory: (activeCategory) => set({ activeCategory }),
    showTerms: false,
    setShowTerms: (showTerms) => set({ showTerms }),
    showPrivacy: false,
    setShowPrivacy: (showPrivacy) => set({ showPrivacy }),

    // Checkout & Orders
    lastOrder: null,
    setLastOrder: (lastOrder) => set({ lastOrder }),
    checkoutStep: 0,
    setCheckoutStep: (checkoutStep) => set({ checkoutStep }),
    paymentMethod: null,
    setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
    paypalData: { email: '', firstName: '', lastName: '', phone: '', idDoc: null, groupLink: '', idNumber: '' },
    setPaypalData: (data) => set((state) => ({ paypalData: { ...state.paypalData, ...data } })),
    proofData: { screenshot: null, refNumber: '', name: '', lastName: '', idNumber: '', phone: '', issuerAccount: '', idDoc: null },
    setProofData: (data) => set((state) => ({ proofData: { ...state.proofData, ...data } })),
    coupon: null,
    setCoupon: (coupon) => set({ coupon }),
    
    // Status Flags
    isProcessing: false,
    setIsProcessing: (isProcessing) => set({ isProcessing }),
    isBlocked: false,
    setIsBlocked: (isBlocked) => set({ isBlocked }),
    isLoadingSecurity: true,
    setIsLoadingSecurity: (isLoadingSecurity) => set({ isLoadingSecurity }),
    isLoadingCatalog: true,
    setIsLoadingCatalog: (isLoadingCatalog) => set({ isLoadingCatalog }),

    // Data from Server
    services: [],
    setServices: (services) => set({ services }),
    multipackages: {},
    setMultipackages: (multipackages) => set({ multipackages }),
    exchangeRateBs: INITIAL_RATE_BS,
    setExchangeRateBs: (exchangeRateBs) => set({ exchangeRateBs }),
    contactInfo: DEFAULT_CONTACT_INFO,
    setContactInfo: (contactInfo) => set({ contactInfo }),
    legalInfo: { terms: "Cargando...", privacy: "Cargando..." },
    setLegalInfo: (legalInfo) => set({ legalInfo }),
    socialLinks: { tiktok: "#", instagram: "#", facebook: "#" },
    setSocialLinks: (socialLinks) => set({ socialLinks }),
}));

export default useAppStore;
