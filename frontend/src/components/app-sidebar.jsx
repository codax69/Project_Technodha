import * as React from "react"
import { useAuth } from "../context/AuthContext"
import { Link, useLocation, useNavigate } from "react-router-dom"

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
  ShieldCheckIcon,
} from "lucide-react"

import { ThemeToggle } from "./ThemeToggle"

export function AppSidebar({ side = "left", ...props }) {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [logoFailed, setLogoFailed] = React.useState(false)

  const userData = {
    name: user?.username || "Admin User",
    email: user?.email || "admin@technodha.com",
    avatar: "/avatars/admin.jpg",
  }

  const isPathActive = (path) => {
    if (path === "/admin") return location.pathname === "/admin"
    return location.pathname.startsWith(path)
  }

  const adminNav = [
    {
      id: "dashboard",
      title: "Dashboard",
      path: "/admin",
      icon: <LayoutDashboardIcon className="w-4 h-4" />,
    },
    {
      id: "products",
      title: "Product Management",
      path: "/admin/products",
      icon: <PackageIcon className="w-4 h-4" />,
    },
    {
      id: "categories",
      title: "Category Management",
      path: "/admin/categories",
      icon: <LayersIcon className="w-4 h-4" />,
    },
    {
      id: "orders",
      title: "Manage Orders",
      path: "/admin/orders",
      icon: <ShoppingBagIcon className="w-4 h-4" />,
    },
  ]

  return (
    <Sidebar side={side} collapsible="offcanvas" {...props}>
      <SidebarHeader className="border-b py-3 px-4">
        <Link to="/admin" className="flex items-center space-x-3 group">
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
        </Link>
      </SidebarHeader>

      <SidebarContent className="space-y-4 pt-2">
        <div>
          <div className="px-4 py-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Admin Components
          </div>
          <SidebarMenu className="px-2 space-y-1">
            {adminNav.map((item) => {
              const isActive = isPathActive(item.path)
              return (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.path)}
                    isActive={isActive}
                    className={`w-full justify-start cursor-pointer rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                      isActive ? "bg-primary text-primary-foreground font-bold shadow-xs" : "hover:bg-accent"
                    }`}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </div>
      </SidebarContent>

      <SidebarFooter className="border-t p-3 space-y-2">
        <ThemeToggle className="w-full justify-center" />
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
