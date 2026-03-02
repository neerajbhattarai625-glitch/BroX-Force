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

    // Real visitor tracker
    useEffect(() => {
        // 1. Identify unique visitor
        const visitorId = localStorage.getItem("brox_visitor_id");
        let isNewVisitor = false;
        if (!visitorId) {
            localStorage.setItem("brox_visitor_id", `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
            isNewVisitor = true;
        }

        // 2. Track page hit
        setAnalytics(prev => {
            const updated = {
                ...prev,
                uniqueVisitors: isNewVisitor ? prev.uniqueVisitors + 1 : prev.uniqueVisitors,
                totalPageHits: prev.totalPageHits + 1
            };
            save("analytics", updated);
            return updated;
        });
    }, []);

    // Hydrate from localStorage
    useEffect(() => {
        try {
            const sp = localStorage.getItem("brox_products");
            const rawProducts = sp ? JSON.parse(sp) : DEFAULT_PRODUCTS;
            const sanitizedProducts = Array.isArray(rawProducts) ? rawProducts.map((p: any) => ({
                ...p,
                sizes: Array.isArray(p.sizes) ? p.sizes : [],
                colors: Array.isArray(p.colors) ? p.colors : [],
                stock: typeof p.stock === 'number' ? p.stock : (parseInt(p.stock) || 0),
                status: p.status || "In Stock",
                isFeatured: !!p.isFeatured,
                price: p.price || "0.00",
                costPrice: p.costPrice || "0.00"
            })) : DEFAULT_PRODUCTS;
            setProducts(sanitizedProducts);

            const sv = localStorage.getItem("brox_vouchers");
            const rawVouchers = sv ? JSON.parse(sv) : [
                { code: "BROX20", discountPercentage: 20, isUsed: false, usageCount: 0, isActive: true },
                { code: "LAUNCH10", discountPercentage: 10, isUsed: false, usageCount: 0, isActive: true },
            ];
            setVouchers(Array.isArray(rawVouchers) ? rawVouchers.map((v: any) => ({
                ...v,
                code: (v.code || "").toUpperCase(),
                isActive: v.isActive !== false,
                usageCount: typeof v.usageCount === 'number' ? v.usageCount : 0
            })) : []);

            const st = localStorage.getItem("brox_theme");
            if (st) {
                const parsedTheme = JSON.parse(st);
                setTheme({ ...DEFAULT_THEME, ...parsedTheme });
            }

            // Orders are now loaded from the API
            fetch('/api/orders')
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setOrders(data.map((o: any) => ({
                            ...o,
                            total: o.total || "0.00",
                            status: o.status || "Pending",
                            paymentStatus: o.paymentStatus || "Unpaid",
                            items: Array.isArray(o.items) ? o.items : []
                        })));
                    }
                })
                .catch(err => console.error("Failed to load orders", err));

            const sc = localStorage.getItem("brox_customers");
            if (sc) {
                const parsedCustomers = JSON.parse(sc);
                if (Array.isArray(parsedCustomers)) {
                    setCustomers(parsedCustomers.map((c: any) => ({
                        ...c,
                        orderHistory: Array.isArray(c.orderHistory) ? c.orderHistory : [],
                        totalSpent: typeof c.totalSpent === 'number' ? c.totalSpent : 0
                    })));
                }
            }

            const sa = localStorage.getItem("brox_analytics");
            if (sa) {
                const parsedAnalytics = JSON.parse(sa);
                setAnalytics(prev => ({
                    ...prev,
                    ...parsedAnalytics,
                    uniqueVisitors: Number(parsedAnalytics.uniqueVisitors) || 0,
                    totalPageHits: Number(parsedAnalytics.totalPageHits) || 0,
                    revenueNPR: Number(parsedAnalytics.revenueNPR) || 0,
                    revenueUSD: Number(parsedAnalytics.revenueUSD) || 0,
                    profitNPR: Number(parsedAnalytics.profitNPR) || 0,
                    profitUSD: Number(parsedAnalytics.profitUSD) || 0
                }));
            }

            const cfg = localStorage.getItem("brox_admin_config");
            if (cfg) {
                const parsedCfg = JSON.parse(cfg);
                setAdminConfig(prev => ({
                    ...prev,
                    ...parsedCfg,
                    payments: { ...prev.payments, ...(parsedCfg.payments || {}) }
                }));
            }
        } catch (e) {
            console.error("Hydration failed", e);
        }
    }, []);

    // --- CROSS-TAB SYNCHRONIZATION ---
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (!e.newValue || !e.key) return;

            try {
                // Determine if this is a key we care about before parsing
                const relevantKeys = [
                    "brox_products", "brox_orders", "brox_customers",
                    "brox_vouchers", "brox_analytics", "brox_categories",
                    "brox_theme", "brox_admin_config"
                ];

                if (!relevantKeys.includes(e.key)) return;

                const val = JSON.parse(e.newValue);
                if (e.key === "brox_products") setProducts(val);
                if (e.key === "brox_orders") setOrders(val);
                if (e.key === "brox_customers") setCustomers(val);
                if (e.key === "brox_vouchers") setVouchers(val);
                if (e.key === "brox_analytics") setAnalytics(val);
                if (e.key === "brox_categories") setCategories(val);
                if (e.key === "brox_theme") setTheme(val);
                if (e.key === "brox_admin_config") setAdminConfig(val);
            } catch (err) {
                console.error("Storage sync failed", err);
            }
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    const save = (key: string, val: any) => localStorage.setItem(`brox_${key}`, JSON.stringify(val));

    const addProduct = useCallback((data: Omit<Product, "id">) => {
        const p: Product = { ...data, id: `prod_${Date.now()}` };
        setProducts(prev => {
            const u = [p, ...prev];
            save("products", u);
            return u;
        });
    }, []);

    const updateProduct = useCallback((id: string, data: Partial<Product>) => {
        setProducts(prev => {
            const u = prev.map(p => p.id === id ? { ...p, ...data } : p);
            save("products", u);
            return u;
        });
    }, []);

    const deleteProduct = useCallback((id: string) => {
        setProducts(prev => {
            const u = prev.filter(p => p.id !== id);
            save("products", u);
            return u;
        });
    }, []);

    // --- Categories ---
    const [categories, setCategories] = useState<string[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem("brox_categories");
        if (stored) {
            setCategories(JSON.parse(stored));
        } else {
            setCategories(DEFAULT_CATEGORIES);
            localStorage.setItem("brox_categories", JSON.stringify(DEFAULT_CATEGORIES));
        }
    }, []);

    const addCategory = useCallback((name: string) => {
        setCategories(prev => {
            if (prev.includes(name)) return prev;
            const next = [...prev, name];
            save("categories", next);
            return next;
        });
    }, []);

    const updateCategory = useCallback((oldName: string, newName: string) => {
        setCategories(prev => {
            const next = prev.map(c => c === oldName ? newName : c);
            save("categories", next);
            return next;
        });
        // Update product categories too
        setProducts(prev => {
            const next = prev.map(p => p.category === oldName ? { ...p, category: newName } : p);
            save("products", next);
            return next;
        });
    }, []);

    const deleteCategory = useCallback((name: string) => {
        setCategories(prev => {
            const next = prev.filter(c => c !== name);
            save("categories", next);
            return next;
        });
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

    const addVoucher = useCallback((code: string, pct: number, expiry?: string, limit?: number) => {
        setVouchers(prev => {
            const u = [...prev, { code: code.toUpperCase(), discountPercentage: pct, isUsed: false, isActive: true, expiryDate: expiry, usageLimit: limit, usageCount: 0 }];
            save("vouchers", u);
            return u;
        });
    }, []);

    const toggleVoucherStatus = useCallback((code: string) => {
        setVouchers(prev => {
            const u = prev.map(v => v.code === code.toUpperCase() ? { ...v, isActive: !v.isActive } : v);
            save("vouchers", u);
            return u;
        });
    }, []);

    const deleteVoucher = useCallback((code: string) => {
        setVouchers(prev => {
            const u = prev.filter(v => v.code !== code.toUpperCase());
            save("vouchers", u);
            return u;
        });
    }, []);

    const applyVoucher = useCallback((code: string) => {
        const upper = code.toUpperCase().trim();
        const v = vouchers.find(v => v.code === upper);
        if (!v) return { success: false, discount: 0, message: "Invalid voucher code." };
        if (!v.isActive) return { success: false, discount: 0, message: "Voucher is currently disabled." };
        if (v.isUsed || (v.usageLimit && v.usageCount >= v.usageLimit)) return { success: false, discount: 0, message: "Voucher no longer valid." };
        if (v.expiryDate && new Date(v.expiryDate) < new Date()) return { success: false, discount: 0, message: "Voucher expired." };

        setVouchers(prev => {
            const u = prev.map(x => x.code === upper ? { ...x, usageCount: x.usageCount + 1, isUsed: x.usageLimit ? (x.usageCount + 1 >= x.usageLimit) : false } : x);
            save("vouchers", u);
            return u;
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

            // Analytics logic moved to updateOrderStatus (only when marked as Shipped)

            // Updating customers can still be local for now or eventually moved to API
            setCustomers(prev => {
                const ex = prev.find(c => c.email === newOrder.customerEmail);
                let u;
                if (ex) {
                    u = prev.map(c => c.email === newOrder.customerEmail ? { ...c, totalSpent: c.totalSpent + parseFloat(newOrder.total), orderHistory: [newOrder.id, ...c.orderHistory] } : c);
                } else {
                    u = [{ id: `cust_${Date.now()}`, name: newOrder.customerName, email: newOrder.customerEmail, phone: newOrder.customerPhone, address: newOrder.customerLocation, orderHistory: [newOrder.id], totalSpent: parseFloat(newOrder.total), isBlocked: false }, ...prev];
                }
                save("customers", u);
                return u;
            });

        } catch (error) {
            console.error("Failed to add order to db", error);
        }
    }, [adminConfig.exchangeRate]);

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
                setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus, isStockReduced: newIsStockReduced } : o));

                if (order.appliedVoucher && (newStatus === "Shipped" || newStatus === "Delivered")) {
                    setVouchers(vv => {
                        const next = vv.map(v => v.code === order.appliedVoucher ? { ...v, isActive: false } : v);
                        save("vouchers", next);
                        return next;
                    });
                }

                // --- Stock Management ---
                if (!oldIsStockReduced && newIsStockReduced) {
                    setProducts(currentProducts => {
                        const updatedProducts = currentProducts.map(p => {
                            const item = order.items.find(i => i.title === p.title);
                            if (item) {
                                const newStock = Math.max(0, p.stock - item.quantity);
                                return { ...p, stock: newStock, status: newStock === 0 ? "Out of Stock" : p.status } as Product;
                            }
                            return p;
                        });
                        save("products", updatedProducts);
                        return updatedProducts;
                    });
                } else if (oldIsStockReduced && !newIsStockReduced) {
                    setProducts(currentProducts => {
                        const updatedProducts = currentProducts.map(p => {
                            const item = order.items.find(i => i.title === p.title);
                            if (item) {
                                const newStock = p.stock + item.quantity;
                                return { ...p, stock: newStock, status: newStock > 0 ? "In Stock" : p.status } as Product;
                            }
                            return p;
                        });
                        save("products", updatedProducts);
                        return updatedProducts;
                    });
                }

                // --- Revenue & Profit Management ---
                const wasRevenueCounted = oldStatus === "Shipped" || oldStatus === "Delivered";
                const isRevenueCounted = newStatus === "Shipped" || newStatus === "Delivered";

                if (!wasRevenueCounted && isRevenueCounted) {
                    setAnalytics(prev => {
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

                        const updated = {
                            ...prev,
                            revenueNPR: prev.revenueNPR + revNPR,
                            revenueUSD: prev.revenueUSD + revUSD,
                            profitNPR: prev.profitNPR + profitNPR,
                            profitUSD: prev.profitUSD + profitUSD
                        };
                        save("analytics", updated);
                        return updated;
                    });
                } else if (wasRevenueCounted && !isRevenueCounted && newStatus === "Cancelled") {
                    setAnalytics(prev => {
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

                        const updated = {
                            ...prev,
                            revenueNPR: Math.max(0, prev.revenueNPR - revNPR),
                            revenueUSD: Math.max(0, prev.revenueUSD - revUSD),
                            profitNPR: Math.max(0, prev.profitNPR - profitNPR),
                            profitUSD: Math.max(0, prev.profitUSD - profitUSD)
                        };
                        save("analytics", updated);
                        return updated;
                    });
                }
            }
        } catch (error) {
            console.error("Failed to update order status", error);
        }
    }, [orders, adminConfig.exchangeRate]);

    const updatePaymentStatus = useCallback(async (id: string, status: PaymentStatus) => {
        try {
            const res = await fetch(`/api/orders/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentStatus: status })
            });
            if (res.ok) {
                setOrders(prev => prev.map(o => o.id === id ? { ...o, paymentStatus: status } : o));
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

    const updateCustomer = useCallback((id: string, data: Partial<Customer>) => {
        setCustomers(prev => {
            const u = prev.map(c => c.id === id ? { ...c, ...data } : c);
            save("customers", u);
            return u;
        });
    }, []);

    const updateAdminConfig = useCallback((data: Partial<AdminConfig>) => {
        setAdminConfig(prev => {
            const u = { ...prev, ...data };
            save("admin_config", u);
            return u;
        });
    }, []);

    const setThemeImage = useCallback((section: keyof ThemeImages, url: string) => {
        setTheme(prev => {
            const next = { ...prev, [section]: url };
            save("theme", next);
            return next;
        });
    }, []);

    const resetTheme = useCallback(() => {
        setTheme(DEFAULT_THEME);
        save("theme", DEFAULT_THEME);
    }, []);

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
