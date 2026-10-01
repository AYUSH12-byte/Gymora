import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Plus,
  Search,
  ShieldCheck,
  UserMinus,
  UserPlus,
  X,
} from "lucide-react";

import api from "../../services/api";
import AdminLayout from "../../components/layout/AdminLayout";

const initialCreateForm = {
  name: "",
  email: "",
  password: "",
  gymId: "",
};

const GymAdmins = () => {
  const [admins, setAdmins] = useState([]);
  const [gyms, setGyms] = useState([]);

  const [loading, setLoading] = useState(true);
  const [gymsLoading, setGymsLoading] = useState(true);

  const [actionLoading, setActionLoading] = useState("");

  const [search, setSearch] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);

  const [selectedAdmin, setSelectedAdmin] = useState(null);

  const [createForm, setCreateForm] = useState(initialCreateForm);

  const [assignForm, setAssignForm] = useState({
    adminId: "",
    gymId: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadAdmins = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/super-admin/users/admins");

      setAdmins(response.data.admins || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load gym admins.");
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

  useEffect(() => {
    loadAdmins();
    loadGyms();
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

  const filteredAdmins = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return admins;
    }

    return admins.filter((admin) => {
      const name = admin.name || "";
      const email = admin.email || "";
      const gymName = admin.gym?.name || "";

      return (
        name.toLowerCase().includes(query) ||
        email.toLowerCase().includes(query) ||
        gymName.toLowerCase().includes(query)
      );
    });
  }, [admins, search]);

  const availableGyms = useMemo(() => {
    return gyms.filter((gym) => gym.status === "active" && !gym.isDeleted);
  }, [gyms]);

  const unassignedAdmins = useMemo(() => {
    return admins.filter((admin) => !admin.gym);
  }, [admins]);

  const handleCreateFormChange = (event) => {
    const { name, value } = event.target;

    setCreateForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleAssignFormChange = (event) => {
    const { name, value } = event.target;

    setAssignForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetCreateForm = () => {
    setCreateForm(initialCreateForm);
  };

  const closeCreateModal = () => {
    if (actionLoading === "create") {
      return;
    }

    setShowCreateModal(false);
    resetCreateForm();
  };

  const closeAssignModal = () => {
    if (actionLoading === "assign") {
      return;
    }

    setShowAssignModal(false);

    setAssignForm({
      adminId: "",
      gymId: "",
    });
  };

  const openRemoveModal = (admin) => {
    setSelectedAdmin(admin);
    setShowRemoveModal(true);
    setError("");
  };

  const closeRemoveModal = () => {
    if (actionLoading === "remove") {
      return;
    }

    setShowRemoveModal(false);
    setSelectedAdmin(null);
  };

  const handleCreateAdmin = async (event) => {
    event.preventDefault();

    if (
      !createForm.name.trim() ||
      !createForm.email.trim() ||
      !createForm.password ||
      !createForm.gymId
    ) {
      setError("Name, email, password and gym are required.");
      return;
    }

    try {
      setActionLoading("create");
      setError("");
      setSuccess("");

      const response = await api.post("/super-admin/users/admins/create", {
        name: createForm.name.trim(),
        email: createForm.email.trim(),
        password: createForm.password,
        gymId: createForm.gymId,
      });

      setSuccess(response.data.message || "Gym admin created successfully.");

      closeCreateModal();

      await Promise.all([loadAdmins(), loadGyms()]);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create gym admin.");
    } finally {
      setActionLoading("");
    }
  };

  const handleAssignAdmin = async (event) => {
    event.preventDefault();

    if (!assignForm.adminId || !assignForm.gymId) {
      setError("Please select an admin and a gym.");
      return;
    }

    const selectedGym = gyms.find((gym) => gym._id === assignForm.gymId);

    if (!selectedGym) {
      setError("Selected gym was not found.");
      return;
    }

    if (selectedGym.status !== "active") {
      setError("An admin can only be assigned to an active gym.");
      return;
    }

    try {
      setActionLoading("assign");
      setError("");
      setSuccess("");

      const response = await api.patch(
        `/super-admin/users/gyms/${assignForm.gymId}/assign-admin`,
        {
          userId: assignForm.adminId,
        },
      );

      setSuccess(
        response.data.message || "Admin assigned to gym successfully.",
      );

      closeAssignModal();

      await Promise.all([loadAdmins(), loadGyms()]);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign admin.");
    } finally {
      setActionLoading("");
    }
  };

  const handleRemoveAdmin = async () => {
    if (!selectedAdmin?._id) {
      return;
    }

    try {
      setActionLoading("remove");
      setError("");
      setSuccess("");

      const response = await api.patch(
        `/super-admin/users/admins/${selectedAdmin._id}/remove-gym`,
      );

      setSuccess(
        response.data.message || "Admin removed from gym successfully.",
      );

      closeRemoveModal();

      await Promise.all([loadAdmins(), loadGyms()]);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to remove admin from gym.",
      );
    } finally {
      setActionLoading("");
    }
  };

  const getStatusClasses = (admin) => {
    if (!admin.isActive) {
      return "bg-red-50 text-red-700 ring-red-600/20";
    }

    if (admin.gym?.status === "active") {
      return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
    }

    if (admin.gym) {
      return "bg-amber-50 text-amber-700 ring-amber-600/20";
    }

    return "bg-slate-100 text-slate-600 ring-slate-500/20";
  };

  const getStatusText = (admin) => {
    if (!admin.isActive) {
      return "Inactive";
    }

    if (admin.gym?.status === "active") {
      return "Active";
    }

    if (admin.gym) {
      return "Gym Inactive";
    }

    return "Unassigned";
  };

  return (
    <AdminLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
                <ShieldCheck size={22} />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Gym Admins
                </h1>

                <p className="text-sm text-slate-500">
                  Manage gym administrator accounts and their gym assignments.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                setError("");
                setShowAssignModal(true);
              }}
              disabled={unassignedAdmins.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <UserPlus size={18} />
              Assign Admin
            </button>

            <button
              type="button"
              onClick={() => {
                setError("");
                setShowCreateModal(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              <Plus size={18} />
              Create Gym Admin
            </button>
          </div>
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
              <h2 className="font-semibold text-slate-900">
                Administrator Accounts
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {filteredAdmins.length} administrator
                {filteredAdmins.length !== 1 ? "s" : ""} shown
              </p>
            </div>

            <div className="relative w-full sm:max-w-sm">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search admin or gym..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Administrator
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Gym
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

                        <span className="text-sm">Loading gym admins...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredAdmins.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-14 text-center">
                      <div className="mx-auto flex max-w-sm flex-col items-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                          <ShieldCheck size={22} />
                        </div>

                        <h3 className="mt-4 font-semibold text-slate-900">
                          No gym admins found
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          Try changing your search or create a new gym
                          administrator.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAdmins.map((admin) => (
                    <tr
                      key={admin._id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">
                            {admin.name?.charAt(0)?.toUpperCase() || "A"}
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {admin.name}
                            </p>

                            <p className="text-xs text-slate-500">
                              {admin.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">
                        {admin.gym ? (
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {admin.gym.name}
                            </p>

                            <p className="text-xs text-slate-500">
                              {admin.gym.address || "Address not available"}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">
                            Not assigned
                          </span>
                        )}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm text-slate-600">
                          {admin.gym?.phone || "No phone"}
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusClasses(admin)}`}
                        >
                          {getStatusText(admin)}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        {admin.gym ? (
                          <button
                            type="button"
                            onClick={() => openRemoveModal(admin)}
                            disabled={actionLoading !== ""}
                            className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <UserMinus size={15} />
                            Remove Gym
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setAssignForm({
                                adminId: admin._id,
                                gymId: "",
                              });

                              setError("");
                              setShowAssignModal(true);
                            }}
                            disabled={actionLoading !== ""}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <UserPlus size={15} />
                            Assign Gym
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Create Gym Admin
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Create an administrator account and assign it to a gym.
                </p>
              </div>

              <button
                type="button"
                onClick={closeCreateModal}
                disabled={actionLoading === "create"}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="space-y-5 p-6">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={createForm.name}
                  onChange={handleCreateFormChange}
                  placeholder="Enter admin name"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={createForm.email}
                  onChange={handleCreateFormChange}
                  placeholder="admin@example.com"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Password
                </label>

                <input
                  type="password"
                  name="password"
                  value={createForm.password}
                  onChange={handleCreateFormChange}
                  placeholder="Minimum 6 characters"
                  minLength={6}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Assign Gym
                </label>

                <select
                  name="gymId"
                  value={createForm.gymId}
                  onChange={handleCreateFormChange}
                  disabled={gymsLoading}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-50"
                >
                  <option value="">
                    {gymsLoading ? "Loading gyms..." : "Select a gym"}
                  </option>

                  {availableGyms.map((gym) => (
                    <option key={gym._id} value={gym._id}>
                      {gym.name}
                    </option>
                  ))}
                </select>

                {availableGyms.length === 0 && !gymsLoading && (
                  <p className="mt-2 text-xs text-amber-600">
                    No active gyms are available. Create or activate a gym
                    first.
                  </p>
                )}
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  disabled={actionLoading === "create"}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    actionLoading === "create" || availableGyms.length === 0
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {actionLoading === "create" ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={17} />
                      Create Admin
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Assign Admin to Gym
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Select an unassigned administrator and an active gym.
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

            <form onSubmit={handleAssignAdmin} className="space-y-5 p-6">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Administrator
                </label>

                <select
                  name="adminId"
                  value={assignForm.adminId}
                  onChange={handleAssignFormChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                >
                  <option value="">Select an administrator</option>

                  {unassignedAdmins.map((admin) => (
                    <option key={admin._id} value={admin._id}>
                      {admin.name} — {admin.email}
                    </option>
                  ))}
                </select>

                {unassignedAdmins.length === 0 && (
                  <p className="mt-2 text-xs text-slate-500">
                    There are no unassigned administrators.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Active Gym
                </label>

                <select
                  name="gymId"
                  value={assignForm.gymId}
                  onChange={handleAssignFormChange}
                  disabled={gymsLoading}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-50"
                >
                  <option value="">
                    {gymsLoading ? "Loading gyms..." : "Select a gym"}
                  </option>

                  {availableGyms.map((gym) => (
                    <option key={gym._id} value={gym._id}>
                      {gym.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                <p className="text-xs leading-5 text-blue-800">
                  Each gym can have one assigned gym administrator. The backend
                  will also verify this rule before completing the assignment.
                </p>
              </div>

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
                    unassignedAdmins.length === 0 ||
                    availableGyms.length === 0
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
                      <UserPlus size={17} />
                      Assign Admin
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRemoveModal && selectedAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                <UserMinus size={22} />
              </div>

              <h2 className="mt-5 text-lg font-bold text-slate-900">
                Remove Gym Assignment?
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                You are about to remove{" "}
                <span className="font-semibold text-slate-700">
                  {selectedAdmin.name}
                </span>{" "}
                from{" "}
                <span className="font-semibold text-slate-700">
                  {selectedAdmin.gym?.name}
                </span>
                . The admin account will remain active but will no longer be
                assigned to this gym.
              </p>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeRemoveModal}
                  disabled={actionLoading === "remove"}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleRemoveAdmin}
                  disabled={actionLoading === "remove"}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {actionLoading === "remove" ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      Removing...
                    </>
                  ) : (
                    <>
                      <UserMinus size={17} />
                      Remove Assignment
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

export default GymAdmins;
