import * as React from "react"
import { useAuth } from "../context/AuthContext"
import { Link, useLocation } from "react-router-dom"

import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  LayoutDashboardIcon,
  PackageIcon,
  LayersIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  StoreIcon,
  ShieldCheckIcon,
} from "lucide-react"

export function AppSidebar({ activeTab, setActiveTab, ...props }) {
  const { user } = useAuth()
  const location = useLocation()
  const [logoFailed, setLogoFailed] = React.useState(false)

  const userData = {
    name: user?.username || "Admin User",
    email: user?.email || "admin@technodha.com",
    avatar: "/avatars/admin.jpg",
  }

  const adminNav = [
    {
      title: "Products Inventory",
      onClick: () => setActiveTab?.('products'),
      isActive: activeTab === 'products',
      icon: <PackageIcon className="w-4 h-4" />,
    },
    {
      title: "Categories",
      onClick: () => setActiveTab?.('categories'),
      isActive: activeTab === 'categories',
      icon: <LayersIcon className="w-4 h-4" />,
    },
    {
      title: "Manage Orders",
      onClick: () => setActiveTab?.('orders'),
      isActive: activeTab === 'orders',
      icon: <ShoppingBagIcon className="w-4 h-4" />,
    },
  ]

  const routeLinks = [
    {
      title: "Product Catalogue",
      url: "/products",
      icon: <StoreIcon className="w-4 h-4" />,
    },
    {
      title: "User Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboardIcon className="w-4 h-4" />,
    },
    {
      title: "Order History",
      url: "/orders",
      icon: <ShoppingBagIcon className="w-4 h-4" />,
    },
    {
      title: "Shopping Cart",
      url: "/cart",
      icon: <ShoppingCartIcon className="w-4 h-4" />,
    },
  ]

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="border-b py-3 px-4">
        <Link to="/" className="flex items-center space-x-3 group">
          {!logoFailed ? (
            <img
              src="/technodha_logo.webp"
              alt="TECHNODHA Logo"
              onError={() => setLogoFailed(true)}
              className="h-9 w-auto object-contain rounded-md transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              <ShieldCheckIcon className="w-5 h-5" />
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight leading-none">TECHNODHA</span>
            <span className="text-[10px] text-muted-foreground font-semibold">Admin Panel</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="space-y-4 pt-2">
        {/* Admin Management Section */}
        <div>
          <div className="px-4 py-1 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Admin Management
          </div>
          <SidebarMenu className="px-2 space-y-1">
            {adminNav.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  onClick={item.onClick}
                  isActive={item.isActive}
                  className={`w-full justify-start cursor-pointer rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    item.isActive ? "bg-primary text-primary-foreground font-bold shadow-xs" : "hover:bg-accent"
                  }`}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>

        {/* General Route Links Section */}
        <div>
          <div className="px-4 py-1 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Quick Navigation
          </div>
          <SidebarMenu className="px-2 space-y-1">
            {routeLinks.map((link) => {
              const isCurrent = location.pathname === link.url;
              return (
                <SidebarMenuItem key={link.title}>
                  <SidebarMenuButton
                    render={<Link to={link.url} />}
                    isActive={isCurrent}
                    className={`w-full justify-start rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                      isCurrent ? "bg-accent text-accent-foreground font-bold" : "hover:bg-accent/60"
                    }`}
                  >
                    {link.icon}
                    <span>{link.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </div>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
