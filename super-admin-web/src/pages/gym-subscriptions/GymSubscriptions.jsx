import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  X,
  XCircle,
} from "lucide-react";

import AdminLayout from "../../components/layout/AdminLayout";
import api from "../../services/api";

const emptyForm = {
  gym: "",
  plan: "",
  startDate: "",
  paymentStatus: "pending",
  transactionId: "",
  notes: "",
};

const GymSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);

  const [gyms, setGyms] = useState([]);
  const [plans, setPlans] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);

  const [showDetails, setShowDetails] = useState(false);

  const [selectedSubscription, setSelectedSubscription] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      const [subscriptionsResponse, gymsResponse, plansResponse] =
        await Promise.all([
          api.get("/super-admin/gym-subscriptions", { params }),
          api.get("/super-admin/gyms", {
            params: {
              status: "active",
            },
          }),
          api.get("/super-admin/subscription-plans", {
            params: {
              status: "active",
            },
          }),
        ]);

      setSubscriptions(subscriptionsResponse.data.subscriptions || []);

      setGyms(gymsResponse.data.gyms || []);

      setPlans(plansResponse.data.plans || []);
    } catch (error) {
      console.error("Fetch subscription data error:", error);

      setError(
        error.response?.data?.message || "Unable to load subscription data",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const filteredSubscriptions = subscriptions.filter((subscription) => {
    const searchText = search.trim().toLowerCase();

    if (!searchText) {
      return true;
    }

    return (
      subscription.gym?.name?.toLowerCase().includes(searchText) ||
      subscription.plan?.name?.toLowerCase().includes(searchText) ||
      subscription.paymentStatus?.toLowerCase().includes(searchText)
    );
  });

  const openCreateModal = () => {
    setForm(emptyForm);
    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (actionLoading) return;

    setShowModal(false);
    setForm(emptyForm);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const getPlanEndDate = () => {
    const selectedPlan = plans.find((plan) => plan._id === form.plan);

    if (!selectedPlan || !form.startDate) {
      return "";
    }

    const date = new Date(`${form.startDate}T00:00:00`);

    if (selectedPlan.durationUnit === "days") {
      date.setDate(date.getDate() + selectedPlan.duration);
    }

    if (selectedPlan.durationUnit === "months") {
      date.setMonth(date.getMonth() + selectedPlan.duration);
    }

    if (selectedPlan.durationUnit === "years") {
      date.setFullYear(date.getFullYear() + selectedPlan.duration);
    }

    return date.toISOString().split("T")[0];
  };

  const handleCreate = async (event) => {
    event.preventDefault();

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      if (!form.gym || !form.plan) {
        setError("Please select a gym and subscription plan.");

        return;
      }

      const payload = {
        gym: form.gym,
        plan: form.plan,
        startDate: form.startDate
          ? new Date(`${form.startDate}T00:00:00`).toISOString()
          : undefined,
        paymentStatus: form.paymentStatus,
        transactionId: form.transactionId.trim(),
        notes: form.notes.trim(),
      };

      await api.post("/super-admin/gym-subscriptions", payload);

      setSuccess("Gym subscription assigned successfully.");

      closeModal();
      await fetchData();
    } catch (error) {
      console.error("Create gym subscription error:", error);

      setError(
        error.response?.data?.message || "Unable to create gym subscription",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const openDetails = (subscription) => {
    setSelectedSubscription(subscription);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedSubscription(null);
  };

  const handleRenew = async (subscription) => {
    const confirmed = window.confirm(
      `Renew the subscription for "${subscription.gym?.name}"?`,
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      await api.post(
        `/super-admin/gym-subscriptions/${subscription._id}/renew`,
      );

      setSuccess("Gym subscription renewed successfully.");

      await fetchData();
    } catch (error) {
      console.error("Renew subscription error:", error);

      setError(error.response?.data?.message || "Unable to renew subscription");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (subscription, newStatus) => {
    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      await api.patch(
        `/super-admin/gym-subscriptions/${subscription._id}/status`,
        {
          status: newStatus,
        },
      );

      setSuccess(`Subscription ${newStatus} successfully.`);

      await fetchData();
    } catch (error) {
      console.error("Update subscription status error:", error);

      setError(
        error.response?.data?.message || "Unable to update subscription status",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handlePaymentStatusChange = async (subscription, newStatus) => {
    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      await api.patch(
        `/super-admin/gym-subscriptions/${subscription._id}/payment-status`,
        {
          paymentStatus: newStatus,
        },
      );

      setSuccess("Payment status updated successfully.");

      await fetchData();
    } catch (error) {
      console.error("Update payment status error:", error);

      setError(
        error.response?.data?.message || "Unable to update payment status",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getDaysRemaining = (endDate) => {
    if (!endDate) return 0;

    const difference = new Date(endDate).getTime() - new Date().getTime();

    return Math.max(Math.ceil(difference / (1000 * 60 * 60 * 24)), 0);
  };

  return (
    <AdminLayout>
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Gym Subscriptions
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage Gymora subscriptions assigned to gyms.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus size={18} />
            Assign Subscription
          </button>
        </div>

        {success && (
          <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {success}
          </div>
        )}

        {error && !showModal && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by gym, plan or payment status..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">All Status</option>

              <option value="active">Active</option>

              <option value="expired">Expired</option>

              <option value="cancelled">Cancelled</option>

              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-80 items-center justify-center">
              <Loader2 size={30} className="animate-spin text-blue-600" />
            </div>
          ) : filteredSubscriptions.length === 0 ? (
            <div className="flex min-h-80 flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 rounded-2xl bg-slate-100 p-4 text-slate-400">
                <CreditCard size={30} />
              </div>

              <h3 className="font-semibold text-slate-800">
                No subscriptions found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Assign a subscription plan to a gym to get started.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-left">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Gym
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Plan
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Period
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Amount
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Payment
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredSubscriptions.map((subscription) => {
                    const daysRemaining = getDaysRemaining(
                      subscription.endDate,
                    );

                    return (
                      <tr
                        key={subscription._id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-800">
                            {subscription.gym?.name || "Unknown Gym"}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {subscription.gym?.email || "—"}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-medium text-slate-700">
                            {subscription.plan?.name || "Unknown Plan"}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {subscription.plan?.duration || "—"}{" "}
                            {subscription.plan?.durationUnit || ""}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <CalendarDays
                              size={16}
                              className="text-slate-400"
                            />

                            <div>
                              <p className="text-sm text-slate-700">
                                {formatDate(subscription.startDate)}
                              </p>

                              <p className="text-xs text-slate-500">
                                to {formatDate(subscription.endDate)}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-800">
                            Rs.{" "}
                            {Number(subscription.amount || 0).toLocaleString()}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <select
                            value={subscription.paymentStatus}
                            onChange={(event) =>
                              handlePaymentStatusChange(
                                subscription,
                                event.target.value,
                              )
                            }
                            disabled={actionLoading}
                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium outline-none focus:border-blue-500"
                          >
                            <option value="pending">Pending</option>

                            <option value="paid">Paid</option>

                            <option value="failed">Failed</option>
                          </select>
                        </td>

                        <td className="px-5 py-4">
                          <div>
                            {subscription.status === "active" ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                <CheckCircle2 size={13} />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                                <XCircle size={13} />
                                {subscription.status}
                              </span>
                            )}

                            {subscription.status === "active" &&
                              daysRemaining <= 30 && (
                                <p className="mt-1 text-xs text-amber-600">
                                  {daysRemaining} days remaining
                                </p>
                              )}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openDetails(subscription)}
                              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                              Details
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRenew(subscription)}
                              disabled={actionLoading}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-50 disabled:opacity-50"
                            >
                              <RefreshCw size={14} />
                              Renew
                            </button>

                            {subscription.status === "active" ? (
                              <button
                                type="button"
                                onClick={() =>
                                  handleStatusChange(subscription, "suspended")
                                }
                                disabled={actionLoading}
                                className="rounded-lg border border-amber-200 px-3 py-2 text-xs font-semibold text-amber-600 transition hover:bg-amber-50 disabled:opacity-50"
                              >
                                Suspend
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  handleStatusChange(subscription, "active")
                                }
                                disabled={actionLoading}
                                className="rounded-lg border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-50 disabled:opacity-50"
                              >
                                Activate
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Assign Subscription
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Assign an active Gymora plan to a gym.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-5 p-6">
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Gym
                </label>

                <select
                  name="gym"
                  value={form.gym}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select a gym</option>

                  {gyms.map((gym) => (
                    <option key={gym._id} value={gym._id}>
                      {gym.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Subscription Plan
                </label>

                <select
                  name="plan"
                  value={form.plan}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select a plan</option>

                  {plans.map((plan) => (
                    <option key={plan._id} value={plan._id}>
                      {plan.name} — Rs.{" "}
                      {Number(plan.price || 0).toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Start Date
                </label>

                <input
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {form.plan && form.startDate && (
                <div className="rounded-xl bg-blue-50 p-4">
                  <p className="text-xs font-medium text-blue-600">
                    Estimated End Date
                  </p>

                  <p className="mt-1 font-semibold text-blue-900">
                    {getPlanEndDate()
                      ? new Date(
                          `${getPlanEndDate()}T00:00:00`,
                        ).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </p>
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Payment Status
                </label>

                <select
                  name="paymentStatus"
                  value={form.paymentStatus}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="pending">Pending</option>

                  <option value="paid">Paid</option>

                  <option value="failed">Failed</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Transaction ID
                </label>

                <input
                  type="text"
                  name="transactionId"
                  value={form.transactionId}
                  onChange={handleChange}
                  placeholder="Optional"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Notes
                </label>

                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Optional subscription notes..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={actionLoading}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {actionLoading && (
                    <Loader2 size={16} className="animate-spin" />
                  )}
                  Assign Subscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetails && selectedSubscription && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Subscription Details
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Complete subscription information.
                </p>
              </div>

              <button
                type="button"
                onClick={closeDetails}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Gym
                </p>

                <h3 className="mt-1 text-lg font-bold text-slate-900">
                  {selectedSubscription.gym?.name || "Unknown Gym"}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedSubscription.gym?.email || "—"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs text-slate-500">Plan</p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {selectedSubscription.plan?.name || "Unknown"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs text-slate-500">Amount</p>

                  <p className="mt-1 font-semibold text-slate-800">
                    Rs.{" "}
                    {Number(selectedSubscription.amount || 0).toLocaleString()}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs text-slate-500">Start Date</p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {formatDate(selectedSubscription.startDate)}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs text-slate-500">End Date</p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {formatDate(selectedSubscription.endDate)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                <div>
                  <p className="text-xs text-slate-500">Payment Status</p>

                  <p className="mt-1 font-semibold capitalize text-slate-800">
                    {selectedSubscription.paymentStatus}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Subscription Status</p>

                  <p className="mt-1 font-semibold capitalize text-slate-800">
                    {selectedSubscription.status}
                  </p>
                </div>
              </div>

              {selectedSubscription.transactionId && (
                <div>
                  <p className="text-xs text-slate-500">Transaction ID</p>

                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {selectedSubscription.transactionId}
                  </p>
                </div>
              )}

              {selectedSubscription.notes && (
                <div>
                  <p className="text-xs text-slate-500">Notes</p>

                  <p className="mt-1 text-sm text-slate-700">
                    {selectedSubscription.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default GymSubscriptions;
