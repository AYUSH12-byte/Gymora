import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  CheckCircle,
  Clock3,
  Edit3,
  Loader2,
  Plus,
  Search,
  ShieldAlert,
  Trash2,
  Users,
  X,
} from "lucide-react";

import api from "../../services/api";
import AdminLayout from "../../components/layout/AdminLayout";

const initialForm = {
  name: "",
  description: "",
  duration: 1,
  durationUnit: "months",
  price: "",
  features: "",
  maxMembers: "",
  maxTrainers: "",
};

const SubscriptionPlans = () => {
  const [plans, setPlans] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showFormModal, setShowFormModal] = useState(false);

  const [showActionModal, setShowActionModal] = useState(false);

  const [editingPlan, setEditingPlan] = useState(null);

  const [selectedPlan, setSelectedPlan] = useState(null);

  const [selectedAction, setSelectedAction] = useState("");

  const [form, setForm] = useState({
    ...initialForm,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadPlans = async () => {
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

      const response = await api.get("/super-admin/subscription-plans", {
        params,
      });

      setPlans(response.data.plans || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load subscription plans.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadPlans();
    }, 250);

    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  useEffect(() => {
    if (!success) {
      return;
    }

    const timer = setTimeout(() => {
      setSuccess("");
    }, 4000);

    return () => clearTimeout(timer);
  }, [success]);

  const filteredPlans = useMemo(() => {
    return plans;
  }, [plans]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openCreateModal = () => {
    setEditingPlan(null);
    setForm({
      ...initialForm,
    });
    setError("");
    setShowFormModal(true);
  };

  const openEditModal = (plan) => {
    setEditingPlan(plan);

    setForm({
      name: plan.name || "",
      description: plan.description || "",
      duration: plan.duration || 1,
      durationUnit: plan.durationUnit || "months",
      price:
        plan.price !== undefined && plan.price !== null
          ? String(plan.price)
          : "",
      features: Array.isArray(plan.features) ? plan.features.join("\n") : "",
      maxMembers:
        plan.maxMembers !== null && plan.maxMembers !== undefined
          ? String(plan.maxMembers)
          : "",
      maxTrainers:
        plan.maxTrainers !== null && plan.maxTrainers !== undefined
          ? String(plan.maxTrainers)
          : "",
    });

    setError("");
    setShowFormModal(true);
  };

  const closeFormModal = () => {
    if (actionLoading === "save") {
      return;
    }

    setShowFormModal(false);
    setEditingPlan(null);
    setForm({
      ...initialForm,
    });
  };

  const openActionModal = (plan, action) => {
    setSelectedPlan(plan);
    setSelectedAction(action);
    setError("");
    setShowActionModal(true);
  };

  const closeActionModal = () => {
    if (actionLoading) {
      return;
    }

    setShowActionModal(false);
    setSelectedPlan(null);
    setSelectedAction("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const name = form.name.trim();
    const description = form.description.trim();

    const duration = Number(form.duration);
    const price = Number(form.price);

    const maxMembers = form.maxMembers === "" ? null : Number(form.maxMembers);

    const maxTrainers =
      form.maxTrainers === "" ? null : Number(form.maxTrainers);

    if (!name) {
      setError("Plan name is required.");
      return;
    }

    if (!Number.isFinite(duration) || duration < 1) {
      setError("Duration must be at least 1.");
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      setError("Price must be 0 or greater.");
      return;
    }

    if (
      maxMembers !== null &&
      (!Number.isFinite(maxMembers) || maxMembers < 1)
    ) {
      setError("Maximum members must be at least 1.");
      return;
    }

    if (
      maxTrainers !== null &&
      (!Number.isFinite(maxTrainers) || maxTrainers < 1)
    ) {
      setError("Maximum trainers must be at least 1.");
      return;
    }

    const features = form.features
      .split("\n")
      .map((feature) => feature.trim())
      .filter(Boolean);

    const payload = {
      name,
      description,
      duration,
      durationUnit: form.durationUnit,
      price,
      features,
      maxMembers,
      maxTrainers,
    };

    try {
      setActionLoading("save");
      setError("");
      setSuccess("");

      let response;

      if (editingPlan) {
        response = await api.put(
          `/super-admin/subscription-plans/${editingPlan._id}`,
          payload,
        );
      } else {
        response = await api.post("/super-admin/subscription-plans", payload);
      }

      setSuccess(
        response.data.message ||
          (editingPlan
            ? "Subscription plan updated successfully."
            : "Subscription plan created successfully."),
      );

      closeFormModal();

      await loadPlans();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to save subscription plan.",
      );
    } finally {
      setActionLoading("");
    }
  };

  const handlePlanAction = async () => {
    if (!selectedPlan?._id || !selectedAction) {
      return;
    }

    try {
      setActionLoading(selectedAction);
      setError("");
      setSuccess("");

      let response;

      if (selectedAction === "activate") {
        response = await api.patch(
          `/super-admin/subscription-plans/${selectedPlan._id}/activate`,
        );
      }

      if (selectedAction === "deactivate") {
        response = await api.patch(
          `/super-admin/subscription-plans/${selectedPlan._id}/deactivate`,
        );
      }

      if (selectedAction === "delete") {
        response = await api.delete(
          `/super-admin/subscription-plans/${selectedPlan._id}`,
        );
      }

      setSuccess(
        response?.data?.message || "Subscription plan updated successfully.",
      );

      closeActionModal();

      await loadPlans();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update subscription plan.",
      );
    } finally {
      setActionLoading("");
    }
  };

  const getStatusClasses = (status) => {
    if (status === "active") {
      return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
    }

    return "bg-slate-100 text-slate-600 ring-slate-500/20";
  };

  const getActionTitle = () => {
    if (selectedAction === "activate") {
      return "Activate Subscription Plan?";
    }

    if (selectedAction === "deactivate") {
      return "Deactivate Subscription Plan?";
    }

    if (selectedAction === "delete") {
      return "Delete Subscription Plan?";
    }

    return "Confirm Action";
  };

  const getActionDescription = () => {
    if (!selectedPlan) {
      return "";
    }

    if (selectedAction === "activate") {
      return (
        <>
          The{" "}
          <span className="font-semibold text-slate-700">
            {selectedPlan.name}
          </span>{" "}
          plan will become available for new Gymora subscriptions.
        </>
      );
    }

    if (selectedAction === "deactivate") {
      return (
        <>
          The{" "}
          <span className="font-semibold text-slate-700">
            {selectedPlan.name}
          </span>{" "}
          plan will no longer be available for new subscriptions. Existing
          subscriptions are not automatically cancelled.
        </>
      );
    }

    if (selectedAction === "delete") {
      return (
        <>
          You are about to permanently delete the{" "}
          <span className="font-semibold text-slate-700">
            {selectedPlan.name}
          </span>{" "}
          subscription plan. Make sure it is not being used by an existing
          subscription.
        </>
      );
    }

    return "Please confirm this action.";
  };

  const getActionButtonText = () => {
    if (selectedAction === "activate") {
      return "Activate Plan";
    }

    if (selectedAction === "deactivate") {
      return "Deactivate Plan";
    }

    if (selectedAction === "delete") {
      return "Delete Plan";
    }

    return "Confirm";
  };

  const getActionButtonClasses = () => {
    if (selectedAction === "delete") {
      return "bg-red-600 hover:bg-red-700";
    }

    if (selectedAction === "deactivate") {
      return "bg-amber-600 hover:bg-amber-700";
    }

    return "bg-emerald-600 hover:bg-emerald-700";
  };

  const getActionIcon = () => {
    if (selectedAction === "delete") {
      return <Trash2 size={21} />;
    }

    if (selectedAction === "deactivate") {
      return <ShieldAlert size={21} />;
    }

    return <CheckCircle2 size={21} />;
  };

  return (
    <AdminLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
              <Clock3 size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Subscription Plans
              </h1>

              <p className="text-sm text-slate-500">
                Create and manage Gymora pricing plans for gyms.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            <Plus size={18} />
            Create Plan
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

        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative w-full md:max-w-md">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search subscription plans..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          >
            <option value="all">All Status</option>

            <option value="active">Active</option>

            <option value="inactive">Inactive</option>
          </select>
        </div>

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col items-center gap-3 text-slate-500">
              <Loader2 size={25} className="animate-spin" />

              <span className="text-sm">Loading subscription plans...</span>
            </div>
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <Clock3 size={22} />
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              No subscription plans found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Create your first Gymora subscription plan to get started.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredPlans.map((plan) => (
              <div
                key={plan._id}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="border-b border-slate-100 p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        {plan.name}
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        {plan.description || "No description provided."}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${getStatusClasses(
                        plan.status,
                      )}`}
                    >
                      {plan.status}
                    </span>
                  </div>

                  <div className="mt-6 flex items-end gap-1">
                    <span className="text-3xl font-bold text-slate-900">
                      NPR {Number(plan.price || 0).toLocaleString()}
                    </span>

                    <span className="pb-1 text-sm text-slate-500">
                      / {plan.duration} {plan.durationUnit}
                    </span>
                  </div>
                </div>

                <div className="flex-1 space-y-5 p-6">
                  <div>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Plan Features
                    </p>

                    {Array.isArray(plan.features) &&
                    plan.features.length > 0 ? (
                      <div className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <div
                            key={`${plan._id}-feature-${index}`}
                            className="flex items-start gap-2 text-sm text-slate-600"
                          >
                            <CheckCircle
                              size={16}
                              className="mt-0.5 shrink-0 text-emerald-600"
                            />

                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400">
                        No specific features added.
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Users size={16} />

                        <span className="text-xs font-medium">Members</span>
                      </div>

                      <p className="mt-2 text-sm font-semibold text-slate-900">
                        {plan.maxMembers === null ||
                        plan.maxMembers === undefined
                          ? "Unlimited"
                          : plan.maxMembers}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Users size={16} />

                        <span className="text-xs font-medium">Trainers</span>
                      </div>

                      <p className="mt-2 text-sm font-semibold text-slate-900">
                        {plan.maxTrainers === null ||
                        plan.maxTrainers === undefined
                          ? "Unlimited"
                          : plan.maxTrainers}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 p-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(plan)}
                      disabled={Boolean(actionLoading)}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Edit3 size={15} />
                      Edit
                    </button>

                    {plan.status === "active" ? (
                      <button
                        type="button"
                        onClick={() => openActionModal(plan, "deactivate")}
                        disabled={Boolean(actionLoading)}
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-amber-200 px-3 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <ShieldAlert size={15} />
                        Deactivate
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openActionModal(plan, "activate")}
                        disabled={Boolean(actionLoading)}
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <CheckCircle2 size={15} />
                        Activate
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => openActionModal(plan, "delete")}
                      disabled={Boolean(actionLoading)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 size={15} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingPlan
                    ? "Edit Subscription Plan"
                    : "Create Subscription Plan"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Configure pricing, duration, limits and features.
                </p>
              </div>

              <button
                type="button"
                onClick={closeFormModal}
                disabled={actionLoading === "save"}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Plan Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleFormChange}
                    placeholder="e.g. Professional"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Duration
                  </label>

                  <input
                    type="number"
                    name="duration"
                    min="1"
                    value={form.duration}
                    onChange={handleFormChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Duration Unit
                  </label>

                  <select
                    name="durationUnit"
                    value={form.durationUnit}
                    onChange={handleFormChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  >
                    <option value="days">Days</option>

                    <option value="months">Months</option>

                    <option value="years">Years</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Price
                  </label>

                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                      NPR
                    </span>

                    <input
                      type="number"
                      name="price"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={handleFormChange}
                      placeholder="0"
                      className="w-full rounded-xl border border-slate-200 py-2.5 pl-14 pr-4 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Maximum Members
                  </label>

                  <input
                    type="number"
                    name="maxMembers"
                    min="1"
                    value={form.maxMembers}
                    onChange={handleFormChange}
                    placeholder="Leave empty for unlimited"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Maximum Trainers
                  </label>

                  <input
                    type="number"
                    name="maxTrainers"
                    min="1"
                    value={form.maxTrainers}
                    onChange={handleFormChange}
                    placeholder="Leave empty for unlimited"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleFormChange}
                    rows="3"
                    placeholder="Describe what this plan includes..."
                    className="w-full resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Features
                  </label>

                  <textarea
                    name="features"
                    value={form.features}
                    onChange={handleFormChange}
                    rows="5"
                    placeholder={`Enter one feature per line
Member management
Trainer management
Attendance tracking
Payment management
Reports`}
                    className="w-full resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  />

                  <p className="mt-1.5 text-xs text-slate-400">
                    Enter each feature on a separate line.
                  </p>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeFormModal}
                  disabled={actionLoading === "save"}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={actionLoading === "save"}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {actionLoading === "save" ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />

                      {editingPlan ? "Saving..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      {editingPlan ? <Edit3 size={17} /> : <Plus size={17} />}

                      {editingPlan ? "Save Changes" : "Create Plan"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showActionModal && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="p-6">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full ${
                  selectedAction === "delete"
                    ? "bg-red-50 text-red-600"
                    : selectedAction === "deactivate"
                      ? "bg-amber-50 text-amber-600"
                      : "bg-emerald-50 text-emerald-600"
                }`}
              >
                {getActionIcon()}
              </div>

              <h2 className="mt-5 text-lg font-bold text-slate-900">
                {getActionTitle()}
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {getActionDescription()}
              </p>

              {selectedAction === "delete" && (
                <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs leading-5 text-red-700">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />

                  <span>
                    Deleting a plan may fail if the backend prevents deletion
                    because the plan is referenced by existing subscriptions.
                  </span>
                </div>
              )}

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
                  onClick={handlePlanAction}
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
                      {getActionIcon()}

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

export default SubscriptionPlans;
