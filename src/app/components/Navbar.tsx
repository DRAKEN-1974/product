'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase' // adjust if your path is different
import './Navbar.css'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // Set scroll state
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    // Check user on mount
    const fetchUserAndRole = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
      if (data.user) {
        // Fetch user profile role if logged in
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()
        setRole(profile?.role ?? null)
      } else {
        setRole(null)
      }
      setLoading(false)
    }
    fetchUserAndRole()
    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(async (_, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
        setRole(profile?.role ?? null)
      } else {
        setRole(null)
      }
    })
    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const navItems = [
    { name: 'Our-Services', href: '/service' },
    { name: 'About', href: '/about' },
    { name: 'Shop', href: '/shop' },
    { name: 'Contact', href: '/contact' }
  ]

  // Handle logout
  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setRole(null)
    router.refresh() // Refresh current page to update UI
  }

  // Auth Buttons
  const renderAuthButtons = () => {
    if (loading) return null
    if (user) {
      if (role === 'admin') {
        return (
          <>
            <Link href="/admin">
              <motion.button 
                className="login-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <i className="fas fa-user-shield"></i> Admin
              </motion.button>
            </Link>
            <motion.button
              className="login-button"
              style={{ marginLeft: 8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
            >
              <i className="fas fa-sign-out-alt"></i> Logout
            </motion.button>
          </>
        )
      } else if (role === 'worker') {
        return (
          <>
            <Link href="/worker">
              <motion.button 
                className="login-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <i className="fas fa-user"></i> Worker Dashboard
              </motion.button>
            </Link>
            <motion.button
              className="login-button"
              style={{ marginLeft: 8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
            >
              <i className="fas fa-sign-out-alt"></i> Logout
            </motion.button>
          </>
        )
      } else {
        // Logged in but no role
        return (
          <motion.button
            className="login-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
          >
            <i className="fas fa-sign-out-alt"></i> Logout
          </motion.button>
        )
      }
    } else {
      // Not logged in: show Login button
      return (
        <Link href="/login">
          <motion.button 
            className="login-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className="fas fa-user"></i> Login
          </motion.button>
        </Link>
      )
    }
  }

  return (
    <motion.nav 
      className={`navbar ${isScrolled ? 'scrolled' : ''} ${['/contact', '/shop', '/services'].includes(pathname) ? 'inner-page' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="navbar-container">
        <Link href="/" className="navbar-logo">
          <Image
            src="/satishgaragewhite[1].png"
            alt="Sateesh Garage Logo"
            width={150}
            height={50}
            priority
            className="logo-image"
          />
        </Link>
        <div className="desktop-menu">
          {navItems.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link 
                href={item.href} 
                className={`nav-link ${pathname === item.href ? 'active' : ''}`}
              >
                {item.name}
              </Link>
            </motion.div>
          ))}
          <div className="auth-buttons">
            {renderAuthButtons()}
          </div>
        </div>
      </div>
    </motion.nav>
  )
}