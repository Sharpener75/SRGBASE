import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

interface DropdownItem {
  label: string
  to: string
}

interface NavItem {
  label: string
  dropdown?: DropdownItem[]
  to?: string
}

const subclassItems: DropdownItem[] = [
  { label: 'miRNA', to: '' },
  { label: 'piRNA', to: '' },
  { label: 'tsRNA', to: '' },
  { label: 'rsRNA', to: '' },
]

const navItems: NavItem[] = [
  {
    label: 'sncRNA Categories',
    dropdown: subclassItems.map(s => ({ label: s.label, to: `/categories/${s.label}` })),
  },
  {
    label: 'Top 50 sncRNAs',
    dropdown: subclassItems.map(s => ({ label: s.label, to: `/top50/${s.label}` })),
  },
  {
    label: 'Differential Expression',
    dropdown: subclassItems.map(s => ({ label: s.label, to: `/diff-expression/${s.label}` })),
  },
  {
    label: 'Target Gene Prediction',
    dropdown: [
      ...subclassItems.flatMap(s => [
        { label: `${s.label} — Promoter`, to: `/targets/${s.label}_promoter` },
        { label: `${s.label} — RNA body`, to: `/targets/${s.label}_RNA_body` },
      ]),
    ],
  },
  { label: 'Raw Data', to: '/raw-data' },
  { label: 'Contact', to: '/contact' },
]

export default function NavBar() {
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  const isActive = (item: NavItem) => {
    if (item.to) return location.pathname === item.to
    return item.dropdown?.some(d => location.pathname.startsWith(d.to.split('/').slice(0, 2).join('/'))) ?? false
  }

  return (
    <nav className="sticky top-0 z-50 bg-primary shadow-md font-body">
      <div className="max-w-screen-xl mx-auto px-4 flex items-center justify-between h-14">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-white hover:opacity-90">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <ellipse cx="14" cy="18" rx="10" ry="7" fill="#1ABC9C" opacity="0.9" />
            <ellipse cx="14" cy="16" rx="7" ry="5" fill="#F8FAFB" opacity="0.15" />
            <circle cx="14" cy="10" r="6" fill="#F8FAFB" opacity="0.95" />
            <path d="M11 10 Q14 7 17 10" stroke="#1B4F72" strokeWidth="1.5" fill="none" />
          </svg>
          <span className="text-lg font-semibold tracking-wide">PingBase</span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-1 text-sm">
          {navItems.map(item => (
            <li key={item.label} className="relative group">
              {item.to ? (
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded transition-colors ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ) : (
                <>
                  <button
                    className={`px-3 py-2 rounded transition-colors flex items-center gap-1 ${
                      isActive(item)
                        ? 'bg-white/20 text-white'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {item.label}
                    <svg className="w-3 h-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute top-full left-0 hidden group-hover:block bg-white shadow-lg rounded-md min-w-[200px] py-1 z-50 border border-gray-100">
                    {item.dropdown?.map(d => (
                      <Link
                        key={d.to}
                        to={d.to}
                        className="block px-4 py-2 text-text-main hover:bg-accent/10 hover:text-primary text-sm"
                      >
                        {d.label}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setMobileOpen(v => !v)}
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-primary border-t border-white/10 px-4 pb-4">
          {navItems.map(item => (
            <div key={item.label}>
              {item.to ? (
                <Link
                  to={item.to}
                  className="block py-2 text-white/80 hover:text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ) : (
                <div>
                  <button
                    className="w-full text-left py-2 text-white/80 hover:text-white flex justify-between"
                    onClick={() => setOpenMenu(openMenu === item.label ? null : item.label)}
                  >
                    {item.label}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openMenu === item.label && (
                    <div className="pl-4 border-l border-white/20 ml-2">
                      {item.dropdown?.map(d => (
                        <Link
                          key={d.to}
                          to={d.to}
                          className="block py-1.5 text-white/70 hover:text-white text-sm"
                          onClick={() => setMobileOpen(false)}
                        >
                          {d.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </nav>
  )
}
