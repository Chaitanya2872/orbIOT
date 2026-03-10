import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Cpu } from "lucide-react";
import { NAV_ITEMS, type AppNavItem } from "../../../app/router/navigation";

interface NavItemProps {
  item: AppNavItem;
  expanded: boolean;
}

function NavItem({ item, expanded }: NavItemProps) {
  const Icon = item.icon;

  return (
    <li className="relative">
      <NavLink
        to={item.path}
        end
        className={({ isActive }) =>
          [
            "group flex items-center gap-3 rounded-2xl px-3 py-3 text-[13px] font-medium",
            "border border-transparent transition-all duration-150 ease-out outline-none",
            "focus-visible:ring-2 focus-visible:ring-sky-500/40",
            isActive
              ? "border-sky-200 bg-sky-50 text-slate-950"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
          ].join(" ")
        }
      >
        {({ isActive }) => (
          <>
            {isActive && (
              <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-sky-500" />
            )}

            <span className="flex-shrink-0 transition-transform duration-150 group-hover:scale-110">
              <Icon
                size={18}
                className={isActive ? "text-sky-600" : "text-slate-400 group-hover:text-slate-700"}
              />
            </span>

            <span
              className={`
                truncate whitespace-nowrap transition-all duration-200
                ${expanded ? "w-auto opacity-100" : "w-0 overflow-hidden opacity-0"}
              `}
            >
              {item.label}
            </span>
          </>
        )}
      </NavLink>
    </li>
  );
}

export default function Sidebar() {
  const [canHover, setCanHover] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const updateHoverSupport = () => {
      setCanHover(mediaQuery.matches);
    };

    updateHoverSupport();
    mediaQuery.addEventListener("change", updateHoverSupport);

    return () => {
      mediaQuery.removeEventListener("change", updateHoverSupport);
    };
  }, []);

  const expanded = !canHover || active;

  return (
    <aside
      className={`
        relative flex h-screen flex-col flex-shrink-0 overflow-hidden border-r border-slate-200 bg-white
        transition-[width] duration-300 ease-in-out
        ${expanded ? "w-[240px]" : "w-[76px]"}
      `}
      aria-label="Primary navigation"
      aria-expanded={expanded}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onFocusCapture={() => setActive(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setActive(false);
        }
      }}
    >
      <div className="flex items-center gap-3 overflow-hidden border-b border-slate-200 px-4 py-5">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-slate-950 shadow-sm">
          <Cpu size={16} className="text-white" />
        </div>
        <div
          className={`overflow-hidden transition-all duration-200 ${expanded ? "w-auto opacity-100" : "w-0 opacity-0"}`}
        >
          <p className="whitespace-nowrap text-[13px] font-bold tracking-wide text-slate-950">
            IoT<span className="text-slate-500">Platform</span>
          </p>
          <p className="whitespace-nowrap text-[10px] uppercase tracking-widest text-slate-500">
            Control Center
          </p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4">
        <ul className="flex flex-col gap-0.5" role="list">
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.id} item={item} expanded={expanded} />
          ))}
        </ul>
      </nav>
    </aside>
  );
}
