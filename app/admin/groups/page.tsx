'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useCurrentUserProfile } from '@/lib/useCurrentUserProfile';

type Group = { id: string; name: string };
type User = { id: string; full_name: string | null; role: string };
type Membership = { user_id: string; group_id: string };

export default function AdminGroupsPage() {
  const { profile, loading: profileLoading } = useCurrentUserProfile();
  const router = useRouter();

  const [groups, setGroups] = useState<Group[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);

  const [newGroupName, setNewGroupName] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // load data + protect route
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

    const load = async () => {
      const [{ data: groupData }, { data: userData }, { data: membershipData }] =
        await Promise.all([
          supabase.from('groups').select('id, name').order('name'),
          supabase.from('profiles').select('id, full_name, role'),
          supabase.from('user_groups').select('user_id, group_id'),
        ]);

      if (groupData) setGroups(groupData);
      if (userData) setUsers(userData);
      if (membershipData) setMemberships(membershipData);

      setLoading(false);
    };

    load();
  }, [profile, profileLoading, router]);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!newGroupName.trim()) {
      setErrorMsg('Group name is required.');
      return;
    }

    setSaving(true);

    const { data, error } = await supabase
      .from('groups')
      .insert({ name: newGroupName.trim() })
      .select('id, name')
      .single();

    if (error) {
      console.error('Error creating group', error);
      setErrorMsg('Failed to create group.');
      setSaving(false);
      return;
    }

    if (data) {
      setGroups((prev) => [...prev, data]);
      setNewGroupName('');
    }

    setSaving(false);
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedGroupId || !selectedUserId) {
      setErrorMsg('Select both a group and a user.');
      return;
    }

    const alreadyMember = memberships.some(
      (m) => m.group_id === selectedGroupId && m.user_id === selectedUserId
    );
    if (alreadyMember) {
      setErrorMsg('User is already in this group.');
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from('user_groups')
      .insert({ group_id: selectedGroupId, user_id: selectedUserId });

    if (error) {
      console.error('Error adding member', error);
      setErrorMsg('Failed to add member.');
      setSaving(false);
      return;
    }

    setMemberships((prev) => [
      ...prev,
      { group_id: selectedGroupId, user_id: selectedUserId },
    ]);
    setSelectedUserId('');
    setSaving(false);
  };

  const handleRemoveMember = async (groupId: string, userId: string) => {
    setSaving(true);
    const { error } = await supabase
      .from('user_groups')
      .delete()
      .match({ group_id: groupId, user_id: userId });

    if (error) {
      console.error('Error removing member', error);
      setSaving(false);
      return;
    }

    setMemberships((prev) =>
      prev.filter(
        (m) => !(m.group_id === groupId && m.user_id === userId)
      )
    );
    setSaving(false);
  };

  if (profileLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <p>Loading groups…</p>
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
            <h1 className="text-3xl font-bold">Groups</h1>
            <p className="text-sm text-slate-300">
              Logged in as{' '}
              <span className="font-semibold">
                {profile?.full_name || 'Admin'}
              </span>
              . Organize staff into teams like Front Desk, Nursing, or Billing.
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
              className="rounded-full bg-slate-900/60 border border-slate-700 px-3 py-1 text-slate-200 hover:border-slate-500"
            >
              Employees
            </a>
            <a
              href="/admin/groups"
              className="rounded-full bg-slate-900/80 border border-blue-500/50 px-3 py-1 font-medium text-blue-200"
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

        {/* Create group */}
        <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl shadow-slate-950/50">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-semibold">Create new group</h2>
              <p className="text-xs text-slate-400">
                Group staff into logical teams so you can assign tasks to a
                whole unit at once.
              </p>
            </div>
            <span className="hidden sm:inline-flex items-center rounded-full bg-purple-500/10 px-3 py-0.5 text-[11px] font-semibold text-purple-300 border border-purple-500/40">
              Team structure
            </span>
          </div>

          {errorMsg && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/40 rounded-lg px-3 py-2">
              {errorMsg}
            </p>
          )}

          <form
            onSubmit={handleCreateGroup}
            className="flex flex-col sm:flex-row gap-3"
          >
            <input
              className="flex-1 rounded-xl border border-slate-700 bg-slate-950/70 text-slate-50 px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Group name (e.g., Front Desk, Nurses, Billing)"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
            />
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold shadow-md shadow-blue-600/30 hover:bg-blue-500 disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Create group'}
            </button>
          </form>
        </section>

        {/* Add member */}
        <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl shadow-slate-950/40">
          <h2 className="text-xl font-semibold">Add user to group</h2>
          <p className="text-xs text-slate-400">
            Choose a group and assign staff to it. A user can belong to multiple
            groups (for example, Front Desk and Billing).
          </p>

          <form
            onSubmit={handleAddMember}
            className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end"
          >
            <div>
              <label className="block text-xs mb-1 text-slate-200">
                Group
              </label>
              <select
                className="w-full rounded-xl border border-slate-700 bg-slate-950/70 text-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
              >
                <option value="">Select group…</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs mb-1 text-slate-200">
                User
              </label>
              <select
                className="w-full rounded-xl border border-slate-700 bg-slate-950/70 text-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                <option value="">Select user…</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name || u.id}{' '}
                    {u.role === 'admin' ? '(admin)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <button
                type="submit"
                disabled={saving}
                className="w-full px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold shadow-md shadow-blue-600/30 hover:bg-blue-500 disabled:opacity-60"
              >
                {saving ? 'Adding…' : 'Add to group'}
              </button>
            </div>
          </form>
        </section>

        {/* Group list with members */}
        <section className="bg-slate-900/70 border border-slate-800 rounded-3xl p-5 space-y-3">
          <h2 className="text-xl font-semibold mb-1">
            Groups &amp; members
          </h2>
          <p className="text-xs text-slate-400 mb-3">
            A quick overview of each team and who belongs to it. Removing a
            member does not delete their user or tasks—only the group link.
          </p>

          {groups.length === 0 ? (
            <p className="text-sm text-slate-400">
              No groups yet. Create a group above to get started.
            </p>
          ) : (
            <div className="space-y-3">
              {groups.map((group) => {
                const groupMembers = memberships
                  .filter((m) => m.group_id === group.id)
                  .map((m) => users.find((u) => u.id === m.user_id))
                  .filter(Boolean) as User[];

                return (
                  <div
                    key={group.id}
                    className="border border-slate-800 rounded-2xl px-4 py-3 bg-slate-950/70"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-slate-50">
                        {group.name}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {groupMembers.length} member
                        {groupMembers.length === 1 ? '' : 's'}
                      </p>
                    </div>

                    {groupMembers.length === 0 ? (
                      <p className="text-xs text-slate-500">
                        No members yet. Use &quot;Add user to group&quot; above
                        to assign staff.
                      </p>
                    ) : (
                      <ul className="flex flex-wrap gap-2 text-xs">
                        {groupMembers.map((member) => (
                          <li
                            key={member.id}
                            className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-full px-3 py-1"
                          >
                            <span className="text-slate-100">
                              {member.full_name || member.id}{' '}
                              {member.role === 'admin' ? '(admin)' : ''}
                            </span>
                            <button
                              type="button"
                              disabled={saving}
                              className="text-red-400 hover:text-red-300"
                              onClick={() =>
                                handleRemoveMember(group.id, member.id)
                              }
                            >
                              ✕
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}