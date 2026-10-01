import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Edit,
  Loader2,
  Plus,
  Search,
  X,
  XCircle,
} from "lucide-react";

import AdminLayout from "../../components/layout/AdminLayout";
import api from "../../services/api";

const emptyForm = {
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
  const [actionLoading, setActionLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [editingPlan, setEditingPlan] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (search.trim()) {
        params.search = search.trim();
      }

      const response = await api.get("/super-admin/subscription-plans", {
        params,
      });

      setPlans(response.data.plans || []);
    } catch (error) {
      console.error("Fetch subscription plans error:", error);

      setError(
        error.response?.data?.message || "Unable to load subscription plans",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPlans();
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const openCreateModal = () => {
    setEditingPlan(null);
    setForm(emptyForm);
    setError("");
    setShowModal(true);
  };

  const openEditModal = (plan) => {
    setEditingPlan(plan);

    setForm({
      name: plan.name || "",
      description: plan.description || "",
      duration: plan.duration || 1,
      durationUnit: plan.durationUnit || "months",
      price: plan.price ?? "",
      features: Array.isArray(plan.features) ? plan.features.join("\n") : "",
      maxMembers: plan.maxMembers ?? "",
      maxTrainers: plan.maxTrainers ?? "",
    });

    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (actionLoading) return;

    setShowModal(false);
    setEditingPlan(null);
    setForm(emptyForm);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        duration: Number(form.duration),
        durationUnit: form.durationUnit,
        price: Number(form.price),
        features: form.features
          .split("\n")
          .map((feature) => feature.trim())
          .filter(Boolean),
        maxMembers: form.maxMembers === "" ? null : Number(form.maxMembers),
        maxTrainers: form.maxTrainers === "" ? null : Number(form.maxTrainers),
      };

      if (editingPlan) {
        await api.put(
          `/super-admin/subscription-plans/${editingPlan._id}`,
          payload,
        );

        setSuccess("Subscription plan updated successfully.");
      } else {
        await api.post("/super-admin/subscription-plans", payload);

        setSuccess("Subscription plan created successfully.");
      }

      closeModal();
      await fetchPlans();
    } catch (error) {
      console.error("Save subscription plan error:", error);

      setError(
        error.response?.data?.message || "Unable to save subscription plan",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (plan) => {
    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      if (plan.status === "active") {
        await api.patch(
          `/super-admin/subscription-plans/${plan._id}/deactivate`,
        );

        setSuccess("Subscription plan deactivated successfully.");
      } else {
        await api.patch(`/super-admin/subscription-plans/${plan._id}/activate`);

        setSuccess("Subscription plan activated successfully.");
      }

      await fetchPlans();
    } catch (error) {
      console.error("Update plan status error:", error);

      setError(error.response?.data?.message || "Unable to update plan status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (plan) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${plan.name}"?`,
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      await api.delete(`/super-admin/subscription-plans/${plan._id}`);

      setSuccess("Subscription plan deleted successfully.");

      await fetchPlans();
    } catch (error) {
      console.error("Delete subscription plan error:", error);

      setError(
        error.response?.data?.message || "Unable to delete subscription plan",
      );
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Subscription Plans
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Create and manage Gymora subscription plans for gyms.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Plan
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
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search subscription plans..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white"
              />
            ))}
          </div>
        ) : plans.length === 0 ? (
          <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-center shadow-sm">
            <div className="mb-4 rounded-2xl bg-slate-100 p-4 text-slate-400">
              <CheckCircle2 size={30} />
            </div>

            <h3 className="font-semibold text-slate-800">
              No subscription plans found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Create your first Gymora subscription plan.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan._id}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {plan.name}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {plan.description || "No description provided."}
                    </p>
                  </div>

                  {plan.status === "active" ? (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 size={13} />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                      <XCircle size={13} />
                      Inactive
                    </span>
                  )}
                </div>

                <div className="mt-6">
                  <span className="text-3xl font-bold text-slate-900">
                    Rs. {Number(plan.price || 0).toLocaleString()}
                  </span>

                  <span className="ml-2 text-sm text-slate-500">
                    / {plan.duration} {plan.durationUnit}
                  </span>
                </div>

                <div className="mt-6 space-y-3 border-t border-slate-100 pt-5">
                  {plan.features?.length > 0 ? (
                    plan.features.map((feature, index) => (
                      <div
                        key={`${feature}-${index}`}
                        className="flex items-start gap-2 text-sm text-slate-600"
                      >
                        <CheckCircle2
                          size={17}
                          className="mt-0.5 shrink-0 text-emerald-500"
                        />

                        <span>{feature}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400">
                      No features specified.
                    </p>
                  )}
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Max Members</p>

                    <p className="mt-1 font-semibold text-slate-800">
                      {plan.maxMembers ?? "Unlimited"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">Max Trainers</p>

                    <p className="mt-1 font-semibold text-slate-800">
                      {plan.maxTrainers ?? "Unlimited"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex gap-2 border-t border-slate-100 pt-5">
                  <button
                    type="button"
                    onClick={() => openEditModal(plan)}
                    disabled={actionLoading}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    <Edit size={16} />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleStatus(plan)}
                    disabled={actionLoading}
                    className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition disabled:opacity-50 ${
                      plan.status === "active"
                        ? "border-red-200 text-red-600 hover:bg-red-50"
                        : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                    }`}
                  >
                    {plan.status === "active" ? "Deactivate" : "Activate"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(plan)}
                    disabled={actionLoading}
                    className="rounded-xl border border-red-200 px-3 py-2.5 text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                    title="Delete plan"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingPlan
                    ? "Edit Subscription Plan"
                    : "Create Subscription Plan"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Configure pricing, duration and platform limits.
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

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Plan Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Professional"
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Plan suitable for growing gyms..."
                    className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Duration
                  </label>

                  <input
                    type="number"
                    name="duration"
                    value={form.duration}
                    onChange={handleChange}
                    min="1"
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Duration Unit
                  </label>

                  <select
                    name="durationUnit"
                    value={form.durationUnit}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="days">Days</option>

                    <option value="months">Months</option>

                    <option value="years">Years</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Price (Rs.)
                  </label>

                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    min="0"
                    required
                    placeholder="5000"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Max Members
                  </label>

                  <input
                    type="number"
                    name="maxMembers"
                    value={form.maxMembers}
                    onChange={handleChange}
                    min="1"
                    placeholder="Unlimited"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Max Trainers
                  </label>

                  <input
                    type="number"
                    name="maxTrainers"
                    value={form.maxTrainers}
                    onChange={handleChange}
                    min="1"
                    placeholder="Unlimited"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Features
                  </label>

                  <textarea
                    name="features"
                    value={form.features}
                    onChange={handleChange}
                    rows={5}
                    placeholder={`Member management
Trainer management
Attendance tracking
Reports and analytics`}
                    className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                  <p className="mt-1.5 text-xs text-slate-400">
                    Enter one feature per line.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={actionLoading}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
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

                  {editingPlan ? "Update Plan" : "Create Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default SubscriptionPlans;
