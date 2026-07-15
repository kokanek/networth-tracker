import { useEffect } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import { useUserStore } from '@/stores/userStore';
import { GrowthRatesForm } from '@/components/settings/GrowthRatesForm';
import { AuthTokenForm } from '@/components/settings/AuthTokenForm';

export function Settings() {
  const { activeUser } = useUserStore();
  const { fetch } = useSettingsStore();

  useEffect(() => {
    fetch(activeUser);
  }, [activeUser]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Settings</h1>
      <AuthTokenForm />
      <GrowthRatesForm />
    </div>
  );
}
