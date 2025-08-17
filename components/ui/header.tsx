"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Menu, Car, Heart, Settings, LogOut, User, X } from "lucide-react"
import { useUser } from "@/components/UserContext"
import { useMobile } from "@/hooks/use-mobile"
import Image from "next/image"

const FluidGlass = ({ mode, lensProps }: { mode: string; lensProps: any }) => (
  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-sm" />
)

interface HeaderProps {
  user: any
  onLoginClick: () => void
  onDashboardClick: () => void
  onGoHome: () => void
  onShowAllCars: () => void
  onGoToSellPage: () => void
  onSignOut: () => void
  transparent?: boolean
}

export function Header({
  user,
  onLoginClick,
  onDashboardClick,
  onGoHome,
  onShowAllCars,
  onGoToSellPage,
  onSignOut,
  transparent = true,
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [loginToggle, setLoginToggle] = useState(false)
  const router = useRouter()
  const { user: authUser, userProfile, signOut: contextSignOut } = useUser()
  const isMobile = useMobile()

  const isLoggedIn = !!authUser
  const isVerified = !!authUser?.email_confirmed_at
  const profile = userProfile || user
  const currentUser = user || authUser

  const navItems = [
    { name: "Browse", key: "browse" },
    { name: "Sell", key: "sell" },
    { name: "About", key: "about" },
  ]

  const rightNavItems = [
    { name: "Services", key: "services" },
    { name: "Contact", key: "contact" },
  ]

  const handleSignOut = async () => {
    try {
      setShowUserMenu(false)
      setIsMobileMenuOpen(false)
      await contextSignOut()
      onSignOut()
    } catch (error) {
      console.error("Header: Error during sign out:", error)
      onSignOut()
    }
  }

  const handleNavigation = (action: () => void, key: string) => {
    setIsMobileMenuOpen(false)
    setShowUserMenu(false)

    switch (key) {
      case "browse":
        router.push("/results")
        break
      case "sell":
        handleSellClick()
        break
      case "about":
        router.push("/about")
        break
      case "services":
        router.push("/services")
        break
      case "contact":
        router.push("/contact")
        break
      case "home":
        onGoHome()
        break
      case "login":
        onLoginClick()
        break
      case "dashboard":
        onDashboardClick()
        break
      default:
        action()
    }
  }

  const handleSellClick = () => {
    if (onGoToSellPage) {
      onGoToSellPage()
    } else {
      if (isLoggedIn) {
        router.push("/upload-vehicle")
      } else {
        router.push("/login?next=/upload-vehicle")
      }
    }
  }

  const userMenuItems = [
    { label: "Dashboard", icon: Car, handler: onDashboardClick || (() => router.push("/dashboard")) },
    { label: "Saved Vehicles", icon: Heart, handler: () => router.push("/liked-cars") },
    { label: "Profile Settings", icon: Settings, handler: () => router.push("/settings") },
  ]

  if (isMobile) {
    return (
      <>
        {/* Mobile Header */}
        <header className="fixed top-2 left-1/2 transform -translate-x-1/2 z-50">
          <div className="relative w-[320px] h-[50px] bg-black/20 border border-white/50 backdrop-blur-sm rounded-full">
            <div className="relative flex items-center justify-between w-full h-full px-6">
              <div className="flex-1 flex justify-center">
                <Image
                  src="/Imoto new header.png"
                  alt="CarMarket Logo"
                  width={320}
                  height={320}
                  className="object-contain"
                  style={{ filter: "none" }}
                  priority
                />
              </div>

              <div className="flex items-center space-x-2">
                <button onClick={() => setIsMobileMenuOpen(true)} className="text-black hover:text-gray-700 p-1">
                  <Menu size={20} />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[100]">
            <div className="absolute inset-0 -z-10">
              <FluidGlass
                mode="lens"
                lensProps={{
                  scale: 1.2,
                  ior: 1.1,
                  thickness: 3,
                  chromaticAberration: 0.05,
                  anisotropy: 0.01,
                }}
              />
            </div>
            <div className="relative bg-black/80 backdrop-blur-md h-full">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-white/10">
                  <Image
                    src="/Imoto new header.png"
                    alt="CarMarket Logo"
                    width={160}
                    height={64}
                    className="object-contain"
                    style={{ filter: "none" }}
                    priority
                  />
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-white hover:bg-white/10 rounded-full p-2"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Menu Items */}
                <div className="flex-1 flex flex-col justify-center items-center space-y-8">
                  {[...navItems, ...rightNavItems].map((item) => (
                    <button
                      key={item.name}
                      onClick={() => handleNavigation(() => {}, item.key)}
                      className="text-white text-2xl font-medium hover:text-orange-500 transition-colors"
                    >
                      {item.name}
                    </button>
                  ))}

                  {isLoggedIn ? (
                    <div className="pt-4 space-y-4 text-center">
                      <button
                        onClick={() => handleNavigation(onDashboardClick, "dashboard")}
                        className="flex items-center space-x-2 text-white text-xl hover:text-orange-500 transition-colors"
                      >
                        <Car className="w-5 h-5" />
                        <span>Dashboard</span>
                      </button>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center space-x-2 text-red-400 text-xl hover:text-red-300 transition-colors"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  ) : (
                    <div className="pt-4">
                      <button
                        className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full text-lg"
                        onClick={() => handleNavigation(onLoginClick, "login")}
                      >
                        Login
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 p-4">
      <nav className="mx-auto max-w-4xl w-[95%] flex items-center justify-between">
        {/* Left Navigation Container */}
        <div className="hidden md:flex items-center bg-black/20 border border-white/50 backdrop-blur-sm rounded-full px-10 h-14">
          <div className="flex items-center justify-evenly w-full gap-8">
            <button
              onClick={() => router.push("/results")}
              className="text-white hover:text-orange-500 transition-colors font-medium"
            >
              Browse
            </button>
            <button
              onClick={handleSellClick}
              className="text-white hover:text-orange-500 transition-colors font-medium"
            >
              Sell
            </button>
            <a href="/about" className="text-white hover:text-orange-500 transition-colors font-medium">
              About
            </a>
          </div>
        </div>

        {/* Logo - Centered */}
        <div className="flex items-center justify-center flex-grow">
          <div className="flex items-center">
            <Image src="/Imoto new header.png" alt="CarMarket Logo" width={350} height={350} />
          </div>
        </div>

        {/* Right Navigation & User Actions Container */}
        <div className="hidden md:flex items-center bg-black/20 border border-white/50 backdrop-blur-sm rounded-l-[100px] rounded-r-[100px] px-8 h-14">
          <div className="flex items-center justify-evenly w-full gap-6">
            <a href="/services" className="text-white hover:text-orange-500 transition-colors font-medium">
              Services
            </a>
            <a href="/contact" className="text-white hover:text-orange-500 transition-colors font-medium">
              Contact
            </a>
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 text-white hover:text-orange-500 transition-colors font-medium rounded-full px-2 py-1"
                >
                  {userProfile?.profilePic ? (
                    <Image
                      src={userProfile.profilePic || "/placeholder.svg"}
                      alt="Profile"
                      width={32}
                      height={32}
                      className="rounded-full object-cover"
                      style={{ aspectRatio: "1/1" }}
                    />
                  ) : (
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <span className="hidden lg:inline">
                    {userProfile?.firstName || currentUser?.email?.split("@")[0] || "User"}
                  </span>
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    {userMenuItems.map((item) => (
                      <button
                        key={item.label}
                        onClick={() => {
                          setShowUserMenu(false)
                          item.handler()
                        }}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.label}
                      </button>
                    ))}
                    <button
                      onClick={handleSignOut}
                      className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition-colors font-medium"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}
