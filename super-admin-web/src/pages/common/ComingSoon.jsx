import AdminLayout from "../../components/layout/AdminLayout";

const ComingSoon = ({ title }) => {
  return (
    <AdminLayout>
      <div className="mx-auto max-w-7xl">
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>

          <p className="mt-2 text-sm text-slate-500">
            This module will be implemented next.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ComingSoon;
