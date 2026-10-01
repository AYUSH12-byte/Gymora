import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Edit3,
  Loader2,
  Plus,
  Power,
  Search,
  Trash2,
  X,
} from "lucide-react";

import api from "../../services/api";
import AdminLayout from "../../components/layout/AdminLayout";

const initialForm = {
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
  const [actionLoading, setActionLoading] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);

  const [editingGym, setEditingGym] = useState(null);
  const [selectedGym, setSelectedGym] = useState(null);
  const [selectedAction, setSelectedAction] = useState("");

  const [form, setForm] = useState(initialForm);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadGyms = async () => {
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

      const response = await api.get("/super-admin/gyms", { params });

      setGyms(response.data.gyms || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load gyms.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadGyms();
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

  const filteredGyms = useMemo(() => {
    return gyms;
  }, [gyms]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openCreateModal = () => {
    setEditingGym(null);
    setForm(initialForm);
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
    if (actionLoading === "save") {
      return;
    }

    setShowModal(false);
    setEditingGym(null);
    setForm(initialForm);
  };

  const openActionModal = (gym, action) => {
    setSelectedGym(gym);
    setSelectedAction(action);
    setError("");
    setShowActionModal(true);
  };

  const closeActionModal = () => {
    if (actionLoading) {
      return;
    }

    setShowActionModal(false);
    setSelectedGym(null);
    setSelectedAction("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.email.trim()) {
      setError("Gym name and email are required.");
      return;
    }

    try {
      setActionLoading("save");
      setError("");
      setSuccess("");

      if (editingGym) {
        const response = await api.put(`/super-admin/gyms/${editingGym._id}`, {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          ownerName: form.ownerName.trim(),
          ownerEmail: form.ownerEmail.trim(),
        });

        setSuccess(response.data.message || "Gym updated successfully.");
      } else {
        const response = await api.post("/super-admin/gyms", {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          ownerName: form.ownerName.trim(),
          ownerEmail: form.ownerEmail.trim(),
        });

        setSuccess(response.data.message || "Gym created successfully.");
      }

      closeModal();
      await loadGyms();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save gym.");
    } finally {
      setActionLoading("");
    }
  };

  const handleGymAction = async () => {
    if (!selectedGym?._id || !selectedAction) {
      return;
    }

    const gymId = selectedGym._id;

    try {
      setActionLoading(selectedAction);
      setError("");
      setSuccess("");

      let response;

      if (selectedAction === "activate") {
        response = await api.patch(`/super-admin/gyms/${gymId}/activate`);
      }

      if (selectedAction === "deactivate") {
        response = await api.patch(`/super-admin/gyms/${gymId}/deactivate`);
      }

      if (selectedAction === "delete") {
        response = await api.delete(`/super-admin/gyms/${gymId}`);
      }

      setSuccess(
        response?.data?.message || "Gym action completed successfully.",
      );

      closeActionModal();
      await loadGyms();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to perform gym action.");
    } finally {
      setActionLoading("");
    }
  };

  const getActionTitle = () => {
    if (selectedAction === "activate") {
      return "Activate Gym?";
    }

    if (selectedAction === "deactivate") {
      return "Deactivate Gym?";
    }

    if (selectedAction === "delete") {
      return "Delete Gym?";
    }

    return "Confirm Action";
  };

  const getActionDescription = () => {
    if (!selectedGym) {
      return "";
    }

    if (selectedAction === "activate") {
      return (
        <>
          This will activate{" "}
          <span className="font-semibold text-slate-700">
            {selectedGym.name}
          </span>{" "}
          and allow its administrator to access Gymora, provided the gym has a
          valid subscription.
        </>
      );
    }

    if (selectedAction === "deactivate") {
      return (
        <>
          This will deactivate{" "}
          <span className="font-semibold text-slate-700">
            {selectedGym.name}
          </span>
          . Its administrator will no longer be able to access Gymora.
        </>
      );
    }

    if (selectedAction === "delete") {
      return (
        <>
          This will soft-delete{" "}
          <span className="font-semibold text-slate-700">
            {selectedGym.name}
          </span>
          . The gym will no longer appear as an active platform gym.
        </>
      );
    }

    return "Please confirm this action.";
  };

  const getActionButtonText = () => {
    if (selectedAction === "activate") {
      return "Activate Gym";
    }

    if (selectedAction === "deactivate") {
      return "Deactivate Gym";
    }

    if (selectedAction === "delete") {
      return "Delete Gym";
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

  return (
    <AdminLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
              <Building2 size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Gyms
              </h1>

              <p className="text-sm text-slate-500">
                Manage all gyms registered on the Gymora platform.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            <Plus size={18} />
            Add Gym
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
          <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">Registered Gyms</h2>

              <p className="mt-1 text-xs text-slate-500">
                {filteredGyms.length} gym
                {filteredGyms.length !== 1 ? "s" : ""} shown
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative w-full sm:w-64">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search gyms..."
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

                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Gym
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Owner
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Contact
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
                    <td colSpan="5" className="px-6 py-14 text-center">
                      <div className="flex flex-col items-center gap-3 text-slate-500">
                        <Loader2 size={24} className="animate-spin" />

                        <span className="text-sm">Loading gyms...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredGyms.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-14 text-center">
                      <div className="mx-auto flex max-w-sm flex-col items-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                          <Building2 size={22} />
                        </div>

                        <h3 className="mt-4 font-semibold text-slate-900">
                          No gyms found
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          Try changing your search or create a new gym.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredGyms.map((gym) => (
                    <tr
                      key={gym._id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                            <Building2 size={19} />
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {gym.name}
                            </p>

                            <p className="text-xs text-slate-500">
                              {gym.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            {gym.ownerName || "Not assigned"}
                          </p>

                          <p className="text-xs text-slate-500">
                            {gym.ownerEmail || "-"}
                          </p>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">
                        <div>
                          <p className="text-sm text-slate-700">
                            {gym.phone || "No phone"}
                          </p>

                          <p className="max-w-xs truncate text-xs text-slate-500">
                            {gym.address || "No address"}
                          </p>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                            gym.status === "active"
                              ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                              : "bg-slate-100 text-slate-600 ring-slate-500/20"
                          }`}
                        >
                          {gym.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(gym)}
                            disabled={actionLoading !== ""}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Edit3 size={15} />
                            Edit
                          </button>

                          {gym.status === "active" ? (
                            <button
                              type="button"
                              onClick={() => openActionModal(gym, "deactivate")}
                              disabled={actionLoading !== ""}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Power size={15} />
                              Deactivate
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => openActionModal(gym, "activate")}
                              disabled={actionLoading !== ""}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Power size={15} />
                              Activate
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => openActionModal(gym, "delete")}
                            disabled={actionLoading !== ""}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Trash2 size={15} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingGym ? "Edit Gym" : "Add Gym"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingGym
                    ? "Update gym information."
                    : "Register a new gym on the Gymora platform."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={actionLoading === "save"}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Gym Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Power Fitness Gym"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Gym Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="gym@example.com"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Phone
                  </label>

                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="9800000000"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Address
                  </label>

                  <input
                    type="text"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Birtamode, Jhapa"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Owner Name
                  </label>

                  <input
                    type="text"
                    name="ownerName"
                    value={form.ownerName}
                    onChange={handleChange}
                    placeholder="Gym owner name"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Owner Email
                  </label>

                  <input
                    type="email"
                    name="ownerEmail"
                    value={form.ownerEmail}
                    onChange={handleChange}
                    placeholder="owner@example.com"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
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

                      {editingGym ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      {editingGym ? <Edit3 size={17} /> : <Plus size={17} />}

                      {editingGym ? "Update Gym" : "Create Gym"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showActionModal && selectedGym && (
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
                {selectedAction === "delete" ? (
                  <Trash2 size={22} />
                ) : (
                  <Power size={22} />
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
                  onClick={handleGymAction}
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
                      {selectedAction === "delete" ? (
                        <Trash2 size={17} />
                      ) : (
                        <Power size={17} />
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

export default Gyms;
