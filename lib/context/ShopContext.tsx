"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

// --- Types ---
export type Product = {
    id: string;
    title: string;
    price: string;
    costPrice: string;
    discountPrice?: string;
    description: string;
    category: string;
    imageUrl: string;
    sizes: string[];
    colors: string[];
    stock: number;
    status: "In Stock" | "Out of Stock";
    isFeatured: boolean;
};

export type CartItem = { product: Product; quantity: number; selectedSize?: string; selectedColor?: string; customSize?: string };

export type Voucher = { code: string; discountPercentage: number; isUsed: boolean; isActive: boolean; expiryDate?: string; usageLimit?: number; usageCount: number };

export type ThemeImages = { hero: string; body: string; footer: string; logo?: string };

export type OrderStatus = "Pending" | "Shipped" | "Delivered" | "Cancelled";
export type PaymentStatus = "Unpaid" | "Paid" | "Refunded";

export type Order = {
    id: string;
    createdAt: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    customerLocation: string;
    items: { title: string; quantity: number; price: string; size?: string; color?: string; customSize?: string }[];
    subtotal: string;
    discount: number;
    total: string;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    paymentMethod: string;
    paymentCurrency: "NPR" | "USD";
    trackingNo?: string;
    appliedVoucher?: string;
    isStockReduced?: boolean;
};

export type Customer = {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    orderHistory: string[]; // Order IDs
    totalSpent: number;
    isBlocked: boolean;
};

export type AnalyticsData = {
    uniqueVisitors: number;
    totalPageHits: number;
    revenueNPR: number;
    revenueUSD: number;
    profitNPR: number;
    profitUSD: number;
};

export type AdminConfig = {
    email: string; // The login/display email
    orderEmail: string; // Recipient for new orders
    contactEmail: string; // Recipient for contact form
    passwordHash: string;
    payments: { esewa: boolean; khalti: boolean; stripe: boolean; cod: boolean; paypal: boolean };
    shippingCost: number;
    freeShippingThreshold: number;
    exchangeRate: number;
};

const DEFAULT_THEME: ThemeImages = {
    hero: "https://images.unsplash.com/photo-1620806497334-927918a096c4?auto=format&fit=crop&q=80&w=2000",
    body: "",
    footer: "",
};

const DEFAULT_PRODUCTS: Product[] = [
    {
        id: "prod_1",
        title: "VORTEX Technical Hoodie",
        price: "120.00",
        costPrice: "45.00",
        description: "Premium tech-wear hoodie with water-resistant fabric and multi-pocket configuration.",
        category: "Hoodies",
        imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800",
        sizes: ["M", "L", "XL"],
        colors: ["Black", "Grey"],
        stock: 50,
        status: "In Stock",
        isFeatured: true,
    },
    {
        id: "prod_2",
        title: "NEON-GRID Oversized Tee",
        price: "45.00",
        costPrice: "15.00",
        description: "Drop shoulder heavyweight cotton tee with cyber-grid back print.",
        category: "T-Shirts",
        imageUrl: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=800",
        sizes: ["M", "L", "XL"],
        colors: ["White", "Black"],
        stock: 120,
        status: "In Stock",
        isFeatured: true,
    },
    {
        id: "prod_3",
        title: "SPECTER Cargo Trousers",
        price: "150.00",
        costPrice: "60.00",
        description: "Articulated fit cargo pants with adjustable ankle straps and hidden cyber-pockets.",
        category: "Trousers",
        imageUrl: "https://images.unsplash.com/photo-1584865288642-42078afe6942?auto=format&fit=crop&q=80&w=800",
        sizes: ["30", "32", "34"],
        colors: ["Olive", "Black"],
        stock: 35,
        status: "In Stock",
        isFeatured: false,
    },
];

const DEFAULT_CATEGORIES = ["T-Shirts", "Hoodies", "Trousers", "Accessories"];

type ShopContextType = {
    products: Product[];
    addProduct: (product: Omit<Product, "id">) => void;
    updateProduct: (id: string, data: Partial<Product>) => void;
    deleteProduct: (id: string) => void;

    categories: string[];
    addCategory: (name: string) => void;
    updateCategory: (oldName: string, newName: string) => void;
    deleteCategory: (name: string) => void;

    cartItems: CartItem[];
    addToCart: (product: Product, size?: string, color?: string, customSize?: string) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    cartCount: number;
    cartSubtotal: number;
    vouchers: Voucher[];
    addVoucher: (code: string, pct: number, expiry?: string, limit?: number) => void;
    toggleVoucherStatus: (code: string) => void;
    deleteVoucher: (code: string) => void;
    applyVoucher: (code: string) => { success: boolean; discount: number; message: string };
    theme: ThemeImages;
    setThemeImage: (section: keyof ThemeImages, url: string) => void;
    resetTheme: () => void;
    orders: Order[];
    addOrder: (order: Omit<Order, "id" | "createdAt" | "status" | "paymentStatus">) => void;
    updateOrderStatus: (id: string, status: OrderStatus) => void;
    updatePaymentStatus: (id: string, status: PaymentStatus) => void;
    deleteOrder: (id: string) => void;
    customers: Customer[];
    updateCustomer: (id: string, data: Partial<Customer>) => void;
    analytics: AnalyticsData;
    adminConfig: AdminConfig;
    updateAdminConfig: (data: Partial<AdminConfig>) => void;
};

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({ children }: { children: ReactNode }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [theme, setTheme] = useState<ThemeImages>(DEFAULT_THEME);
    const [orders, setOrders] = useState<Order[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [analytics, setAnalytics] = useState<AnalyticsData>({
        uniqueVisitors: 0,
        totalPageHits: 0,
        revenueNPR: 0,
        revenueUSD: 0,
        profitNPR: 0,
        profitUSD: 0
    });
    const [adminConfig, setAdminConfig] = useState<AdminConfig>({
        email: "codevengers8848@gmail.com",
        orderEmail: "codevengers8848@gmail.com",
        contactEmail: "codevengers8848@gmail.com",
        passwordHash: "brox@admin2024",
        payments: { esewa: true, khalti: true, stripe: false, cod: true, paypal: true },
        shippingCost: 5,
        freeShippingThreshold: 100,
        exchangeRate: 135,
    });

    const [loading, setLoading] = useState(true);

    // Initial Hydration from Database
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                // Load Products
                const prodRes = await fetch('/api/products');
                const productsData = await prodRes.json();
                if (Array.isArray(productsData) && productsData.length > 0) {
                    setProducts(productsData);
                } else {
                    setProducts(DEFAULT_PRODUCTS);
                }

                // Load Categories
                const catRes = await fetch('/api/categories');
                const categoriesData = await catRes.json();
                if (Array.isArray(categoriesData) && categoriesData.length > 0) {
                    setCategories(categoriesData.map((c: any) => c.name));
                } else {
                    setCategories(DEFAULT_CATEGORIES);
                }

                // Load Vouchers
                const vouchRes = await fetch('/api/vouchers');
                const vouchersData = await vouchRes.json();
                if (Array.isArray(vouchersData)) {
                    setVouchers(vouchersData);
                }

                // Load Theme
                const themeRes = await fetch('/api/theme');
                const themeData = await themeRes.json();
                if (themeData && !themeData.error) {
                    setTheme(themeData);
                }

                // Load Admin Config
                const configRes = await fetch('/api/admin-config');
                const configData = await configRes.json();
                if (configData && !configData.error) {
                    const { id, ...rest } = configData;
                    setAdminConfig({
                        ...rest,
                        payments: {
                            esewa: configData.esewa,
                            khalti: configData.khalti,
                            stripe: configData.stripe,
                            cod: configData.cod,
                            paypal: configData.paypal
                        }
                    });
                }

                // Load Customers
                const custRes = await fetch('/api/customers');
                const customersData = await custRes.json();
                if (Array.isArray(customersData)) {
                    setCustomers(customersData);
                }

                // Load Orders
                const ordersRes = await fetch('/api/orders');
                const ordersData = await ordersRes.json();
                if (Array.isArray(ordersData)) {
                    setOrders(ordersData);
                }

                // Load Analytics
                const analyticsRes = await fetch('/api/analytics');
                const analyticsData = await analyticsRes.json();
                if (analyticsData && !analyticsData.error) {
                    setAnalytics(analyticsData);
                }

            } catch (error) {
                console.error("Failed to hydrate data from DB:", error);
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, []);

    // Visitor tracking: local ID, but hit tracking on server
    useEffect(() => {
        const trackHit = async () => {
            const visitorId = localStorage.getItem("brox_visitor_id");
            let type = 'hit';
            if (!visitorId) {
                localStorage.setItem("brox_visitor_id", `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
                type = 'visitor';
            }

            try {
                const res = await fetch('/api/analytics', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type })
                });
                const updated = await res.json();
                setAnalytics(updated);
            } catch (err) {
                console.error("Failed to track hit:", err);
            }
        };

        trackHit();
    }, []);

    const addProduct = useCallback(async (data: Omit<Product, "id">) => {
        try {
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const newProd = await res.json();
            setProducts(prev => [newProd, ...prev]);
        } catch (error) {
            console.error("Failed to add product:", error);
        }
    }, []);

    const updateProduct = useCallback(async (id: string, data: Partial<Product>) => {
        try {
            const res = await fetch(`/api/products/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const updated = await res.json();
            setProducts(prev => prev.map(p => p.id === id ? updated : p));
        } catch (error) {
            console.error("Failed to update product:", error);
        }
    }, []);

    const deleteProduct = useCallback(async (id: string) => {
        try {
            await fetch(`/api/products/${id}`, { method: 'DELETE' });
            setProducts(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            console.error("Failed to delete product:", error);
        }
    }, []);

    const addCategory = useCallback(async (name: string) => {
        try {
            const res = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });
            const newCat = await res.json();
            setCategories(prev => [...prev.filter(c => c !== newCat.name), newCat.name]);
        } catch (error) {
            console.error("Failed to add category:", error);
        }
    }, []);

    const updateCategory = useCallback(async (oldName: string, newName: string) => {
        try {
            // Delete old, add new (Prisma upsert/delete approach)
            await fetch(`/api/categories?name=${encodeURIComponent(oldName)}`, { method: 'DELETE' });
            await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName })
            });

            setCategories(prev => prev.map(c => c === oldName ? newName : c));

            // Sync products too
            setProducts(prev => prev.map(p => p.category === oldName ? { ...p, category: newName } : p));
        } catch (error) {
            console.error("Failed to update category:", error);
        }
    }, []);

    const deleteCategory = useCallback(async (name: string) => {
        try {
            await fetch(`/api/categories?name=${encodeURIComponent(name)}`, { method: 'DELETE' });
            setCategories(prev => prev.filter(c => c !== name));
        } catch (error) {
            console.error("Failed to delete category:", error);
        }
    }, []);

    const addToCart = useCallback((product: Product, size?: string, color?: string, customSize?: string) => {
        if (product.stock <= 0 || product.status === "Out of Stock") return;
        setCartItems(prev => {
            const ex = prev.find(i => i.product.id === product.id && i.selectedSize === size && i.selectedColor === color && i.customSize === customSize);
            return ex
                ? prev.map(i => i.product.id === product.id && i.selectedSize === size && i.selectedColor === color && i.customSize === customSize ? { ...i, quantity: i.quantity + 1 } : i)
                : [...prev, { product, quantity: 1, selectedSize: size, selectedColor: color, customSize }];
        });
    }, []);

    const removeFromCart = useCallback((id: string) => setCartItems(prev => prev.filter(i => i.product.id !== id)), []);
    const updateQuantity = useCallback((id: string, quantity: number) => {
        if (quantity < 1) return;
        setCartItems(prev => prev.map(i => i.product.id === id ? { ...i, quantity } : i));
    }, []);
    const clearCart = useCallback(() => setCartItems([]), []);
    const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);
    const cartSubtotal = cartItems.reduce((s, i) => s + parseFloat(i.product.price) * i.quantity, 0);

    const addVoucher = useCallback(async (code: string, pct: number, expiry?: string, limit?: number) => {
        try {
            const res = await fetch('/api/vouchers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, discountPercentage: pct, expiryDate: expiry, usageLimit: limit })
            });
            const newVoucher = await res.json();
            setVouchers(prev => [newVoucher, ...prev]);
        } catch (error) {
            console.error("Failed to add voucher:", error);
        }
    }, []);

    const toggleVoucherStatus = useCallback(async (code: string) => {
        const v = vouchers.find(x => x.code === code);
        if (!v) return;
        try {
            const id = (v as any).id; // Use ID if available
            const res = await fetch(`/api/vouchers/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !v.isActive })
            });
            const updated = await res.json();
            setVouchers(prev => prev.map(x => x.code === code ? updated : x));
        } catch (error) {
            console.error("Failed to toggle voucher:", error);
        }
    }, [vouchers]);

    const deleteVoucher = useCallback(async (code: string) => {
        const v = vouchers.find(x => x.code === code);
        if (!v) return;
        try {
            const id = (v as any).id;
            await fetch(`/api/vouchers/${id}`, { method: 'DELETE' });
            setVouchers(prev => prev.filter(x => x.code !== code));
        } catch (error) {
            console.error("Failed to delete voucher:", error);
        }
    }, [vouchers]);

    const applyVoucher = useCallback((code: string) => {
        const upper = code.toUpperCase().trim();
        const v = vouchers.find(v => v.code === upper);
        if (!v) return { success: false, discount: 0, message: "Invalid voucher code." };
        if (!v.isActive) return { success: false, discount: 0, message: "Voucher is currently disabled." };
        if (v.isUsed || (v.usageLimit && v.usageCount >= v.usageLimit)) return { success: false, discount: 0, message: "Voucher no longer valid." };
        if (v.expiryDate && new Date(v.expiryDate) < new Date()) return { success: false, discount: 0, message: "Voucher expired." };

        // Increment usage count in DB
        const id = (v as any).id;
        fetch(`/api/vouchers/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                usageCount: v.usageCount + 1,
                isUsed: v.usageLimit ? (v.usageCount + 1 >= v.usageLimit) : false
            })
        }).then(res => res.json()).then(updated => {
            setVouchers(prev => prev.map(x => x.code === upper ? updated : x));
        });

        return { success: true, discount: v.discountPercentage, message: `${v.discountPercentage}% discount applied!` };
    }, [vouchers]);

    const addOrder = useCallback(async (data: Omit<Order, "id" | "createdAt" | "status" | "paymentStatus">) => {
        try {
            const formData = {
                ...data,
                paymentCurrency: (data as any).paymentCurrency || "NPR"
            }
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            const newOrder = await res.json();

            setOrders(prev => [newOrder, ...prev]);

            // Sync Customer to DB
            await fetch("/api/customers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newOrder.customerName,
                    email: newOrder.customerEmail,
                    phone: newOrder.customerPhone,
                    address: newOrder.customerLocation,
                    totalSpent: newOrder.total
                })
            });

            // Reload customers
            const custRes = await fetch('/api/customers');
            const custData = await custRes.json();
            if (Array.isArray(custData)) setCustomers(custData);

        } catch (error) {
            console.error("Failed to add order to db", error);
        }
    }, []);

    const updateOrderStatus = useCallback(async (id: string, newStatus: OrderStatus) => {
        const order = orders.find(o => o.id === id);
        if (!order) return;

        const oldStatus = order.status;
        const oldIsStockReduced = order.isStockReduced;

        let newIsStockReduced = oldIsStockReduced;
        if (newStatus === "Shipped" || newStatus === "Delivered") {
            newIsStockReduced = true;
        } else if (newStatus === "Cancelled") {
            newIsStockReduced = false;
        }

        try {
            const res = await fetch(`/api/orders/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus, isStockReduced: newIsStockReduced })
            });

            if (res.ok) {
                const refreshedOrder = await res.json();
                setOrders(prev => prev.map(o => o.id === id ? refreshedOrder : o));

                if (order.appliedVoucher && (newStatus === "Shipped" || newStatus === "Delivered")) {
                    const v = vouchers.find(x => x.code === order.appliedVoucher);
                    if (v) {
                        const vid = (v as any).id;
                        await fetch(`/api/vouchers/${vid}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ isActive: false })
                        });
                        // Reload vouchers
                        const vRes = await fetch('/api/vouchers');
                        const vData = await vRes.json();
                        if (Array.isArray(vData)) setVouchers(vData);
                    }
                }

                // If stock needs updating, do it via product API
                if (!oldIsStockReduced && newIsStockReduced) {
                    for (const item of order.items) {
                        const p = products.find(prod => prod.title === item.title);
                        if (p) {
                            const newStock = Math.max(0, p.stock - item.quantity);
                            await updateProduct(p.id, { stock: newStock, status: newStock === 0 ? "Out of Stock" : p.status });
                        }
                    }
                } else if (oldIsStockReduced && !newIsStockReduced) {
                    for (const item of order.items) {
                        const p = products.find(prod => prod.title === item.title);
                        if (p) {
                            const newStock = p.stock + item.quantity;
                            await updateProduct(p.id, { stock: newStock, status: newStock > 0 ? "In Stock" : p.status });
                        }
                    }
                }

                // --- Revenue & Profit Management ---
                const wasRevenueCounted = oldStatus === "Shipped" || oldStatus === "Delivered";
                const isRevenueCounted = newStatus === "Shipped" || newStatus === "Delivered";

                if (!wasRevenueCounted && isRevenueCounted) {
                    const revNPR = order.paymentCurrency === "NPR" ? parseFloat(order.total) : (parseFloat(order.total) * adminConfig.exchangeRate);
                    const revUSD = order.paymentCurrency === "USD" ? parseFloat(order.total) : (parseFloat(order.total) / adminConfig.exchangeRate);

                    // Calculate Profit
                    let totalCostNPR = 0;
                    order.items.forEach(item => {
                        const p = products.find(prod => prod.title === item.title);
                        const costNPR = p ? (parseFloat(p.costPrice) * (order.paymentCurrency === "USD" ? adminConfig.exchangeRate : 1)) : 0;
                        totalCostNPR += costNPR * item.quantity;
                    });

                    const profitNPR = revNPR - totalCostNPR;
                    const profitUSD = revUSD - (totalCostNPR / adminConfig.exchangeRate);

                    await fetch('/api/analytics', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            type: 'revenue',
                            npr: revNPR,
                            usd: revUSD,
                            pNpr: profitNPR,
                            pUsd: profitUSD
                        })
                    });

                    // Refresh analytics
                    const aRes = await fetch('/api/analytics');
                    const aData = await aRes.json();
                    if (aData && !aData.error) setAnalytics(aData);
                } else if (wasRevenueCounted && !isRevenueCounted && newStatus === "Cancelled") {
                    const revNPR = order.paymentCurrency === "NPR" ? parseFloat(order.total) : (parseFloat(order.total) * adminConfig.exchangeRate);
                    const revUSD = order.paymentCurrency === "USD" ? parseFloat(order.total) : (parseFloat(order.total) / adminConfig.exchangeRate);

                    // Calculate Profit to deduct
                    let totalCostNPR = 0;
                    order.items.forEach(item => {
                        const p = products.find(prod => prod.title === item.title);
                        const costNPR = p ? (parseFloat(p.costPrice) * (order.paymentCurrency === "USD" ? adminConfig.exchangeRate : 1)) : 0;
                        totalCostNPR += costNPR * item.quantity;
                    });

                    const profitNPR = revNPR - totalCostNPR;
                    const profitUSD = revUSD - (totalCostNPR / adminConfig.exchangeRate);

                    await fetch('/api/analytics', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            type: 'revenue',
                            npr: -revNPR,
                            usd: -revUSD,
                            pNpr: -profitNPR,
                            pUsd: -profitUSD
                        })
                    });

                    // Refresh analytics
                    const aRes = await fetch('/api/analytics');
                    const aData = await aRes.json();
                    if (aData && !aData.error) setAnalytics(aData);
                }
            }
        } catch (error) {
            console.error("Failed to update order status", error);
        }
    }, [orders, products, vouchers, updateProduct]);

    const updatePaymentStatus = useCallback(async (id: string, status: PaymentStatus) => {
        try {
            const res = await fetch(`/api/orders/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentStatus: status })
            });
            if (res.ok) {
                const updated = await res.json();
                setOrders(prev => prev.map(o => o.id === id ? updated : o));
            }
        } catch (error) {
            console.error("Failed to update payment status", error);
        }
    }, []);

    const deleteOrder = useCallback(async (id: string) => {
        try {
            const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setOrders(prev => prev.filter(o => o.id !== id));
            }
        } catch (error) {
            console.error("Failed to delete order", error);
        }
    }, []);

    const updateCustomer = useCallback(async (id: string, data: Partial<Customer>) => {
        try {
            // Simplified: we use POST (upsert) for customers based on email
            const c = customers.find(x => x.id === id);
            if (!c) return;
            const res = await fetch("/api/customers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...c, ...data })
            });
            const updated = await res.json();
            setCustomers(prev => prev.map(x => x.id === id ? updated : x));
        } catch (error) {
            console.error("Failed to update customer:", error);
        }
    }, [customers]);

    const updateAdminConfig = useCallback(async (data: Partial<AdminConfig>) => {
        try {
            const res = await fetch('/api/admin-config', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const updated = await res.json();
            const { id, ...rest } = updated;
            setAdminConfig({
                ...rest,
                payments: {
                    esewa: updated.esewa,
                    khalti: updated.khalti,
                    stripe: updated.stripe,
                    cod: updated.cod,
                    paypal: updated.paypal
                }
            });
        } catch (error) {
            console.error("Failed to update admin config:", error);
        }
    }, []);

    const setThemeImage = useCallback(async (section: keyof ThemeImages, url: string) => {
        try {
            const res = await fetch('/api/theme', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [section]: url })
            });
            const updated = await res.json();
            setTheme(updated);
        } catch (error) {
            console.error("Failed to update theme:", error);
        }
    }, []);

    const resetTheme = useCallback(async () => {
        try {
            const res = await fetch('/api/theme', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(DEFAULT_THEME)
            });
            const updated = await res.json();
            setTheme(updated);
        } catch (error) {
            console.error("Failed to reset theme:", error);
        }
    }, []);

    if (loading) return null; // Or a loading spinner

    return (
        <ShopContext.Provider value={{
            products, addProduct, updateProduct, deleteProduct,
            categories, addCategory, updateCategory, deleteCategory,
            cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartSubtotal,
            vouchers, addVoucher, toggleVoucherStatus, deleteVoucher, applyVoucher,
            theme, setThemeImage, resetTheme,
            orders, addOrder, updateOrderStatus, updatePaymentStatus, deleteOrder,
            customers, updateCustomer,
            analytics,
            adminConfig, updateAdminConfig,
        }}>
            {children}
        </ShopContext.Provider>
    );
}

export function useShop() {
    const ctx = useContext(ShopContext);
    if (!ctx) throw new Error("useShop must be used within ShopProvider");
    return ctx;
}
