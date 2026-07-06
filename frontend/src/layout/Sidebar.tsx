import { NavLink } from 'react-router-dom'

interface NavItem {
  to: string
  label: string
  icon: JSX.Element
}

const navItems: NavItem[] = [
  {
    to: '/',
    label: 'Overview',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 12l2-2m0 0l7-7 7 7m-9-2v9a1 1 0 001 1h3m6-9l2 2m-2-2v9a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    ),
  },
  {
    to: '/financial-detail',
    label: 'Financial Detail',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 17V9m3 8V5m3 12v-4m-9 8h12a2 2 0 002-2V5a2 2 0 00-2-2H6a2 2 0 00-2 2v14a2 2 0 002 2z"
      />
    ),
  },
  {
    to: '/audience-views',
    label: 'Audience Views',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-3.13a4 4 0 10-4-4 4 4 0 004 4zm6 0a4 4 0 10-4-4"
      />
    ),
  },
  {
    to: '/events',
    label: 'Events & Governance',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    ),
  },
]

export function Sidebar() {
  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950">
      <div className="px-5 py-6">
        <p className="text-sm font-semibold tracking-wide text-zinc-100">
          <span className="text-brand">SENUS</span> <span className="font-normal text-zinc-500">PLC</span>
        </p>
        <p className="mt-0.5 text-xs text-zinc-500">Board Report</p>
      </div>

      <nav className="flex-1 space-y-0.5 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-zinc-800/80 text-brand'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200',
              ].join(' ')
            }
          >
            <svg
              className="h-4 w-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.75}
            >
              {item.icon}
            </svg>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-zinc-800 px-5 py-4">
        <div className="flex items-center gap-2 text-xs text-zinc-600">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" />
          Live API · localhost:8000
        </div>
      </div>
    </aside>
  )
}
