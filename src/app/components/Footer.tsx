'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import './Footer.css'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    services: [
      { name: 'Engine Diagnostics', href: '/services/diagnostics' },
      { name: 'Premium Service', href: '/services/premium' },
      { name: 'Expert Repairs', href: '/services/repairs' },
      { name: 'Custom Modifications', href: '/services/modifications' }
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Our Team', href: '/team' },
      { name: 'Careers', href: '/careers' },
      { name: 'Contact', href: '/contact' }
    ]
  }

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-main">
          <motion.div 
            className="footer-brand"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Link href="/" className="footer-logo">
              SATISH
              <span className="logo-accent">GARAGE</span>
            </Link>
            <p className="footer-description">
              Premium auto service delivering excellence through expert craftsmanship 
              and cutting-edge technology.
            </p>
            <div className="footer-social">
              <Link href="#" className="social-link">Instagram</Link>
              <Link href="#" className="social-link">Facebook</Link>
              <Link href="#" className="social-link">Twitter</Link>
            </div>
          </motion.div>

          <motion.div 
            className="footer-links-grid"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="footer-links-column">
              <h3 className="footer-links-title">Services</h3>
              {footerLinks.services.map((link) => (
                <Link key={link.name} href={link.href} className="footer-link">
                  {link.name}
                </Link>
              ))}
            </div>
            <div className="footer-links-column">
              <h3 className="footer-links-title">Company</h3>
              {footerLinks.company.map((link) => (
                <Link key={link.name} href={link.href} className="footer-link">
                  {link.name}
                </Link>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div 
          className="footer-bottom"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="footer-info">
            <p className="copyright">
              © {currentYear} Satish Garage. All rights reserved.
            </p>
            <div className="footer-bottom-links">
              <Link href="/privacy" className="footer-bottom-link">
                Privacy Policy
              </Link>
              <span className="divider">|</span>
              <Link href="/terms" className="footer-bottom-link">
                Terms of Use
              </Link>
            </div>
          </div>

          <div className="footer-contact">
            <a href="tel:++91 96164 50975" className="contact-link">
              +91 96164 50975
            </a>
            <a href="mailto:info@sateeshgarage.in" className="contact-link">
              info@satishgarage.in
            </a>
          </div>
        </motion.div>
      </div>

      {/* 👇 Skillancer Footer Banner */}
    {/* 👇 Skillancer Footer Badge */}
<div className="skillancer-footer">
  <div className="skillancer-content">
    <img src="/skillancerlogo.avif" alt="Skillancer Logo" className="skillancer-logo" />
    <p className="skillancer-text">
      Developed By: <strong>SKILLANCER PRIVATE LIMITED</strong>
    </p>
  </div>
</div>

    </footer>
  )
}
