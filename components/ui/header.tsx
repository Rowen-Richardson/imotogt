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
    // If the action is specifically the onShowAllCars handler, navigate to /results
    if (action === onShowAllCars) {
      router.push("/results")
    } else {
      action()
    }
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
      <nav className="mx-auto max-w-4xl w-[95%] flex items-center justify-between">
        {/* Left Navigation Container */}
        <div className="hidden md:flex items-center bg-black/20 border border-white/50 backdrop-blur-sm rounded-full px-10 h-14">
          <div className="flex items-center justify-evenly w-full gap-8">
            <button
              onClick={() => router.push("/results")} // Directly navigate to /results
              className="text-white hover:text-orange-500 transition-colors font-medium"
            >
              Browse
            </button>
            <button
              onClick={() => handleNavigation(handleSellClick)}
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
                        onClick={() => handleNavigation(item.handler)}
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
                onClick={() => handleNavigation(onLoginClick)}
                className="bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition-colors font-medium"
              >
                Login
              </button>
            )}
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
                    className="rounded-full object-cover"
                    style={{ aspectRatio: "1/1" }}
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
        <div // This is a duplicate mobile menu block
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? "max-h-[calc(100vh-60px)] opacity-100" : "max-h-0 opacity-0"}`}
        >
          <div className="px-6 py-4 space-y-4 border-t border-white/10">
            <button
              onClick={() => handleNavigation(onShowAllCars)}
              className="block w-full text-left text-white hover:text-orange-500 transition-colors font-medium py-2"
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
            <a href="/services" className="block text-white hover:text-orange-500 transition-colors font-medium py-2">
              Services {/* Add Services Link to Mobile Menu */}
            </a>
            <a href="/contact" className="block text-white hover:text-orange-500 transition-colors font-medium py-2">
              Contact
            </a>
          </div>

          {/* Desktop User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {currentUser ? (
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
                    style={{ aspectRatio: "1/1" }}
                  />
                ) : (
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
                <span className="font-medium">
                  {userProfile?.firstName || currentUser?.email?.split("@")[0] || "User"}
                </span>
              </button>
            ) : (
              <button
                onClick={() => handleNavigation(onLoginClick)}
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
