import { useEffect, useState } from "react";
import {
  Building2,
  CheckCircle2,
  Edit,
  Loader2,
  Plus,
  Search,
  Trash2,
  UserRound,
  X,
  XCircle,
} from "lucide-react";

import AdminLayout from "../../components/layout/AdminLayout";
import api from "../../services/api";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  address: "",
  ownerName: "",
  ownerEmail: "",
};

const Gyms = () => {
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const [showModal, setShowModal] = useState(false);

  const [editingGym, setEditingGym] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchGyms = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (search.trim()) {
        params.search = search.trim();
      }

      if (status !== "all") {
        params.status = status;
      }

      const response = await api.get("/super-admin/gyms", {
        params,
      });

      setGyms(response.data.gyms || []);
    } catch (error) {
      console.error("Fetch gyms error:", error);

      setError(error.response?.data?.message || "Unable to load gyms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchGyms();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, status]);

  const openCreateModal = () => {
    setEditingGym(null);
    setForm(emptyForm);
    setError("");
    setShowModal(true);
  };

  const openEditModal = (gym) => {
    setEditingGym(gym);

    setForm({
      name: gym.name || "",
      email: gym.email || "",
      phone: gym.phone || "",
      address: gym.address || "",
      ownerName: gym.ownerName || "",
      ownerEmail: gym.ownerEmail || "",
    });

    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (actionLoading) return;

    setShowModal(false);
    setEditingGym(null);
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

      if (editingGym) {
        await api.put(`/super-admin/gyms/${editingGym._id}`, form);

        setSuccess("Gym updated successfully.");
      } else {
        await api.post("/super-admin/gyms", form);

        setSuccess("Gym created successfully.");
      }

      closeModal();
      await fetchGyms();
    } catch (error) {
      console.error("Save gym error:", error);

      setError(error.response?.data?.message || "Unable to save gym");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (gym) => {
    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      if (gym.status === "active") {
        await api.patch(`/super-admin/gyms/${gym._id}/deactivate`);

        setSuccess("Gym deactivated successfully.");
      } else {
        await api.patch(`/super-admin/gyms/${gym._id}/activate`);

        setSuccess("Gym activated successfully.");
      }

      await fetchGyms();
    } catch (error) {
      console.error("Update gym status error:", error);

      setError(error.response?.data?.message || "Unable to update gym status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (gym) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${gym.name}"?`,
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      await api.delete(`/super-admin/gyms/${gym._id}`);

      setSuccess("Gym deleted successfully.");

      await fetchGyms();
    } catch (error) {
      console.error("Delete gym error:", error);

      setError(error.response?.data?.message || "Unable to delete gym");
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
              Gyms
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage all gyms registered on the Gymora platform.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Gym
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
                placeholder="Search gyms by name, email or owner..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">All Status</option>

              <option value="active">Active</option>

              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-80 items-center justify-center">
              <Loader2 size={30} className="animate-spin text-blue-600" />
            </div>
          ) : gyms.length === 0 ? (
            <div className="flex min-h-80 flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 rounded-2xl bg-slate-100 p-4 text-slate-400">
                <Building2 size={30} />
              </div>

              <h3 className="font-semibold text-slate-800">No gyms found</h3>

              <p className="mt-1 text-sm text-slate-500">
                Try changing your search or add a new gym.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Gym
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Contact
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Owner
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
                    {gyms.map((gym) => (
                      <tr
                        key={gym._id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                              <Building2 size={19} />
                            </div>

                            <div>
                              <p className="font-semibold text-slate-800">
                                {gym.name}
                              </p>

                              <p className="mt-0.5 text-xs text-slate-500">
                                {gym.address || "No address"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm text-slate-700">{gym.email}</p>

                          <p className="mt-1 text-xs text-slate-500">
                            {gym.phone || "No phone"}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <UserRound size={16} className="text-slate-400" />

                            <div>
                              <p className="text-sm font-medium text-slate-700">
                                {gym.ownerName || "Not assigned"}
                              </p>

                              {gym.ownerEmail && (
                                <p className="text-xs text-slate-500">
                                  {gym.ownerEmail}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          {gym.status === "active" ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                              <CheckCircle2 size={14} />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                              <XCircle size={14} />
                              Inactive
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(gym)}
                              disabled={actionLoading}
                              title="Edit gym"
                              className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50"
                            >
                              <Edit size={16} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleStatus(gym)}
                              disabled={actionLoading}
                              title={
                                gym.status === "active"
                                  ? "Deactivate gym"
                                  : "Activate gym"
                              }
                              className={`rounded-lg border p-2 transition disabled:opacity-50 ${
                                gym.status === "active"
                                  ? "border-red-200 text-red-500 hover:bg-red-50"
                                  : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                              }`}
                            >
                              {gym.status === "active" ? (
                                <XCircle size={16} />
                              ) : (
                                <CheckCircle2 size={16} />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(gym)}
                              disabled={actionLoading}
                              title="Delete gym"
                              className="rounded-lg border border-red-200 p-2 text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-slate-200 px-5 py-4">
                <p className="text-sm text-slate-500">
                  Showing{" "}
                  <span className="font-semibold text-slate-700">
                    {gyms.length}
                  </span>{" "}
                  gym{gyms.length !== 1 ? "s" : ""}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingGym ? "Edit Gym" : "Add New Gym"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingGym
                    ? "Update gym information."
                    : "Register a new gym on Gymora."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
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
                    Gym Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Power Fitness Gym"
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="gym@example.com"
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Phone
                  </label>

                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="9800000000"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Address
                  </label>

                  <input
                    type="text"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Birtamode, Jhapa"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Owner Name
                  </label>

                  <input
                    type="text"
                    name="ownerName"
                    value={form.ownerName}
                    onChange={handleChange}
                    placeholder="Ram Sharma"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Owner Email
                  </label>

                  <input
                    type="email"
                    name="ownerEmail"
                    value={form.ownerEmail}
                    onChange={handleChange}
                    placeholder="owner@example.com"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
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

                  {editingGym ? "Update Gym" : "Create Gym"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Gyms;
