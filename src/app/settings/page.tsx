'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/providers/theme-provider';
import { Save, User, Monitor, RefreshCw, FlaskConical } from 'lucide-react';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [refreshInterval, setRefreshInterval] = useState('30');
  const [operatorName, setOperatorName] = useState('');
  const [testMode, setTestMode] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.fullName) setOperatorName(data.fullName);
      })
      .catch(() => {});

    const storedInterval = localStorage.getItem('gas-monitor-refresh');
    if (storedInterval) setRefreshInterval(storedInterval);
    const storedTestMode = localStorage.getItem('gas-monitor-testmode');
    if (storedTestMode !== null) setTestMode(storedTestMode === 'true');
  }, []);

  const handleSave = () => {
    localStorage.setItem('gas-monitor-refresh', refreshInterval);
    localStorage.setItem('gas-monitor-testmode', String(testMode));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <Header title="Настройки" subtitle="Параметры системы мониторинга" />
      <div className="p-6 space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Monitor className="h-5 w-5 text-zinc-500" />
              <div><CardTitle>Тема интерфейса</CardTitle><CardDescription>Выберите цветовую схему</CardDescription></div>
            </div>
          </CardHeader>
          <CardContent>
            <Select value={theme} onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')} className="w-full">
              <option value="light">Светлая тема</option>
              <option value="dark">Тёмная тема</option>
              <option value="system">Системная</option>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <RefreshCw className="h-5 w-5 text-zinc-500" />
              <div><CardTitle>Интервал обновления</CardTitle><CardDescription>Частота обновления данных на дашборде</CardDescription></div>
            </div>
          </CardHeader>
          <CardContent>
            <Select value={refreshInterval} onChange={(e) => setRefreshInterval(e.target.value)} className="w-full">
              <option value="10">10 секунд</option>
              <option value="30">30 секунд</option>
              <option value="60">1 минута</option>
              <option value="300">5 минут</option>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-zinc-500" />
              <div><CardTitle>Профиль оператора</CardTitle><CardDescription>Имя оператора для отчётов</CardDescription></div>
            </div>
          </CardHeader>
          <CardContent>
            <Input value={operatorName} onChange={(e) => setOperatorName(e.target.value)} placeholder="ФИО оператора" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <FlaskConical className="h-5 w-5 text-zinc-500" />
              <div><CardTitle>Тестовый режим</CardTitle><CardDescription>Использовать демонстрационные данные</CardDescription></div>
            </div>
          </CardHeader>
          <CardContent>
            <label className="flex items-center gap-3 cursor-pointer">
              <button
                onClick={() => setTestMode(!testMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${testMode ? 'bg-blue-600' : 'bg-zinc-300 dark:bg-zinc-600'}`}
              >
                <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${testMode ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              <span className="text-sm">{testMode ? 'Включён' : 'Выключен'}</span>
            </label>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <Button onClick={handleSave}><Save className="h-4 w-4" /> Сохранить настройки</Button>
          {saved && <span className="text-sm text-emerald-600 font-medium">Настройки сохранены</span>}
        </div>
      </div>
    </div>
  );
}
