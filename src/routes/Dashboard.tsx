import { useEffect, useState } from 'react';
import { useSnapshotStore } from '@/stores/snapshotStore';
import { useUserStore } from '@/stores/userStore';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { NetWorthChart } from '@/components/chart/NetWorthChart';
import { SnapshotDetail } from '@/components/snapshot/SnapshotDetail';
import { SnapshotForm } from '@/components/snapshot/SnapshotForm';

export function Dashboard() {
  const { activeUser } = useUserStore();
  const snapshotStore = useSnapshotStore();
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    snapshotStore.fetch(activeUser);
  }, [activeUser]);

  const selectedSnapshot = snapshotStore.snapshots.find((s) => s._id === snapshotStore.selectedId) ?? null;

  const handleSave = async (date: string, assets: import('@/types').Asset[]) => {
    if (editMode && selectedSnapshot) {
      await snapshotStore.update(activeUser, selectedSnapshot._id, date, assets);
    } else {
      await snapshotStore.create(activeUser, date, assets);
    }
    setShowForm(false);
    setEditMode(false);
  };

  const handleEdit = () => {
    setEditMode(true);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!selectedSnapshot) return;
    await snapshotStore.remove(activeUser, selectedSnapshot._id);
  };

  return (
    <DashboardLayout
      left={
        <div>
          <NetWorthChart
            onSelect={() => {
              setShowForm(false);
              setEditMode(false);
            }}
          />
          <button
            onClick={() => {
              setEditMode(false);
              setShowForm(true);
            }}
            className="mt-4 px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors"
          >
            + Add Snapshot
          </button>
        </div>
      }
      right={
        showForm ? (
          <SnapshotForm
            snapshot={editMode ? selectedSnapshot : null}
            onSave={handleSave}
            onClose={() => {
              setShowForm(false);
              setEditMode(false);
            }}
          />
        ) : (
          <SnapshotDetail onEdit={handleEdit} onDelete={handleDelete} />
        )
      }
    />
  );
}
