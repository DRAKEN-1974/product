'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import './Navbar.css'
import type { User } from '@supabase/supabase-js'

type Role = string | null

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<Role>(null)
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false) // <-- hamburger state
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const fetchUserAndRole = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
      if (data.user) {
        const { data: profile } = await supabase
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
      listener?.subscription?.unsubscribe()
    }
  }, [])

  const navItems = [
    { name: 'Our-Services', href: '/service' },
    { name: 'About', href: '/about' },
    { name: 'Shop', href: '/shop' },
    { name: 'Contact', href: '/contact' }
  ]

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setRole(null)
    router.refresh()
    setMenuOpen(false)
  }

  const renderAuthButtons = () => {
    if (loading) {
      return (
        <motion.button 
          className="login-button"
          disabled
          style={{ opacity: 0.6, pointerEvents: 'none' }}
        >
          <i className="fas fa-user"></i> Loading...
        </motion.button>
      )
    }
    if (user) {
      if (role === 'admin') {
        return (
          <>
            <Link href="/admin" onClick={() => setMenuOpen(false)}>
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
            <Link href="/worker" onClick={() => setMenuOpen(false)}>
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
      return (
        <Link href="/login" onClick={() => setMenuOpen(false)}>
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
        <Link href="/" className="navbar-logo" onClick={() => setMenuOpen(false)}>
          <Image
            src="/satishgaragewhite[1].png"
            alt="Sateesh Garage Logo"
            width={150}
            height={50}
            priority
            className="logo-image"
          />
        </Link>
        {/* Hamburger icon */}
        <button
          className={`hamburger${menuOpen ? ' open' : ''}`}
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span />
          <span />
          <span />
        </button>
        {/* Desktop menu */}
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
        {/* Mobile menu */}
        <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`nav-link ${pathname === item.href ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          <div className="auth-buttons">
            {renderAuthButtons()}
          </div>
        </div>
      </div>
    </motion.nav>
  )
}
