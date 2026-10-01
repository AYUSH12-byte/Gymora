import { useEffect, useState } from "react";
import {
  Building2,
  CheckCircle2,
  Loader2,
  Plus,
  Search,
  ShieldCheck,
  UserMinus,
  X,
} from "lucide-react";

import AdminLayout from "../../components/layout/AdminLayout";
import api from "../../services/api";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  gymId: "",
};

const GymAdmins = () => {
  const [admins, setAdmins] = useState([]);
  const [gyms, setGyms] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState(emptyForm);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/super-admin/users/admins");

      setAdmins(response.data.admins || []);
    } catch (error) {
      console.error("Fetch gym admins error:", error);

      setError(error.response?.data?.message || "Unable to load gym admins");
    } finally {
      setLoading(false);
    }
  };

  const fetchGyms = async () => {
    try {
      const response = await api.get("/super-admin/gyms", {
        params: {
          status: "active",
        },
      });

      setGyms(response.data.gyms || []);
    } catch (error) {
      console.error("Fetch gyms error:", error);
    }
  };

  useEffect(() => {
    fetchAdmins();
    fetchGyms();
  }, []);

  const filteredAdmins = admins.filter((admin) => {
    const searchText = search.trim().toLowerCase();

    if (!searchText) {
      return true;
    }

    return (
      admin.name?.toLowerCase().includes(searchText) ||
      admin.email?.toLowerCase().includes(searchText) ||
      admin.gym?.name?.toLowerCase().includes(searchText)
    );
  });

  const availableGyms = gyms.filter(
    (gym) =>
      !admins.some(
        (admin) => admin.gym?._id === gym._id || admin.gym === gym._id,
      ),
  );

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

  const handleCreateAdmin = async (event) => {
    event.preventDefault();

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      await api.post("/super-admin/users/admins/create", {
        name: form.name,
        email: form.email,
        password: form.password,
        gymId: form.gymId,
      });

      setSuccess("Gym admin created successfully.");

      closeModal();

      await fetchAdmins();
      await fetchGyms();
    } catch (error) {
      console.error("Create gym admin error:", error);

      setError(error.response?.data?.message || "Unable to create gym admin");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveAdmin = async (admin) => {
    const gymName = admin.gym?.name || "this gym";

    const confirmed = window.confirm(`Remove ${admin.name} from ${gymName}?`);

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      await api.patch(`/super-admin/users/admins/${admin._id}/remove-gym`);

      setSuccess("Admin removed from gym successfully.");

      await fetchAdmins();
      await fetchGyms();
    } catch (error) {
      console.error("Remove gym admin error:", error);

      setError(
        error.response?.data?.message || "Unable to remove admin from gym",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignAdmin = async (admin) => {
    const gymId = window.prompt("Enter the Gym ID to assign this admin:");

    if (!gymId) return;

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      await api.patch(`/super-admin/users/gyms/${gymId}/assign-admin`, {
        userId: admin._id,
      });

      setSuccess("Admin assigned to gym successfully.");

      await fetchAdmins();
      await fetchGyms();
    } catch (error) {
      console.error("Assign gym admin error:", error);

      setError(error.response?.data?.message || "Unable to assign admin");
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
              Gym Admins
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage administrators responsible for each Gymora gym.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus size={18} />
            Create Gym Admin
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
              placeholder="Search by admin name, email or gym..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-80 items-center justify-center">
              <Loader2 size={30} className="animate-spin text-blue-600" />
            </div>
          ) : filteredAdmins.length === 0 ? (
            <div className="flex min-h-80 flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 rounded-2xl bg-slate-100 p-4 text-slate-400">
                <ShieldCheck size={30} />
              </div>

              <h3 className="font-semibold text-slate-800">
                No gym admins found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Create a gym admin to start managing gym accounts.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Admin
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Assigned Gym
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
                    {filteredAdmins.map((admin) => (
                      <tr
                        key={admin._id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                              <ShieldCheck size={19} />
                            </div>

                            <div>
                              <p className="font-semibold text-slate-800">
                                {admin.name}
                              </p>

                              <p className="mt-0.5 text-xs text-slate-500">
                                {admin.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          {admin.gym ? (
                            <div className="flex items-center gap-2">
                              <Building2 size={17} className="text-blue-500" />

                              <div>
                                <p className="text-sm font-medium text-slate-700">
                                  {admin.gym.name}
                                </p>

                                <p className="text-xs text-slate-500">
                                  {admin.gym.email}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                              No gym assigned
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          {admin.isActive ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                              <CheckCircle2 size={14} />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                              Inactive
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            {!admin.gym && (
                              <button
                                type="button"
                                onClick={() => handleAssignAdmin(admin)}
                                disabled={actionLoading}
                                className="rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-50 disabled:opacity-50"
                              >
                                Assign Gym
                              </button>
                            )}

                            {admin.gym && (
                              <button
                                type="button"
                                onClick={() => handleRemoveAdmin(admin)}
                                disabled={actionLoading}
                                title="Remove gym assignment"
                                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                              >
                                <UserMinus size={15} />
                                Remove
                              </button>
                            )}
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
                    {filteredAdmins.length}
                  </span>{" "}
                  admin
                  {filteredAdmins.length !== 1 ? "s" : ""}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Create Gym Admin
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Create an administrator and assign them to a gym.
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

            <form onSubmit={handleCreateAdmin} className="space-y-5 p-6">
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Admin Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Ram Sharma"
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                  placeholder="admin@example.com"
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Temporary Password
                </label>

                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
                  minLength={6}
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Assign Gym
                </label>

                <select
                  name="gymId"
                  value={form.gymId}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select a gym</option>

                  {availableGyms.map((gym) => (
                    <option key={gym._id} value={gym._id}>
                      {gym.name}
                    </option>
                  ))}
                </select>

                {availableGyms.length === 0 && (
                  <p className="mt-2 text-xs text-amber-600">
                    All active gyms already have an assigned admin.
                  </p>
                )}
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
                  disabled={actionLoading || availableGyms.length === 0}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {actionLoading && (
                    <Loader2 size={16} className="animate-spin" />
                  )}
                  Create Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default GymAdmins;
