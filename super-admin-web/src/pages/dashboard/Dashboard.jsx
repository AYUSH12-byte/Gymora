import { useEffect, useState } from "react";
import {
  Building2,
  CheckCircle2,
  CreditCard,
  Dumbbell,
  RefreshCw,
  Users,
  XCircle,
} from "lucide-react";

import AdminLayout from "../../components/layout/AdminLayout";
import api from "../../services/api";

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/super-admin/dashboard");

      setDashboard(response.data.dashboard);
    } catch (error) {
      console.error("Super admin dashboard error:", error);

      setError(
        error.response?.data?.message || "Unable to load dashboard data",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const stats = dashboard
    ? [
        {
          title: "Total Gyms",
          value: dashboard.gyms.total,
          icon: Building2,
          iconClass: "bg-blue-50 text-blue-600",
        },
        {
          title: "Active Gyms",
          value: dashboard.gyms.active,
          icon: CheckCircle2,
          iconClass: "bg-emerald-50 text-emerald-600",
        },
        {
          title: "Total Members",
          value: dashboard.users.totalMembers,
          icon: Users,
          iconClass: "bg-violet-50 text-violet-600",
        },
        {
          title: "Total Trainers",
          value: dashboard.users.totalTrainers,
          icon: Dumbbell,
          iconClass: "bg-orange-50 text-orange-600",
        },
        {
          title: "Active Subscriptions",
          value: dashboard.subscriptions.active,
          icon: CreditCard,
          iconClass: "bg-cyan-50 text-cyan-600",
        },
        {
          title: "Expired Subscriptions",
          value: dashboard.subscriptions.expired,
          icon: XCircle,
          iconClass: "bg-red-50 text-red-600",
        },
        {
          title: "Pending Payments",
          value: dashboard.subscriptions.pendingPayment,
          icon: RefreshCw,
          iconClass: "bg-amber-50 text-amber-600",
        },
        {
          title: "Total Revenue",
          value: `Rs. ${Number(dashboard.revenue.total || 0).toLocaleString()}`,
          icon: CreditCard,
          iconClass: "bg-green-50 text-green-600",
        },
      ]
    : [];

  return (
    <AdminLayout>
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Dashboard
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Monitor the Gymora platform from one place.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchDashboard}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
            <span>{error}</span>

            <button
              type="button"
              onClick={fetchDashboard}
              className="font-semibold underline"
            >
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white"
              />
            ))}
          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={stat.title}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-500">
                          {stat.title}
                        </p>

                        <p className="mt-3 text-2xl font-bold text-slate-900">
                          {stat.value}
                        </p>
                      </div>

                      <div className={`rounded-xl p-3 ${stat.iconClass}`}>
                        <Icon size={21} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                  <div>
                    <h2 className="font-semibold text-slate-900">
                      Recent Gyms
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Recently registered gyms
                    </p>
                  </div>
                </div>

                {dashboard.recentGyms?.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {dashboard.recentGyms.map((gym) => (
                      <div
                        key={gym._id}
                        className="flex items-center justify-between gap-4 px-5 py-4"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <Building2 size={19} />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-800">
                              {gym.name}
                            </p>

                            <p className="truncate text-xs text-slate-500">
                              {gym.email}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            gym.status === "active"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {gym.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-5 py-10 text-center text-sm text-slate-500">
                    No gyms found.
                  </div>
                )}
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-5 py-4">
                  <h2 className="font-semibold text-slate-900">
                    Recent Subscriptions
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Latest gym subscription activity
                  </p>
                </div>

                {dashboard.recentSubscriptions?.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {dashboard.recentSubscriptions.map((subscription) => (
                      <div
                        key={subscription._id}
                        className="flex items-center justify-between gap-4 px-5 py-4"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {subscription.gym?.name || "Unknown Gym"}
                          </p>

                          <p className="mt-1 truncate text-xs text-slate-500">
                            {subscription.plan?.name || "Unknown Plan"}
                          </p>
                        </div>

                        <div className="shrink-0 text-right">
                          <p className="text-sm font-semibold text-slate-800">
                            Rs.{" "}
                            {Number(subscription.amount || 0).toLocaleString()}
                          </p>

                          <span
                            className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
                              subscription.status === "active"
                                ? "bg-emerald-50 text-emerald-700"
                                : subscription.status === "expired"
                                  ? "bg-red-50 text-red-700"
                                  : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {subscription.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-5 py-10 text-center text-sm text-slate-500">
                    No subscriptions found.
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
