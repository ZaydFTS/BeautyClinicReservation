"use client"

import { useEffect } from"react"
import { useNav } from"@/store/nav"
import { useAuth } from"@/store/auth"
import { CustomerHeader } from"@/components/shared/customer-header"
import { CustomerFooter } from"@/components/shared/customer-footer"
import { HomePage } from"@/components/customer/home-page"
import { ServicesPage } from"@/components/customer/services-page"
import { ServiceDetailPage } from"@/components/customer/service-detail-page"
import { BookingPage } from"@/components/customer/booking-page"
import { ShopPage } from"@/components/customer/shop-page"
import { ProductDetailPage } from"@/components/customer/product-detail-page"
import { CartPage } from"@/components/customer/cart-page"
import { CheckoutPage } from"@/components/customer/checkout-page"
import { OrderSuccessPage } from"@/components/customer/order-success-page"
import { ContactPage } from"@/components/customer/contact-page"
import { AdminLoginPage } from"@/components/admin/admin-login-page"
import { AdminShell } from"@/components/admin/admin-shell"
import { AdminDashboardPage } from"@/components/admin/admin-dashboard-page"
import { AdminCalendarPage } from"@/components/admin/admin-calendar-page"
import { AdminSlotsPage } from"@/components/admin/admin-slots-page"
import { AdminServicesPage } from"@/components/admin/admin-services-page"
import { AdminProductsPage } from"@/components/admin/admin-products-page"
import { AdminOrdersPage } from"@/components/admin/admin-orders-page"
import { AdminAppointmentsPage } from"@/components/admin/admin-appointments-page"
import { AdminCustomersPage } from"@/components/admin/admin-customers-page"
import { AdminFinancialsPage } from"@/components/admin/admin-financials-page"
import { AdminSettingsPage } from"@/components/admin/admin-settings-page"

export default function Home() {
 const route = useNav((s) => s.route)
 const isAdmin = useNav((s) => s.isAdmin)
 const fetchMe = useAuth((s) => s.fetchMe)
 const admin = useAuth((s) => s.admin)
 const authLoaded = useAuth((s) => s.loaded)

 // Pre-fetch admin session for any admin route
 useEffect(() => {
 if (route.name.startsWith("admin_") && !authLoaded) {
 fetchMe()
 }
 }, [route.name, authLoaded, fetchMe])

 // Admin login page - standalone (no shell, no customer header)
 if (route.name ==="admin_login") {
 return <AdminLoginPage />
 }

 // Admin pages (require auth)
 if (route.name.startsWith("admin_")) {
 // Wait for auth to load
 if (!authLoaded) {
 return (
 <div className="min-h-screen flex items-center justify-center">
 <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
 </div>
 )
 }
 // Not authenticated - show login
 if (!admin) {
 return <AdminLoginPage />
 }
 // Authenticated - render inside admin shell
 return (
 <AdminShell>
 {renderAdminRoute(route)}
 </AdminShell>
 )
 }

 // Customer pages - render with header/footer
 return (
 <div className="min-h-screen flex flex-col bg-background">
 <CustomerHeader />
 <main className="flex-1">
 {renderCustomerRoute(route)}
 </main>
 <CustomerFooter />
 </div>
 )
}

function renderCustomerRoute(route: ReturnType<typeof useNav.getState>["route"]) {
 switch (route.name) {
 case"home": return <HomePage />
 case"services": return <ServicesPage />
 case"service_detail": return <ServiceDetailPage route={route} />
 case"booking": return <BookingPage route={route} />
 case"shop": return <ShopPage />
 case"product_detail": return <ProductDetailPage route={route} />
 case"cart": return <CartPage />
 case"checkout": return <CheckoutPage />
 case"order_success": return <OrderSuccessPage route={route} />
 case"contact": return <ContactPage />
 default: return <HomePage />
 }
}

function renderAdminRoute(route: ReturnType<typeof useNav.getState>["route"]) {
 switch (route.name) {
 case"admin_dashboard": return <AdminDashboardPage />
 case"admin_calendar": return <AdminCalendarPage />
 case"admin_slots": return <AdminSlotsPage />
 case"admin_services": return <AdminServicesPage />
 case"admin_products": return <AdminProductsPage />
 case"admin_orders": return <AdminOrdersPage />
 case"admin_appointments": return <AdminAppointmentsPage />
 case"admin_customers": return <AdminCustomersPage />
 case"admin_financials": return <AdminFinancialsPage />
 case"admin_settings": return <AdminSettingsPage />
 default: return <AdminDashboardPage />
 }
}
