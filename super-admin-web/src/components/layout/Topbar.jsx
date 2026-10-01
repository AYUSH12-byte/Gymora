import { Bell, Menu } from "lucide-react";

import { useAuth } from "../../context/AuthContext";

const Topbar = ({ setMobileOpen }) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
        >
          <Menu size={22} />
        </button>

        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Main Administration
          </h2>

          <p className="hidden text-xs text-slate-500 sm:block">
            Manage the Gymora platform
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
        >
          <Bell size={20} />

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />
        </button>

        <div className="hidden h-8 w-px bg-slate-200 sm:block" />

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
            {user?.name?.charAt(0)?.toUpperCase() || "A"}
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-slate-800">
              {user?.name || "Main Admin"}
            </p>

            <p className="text-xs text-slate-500">Super Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
