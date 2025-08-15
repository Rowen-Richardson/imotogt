"use client"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Menu, Car, Heart, Settings, LogOut, User, X } from "lucide-react"
import { useUser } from "@/components/UserContext"
import { useMobile } from "@/hooks/use-mobile"
import Image from "next/image"

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
  const [isMenuOpen, setIsMenuOpen] = useState(false)
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

  const handleSignOut = async () => {
    try {
      setShowUserMenu(false)
      setIsMenuOpen(false)
      await contextSignOut()
      onSignOut()
    } catch (error) {
      console.error("Header: Error during sign out:", error)
      onSignOut()
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (!isMobile) {
      setIsMenuOpen(false)
    }
  }, [isMobile])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const handleNavigation = (action: () => void) => {
    action()
    closeMenu()
    setShowUserMenu(false)
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

  const getInitials = (firstName?: string, lastName?: string, email?: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase()
    }
    if (firstName) {
      return firstName.substring(0, 2).toUpperCase()
    }
    if (email) {
      return email.substring(0, 2).toUpperCase()
    }
    return "U"
  }

  const navLinks = [
    { href: "/home", label: "Home", handler: onGoHome },
    { href: "/#featured", label: "All Cars", handler: onShowAllCars },
    { href: "/about", label: "About Us" },
    { href: "/services", label: "Services" },
  ]

  const userMenuItems = [
    { label: "Dashboard", icon: Car, handler: onDashboardClick || (() => router.push("/dashboard")) },
    { label: "Saved Vehicles", icon: Heart, handler: () => router.push("/liked-cars") },
    { label: "Profile Settings", icon: Settings, handler: () => router.push("/settings") },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 p-4">
      <nav
        className={`
          mx-auto max-w-6xl w-[95%] rounded-full transition-all duration-300 ease-in-out
 ${
            transparent && !isScrolled ? "bg-black/20 backdrop-blur-sm" : "bg-black/90 backdrop-blur-md shadow-lg"
          } ${isMobile && isMenuOpen ? '!rounded-none w-full max-w-full' : ''}
        `}
      >
        <div className="flex items-center justify-between px-4 py-2 bg-black text-white rounded-full">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => handleNavigation(onGoHome)}
              className="text-white text-xl font-bold hover:text-orange-500 transition-colors"
            >
              CarMarket
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => handleNavigation(onShowAllCars)}
              className="text-white hover:text-orange-500 transition-colors font-medium"
            >
              Browse Cars
            </button>
            <button
              onClick={() => handleNavigation(onGoToSellPage)}
              className="text-white hover:text-orange-500 transition-colors font-medium"
            >
              Sell Your Car
            </button>
            <a href="/about" className="text-white hover:text-orange-500 transition-colors font-medium">
              About
            </a>
            <a href="/services" className="text-white hover:text-orange-500 transition-colors font-medium">
              Services
            </a>
          </div>

          {/* Desktop User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => {
                setLoginToggle((prev) => !prev)
                if (!loginToggle) {
                  router.push("/dashboard")
                } else {
                  router.push("/home")
                }
              }}
              className="flex items-center space-x-2 text-white hover:text-orange-500 transition-colors font-medium rounded-full px-4 py-2"
              style={{ minWidth: 120 }}
            >
              {userProfile?.profilePic ? (
                <Image
                  src={userProfile.profilePic || "/placeholder.svg"}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="rounded-full object-cover border-2"
                  style={{ aspectRatio: '1/1' }}
                />
              ) : (
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
              <span className="font-medium">
                {userProfile?.firstName || currentUser?.email?.split("@")[0] || "Login"}
              </span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            {currentUser && (
              <div className="flex items-center space-x-2">
                {userProfile?.profilePic ? (
                  <Image
                    src={userProfile.profilePic || "/placeholder.svg"}
                    alt="Profile"
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            )}
            <button
              onClick={toggleMenu}
              className="text-white hover:text-orange-500 transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
 <div
          className={`
            md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-black
            ${isMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"}
 `}
        >
 <div className="px-6 py-4 space-y-4 border-t border-white/10 h-screen flex flex-col">
            <button
              onClick={() => handleNavigation(onShowAllCars)}
              className="block w-full text-left text-white text-lg hover:text-orange-500 transition-colors font-medium py-3"
            >
              Browse Cars
            </button>
            <button
              onClick={() => handleNavigation(onGoToSellPage)}
              className="block w-full text-left text-white text-lg hover:text-orange-500 transition-colors font-medium py-3"
            >
              Sell Your Car
            </button>
            <a href="/about" className="block text-white text-lg hover:text-orange-500 transition-colors font-medium py-3">
              About
            </a>
            <a href="/services" className="block text-white text-lg hover:text-orange-500 transition-colors font-medium py-3">
              Services
            </a>

            {currentUser ? (
              <div className="space-y-2 pt-4 border-t border-white/10">
                <button
                  onClick={() => handleNavigation(onDashboardClick)}
                  className="flex items-center space-x-2 w-full text-left text-white text-lg hover:text-orange-500 transition-colors py-3"
                >
                  <Car className="w-4 h-4" />
                  <span>Dashboard</span>
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 w-full text-left text-red-400 text-lg hover:text-red-300 transition-colors py-3"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-white/10">
                <button
                  onClick={() => handleNavigation(onLoginClick)}
                  className="w-full bg-orange-500 text-white text-lg px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium"
                >
                  Login
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}
