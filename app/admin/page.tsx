"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useShop, Product, Order, OrderStatus, PaymentStatus, Customer, Voucher } from "@/lib/context/ShopContext";
import { useTheme } from "@/lib/context/ThemeContext";
import AdminLogin from "@/components/AdminLogin";
import {
    LayoutDashboard, Package, ShoppingCart, Users, Ticket,
    Palette, FolderOpen, Settings, LogOut, Plus, Search,
    Filter, MoreHorizontal, TrendingUp, DollarSign,
    Clock, CheckCircle2, XCircle, Truck, Trash2,
    ChevronRight, Edit3, Image as ImageIcon, Save,
    Eye, EyeOff, ShieldCheck, Mail, MapPin, Phone,
    CreditCard, Globe, PieChart,
    Calendar, Info, AlertTriangle, Check, Paintbrush, Tag, Layers, Sun, Moon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type AdminTab = "dashboard" | "products" | "orders" | "customers" | "coupons" | "categories" | "content" | "media" | "settings";

const inputCls = "w-full crystal-card p-3 text-[var(--crystal-text)] text-sm focus:outline-none focus:border-[var(--gold)] transition-all placeholder-[var(--crystal-muted)] rounded-lg border-0";
const labelCls = "text-[10px] uppercase font-bold tracking-widest text-[var(--crystal-muted)] mb-1.5 block";
const btnCls = "bg-[var(--gold)] text-black px-6 py-3 font-bold text-[11px] uppercase tracking-widest hover:bg-[var(--fg)] hover:text-[var(--bg)] transition-all duration-500 active:scale-95 disabled:opacity-50 rounded-lg";

export default function AdminPanel() {
    const { theme, toggleTheme } = useTheme();
    const {
        products, addProduct, updateProduct, deleteProduct,
        orders, updateOrderStatus, updatePaymentStatus, deleteOrder,
        customers, updateCustomer,
        vouchers, addVoucher, toggleVoucherStatus, deleteVoucher,
        theme: siteTheme, setThemeImage, resetTheme,
        categories, addCategory, updateCategory, deleteCategory,
        analytics,
        adminConfig, updateAdminConfig
    } = useShop();

    const [authed, setAuthed] = useState(false);
    const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const flash = (msg: string) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(null), 3000);
    };

    const handleAuthSuccess = () => {
        const now = Date.now().toString();
        localStorage.setItem("brox_admin_auth", "true");
        localStorage.setItem("brox_admin_login_time", now);
        setAuthed(true);
    };

    const logout = () => {
        localStorage.removeItem("brox_admin_auth");
        sessionStorage.removeItem("brox_admin_auth");
        setAuthed(false);
    };

    // --- PERSISTENCE & SESSION TIMEOUT: CHECK AUTH ON MOUNT ---
    useEffect(() => {
        const checkAuth = () => {
            const isAuthed = localStorage.getItem("brox_admin_auth") === "true" ||
                sessionStorage.getItem("brox_admin_auth") === "true";

            if (isAuthed) {
                const loginTime = localStorage.getItem("brox_admin_login_time");
                if (loginTime) {
                    const elapsed = Date.now() - parseInt(loginTime);
                    const threeHours = 3 * 60 * 60 * 1000; // 10,800,000 ms

                    if (elapsed > threeHours) {
                        logout();
                        return;
                    }
                }
                setAuthed(true);
            }
        };

        checkAuth();
        // Periodic check every minute
        const interval = setInterval(checkAuth, 60000);
        return () => clearInterval(interval);
    }, []);


    // --- DASHBOARD METRICS ---
    const metrics = useMemo(() => {
        const safeOrders = orders || [];
        const safeCustomers = customers || [];
        const safeProducts = products || [];
        const safeAnalytics = analytics || { revenueNPR: 0, revenueUSD: 0, profitNPR: 0, profitUSD: 0, uniqueVisitors: 0, totalPageHits: 0 };

        const pendingOrders = safeOrders.filter(o => o?.status === "Pending").length;

        return {
            revenueNPR: (Number(safeAnalytics?.revenueNPR) || 0).toFixed(2),
            revenueUSD: (Number(safeAnalytics?.revenueUSD) || 0).toFixed(2),
            profitNPR: (Number(safeAnalytics?.profitNPR) || 0).toFixed(2),
            profitUSD: (Number(safeAnalytics?.profitUSD) || 0).toFixed(2),
            totalOrders: safeOrders.length,
            pendingOrders,
            totalCustomers: safeCustomers.length,
            totalProducts: safeProducts.length,
            stockAlerts: safeProducts.filter(p => p && (Number(p.stock) || 0) < 10).length,
            uniqueVisitors: Number(safeAnalytics?.uniqueVisitors) || 0,
            totalPageHits: Number(safeAnalytics?.totalPageHits) || 0
        };
    }, [orders, customers, products, analytics]);

    // --- PRODUCT FORM ---
    const [showProductModal, setShowProductModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [productForm, setProductForm] = useState<Omit<Product, "id">>({
        title: "", price: "0.00", costPrice: "0.00", description: "", category: "T-Shirts", imageUrl: "",
        sizes: ["S", "M", "L", "XL"], colors: ["Black", "White"], stock: 100,
        status: "In Stock", isFeatured: false, discountPrice: ""
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: "imageUrl") => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProductForm(prev => ({ ...prev, [field]: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleProductSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingProduct) {
            updateProduct(editingProduct.id, productForm);
            flash("Product updated successfully!");
        } else {
            addProduct(productForm);
            flash("Product published successfully!");
        }
        setShowProductModal(false);
        setEditingProduct(null);
    };

    // --- SECURITY: PASSWORD CHANGE ---
    const [pwForm, setPwForm] = useState({ new: "", confirm: "" });
    const handlePasswordChange = (e: React.FormEvent) => {
        e.preventDefault();
        if (pwForm.new !== pwForm.confirm) return alert("Passwords do not match");
        updateAdminConfig({ passwordHash: pwForm.new });
        setPwForm({ new: "", confirm: "" });
        flash("Password changed successfully!");
    };

    // --- CMS CONTENT ---
    const [cmsForm, setCmsForm] = useState({
        hero: siteTheme?.hero || "",
        footer: siteTheme?.footer || "",
        logo: siteTheme?.logo || ""
    });

    useEffect(() => {
        if (siteTheme) {
            setCmsForm({
                hero: siteTheme.hero || "",
                footer: siteTheme.footer || "",
                logo: siteTheme.logo || ""
            });
        }
    }, [siteTheme]);

    const handleCmsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setThemeImage('hero', cmsForm.hero);
        setThemeImage('footer', cmsForm.footer);
        setThemeImage('logo', cmsForm.logo);
        flash("Visuals updated successfully!");
    };

    if (!authed) return <AdminLogin onSuccess={handleAuthSuccess} />;


    const menuItems: { id: AdminTab; label: string; icon: any }[] = [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "products", label: "Inventory", icon: Package },
        { id: "categories", label: "Categories", icon: Layers },
        { id: "orders", label: "Orders", icon: ShoppingCart },
        { id: "customers", label: "Customers", icon: Users },
        { id: "coupons", label: "Vouchers", icon: Ticket },
        { id: "content", label: "Content", icon: FolderOpen },
        { id: "media", label: "Media", icon: Eye },
        { id: "settings", label: "Settings", icon: Settings },
    ];

    return (
        <div className="min-h-screen flex" style={{ background: '#000000' }}>
            {/* Ambient lights — theme-aware */}
            {/* Premium Black Matte Backdrop (Zen) */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
                style={{
                    background: '#000000'
                }}>
                {/* Extremely Subtle Ambient Gold Glow (Static) */}
                <div className="absolute top-[-30%] left-[-15%] w-[80%] h-[80%] rounded-full blur-[150px] opacity-[0.08]"
                    style={{ background: 'radial-gradient(circle, var(--gold) 0%, transparent 70%)' }} />

                {/* New: Subtle Ambient Silver Rim Light (Bottom Right) */}
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[130px] opacity-[0.05]"
                    style={{ background: 'radial-gradient(circle, var(--silver) 0%, transparent 70%)' }} />
            </div>

            {/* Sidebar */}
            <aside className="crystal-sidebar w-64 hidden lg:flex flex-col fixed inset-y-0 z-40">
                <div className="p-8" style={{ borderBottom: '1px solid var(--crystal-border)' }}>
                    <span className="font-heading text-2xl tracking-[0.2em]" style={{ color: 'var(--crystal-text)' }}>
                        BroX<span className="text-[var(--gold)]"> Force</span>
                    </span>
                    <p className="text-[10px] uppercase tracking-[0.3em] mt-1" style={{ color: 'var(--crystal-muted)' }}>Admin Suite</p>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold uppercase tracking-widest transition-all duration-200 rounded-xl group crystal-hover ${activeTab === item.id
                                ? "text-[var(--gold)]"
                                : "hover:text-[var(--crystal-text)]"
                                }`}
                            style={{
                                color: activeTab === item.id ? 'var(--gold)' : 'var(--crystal-muted)',
                                ...(activeTab === item.id ? {
                                    background: 'linear-gradient(135deg, rgba(201,168,76,0.12), rgba(201,168,76,0.06))',
                                    border: '1px solid rgba(201,168,76,0.3)',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.4), inset 0 0.5px 0 rgba(255,255,255,0.15)'
                                } : { border: '1px solid transparent' })
                            }}
                        >
                            <item.icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="p-4 space-y-1" style={{ borderTop: '1px solid var(--crystal-border)' }}>
                    {/* Theme toggle */}
                    <button
                        onClick={toggleTheme}
                        className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold uppercase tracking-widest rounded-xl crystal-hover transition-all"
                        style={{ color: 'var(--crystal-muted)' }}
                    >
                        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    </button>
                    <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-red-400/60 hover:text-red-400 transition-all rounded-xl hover:bg-red-500/5">
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:ml-64 p-4 md:p-6 lg:p-10 min-h-screen w-full min-w-0 max-w-[100vw] overflow-x-hidden">

                {/* Mobile Header */}
                <div className="lg:hidden flex items-center justify-between mb-6 pb-4 overflow-x-auto gap-3 no-scrollbar" style={{ borderBottom: '1px solid var(--crystal-border)' }}>
                    {menuItems.map(item => (
                        <button key={item.id} onClick={() => setActiveTab(item.id)}
                            className="shrink-0 p-3 flex flex-col items-center gap-1 rounded-xl transition-all crystal-hover"
                            style={{ color: activeTab === item.id ? 'var(--gold)' : 'var(--crystal-muted)', ...(activeTab === item.id ? { background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.15)' } : {}) }}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="text-[8px] uppercase font-bold tracking-tighter">{item.label}</span>
                        </button>
                    ))}
                    <button onClick={toggleTheme} className="shrink-0 p-3 flex flex-col items-center gap-1 rounded-xl crystal-hover" style={{ color: 'var(--crystal-muted)' }}>
                        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        <span className="text-[8px] uppercase font-bold">{theme === 'dark' ? 'Light' : 'Dark'}</span>
                    </button>
                    <button onClick={logout} className="shrink-0 p-3 text-red-400/60 flex flex-col items-center gap-1 rounded-xl">
                        <LogOut className="w-5 h-5" />
                        <span className="text-[8px] uppercase font-bold">Exit</span>
                    </button>
                </div>

                {/* Global Toast */}
                <AnimatePresence>
                    {successMsg && (
                        <motion.div
                            initial={{ opacity: 0, y: -20, x: "-50%" }}
                            animate={{ opacity: 1, y: 0, x: "-50%" }}
                            exit={{ opacity: 0, y: -20, x: "-50%" }}
                            className="fixed top-8 left-1/2 z-[100] bg-[var(--gold)] text-black px-8 py-3 font-bold uppercase text-xs tracking-widest shadow-2xl flex items-center gap-2"
                        >
                            <CheckCircle2 className="w-4 h-4" /> {successMsg}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="max-w-7xl mx-auto">
                    {/* Dashboard Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.4em] text-[var(--gold)] font-bold mb-3">Enterprise Suite</p>
                            <h1 className="font-heading text-5xl md:text-6xl capitalize tracking-tight" style={{ color: 'var(--crystal-text)' }}>{activeTab}</h1>
                        </div>

                        <div className="crystal-card flex items-center gap-6 px-6 py-3 rounded-2xl">
                            <div className="flex flex-col items-center">
                                <span className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--crystal-muted)' }}>Unique Visitors</span>
                                <span className="font-mono text-[var(--gold)] font-bold text-lg">{metrics.uniqueVisitors || 0}</span>
                            </div>
                            <div className="w-px h-8" style={{ background: 'var(--crystal-border)' }} />
                            <div className="flex flex-col items-center">
                                <span className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--crystal-muted)' }}>Total Page Hits</span>
                                <span className="font-mono text-[var(--gold)] font-bold text-lg">{metrics.totalPageHits || 0}</span>
                            </div>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {/* 1. DASHBOARD */}
                        {activeTab === "dashboard" && (
                            <motion.div key="dash" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                                {/* Stats Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                                    {[
                                        { label: "Revenue (NPR)", val: `Rs.${metrics.revenueNPR}`, icon: DollarSign, color: "text-[var(--gold)]" },
                                        { label: "Revenue (USD)", val: `$${metrics.revenueUSD}`, icon: TrendingUp, color: "text-green-400" },
                                        { label: "Profit (NPR)", val: `Rs.${metrics.profitNPR}`, icon: CreditCard, color: "text-emerald-400" },
                                        { label: "Profit (USD)", val: `$${metrics.profitUSD}`, icon: TrendingUp, color: "text-cyan-400" },
                                        { label: "Total Orders", val: metrics.totalOrders, icon: ShoppingCart, color: "text-blue-400" },
                                        { label: "Total Products", val: metrics.totalProducts, icon: Package, color: "text-purple-400" },
                                    ].map((s, i) => (
                                        <motion.div key={i} whileHover={{ y: -4, scale: 1.01 }} className="crystal-card p-4 rounded-2xl transition-all duration-300 cursor-default">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className={`p-2 rounded-xl crystal-card ${s.color}`}>
                                                    <s.icon className="w-4 h-4" />
                                                </div>
                                                <TrendingUp className="w-3 h-3 text-green-400/40" />
                                            </div>
                                            <p className="text-[9px] uppercase tracking-widest mb-1 font-bold" style={{ color: 'var(--crystal-muted)' }}>{s.label}</p>
                                            <h3 className="text-xl font-mono tracking-tighter" style={{ color: 'var(--crystal-text)' }}>{s.val}</h3>
                                        </motion.div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Recent Activity */}
                                    <div className="lg:col-span-2 crystal-card p-4 sm:p-6 lg:p-8 rounded-2xl">
                                        <div className="flex items-center justify-between mb-8">
                                            <h3 className="font-heading text-xl md:text-2xl" style={{ color: 'var(--crystal-text)' }}>Recent Transactions</h3>
                                            <button onClick={() => setActiveTab("orders")} className="text-[9px] uppercase tracking-[0.3em] text-[var(--gold)] font-bold hover:text-white transition-colors">View All</button>
                                        </div>
                                        <div className="space-y-3">
                                            {(orders || []).slice(0, 5).map(order => (
                                                <div key={order?.id || Math.random()} className="crystal-card flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl crystal-hover gap-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-[var(--gold)] border border-[var(--gold)]/20 text-[10px]" style={{ background: 'rgba(201,168,76,0.1)' }}>
                                                            {(order?.customerName || "?").charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--crystal-text)' }}>{order?.customerName || "Unknown Customer"}</p>
                                                            <p className="text-[10px] font-mono" style={{ color: 'var(--crystal-muted)' }}>{order?.createdAt ? new Date(order.createdAt).toDateString() : "N/A"}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-mono text-sm font-bold" style={{ color: 'var(--crystal-text)' }}>
                                                            {order?.paymentCurrency === "USD" ? `$${order?.total || "0.00"}` : `Rs.${order?.total || "0.00"}`}
                                                        </p>
                                                        <span className={`text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-full border ${order?.status === "Delivered" ? "bg-green-500/10 text-green-400 border-green-500/20" : order?.status === "Cancelled" ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-[var(--gold)]/10 text-[var(--gold)] border-[var(--gold)]/20"}`}>
                                                            {order?.status || "Pending"}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                            {orders.length === 0 && <p className="text-center py-10 text-sm italic" style={{ color: 'var(--crystal-muted)' }}>No data available</p>}
                                        </div>
                                    </div>

                                    {/* Stock Alerts */}
                                    <div className="crystal-card p-4 sm:p-6 lg:p-8 rounded-2xl">
                                        <h3 className="font-heading text-xl md:text-2xl mb-8 flex items-center gap-2" style={{ color: 'var(--crystal-text)' }}>
                                            Inventory <span className="bg-red-500/15 text-red-400 text-[10px] px-2 py-0.5 rounded-full border border-red-500/20">{metrics.stockAlerts}</span>
                                        </h3>
                                        <div className="space-y-4">
                                            {products.filter(p => p.stock < 20).slice(0, 5).map(p => (
                                                <div key={p.id} className="group">
                                                    <div className="flex justify-between text-[11px] mb-2 font-bold uppercase tracking-wider">
                                                        <span className="truncate max-w-[120px]" style={{ color: 'var(--crystal-text)' }}>{p.title}</span>
                                                        <span className={p.stock < 10 ? "text-red-400" : "text-[var(--gold)]"}>{p.stock} left</span>
                                                    </div>
                                                    <div className="h-1 w-full relative overflow-hidden rounded-full" style={{ background: 'var(--crystal-border)' }}>
                                                        <motion.div initial={{ width: 0 }} animate={{ width: `${(p.stock / 200) * 100}%` }} className={`h-full rounded-full ${p.stock < 10 ? "bg-red-500" : "bg-[var(--gold)]"}`} />
                                                    </div>
                                                </div>
                                            ))}
                                            {products.length === 0 && <p className="text-xs text-center" style={{ color: 'var(--crystal-muted)' }}>All clear</p>}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* 2. PRODUCTS PAGE */}
                        {activeTab === "products" && (
                            <motion.div key="prod" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
                                    <div className="flex gap-2">
                                        <button onClick={() => {
                                            setEditingProduct(null);
                                            setProductForm({
                                                title: "", price: "0.00", costPrice: "0.00", description: "", category: "T-Shirts", imageUrl: "",
                                                sizes: ["S", "M", "L", "XL"], colors: ["Black", "White"], stock: 100,
                                                status: "In Stock", isFeatured: false, discountPrice: ""
                                            });
                                            setShowProductModal(true);
                                        }} className={btnCls}>
                                            <Plus className="w-4 h-4 inline-block mr-2 -mt-0.5" /> New Product
                                        </button>
                                    </div>
                                    <div className="flex gap-2 w-full sm:w-auto">
                                        <div className="relative flex-1 sm:w-64">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                            <input type="text" placeholder="Search SKU or Name..." className={`${inputCls} pl-10 h-11`} />
                                        </div>
                                        <button className="crystal-card crystal-hover px-4 rounded-lg transition-colors" style={{ color: 'var(--crystal-muted)' }}><Filter className="w-4 h-4" /></button>
                                    </div>
                                </div>

                                <div className="crystal-card rounded-2xl overflow-hidden">
                                    <div className="w-full overflow-x-auto"><table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr style={{ background: 'var(--crystal-bg)', borderBottom: '1px solid var(--crystal-border)' }}>
                                                <th className="p-4 text-[10px] uppercase tracking-widest font-bold" style={{ color: 'var(--crystal-muted)' }}>Image</th>
                                                <th className="p-4 text-[10px] uppercase tracking-widest font-bold" style={{ color: 'var(--crystal-muted)' }}>Product Details</th>
                                                <th className="p-4 text-[10px] uppercase tracking-widest font-bold" style={{ color: 'var(--crystal-muted)' }}>Category</th>
                                                <th className="p-4 text-[10px] uppercase tracking-widest font-bold" style={{ color: 'var(--crystal-muted)' }}>Cost</th>
                                                <th className="p-4 text-[10px] uppercase tracking-widest font-bold" style={{ color: 'var(--crystal-muted)' }}>Price</th>
                                                <th className="p-4 text-[10px] uppercase tracking-widest font-bold" style={{ color: 'var(--crystal-muted)' }}>Stock</th>
                                                <th className="p-4 text-[10px] uppercase tracking-widest font-bold" style={{ color: 'var(--crystal-muted)' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody style={{ borderColor: 'var(--crystal-border)' }} className="divide-y divide-[var(--crystal-border)]">
                                            {(products || []).map(p => (
                                                <tr key={p?.id || Math.random()} className="crystal-hover transition-colors group">
                                                    <td className="p-4">
                                                        <div className="w-12 h-16 rounded-lg overflow-hidden border" style={{ background: 'var(--crystal-bg)', borderColor: 'var(--crystal-border)' }}>
                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                            <img src={p?.imageUrl || ""} alt="" className="w-full h-full object-cover" />
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <p className="font-bold text-xs uppercase tracking-wider mb-1 group-hover:text-[var(--gold)] transition-colors" style={{ color: 'var(--crystal-text)' }}>{p?.title || "Unnamed Product"}</p>
                                                        <div className="flex gap-1">
                                                            {p?.isFeatured && <span className="text-[8px] uppercase tracking-tighter px-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded">Featured</span>}
                                                            <span className={`text-[8px] uppercase tracking-tighter px-1 rounded border ${(Number(p?.stock) || 0) > 0 ? "border-green-500/20 text-green-400 bg-green-500/5" : "border-red-500/20 text-red-400 bg-red-500/5"}`}>
                                                                {(Number(p?.stock) || 0) > 0 ? "Available" : "Sold Out"}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-[11px] uppercase tracking-wider" style={{ color: 'var(--crystal-muted)' }}>{p?.category || "Uncategorized"}</td>
                                                    <td className="p-4 font-mono text-xs" style={{ color: 'var(--crystal-muted)' }}>${p?.costPrice || "0.00"}</td>
                                                    <td className="p-4">
                                                        <p className="font-mono text-xs font-bold" style={{ color: 'var(--crystal-text)' }}>${p?.price || "0.00"}</p>
                                                        {p?.discountPrice && <p className="font-mono text-[9px] line-through" style={{ color: 'var(--crystal-muted)' }}>${p.discountPrice}</p>}
                                                    </td>
                                                    <td className={`p-4 font-mono text-xs font-bold ${(Number(p?.stock) || 0) < 15 ? "text-red-400" : ""}`} style={(Number(p?.stock) || 0) >= 15 ? { color: 'var(--crystal-text)' } : {}}>{p?.stock ?? 0}</td>
                                                    <td className="p-4">
                                                        <div className="flex gap-2">
                                                            <button onClick={() => {
                                                                if (!p) return;
                                                                setEditingProduct(p);
                                                                setProductForm({
                                                                    ...p,
                                                                    costPrice: p.costPrice || "0.00",
                                                                    sizes: p.sizes || [],
                                                                    colors: p.colors || [],
                                                                    discountPrice: p.discountPrice || ""
                                                                });
                                                                setShowProductModal(true);
                                                            }} className="p-2 crystal-card crystal-hover rounded-lg transition-colors" style={{ color: 'var(--crystal-muted)' }}>
                                                                <Edit3 className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => { if (p && confirm("Delete product?")) deleteProduct(p.id); }} className="p-2 bg-red-500/5 text-red-400/60 hover:text-red-400 border border-red-500/10 transition-colors rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table></div>
                                    {products.length === 0 && <div className="p-20 text-center uppercase tracking-widest text-xs" style={{ color: 'var(--crystal-muted)' }}>No products found</div>}
                                </div>
                            </motion.div>
                        )}

                        {/* 3. ORDERS PAGE */}
                        {activeTab === "orders" && (
                            <motion.div key="ord" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                                {orders.map(o => (
                                    <div key={o.id} className="crystal-card rounded-2xl p-6 md:p-8 flex flex-col lg:flex-row gap-8">
                                        <div className="flex-1 space-y-6">
                                            <div className="flex items-start justify-between pb-4" style={{ borderBottom: '1px solid var(--crystal-border)' }}>
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-widest text-[var(--gold)] font-bold mb-1">Order Ref: {o?.id?.split('_')?.[1] || o?.id || "N/A"}</p>
                                                    <div className="flex items-center gap-3 flex-wrap">
                                                        <h3 className="font-heading text-2xl" style={{ color: 'var(--crystal-text)' }}>{o?.customerName || "Unknown Customer"}</h3>
                                                        <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full border ${o?.status === "Delivered" ? "border-green-500/30 text-green-400 bg-green-500/10" : o?.status === "Cancelled" ? "border-red-500/30 text-red-400 bg-red-500/10" : "border-[var(--gold)]/30 text-[var(--gold)] bg-[var(--gold)]/10"}`}>{o?.status || "Pending"}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-mono" style={{ color: 'var(--crystal-muted)' }}>{o?.createdAt ? new Date(o.createdAt).toLocaleString() : "N/A"}</p>
                                                    <p className="text-xl font-mono font-bold mt-1" style={{ color: 'var(--crystal-text)' }}>${o?.total || "0.00"}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-3">
                                                    <h4 className="text-[9px] uppercase tracking-widest font-bold pb-2" style={{ color: 'var(--crystal-muted)', borderBottom: '1px solid var(--crystal-border)' }}>Shipping Info</h4>
                                                    <div className="space-y-2 text-[11px] leading-relaxed font-medium" style={{ color: 'var(--crystal-muted)' }}>
                                                        <p className="flex items-center gap-3"><Phone className="w-3.5 h-3.5 text-[var(--gold)]" /> {o?.customerPhone || "N/A"}</p>
                                                        <p className="flex items-center gap-3"><Mail className="w-3.5 h-3.5 text-[var(--gold)]" /> {o?.customerEmail || "N/A"}</p>
                                                        <p className="flex items-center gap-3"><MapPin className="w-3.5 h-3.5 text-[var(--gold)]" /> {o?.customerLocation || "N/A"}</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <h4 className="text-[9px] uppercase tracking-widest font-bold pb-2" style={{ color: 'var(--crystal-muted)', borderBottom: '1px solid var(--crystal-border)' }}>Workflow Controls</h4>
                                                    <div className="space-y-3">
                                                        {o.status === "Pending" ? (
                                                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => updateOrderStatus(o.id, "Shipped")} className="w-full flex items-center justify-center gap-3 bg-[var(--gold)] text-black py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-colors rounded-xl">
                                                                <Truck className="w-4 h-4" /> Confirm & Ship
                                                            </motion.button>
                                                        ) : (
                                                            <div className="flex flex-wrap gap-2">
                                                                {(["Pending", "Shipped", "Delivered", "Cancelled"] as OrderStatus[]).map(s => (
                                                                    <motion.button key={s} initial={false} animate={{ backgroundColor: o.status === s ? (s === "Delivered" ? "#22c55e" : "#c9a84c") : "transparent", color: o.status === s ? "#000" : 'var(--crystal-muted)', borderColor: o.status === s ? (s === "Delivered" ? "#22c55e" : "#c9a84c") : 'var(--crystal-border)' }} onClick={() => updateOrderStatus(o.id, s)} className="px-3 py-1.5 text-[9px] uppercase tracking-widest font-bold border rounded-lg transition-all">{s}</motion.button>
                                                                ))}
                                                            </div>
                                                        )}
                                                        <div className="flex gap-3 items-end">
                                                            <div className="flex-1">
                                                                <p className="text-[8px] uppercase tracking-widest font-bold mb-1.5" style={{ color: 'var(--crystal-muted)' }}>Payment Status</p>
                                                                <select value={o.paymentStatus} onChange={(e) => updatePaymentStatus(o.id, e.target.value as PaymentStatus)} className="w-full crystal-card rounded-lg p-2.5 text-[10px] uppercase font-bold outline-none border-0" style={{ color: 'var(--crystal-text)', background: 'var(--crystal-bg)' }}>
                                                                    {(["Unpaid", "Paid", "Refunded"] as PaymentStatus[]).map(s => <option key={s}>{s}</option>)}
                                                                </select>
                                                            </div>
                                                            <button onClick={() => { if (confirm("Delete order?")) deleteOrder(o.id); }} className="p-2.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all"><Trash2 className="w-4 h-4" /></button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="crystal-card rounded-xl p-5">
                                                <div className="flex justify-between items-center mb-3">
                                                    <h4 className="text-[9px] uppercase tracking-widest font-bold" style={{ color: 'var(--crystal-muted)' }}>Order Basket</h4>
                                                    {o.appliedVoucher && (<div className="flex items-center gap-2 px-2 py-0.5 rounded-full" style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)' }}><Tag className="w-3 h-3 text-[var(--gold)]" /><span className="text-[9px] font-black uppercase tracking-widest text-[var(--gold)]">Voucher: {o.appliedVoucher}</span></div>)}
                                                </div>
                                                <div className="space-y-2">
                                                    {(o?.items || []).map((item, idx) => (
                                                        <div key={idx} className="flex justify-between items-center text-[11px] font-bold uppercase tracking-wider py-2" style={{ borderBottom: idx < (o?.items?.length || 0) - 1 ? '1px solid var(--crystal-border)' : 'none' }}>
                                                            <div style={{ color: 'var(--crystal-text)' }}>{item?.title || "Unknown Item"} <span className="text-[var(--gold)]">x{item?.quantity || 1}</span>{item?.customSize ? <span className="text-[var(--gold)] ml-2 border border-[var(--gold)]/30 px-1 py-0.5 rounded">Personal: {item.customSize}</span> : item?.size && <span className="ml-2" style={{ color: 'var(--crystal-muted)' }}>[{item.size}]</span>}</div>
                                                            <span className="font-mono" style={{ color: 'var(--crystal-muted)' }}>{(o?.paymentCurrency === "USD" ? "$" : "Rs.")}{((Number(item?.price) || 0) * (Number(item?.quantity) || 1)).toFixed(2)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {orders.length === 0 && <div className="crystal-card rounded-2xl p-20 text-center text-sm italic" style={{ color: 'var(--crystal-muted)' }}>No orders yet</div>}
                            </motion.div>
                        )}

                        {/* 4. CUSTOMERS */}
                        {activeTab === "customers" && (
                            <motion.div key="cust" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                                <div className="crystal-card rounded-2xl overflow-hidden">
                                    <div className="w-full overflow-x-auto"><table className="w-full text-left">
                                        <thead>
                                            <tr style={{ background: 'var(--crystal-bg)', borderBottom: '1px solid var(--crystal-border)' }}>
                                                <th className="p-5 text-[10px] uppercase font-bold tracking-widest" style={{ color: 'var(--crystal-muted)' }}>Profile</th>
                                                <th className="p-5 text-[10px] uppercase font-bold tracking-widest" style={{ color: 'var(--crystal-muted)' }}>Contact</th>
                                                <th className="p-5 text-[10px] uppercase font-bold tracking-widest" style={{ color: 'var(--crystal-muted)' }}>Orders</th>
                                                <th className="p-5 text-[10px] uppercase font-bold tracking-widest" style={{ color: 'var(--crystal-muted)' }}>Revenue</th>
                                                <th className="p-5 text-[10px] uppercase font-bold tracking-widest" style={{ color: 'var(--crystal-muted)' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y" style={{ borderColor: 'var(--crystal-border)' }}>
                                            {(customers || []).map(c => (
                                                <tr key={c?.id || Math.random()} className="crystal-hover transition-all">
                                                    <td className="p-5">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${c?.isBlocked ? "bg-red-500/15 text-red-400" : "text-[var(--gold)]"}`} style={!c?.isBlocked ? { background: 'rgba(201,168,76,0.12)' } : {}}>{(c?.name || "?").charAt(0)}</div>
                                                            <div>
                                                                <p className="font-bold text-xs uppercase tracking-wider" style={{ color: 'var(--crystal-text)' }}>{c?.name || "Unknown Customer"}</p>
                                                                <span className={`text-[8px] uppercase font-bold ${c?.isBlocked ? 'text-red-400' : 'text-green-400'}`}>{c?.isBlocked ? 'Blocked' : 'Active'}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-5">
                                                        <p className="text-xs font-medium mb-1" style={{ color: 'var(--crystal-muted)' }}>{c?.email || "N/A"}</p>
                                                        <p className="text-xs font-medium" style={{ color: 'var(--crystal-muted)' }}>{c?.phone || "N/A"}</p>
                                                    </td>
                                                    <td className="p-5 text-xs font-mono" style={{ color: 'var(--crystal-text)' }}>{c?.orderHistory?.length || 0}</td>
                                                    <td className="p-5 text-sm font-mono text-[var(--gold)] font-bold">${(Number(c?.totalSpent) || 0).toFixed(2)}</td>
                                                    <td className="p-5">{c?.isBlocked ? <button onClick={() => c && updateCustomer(c.id, { isBlocked: false })} className="text-[10px] uppercase font-bold tracking-widest text-green-400 hover:text-green-300">Unblock</button> : <button onClick={() => c && updateCustomer(c.id, { isBlocked: true })} className="text-[10px] uppercase font-bold tracking-widest text-red-400/60 hover:text-red-400">Block</button>}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table></div>
                                </div>
                            </motion.div>
                        )}

                        {/* 5. COUPONS */}
                        {activeTab === "coupons" && (
                            <motion.div key="coup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
                                <div className="lg:col-span-4 crystal-card rounded-2xl p-4 sm:p-6 lg:p-8 h-fit">
                                    <h3 className="font-heading text-xl md:text-2xl mb-8" style={{ color: 'var(--crystal-text)' }}>Create Coupon</h3>
                                    <form onSubmit={(e) => {
                                        e.preventDefault();
                                        const d = new FormData(e.currentTarget);
                                        addVoucher(d.get('code') as string, Number(d.get('pct')), d.get('exp') as string, Number(d.get('limit')));
                                        flash("Coupon created!");
                                        (e.target as any).reset();
                                    }} className="space-y-6">
                                        <div><label className={labelCls}>Code</label><input name="code" type="text" className={inputCls} placeholder="WELCOMEX" required /></div>
                                        <div><label className={labelCls}>Discount %</label><input name="pct" type="number" className={inputCls} placeholder="20" required /></div>
                                        <div><label className={labelCls}>Expiry Date</label><input name="exp" type="date" className={inputCls} /></div>
                                        <div><label className={labelCls}>Usage Limit</label><input name="limit" type="number" className={inputCls} placeholder="100" /></div>
                                        <button type="submit" className={btnCls + " w-full"}>Issue Coupon</button>
                                    </form>
                                </div>
                                <div className="lg:col-span-8 crystal-card rounded-2xl p-4 sm:p-6 lg:p-8">
                                    <h3 className="font-heading text-xl md:text-2xl mb-8" style={{ color: 'var(--crystal-text)' }}>Active Vouchers</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {(vouchers || []).map((v, i) => (
                                            <div key={v?.code || i} className="crystal-card rounded-xl p-6 relative overflow-hidden group">
                                                <div className="absolute -right-4 -top-4 w-12 h-12 rotate-45" style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)' }} />
                                                <p className="font-mono text-xl font-black text-[var(--gold)] mb-1 tracking-tighter">{v?.code || "N/A"}</p>
                                                <p className="text-[10px] uppercase font-bold mb-4" style={{ color: 'var(--crystal-muted)' }}>{v?.discountPercentage || 0}% OFF</p>
                                                <div className="flex items-center justify-between text-[10px] uppercase tracking-widest font-bold" style={{ color: 'var(--crystal-muted)' }}>
                                                    <span>Uses: {v?.usageCount || 0} / {v?.usageLimit || '∞'}</span>
                                                    <div className="flex items-center gap-3">
                                                        <span className={v?.isActive ? 'text-green-400' : 'text-red-400'}>{v?.isActive ? 'Active' : 'Inactive'}</span>
                                                        <span className={v?.expiryDate && new Date(v.expiryDate || '2099') < new Date() ? 'text-red-400' : ''}>{v?.expiryDate ? new Date(v.expiryDate).toLocaleDateString() : '∞'}</span>
                                                    </div>
                                                </div>
                                                <div className="mt-4 flex gap-2 pt-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ borderTop: '1px solid var(--crystal-border)' }}>
                                                    <button onClick={() => v?.code && toggleVoucherStatus(v.code)} className={`flex-1 text-[8px] uppercase font-black py-2 rounded-lg border transition-all ${v?.isActive ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' : 'border-green-500/30 text-green-400 hover:bg-green-500/10'}`}>{v?.isActive ? 'Deactivate' : 'Activate'}</button>
                                                    <button onClick={() => { if (v?.code && confirm(`Delete ${v.code}?`)) deleteVoucher(v.code); }} className="px-3 py-2 rounded-lg transition-all crystal-card" style={{ color: 'var(--crystal-muted)' }}><Trash2 className="w-3.5 h-3.5" /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* 6. CATEGORIES */}
                        {activeTab === "categories" && (
                            <motion.div key="cat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-4xl space-y-8" style={{ maxWidth: '100vw' }}>
                                <div className="crystal-card rounded-2xl p-4 sm:p-6 lg:p-8">
                                    <h3 className="font-heading text-xl md:text-2xl mb-8" style={{ color: 'var(--crystal-text)' }}>Category Management</h3>

                                    <div className="flex flex-col sm:flex-row gap-4 mb-10 w-full">
                                        <input
                                            id="new-category-input"
                                            type="text"
                                            placeholder="Enter category name..."
                                            className={inputCls + " flex-1 w-full"}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    const val = (e.target as HTMLInputElement).value;
                                                    if (val) {
                                                        addCategory(val);
                                                        (e.target as HTMLInputElement).value = "";
                                                        flash(`Category "${val}" added!`);
                                                    }
                                                }
                                            }}
                                        />
                                        <button
                                            onClick={() => {
                                                const el = document.getElementById('new-category-input') as HTMLInputElement;
                                                if (el.value) {
                                                    addCategory(el.value);
                                                    el.value = "";
                                                    flash("Category added!");
                                                }
                                            }}
                                            className={btnCls + " w-full sm:w-auto"}
                                        >
                                            Add Category
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {(categories || []).map(cat => (
                                            <div key={cat} className="crystal-card crystal-hover group flex items-center justify-between p-4 rounded-xl transition-all">
                                                <span className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--crystal-text)' }}>{cat}</span>
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => {
                                                            const n = prompt("Rename category:", cat);
                                                            if (n && n !== cat) updateCategory(cat, n);
                                                        }}
                                                        className="p-2 text-gray-400 hover:text-[var(--gold)]"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (confirm(`Delete category "${cat}"? Products in this category will not be deleted but may need re-categorizing.`)) {
                                                                deleteCategory(cat);
                                                                flash("Category deleted");
                                                            }
                                                        }}
                                                        className="p-2 text-gray-400 hover:text-red-500"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* 7. CONTENT */}
                        {activeTab === "content" && (
                            <motion.div key="cont" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-4xl space-y-8">
                                <div className="crystal-card rounded-2xl p-8">
                                    <h3 className="font-heading text-2xl mb-8" style={{ color: 'var(--crystal-text)' }}>Site Assets & CMS</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <form onSubmit={handleCmsSubmit} className="space-y-6">
                                            <div><label className={labelCls}>Homepage Hero Image</label><input type="url" value={cmsForm.hero} onChange={e => setCmsForm(prev => ({ ...prev, hero: e.target.value }))} className={inputCls} placeholder="https://..." /></div>
                                            <div><label className={labelCls}>Footer Background</label><input type="url" value={cmsForm.footer} onChange={e => setCmsForm(prev => ({ ...prev, footer: e.target.value }))} className={inputCls} placeholder="https://..." /></div>
                                            <div><label className={labelCls}>Custom Logo URL</label><input type="url" value={cmsForm.logo} onChange={e => setCmsForm(prev => ({ ...prev, logo: e.target.value }))} className={inputCls} placeholder="https://..." /></div>
                                            <button type="submit" className={btnCls + " w-full"}>Update Assets</button>
                                        </form>
                                        <div className="crystal-card rounded-xl p-6 flex flex-col items-center justify-center text-center">
                                            <Paintbrush className="w-12 h-12 text-[var(--gold)] mb-4 opacity-50" />
                                            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: 'var(--crystal-text)' }}>UI Styling Mode</h4>
                                            <p className="text-[10px] leading-relaxed mb-6 uppercase tracking-widest" style={{ color: 'var(--crystal-muted)' }}>Animations are globally synchronised. Adding products or editing content does not disrupt the luxury entrance effects.</p>
                                            <button onClick={resetTheme} className={btnCls + " !bg-transparent !text-[var(--gold)] border border-[var(--gold)]/30 hover:!bg-[var(--gold)] hover:!text-black"}>Revert to Defaults</button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* 7. MEDIA MANAGER */}
                        {activeTab === "media" && (
                            <motion.div key="med" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                                <div className="crystal-card rounded-2xl p-8">
                                    <div className="flex justify-between items-center mb-10">
                                        <h3 className="font-heading text-2xl" style={{ color: 'var(--crystal-text)' }}>Digital Assets Library</h3>
                                        <label className={`${btnCls} cursor-pointer inline-flex items-center gap-2`}>
                                            <Plus className="w-4 h-4" /> Upload Mockups
                                            <input type="file" className="hidden" accept="image/*" multiple />
                                        </label>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                                        {products.map(p => (
                                            <div key={p.id} className="aspect-square crystal-card rounded-xl relative group overflow-hidden">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={p.imageUrl} alt="" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button className="p-2 bg-[var(--gold)] text-black rounded-full"><Eye className="w-4 h-4" /></button>
                                                </div>
                                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-[8px] uppercase font-bold text-white tracking-widest truncate">{p.title}</div>
                                            </div>
                                        ))}
                                        <div className="aspect-square crystal-card rounded-xl border-2 border-dashed flex items-center justify-center" style={{ borderColor: 'var(--crystal-border)' }}>
                                            <ImageIcon className="w-8 h-8 opacity-20" style={{ color: 'var(--crystal-muted)' }} />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* 8. SETTINGS */}
                        {activeTab === "settings" && (
                            <motion.div key="sett" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="crystal-card rounded-2xl p-8">
                                    <h3 className="font-heading text-2xl mb-8 flex items-center gap-3" style={{ color: 'var(--crystal-text)' }}><ShieldCheck className="w-6 h-6 text-[var(--gold)]" /> Security & Account</h3>
                                    <form onSubmit={handlePasswordChange} className="space-y-6">
                                        <div><label className={labelCls}>Global Admin Password</label><input type="password" value={pwForm.new} onChange={e => setPwForm(p => ({ ...p, new: e.target.value }))} className={inputCls} placeholder="Enter new password" required /></div>
                                        <div><label className={labelCls}>Confirm Password</label><input type="password" value={pwForm.confirm} onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} className={inputCls} placeholder="Verify password" required /></div>
                                        <p className="text-[9px] text-[var(--muted)] uppercase tracking-widest leading-relaxed">Updating this will instantly invalidate current session. Only the new password will function across all access points.</p>
                                        <button type="submit" className={btnCls + " w-full"}>Update Credentials</button>
                                    </form>
                                </div>

                                <div className="crystal-card rounded-2xl p-8">
                                    <h3 className="font-heading text-2xl mb-8 flex items-center gap-3" style={{ color: 'var(--crystal-text)' }}><CreditCard className="w-6 h-6 text-[var(--gold)]" /> Payment Gateways</h3>
                                    <div className="space-y-3">
                                        {[
                                            { id: "esewa", label: "eSewa Payment", active: adminConfig.payments.esewa },
                                            { id: "khalti", label: "Khalti SDK", active: adminConfig.payments.khalti },
                                            { id: "stripe", label: "Stripe Checkout", active: adminConfig.payments.stripe },
                                            { id: "paypal", label: "PayPal Express", active: adminConfig.payments.paypal },
                                            { id: "cod", label: "Cash on Delivery", active: adminConfig.payments.cod }
                                        ].map(pm => (
                                            <div key={pm.id} className="crystal-card crystal-hover flex items-center justify-between p-4 rounded-xl">
                                                <span className="text-xs uppercase font-bold tracking-widest" style={{ color: 'var(--crystal-text)' }}>{pm.label}</span>
                                                <button onClick={() => updateAdminConfig({ payments: { ...adminConfig.payments, [pm.id]: !pm.active } })} className={`w-10 h-5 rounded-full transition-all relative ${pm.active ? "bg-[var(--gold)]" : "bg-[var(--muted)]/20"}`}>
                                                    <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${pm.active ? "right-1" : "left-1"}`} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-10 pt-10" style={{ borderTop: '1px solid var(--crystal-border)' }}>
                                        <h3 className="font-heading text-2xl mb-8 flex items-center gap-3" style={{ color: 'var(--crystal-text)' }}><Mail className="w-6 h-6 text-[var(--gold)]" /> Communication Protocol</h3>
                                        <div className="space-y-6">
                                            <div>
                                                <label className={labelCls}>Order Notification Email</label>
                                                <input type="email" value={adminConfig.orderEmail} onChange={e => updateAdminConfig({ orderEmail: e.target.value })} className={inputCls} placeholder="Forwarding address for orders" />
                                            </div>
                                            <div>
                                                <label className={labelCls}>Contact Inquiry Email</label>
                                                <input type="email" value={adminConfig.contactEmail} onChange={e => updateAdminConfig({ contactEmail: e.target.value })} className={inputCls} placeholder="Forwarding address for messages" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-10 pt-10" style={{ borderTop: '1px solid var(--crystal-border)' }}>
                                        <h3 className="font-heading text-2xl mb-8 flex items-center gap-3" style={{ color: 'var(--crystal-text)' }}><Truck className="w-6 h-6 text-[var(--gold)]" /> Logistics & Currency</h3>
                                        <div className="space-y-6">
                                            <div><label className={labelCls}>Exchange Rate (1 USD = ? NPR)</label><input type="number" value={adminConfig.exchangeRate} onChange={e => updateAdminConfig({ exchangeRate: Number(e.target.value) })} className={`${inputCls} font-mono`} /></div>
                                            <div><label className={labelCls}>Flat Shipping Rate ($)</label><input type="number" value={adminConfig.shippingCost} onChange={e => updateAdminConfig({ shippingCost: Number(e.target.value) })} className={inputCls} /></div>
                                            <div><label className={labelCls}>Free Shipping Over ($)</label><input type="number" value={adminConfig.freeShippingThreshold} onChange={e => updateAdminConfig({ freeShippingThreshold: Number(e.target.value) })} className={inputCls} /></div>
                                            <button onClick={() => flash("Settings saved!")} className={btnCls + " w-full"}>Save Configuration</button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {/* PRODUCT MODAL (Slide-over) */}
            <AnimatePresence>
                {showProductModal && (
                    <>
                        <motion.div key="mask" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowProductModal(false)} className="fixed inset-0 bg-black/60 z-[60]" style={{ backdropFilter: 'blur(20px)' }} />
                        <motion.div key="modal" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }} className="fixed inset-y-0 right-0 w-full max-w-2xl z-[70] shadow-2xl p-8 lg:p-12 overflow-y-auto crystal-sidebar">
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="font-heading text-4xl" style={{ color: 'var(--crystal-text)' }}>{editingProduct ? "Edit" : "New"} Product</h3>
                                <button onClick={() => setShowProductModal(false)} className="text-[var(--muted)] hover:text-white transition-colors"><XCircle className="w-8 h-8" /></button>
                            </div>

                            <form onSubmit={handleProductSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div><label className={labelCls}>Product Title</label><input type="text" value={productForm.title} onChange={e => setProductForm(p => ({ ...p, title: e.target.value }))} className={inputCls} placeholder="e.g. BroX Ultra Hoodie" required /></div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div><label className={labelCls}>Cost ($)</label><input type="text" value={productForm.costPrice} onChange={e => setProductForm(p => ({ ...p, costPrice: e.target.value }))} className={`${inputCls} font-mono`} placeholder="45.00" required /></div>
                                            <div><label className={labelCls}>Price ($)</label><input type="text" value={productForm.price} onChange={e => setProductForm(p => ({ ...p, price: e.target.value }))} className={`${inputCls} font-mono`} placeholder="99.00" required /></div>
                                            <div><label className={labelCls}>Sale ($)</label><input type="text" value={productForm.discountPrice || ""} onChange={e => setProductForm(p => ({ ...p, discountPrice: e.target.value }))} className={`${inputCls} font-mono`} placeholder="Opt" /></div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelCls}>Product Thumbnail</label>
                                        <div className="aspect-[3/4] crystal-card rounded-xl border-2 border-dashed relative overflow-hidden group" style={{ borderColor: 'var(--crystal-border)' }}>
                                            {productForm.imageUrl
                                                ? <img src={productForm.imageUrl} alt="" className="w-full h-full object-cover" /> // eslint-disable-line @next/next/no-img-element
                                                : <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--muted)] uppercase tracking-widest text-[9px] font-bold"><ImageIcon className="w-10 h-10 mb-2 opacity-20" /> Select Media</div>
                                            }
                                            <input type="file" onChange={(e) => handleFileChange(e, 'imageUrl')} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                                <p className="text-white text-[10px] uppercase tracking-widest font-bold">Change Image</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8 pt-4">
                                    <div>
                                        <label className={labelCls}>Stock Quantity</label>
                                        <input type="number" value={productForm.stock} onChange={e => setProductForm(p => ({ ...p, stock: Number(e.target.value) }))} className={`${inputCls} font-mono`} required />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Category</label>
                                        <select value={productForm.category} onChange={e => setProductForm(p => ({ ...p, category: e.target.value }))} className={inputCls}>
                                            <option value="">Select Category</option>
                                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div className="crystal-card flex items-center gap-3 p-4 rounded-xl">
                                        <input type="checkbox" checked={productForm.isFeatured} onChange={e => setProductForm(p => ({ ...p, isFeatured: e.target.checked }))} className="w-4 h-4 accent-[var(--gold)]" />
                                        <span className="text-[10px] uppercase font-bold tracking-widest" style={{ color: 'var(--crystal-text)' }}>Featured Product</span>
                                    </div>
                                    <div className="crystal-card flex items-center gap-3 p-4 rounded-xl">
                                        <select value={productForm.status} onChange={e => setProductForm(p => ({ ...p, status: e.target.value as any }))} className="text-[10px] uppercase font-bold tracking-widest outline-none border-none w-full" style={{ background: 'transparent', color: 'var(--crystal-text)' }}>
                                            <option>In Stock</option>
                                            <option>Out of Stock</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className={labelCls}>Description</label>
                                    <textarea rows={5} value={productForm.description} onChange={e => setProductForm(p => ({ ...p, description: e.target.value }))} className={`${inputCls} resize-none`} placeholder="Elaborate on the fit, material and vibe..." required />
                                </div>

                                <button type="submit" className={btnCls + " w-full py-5 text-sm"}>
                                    <Save className="w-4 h-4 inline-block mr-2" /> {editingProduct ? "Update" : "Publish"} Item
                                </button>
                            </form>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
