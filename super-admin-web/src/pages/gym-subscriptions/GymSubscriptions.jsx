import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  CreditCard,
  Edit3,
  Eye,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  X,
} from "lucide-react";

import api from "../../services/api";
import AdminLayout from "../../components/layout/AdminLayout";

const initialForm = {
  gymId: "",
  planId: "",
  startDate: "",
  paymentStatus: "pending",
  transactionId: "",
  notes: "",
};

const getTodayDate = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const calculateEndDate = (startDate, duration, durationUnit) => {
  if (!startDate || !duration) {
    return "";
  }

  const date = new Date(`${startDate}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  if (durationUnit === "days") {
    date.setDate(date.getDate() + Number(duration));
  }

  if (durationUnit === "months") {
    date.setMonth(date.getMonth() + Number(duration));
  }

  if (durationUnit === "years") {
    date.setFullYear(date.getFullYear() + Number(duration));
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatDate = (date) => {
  if (!date) {
    return "-";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getDaysRemaining = (endDate) => {
  if (!endDate) {
    return 0;
  }

  const end = new Date(endDate);
  const now = new Date();

  const difference = end.getTime() - now.getTime();

  return Math.ceil(difference / (1000 * 60 * 60 * 24));
};

const GymSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);

  const [gyms, setGyms] = useState([]);
  const [plans, setPlans] = useState([]);

  const [loading, setLoading] = useState(true);
  const [gymsLoading, setGymsLoading] = useState(true);
  const [plansLoading, setPlansLoading] = useState(true);

  const [actionLoading, setActionLoading] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [paymentFilter, setPaymentFilter] = useState("all");

  const [showAssignModal, setShowAssignModal] = useState(false);

  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [showActionModal, setShowActionModal] = useState(false);

  const [editingSubscription, setEditingSubscription] = useState(null);

  const [selectedSubscription, setSelectedSubscription] = useState(null);

  const [selectedAction, setSelectedAction] = useState("");

  const [form, setForm] = useState({
    ...initialForm,
    startDate: getTodayDate(),
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (search.trim()) {
        params.search = search.trim();
      }

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      if (paymentFilter !== "all") {
        params.paymentStatus = paymentFilter;
      }

      const response = await api.get("/super-admin/gym-subscriptions", {
        params,
      });

      setSubscriptions(response.data.subscriptions || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load subscriptions.");
    } finally {
      setLoading(false);
    }
  };

  const loadGyms = async () => {
    try {
      setGymsLoading(true);

      const response = await api.get("/super-admin/gyms");

      setGyms(response.data.gyms || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load gyms.");
    } finally {
      setGymsLoading(false);
    }
  };

  const loadPlans = async () => {
    try {
      setPlansLoading(true);

      const response = await api.get("/super-admin/subscription-plans", {
        params: {
          status: "active",
        },
      });

      setPlans(response.data.plans || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load subscription plans.",
      );
    } finally {
      setPlansLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadSubscriptions();
    }, 250);

    return () => clearTimeout(timer);
  }, [search, statusFilter, paymentFilter]);

  useEffect(() => {
    loadGyms();
    loadPlans();
  }, []);

  useEffect(() => {
    if (!success) {
      return;
    }

    const timer = setTimeout(() => {
      setSuccess("");
    }, 4000);

    return () => clearTimeout(timer);
  }, [success]);

  const availableGyms = useMemo(() => {
    return gyms.filter((gym) => gym.status === "active" && !gym.isDeleted);
  }, [gyms]);

  const availablePlans = useMemo(() => {
    return plans.filter((plan) => plan.status === "active");
  }, [plans]);

  const selectedPlan = useMemo(() => {
    return plans.find((plan) => plan._id === form.planId);
  }, [plans, form.planId]);

  const estimatedEndDate = useMemo(() => {
    if (!selectedPlan) {
      return "";
    }

    return calculateEndDate(
      form.startDate,
      selectedPlan.duration,
      selectedPlan.durationUnit,
    );
  }, [form.startDate, selectedPlan]);

  const filteredSubscriptions = useMemo(() => {
    return subscriptions;
  }, [subscriptions]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm({
      ...initialForm,
      startDate: getTodayDate(),
    });

    setEditingSubscription(null);
  };

  const openAssignModal = () => {
    resetForm();
    setError("");
    setShowAssignModal(true);
  };

  const closeAssignModal = () => {
    if (actionLoading === "assign") {
      return;
    }

    setShowAssignModal(false);
    resetForm();
  };

  const openDetailsModal = (subscription) => {
    setSelectedSubscription(subscription);
    setError("");
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    if (actionLoading) {
      return;
    }

    setShowDetailsModal(false);
    setSelectedSubscription(null);
  };

  const openActionModal = (subscription, action) => {
    setSelectedSubscription(subscription);
    setSelectedAction(action);
    setError("");
    setShowActionModal(true);
  };

  const closeActionModal = () => {
    if (actionLoading) {
      return;
    }

    setShowActionModal(false);
    setSelectedSubscription(null);
    setSelectedAction("");
  };

  const handleAssignSubscription = async (event) => {
    event.preventDefault();

    if (!form.gymId || !form.planId || !form.startDate) {
      setError("Gym, subscription plan and start date are required.");
      return;
    }

    const gym = gyms.find((item) => item._id === form.gymId);

    if (!gym) {
      setError("Selected gym was not found.");
      return;
    }

    if (gym.status !== "active" || gym.isDeleted) {
      setError("A subscription can only be assigned to an active gym.");
      return;
    }

    const plan = plans.find((item) => item._id === form.planId);

    if (!plan) {
      setError("Selected subscription plan was not found.");
      return;
    }

    if (plan.status !== "active") {
      setError("An inactive subscription plan cannot be assigned.");
      return;
    }

    try {
      setActionLoading("assign");
      setError("");
      setSuccess("");

      const response = await api.post("/super-admin/gym-subscriptions", {
        gymId: form.gymId,
        planId: form.planId,
        startDate: form.startDate,
        paymentStatus: form.paymentStatus,
        transactionId: form.transactionId.trim(),
        notes: form.notes.trim(),
      });

      setSuccess(
        response.data.message || "Subscription assigned successfully.",
      );

      closeAssignModal();

      await loadSubscriptions();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign subscription.");
    } finally {
      setActionLoading("");
    }
  };

  const handleSubscriptionAction = async () => {
    if (!selectedSubscription?._id || !selectedAction) {
      return;
    }

    const subscriptionId = selectedSubscription._id;

    try {
      setActionLoading(selectedAction);
      setError("");
      setSuccess("");

      let response;

      if (selectedAction === "renew") {
        response = await api.post(
          `/super-admin/gym-subscriptions/${subscriptionId}/renew`,
        );
      }

      if (selectedAction === "suspend") {
        response = await api.patch(
          `/super-admin/gym-subscriptions/${subscriptionId}/status`,
          {
            status: "suspended",
          },
        );
      }

      if (selectedAction === "activate") {
        response = await api.patch(
          `/super-admin/gym-subscriptions/${subscriptionId}/status`,
          {
            status: "active",
          },
        );
      }

      setSuccess(
        response?.data?.message ||
          "Subscription action completed successfully.",
      );

      closeActionModal();

      await loadSubscriptions();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update subscription.");
    } finally {
      setActionLoading("");
    }
  };

  const handlePaymentStatusChange = async (subscription, paymentStatus) => {
    if (!subscription?._id) {
      return;
    }

    const loadingKey = `payment-${subscription._id}`;

    try {
      setActionLoading(loadingKey);
      setError("");
      setSuccess("");

      const response = await api.patch(
        `/super-admin/gym-subscriptions/${subscription._id}/payment-status`,
        {
          paymentStatus,
        },
      );

      setSuccess(
        response.data.message || "Payment status updated successfully.",
      );

      await loadSubscriptions();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update payment status.",
      );
    } finally {
      setActionLoading("");
    }
  };

  const getStatusClasses = (status) => {
    if (status === "active") {
      return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
    }

    if (status === "expired") {
      return "bg-red-50 text-red-700 ring-red-600/20";
    }

    if (status === "suspended") {
      return "bg-amber-50 text-amber-700 ring-amber-600/20";
    }

    if (status === "cancelled") {
      return "bg-slate-100 text-slate-600 ring-slate-500/20";
    }

    return "bg-slate-100 text-slate-600 ring-slate-500/20";
  };

  const getPaymentClasses = (paymentStatus) => {
    if (paymentStatus === "paid") {
      return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
    }

    if (paymentStatus === "failed") {
      return "bg-red-50 text-red-700 ring-red-600/20";
    }

    return "bg-amber-50 text-amber-700 ring-amber-600/20";
  };

  const getActionTitle = () => {
    if (selectedAction === "renew") {
      return "Renew Subscription?";
    }

    if (selectedAction === "suspend") {
      return "Suspend Subscription?";
    }

    if (selectedAction === "activate") {
      return "Activate Subscription?";
    }

    return "Confirm Action";
  };

  const getActionDescription = () => {
    if (!selectedSubscription) {
      return "";
    }

    const gymName = selectedSubscription.gym?.name || "this gym";

    const planName = selectedSubscription.plan?.name || "this plan";

    if (selectedAction === "renew") {
      return (
        <>
          This will renew the Gymora subscription for{" "}
          <span className="font-semibold text-slate-700">{gymName}</span> using
          the <span className="font-semibold text-slate-700">{planName}</span>{" "}
          plan. The current subscription will be cancelled and a new
          subscription will be created.
        </>
      );
    }

    if (selectedAction === "suspend") {
      return (
        <>
          This will suspend the current Gymora subscription for{" "}
          <span className="font-semibold text-slate-700">{gymName}</span>. The
          gym's access will be blocked until the subscription is activated
          again.
        </>
      );
    }

    if (selectedAction === "activate") {
      return (
        <>
          This will activate the subscription for{" "}
          <span className="font-semibold text-slate-700">{gymName}</span>. Gym
          access will also depend on the gym itself being active and the
          subscription dates being valid.
        </>
      );
    }

    return "Please confirm this action.";
  };

  const getActionButtonText = () => {
    if (selectedAction === "renew") {
      return "Renew Subscription";
    }

    if (selectedAction === "suspend") {
      return "Suspend Subscription";
    }

    if (selectedAction === "activate") {
      return "Activate Subscription";
    }

    return "Confirm";
  };

  const getActionButtonClasses = () => {
    if (selectedAction === "suspend") {
      return "bg-amber-600 hover:bg-amber-700";
    }

    if (selectedAction === "renew") {
      return "bg-slate-900 hover:bg-slate-800";
    }

    return "bg-emerald-600 hover:bg-emerald-700";
  };

  return (
    <AdminLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
              <CreditCard size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Gym Subscriptions
              </h1>

              <p className="text-sm text-slate-500">
                Manage Gymora subscriptions for all registered gyms.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openAssignModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            <Plus size={18} />
            Assign Subscription
          </button>
        </div>

        {success && (
          <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <CheckCircle2 size={19} className="mt-0.5 shrink-0" />

            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <div className="flex items-start gap-3">
              <AlertCircle size={19} className="mt-0.5 shrink-0" />

              <span>{error}</span>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="text-red-600 transition hover:text-red-800"
            >
              <X size={17} />
            </button>
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">
                Subscription Records
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {filteredSubscriptions.length} record
                {filteredSubscriptions.length !== 1 ? "s" : ""} shown
              </p>
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
              <div className="relative w-full md:w-64">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search gym or plan..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              >
                <option value="all">All Status</option>

                <option value="active">Active</option>

                <option value="expired">Expired</option>

                <option value="suspended">Suspended</option>

                <option value="cancelled">Cancelled</option>
              </select>

              <select
                value={paymentFilter}
                onChange={(event) => setPaymentFilter(event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              >
                <option value="all">All Payments</option>

                <option value="paid">Paid</option>

                <option value="pending">Pending</option>

                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[1100px] divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Gym
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Plan
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Period
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Amount
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Payment
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>

                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-14 text-center">
                      <div className="flex flex-col items-center gap-3 text-slate-500">
                        <Loader2 size={24} className="animate-spin" />

                        <span className="text-sm">
                          Loading subscriptions...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : filteredSubscriptions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-14 text-center">
                      <div className="mx-auto flex max-w-sm flex-col items-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                          <CreditCard size={22} />
                        </div>

                        <h3 className="mt-4 font-semibold text-slate-900">
                          No subscriptions found
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          Try changing your filters or assign a subscription to
                          a gym.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredSubscriptions.map((subscription) => {
                    const daysRemaining = getDaysRemaining(
                      subscription.endDate,
                    );

                    return (
                      <tr
                        key={subscription._id}
                        className="transition hover:bg-slate-50/70"
                      >
                        <td className="whitespace-nowrap px-6 py-4">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {subscription.gym?.name || "Unknown Gym"}
                            </p>

                            <p className="text-xs text-slate-500">
                              {subscription.gym?.email || "-"}
                            </p>
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-slate-800">
                              {subscription.plan?.name || "Unknown Plan"}
                            </p>

                            <p className="text-xs text-slate-500">
                              {subscription.plan?.duration
                                ? `${subscription.plan.duration} ${subscription.plan.durationUnit}`
                                : "-"}
                            </p>
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center gap-2">
                            <CalendarDays
                              size={15}
                              className="text-slate-400"
                            />

                            <div>
                              <p className="text-xs text-slate-500">
                                {formatDate(subscription.startDate)}
                              </p>

                              <p className="text-sm font-medium text-slate-800">
                                {formatDate(subscription.endDate)}
                              </p>
                            </div>
                          </div>

                          {subscription.status === "active" && (
                            <p
                              className={`mt-1 text-xs ${
                                daysRemaining <= 7
                                  ? "font-semibold text-red-600"
                                  : "text-slate-500"
                              }`}
                            >
                              {daysRemaining > 0
                                ? `${daysRemaining} days remaining`
                                : "Expired"}
                            </p>
                          )}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4">
                          <span className="text-sm font-semibold text-slate-900">
                            NPR{" "}
                            {Number(subscription.amount || 0).toLocaleString()}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center gap-2">
                            <select
                              value={subscription.paymentStatus || "pending"}
                              onChange={(event) =>
                                handlePaymentStatusChange(
                                  subscription,
                                  event.target.value,
                                )
                              }
                              disabled={
                                actionLoading === `payment-${subscription._id}`
                              }
                              className={`rounded-lg border-0 px-2.5 py-1.5 text-xs font-semibold ring-1 ring-inset outline-none ${getPaymentClasses(
                                subscription.paymentStatus,
                              )}`}
                            >
                              <option value="pending">Pending</option>

                              <option value="paid">Paid</option>

                              <option value="failed">Failed</option>
                            </select>

                            {actionLoading ===
                              `payment-${subscription._id}` && (
                              <Loader2
                                size={14}
                                className="animate-spin text-slate-400"
                              />
                            )}
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${getStatusClasses(
                              subscription.status,
                            )}`}
                          >
                            {subscription.status}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openDetailsModal(subscription)}
                              disabled={Boolean(actionLoading)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Eye size={15} />
                              View
                            </button>

                            {subscription.status === "active" && (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    openActionModal(subscription, "renew")
                                  }
                                  disabled={Boolean(actionLoading)}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  <RefreshCw size={15} />
                                  Renew
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    openActionModal(subscription, "suspend")
                                  }
                                  disabled={Boolean(actionLoading)}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  <ShieldAlert size={15} />
                                  Suspend
                                </button>
                              </>
                            )}

                            {subscription.status === "suspended" && (
                              <button
                                type="button"
                                onClick={() =>
                                  openActionModal(subscription, "activate")
                                }
                                disabled={Boolean(actionLoading)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <CheckCircle2 size={15} />
                                Activate
                              </button>
                            )}

                            {subscription.status === "expired" && (
                              <button
                                type="button"
                                onClick={() =>
                                  openActionModal(subscription, "renew")
                                }
                                disabled={Boolean(actionLoading)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <RefreshCw size={15} />
                                Renew
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Assign Subscription
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Assign an active Gymora plan to a gym.
                </p>
              </div>

              <button
                type="button"
                onClick={closeAssignModal}
                disabled={actionLoading === "assign"}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAssignSubscription} className="space-y-5 p-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Gym
                  </label>

                  <select
                    name="gymId"
                    value={form.gymId}
                    onChange={handleFormChange}
                    disabled={gymsLoading}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-50"
                  >
                    <option value="">
                      {gymsLoading ? "Loading gyms..." : "Select an active gym"}
                    </option>

                    {availableGyms.map((gym) => (
                      <option key={gym._id} value={gym._id}>
                        {gym.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Subscription Plan
                  </label>

                  <select
                    name="planId"
                    value={form.planId}
                    onChange={handleFormChange}
                    disabled={plansLoading}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-50"
                  >
                    <option value="">
                      {plansLoading
                        ? "Loading plans..."
                        : "Select an active plan"}
                    </option>

                    {availablePlans.map((plan) => (
                      <option key={plan._id} value={plan._id}>
                        {plan.name} — NPR{" "}
                        {Number(plan.price || 0).toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Start Date
                  </label>

                  <input
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleFormChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Estimated End Date
                  </label>

                  <div className="flex min-h-[42px] items-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-600">
                    {estimatedEndDate
                      ? formatDate(estimatedEndDate)
                      : "Select a plan and start date"}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Payment Status
                  </label>

                  <select
                    name="paymentStatus"
                    value={form.paymentStatus}
                    onChange={handleFormChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  >
                    <option value="pending">Pending</option>

                    <option value="paid">Paid</option>

                    <option value="failed">Failed</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Transaction ID
                  </label>

                  <input
                    type="text"
                    name="transactionId"
                    value={form.transactionId}
                    onChange={handleFormChange}
                    placeholder="Optional transaction ID"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Notes
                </label>

                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleFormChange}
                  rows="3"
                  placeholder="Optional subscription notes..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              {selectedPlan && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {selectedPlan.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {selectedPlan.duration} {selectedPlan.durationUnit}
                      </p>
                    </div>

                    <p className="text-lg font-bold text-slate-900">
                      NPR {Number(selectedPlan.price || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeAssignModal}
                  disabled={actionLoading === "assign"}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    actionLoading === "assign" ||
                    availableGyms.length === 0 ||
                    availablePlans.length === 0
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {actionLoading === "assign" ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    <>
                      <Plus size={17} />
                      Assign Subscription
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailsModal && selectedSubscription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Subscription Details
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Complete subscription information.
                </p>
              </div>

              <button
                type="button"
                onClick={closeDetailsModal}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 p-6">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Gym
                    </p>

                    <h3 className="mt-1 text-lg font-bold text-slate-900">
                      {selectedSubscription.gym?.name || "Unknown Gym"}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {selectedSubscription.gym?.email || "-"}
                    </p>
                  </div>

                  <span
                    className={`inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-semibold capitalize ring-1 ring-inset ${getStatusClasses(
                      selectedSubscription.status,
                    )}`}
                  >
                    {selectedSubscription.status}
                  </span>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Subscription Plan
                  </p>

                  <p className="mt-2 text-base font-semibold text-slate-900">
                    {selectedSubscription.plan?.name || "Unknown Plan"}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {selectedSubscription.plan?.duration
                      ? `${selectedSubscription.plan.duration} ${selectedSubscription.plan.durationUnit}`
                      : "-"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Amount
                  </p>

                  <p className="mt-2 text-base font-semibold text-slate-900">
                    NPR{" "}
                    {Number(selectedSubscription.amount || 0).toLocaleString()}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Start Date
                  </p>

                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {formatDate(selectedSubscription.startDate)}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    End Date
                  </p>

                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {formatDate(selectedSubscription.endDate)}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Payment Status
                  </p>

                  <span
                    className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${getPaymentClasses(
                      selectedSubscription.paymentStatus,
                    )}`}
                  >
                    {selectedSubscription.paymentStatus}
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Transaction ID
                  </p>

                  <p className="mt-2 break-all text-sm font-semibold text-slate-900">
                    {selectedSubscription.transactionId || "Not provided"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Notes
                </p>

                <div className="mt-2 rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600">
                  {selectedSubscription.notes || "No notes available."}
                </div>
              </div>

              <div className="flex justify-end border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={closeDetailsModal}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showActionModal && selectedSubscription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="p-6">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full ${
                  selectedAction === "suspend"
                    ? "bg-amber-50 text-amber-600"
                    : selectedAction === "activate"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-slate-100 text-slate-700"
                }`}
              >
                {selectedAction === "renew" ? (
                  <RefreshCw size={22} />
                ) : selectedAction === "suspend" ? (
                  <ShieldAlert size={22} />
                ) : (
                  <CheckCircle2 size={22} />
                )}
              </div>

              <h2 className="mt-5 text-lg font-bold text-slate-900">
                {getActionTitle()}
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {getActionDescription()}
              </p>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeActionModal}
                  disabled={Boolean(actionLoading)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSubscriptionAction}
                  disabled={Boolean(actionLoading)}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${getActionButtonClasses()}`}
                >
                  {actionLoading === selectedAction ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {selectedAction === "renew" ? (
                        <RefreshCw size={17} />
                      ) : selectedAction === "suspend" ? (
                        <ShieldAlert size={17} />
                      ) : (
                        <CheckCircle2 size={17} />
                      )}

                      {getActionButtonText()}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default GymSubscriptions;
