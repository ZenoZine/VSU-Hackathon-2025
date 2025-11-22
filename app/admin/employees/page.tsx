'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useCurrentUserProfile } from '@/lib/useCurrentUserProfile';

type Employee = {
  id: string;
  employee_code: string;
  name: string;
  address: string | null;
  salary: number | null;
  department: string | null;
  job_role: string | null;
  date_of_hire: string | null;
  date_of_birth: string | null;
};

export default function AdminEmployeesPage() {
  const { profile, loading: profileLoading } = useCurrentUserProfile();
  const router = useRouter();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // form state
  const [employeeCode, setEmployeeCode] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [salary, setSalary] = useState('');
  const [department, setDepartment] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [dateOfHire, setDateOfHire] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Guard + load employees
  useEffect(() => {
    if (profileLoading) return;

    if (!profile) {
      router.replace('/login');
      return;
    }

    if (profile.role !== 'admin') {
      router.replace('/me/tasks');
      return;
    }

    const loadEmployees = async () => {
      const { data, error } = await supabase
        .from('employees')
        .select(
          `
          id,
          employee_code,
          name,
          address,
          salary,
          department,
          job_role,
          date_of_hire,
          date_of_birth
        `
        )
        .order('name', { ascending: true });

      if (error) {
        console.error('Error loading employees', error);
      } else if (data) {
        setEmployees(data as Employee[]);
      }

      setLoading(false);
    };

    loadEmployees();
  }, [profile, profileLoading, router]);

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!employeeCode.trim() || !name.trim()) {
      setErrorMsg('Employee code and name are required.');
      return;
    }

    setSaving(true);

    const { error } = await supabase.from('employees').insert({
      employee_code: employeeCode.trim(),
      name: name.trim(),
      address: address.trim() || null,
      salary: salary ? Number(salary) : null,
      department: department.trim() || null,
      job_role: jobRole.trim() || null,
      date_of_hire: dateOfHire || null,
      date_of_birth: dateOfBirth || null,
    });

    if (error) {
      console.error('Error creating employee', error);
      setErrorMsg('Failed to create employee.');
      setSaving(false);
      return;
    }

    // Reload employees
    const { data: dataAfter } = await supabase
      .from('employees')
      .select(
        `
        id,
        employee_code,
        name,
        address,
        salary,
        department,
        job_role,
        date_of_hire,
        date_of_birth
      `
      )
      .order('name', { ascending: true });

    if (dataAfter) {
      setEmployees(dataAfter as Employee[]);
    }

    // Reset form
    setEmployeeCode('');
    setName('');
    setAddress('');
    setSalary('');
    setDepartment('');
    setJobRole('');
    setDateOfHire('');
    setDateOfBirth('');
    setSaving(false);
  };

  if (profileLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p>Loading employees…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex justify-center">
      <div className="w-full max-w-6xl space-y-8">
        {/* Header + nav */}
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Admin console
            </p>
            <h1 className="text-3xl font-bold">Employees</h1>
            <p className="text-sm text-slate-300">
              Logged in as{' '}
              <span className="font-semibold">
                {profile?.full_name || 'Admin'}
              </span>
              . Maintain staff records and key HR details.
            </p>
          </div>
          <nav className="flex flex-wrap gap-2 text-xs">
            <a
              href="/admin/tasks"
              className="rounded-full bg-slate-900/60 border border-slate-700 px-3 py-1 text-slate-200 hover:border-slate-500"
            >
              Tasks
            </a>
            <a
              href="/admin/employees"
              className="rounded-full bg-slate-900/80 border border-blue-500/50 px-3 py-1 font-medium text-blue-200"
            >
              Employees
            </a>
            <a
              href="/admin/groups"
              className="rounded-full bg-slate-900/60 border border-slate-700 px-3 py-1 text-slate-200 hover:border-slate-500"
            >
              Groups
            </a>
            <a
              href="/me/tasks"
              className="rounded-full bg-slate-900/40 border border-slate-700 px-3 py-1 text-slate-300 hover:border-slate-500"
            >
              My Tasks
            </a>
          </nav>
        </header>

        {/* Create employee form */}
        <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl shadow-slate-950/50">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-semibold">Create new employee</h2>
              <p className="text-xs text-slate-400">
                Store staff identity, department, role, salary, and key dates.
              </p>
            </div>
            <span className="hidden sm:inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-0.5 text-[11px] font-semibold text-emerald-300 border border-emerald-500/40">
              HR record
            </span>
          </div>

          {errorMsg && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/40 rounded-lg px-3 py-2">
              {errorMsg}
            </p>
          )}

          <form
            onSubmit={handleCreateEmployee}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <div>
              <label className="block text-xs mb-1 text-slate-200">
                Employee code
              </label>
              <input
                className="w-full rounded-xl border border-slate-700 bg-slate-950/70 text-slate-50 px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={employeeCode}
                onChange={(e) => setEmployeeCode(e.target.value)}
                placeholder="EMP-001"
                required
              />
            </div>

            <div className="md:col-span-1 lg:col-span-2">
              <label className="block text-xs mb-1 text-slate-200">
                Name
              </label>
              <input
                className="w-full rounded-xl border border-slate-700 bg-slate-950/70 text-slate-50 px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                required
              />
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-xs mb-1 text-slate-200">
                Address
              </label>
              <input
                className="w-full rounded-xl border border-slate-700 bg-slate-950/70 text-slate-50 px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Clinic St, Springfield"
              />
            </div>

            <div>
              <label className="block text-xs mb-1 text-slate-200">
                Department
              </label>
              <input
                className="w-full rounded-xl border border-slate-700 bg-slate-950/70 text-slate-50 px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Front Desk, Nursing, Billing…"
              />
            </div>

            <div>
              <label className="block text-xs mb-1 text-slate-200">
                Job role
              </label>
              <input
                className="w-full rounded-xl border border-slate-700 bg-slate-950/70 text-slate-50 px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                placeholder="Receptionist, RN, Technician…"
              />
            </div>

            <div>
              <label className="block text-xs mb-1 text-slate-200">
                Salary
              </label>
              <input
                type="number"
                className="w-full rounded-xl border border-slate-700 bg-slate-950/70 text-slate-50 px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="50000"
                min="0"
              />
            </div>

            <div>
              <label className="block text-xs mb-1 text-slate-200">
                Date of hire
              </label>
              <input
                type="date"
                className="w-full rounded-xl border border-slate-700 bg-slate-950/70 text-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={dateOfHire}
                onChange={(e) => setDateOfHire(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs mb-1 text-slate-200">
                Date of birth
              </label>
              <input
                type="date"
                className="w-full rounded-xl border border-slate-700 bg-slate-950/70 text-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
            </div>

            <div className="md:col-span-2 lg:col-span-3 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold shadow-md shadow-blue-600/30 hover:bg-blue-500 disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Create employee'}
              </button>
            </div>
          </form>
        </section>

        {/* Employee list */}
        <section className="bg-slate-900/70 border border-slate-800 rounded-3xl p-5 space-y-3">
          <h2 className="text-xl font-semibold mb-1">Employees</h2>
          <p className="text-xs text-slate-400 mb-3">
            A simple overview of everyone in the clinic and their key details.
          </p>

          {employees.length === 0 ? (
            <p className="text-sm text-slate-400">
              No employees yet. Use the form above to add your first staff
              member.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/80">
                    <th className="text-left px-3 py-2 border-b border-slate-800">
                      Code
                    </th>
                    <th className="text-left px-3 py-2 border-b border-slate-800">
                      Name
                    </th>
                    <th className="text-left px-3 py-2 border-b border-slate-800">
                      Department
                    </th>
                    <th className="text-left px-3 py-2 border-b border-slate-800">
                      Role
                    </th>
                    <th className="text-left px-3 py-2 border-b border-slate-800">
                      Salary
                    </th>
                    <th className="text-left px-3 py-2 border-b border-slate-800">
                      Hire date
                    </th>
                    <th className="text-left px-3 py-2 border-b border-slate-800">
                      DOB
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-950/40">
                      <td className="px-3 py-2 border-b border-slate-900">
                        {emp.employee_code}
                      </td>
                      <td className="px-3 py-2 border-b border-slate-900">
                        {emp.name}
                      </td>
                      <td className="px-3 py-2 border-b border-slate-900">
                        {emp.department || '—'}
                      </td>
                      <td className="px-3 py-2 border-b border-slate-900">
                        {emp.job_role || '—'}
                      </td>
                      <td className="px-3 py-2 border-b border-slate-900">
                        {emp.salary != null
                          ? `$${emp.salary.toLocaleString()}`
                          : '—'}
                      </td>
                      <td className="px-3 py-2 border-b border-slate-900">
                        {emp.date_of_hire
                          ? new Date(emp.date_of_hire).toLocaleDateString()
                          : '—'}
                      </td>
                      <td className="px-3 py-2 border-b border-slate-900">
                        {emp.date_of_birth
                          ? new Date(emp.date_of_birth).toLocaleDateString()
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}