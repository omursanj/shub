import {
  BarChart3,
  CirclePlus,
  House,
  Menu,
  ReceiptText,
} from 'lucide-react'
import { NavLink } from 'react-router'

export function MobileNavigation() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-5 items-end">
        <NavItem
          to="/"
          label="Home"
          icon={House}
          end
        />

        <NavItem
          to="/transactions"
          label="Transactions"
          icon={ReceiptText}
        />

        <NavLink
          to="/transactions"
          aria-label="Add transaction"
          className="flex flex-col items-center justify-center"
        >
          <div className="-mt-7 flex size-14 items-center justify-center rounded-full bg-slate-950 text-white shadow-lg transition-transform active:scale-95">
            <CirclePlus size={27} />
          </div>

          <span className="mt-1 text-[11px] font-medium text-slate-700">
            Add
          </span>
        </NavLink>

        <NavItem
          to="/analytics"
          label="Analytics"
          icon={BarChart3}
        />

        <NavItem
          to="/settings"
          label="More"
          icon={Menu}
        />
      </div>
    </nav>
  )
}

type NavItemProps = {
  to: string
  label: string
  icon: typeof House
  end?: boolean
}

function NavItem({
  to,
  label,
  icon: Icon,
  end,
}: NavItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          'flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-[11px] font-medium transition-colors',
          isActive
            ? 'text-slate-950'
            : 'text-slate-400',
        ].join(' ')
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            size={21}
            strokeWidth={isActive ? 2.5 : 2}
          />

          <span>{label}</span>
        </>
      )}
    </NavLink>
  )
}