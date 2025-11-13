import { useQuery } from '@tanstack/react-query';

export interface TabConfig {
  id: number;
  key: string;
  label: string;
  icon: string;
  contentType: string;
  settings: Record<string, any>;
  displayOrder: number;
  isVisible: boolean;
  isSystemDefault: boolean;
  scope: string;
  isMandatory?: boolean;
  category?: string;
}

const FALLBACK_TABS: TabConfig[] = [
  { id: -1, key: 'overview', label: 'Overview', icon: 'LayoutGrid', contentType: 'builtin_component', settings: {}, displayOrder: 10, isVisible: true, isSystemDefault: true, scope: 'system' },
  { id: -2, key: 'visits', label: 'Visits', icon: 'Calendar', contentType: 'builtin_component', settings: {}, displayOrder: 20, isVisible: true, isSystemDefault: true, scope: 'system' },
  { id: -3, key: 'lab', label: 'Lab Results', icon: 'TestTube', contentType: 'builtin_component', settings: {}, displayOrder: 30, isVisible: true, isSystemDefault: true, scope: 'system' },
  { id: -4, key: 'medications', label: 'Medications', icon: 'Pill', contentType: 'builtin_component', settings: {}, displayOrder: 40, isVisible: true, isSystemDefault: true, scope: 'system' },
  { id: -5, key: 'vitals', label: 'Vitals', icon: 'Activity', contentType: 'builtin_component', settings: {}, displayOrder: 50, isVisible: true, isSystemDefault: true, scope: 'system' },
];

// Bidirectional key mapping
const SERVER_TO_UI_KEY_MAP: Record<string, string> = {
  'visits': 'record-visit',
  'lab': 'labs',
};

const UI_TO_SERVER_KEY_MAP: Record<string, string> = {
  'record-visit': 'visits',
  'labs': 'lab',
};

export function mapServerKeyToUiKey(serverKey: string): string {
  return SERVER_TO_UI_KEY_MAP[serverKey] || serverKey;
}

export function mapUiKeyToServerKey(uiKey: string): string {
  return UI_TO_SERVER_KEY_MAP[uiKey] || uiKey;
}

export function usePatientTabs() {
  const { data: tabs, isLoading, isError } = useQuery<TabConfig[]>({
    queryKey: ['/api/tab-configs'],
  });

  const effectiveTabs = (isError || !tabs || tabs.length === 0) ? FALLBACK_TABS : tabs;
  
  const visibleTabs = effectiveTabs
    .filter(tab => tab.isVisible)
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map(tab => ({
      ...tab,
      key: mapServerKeyToUiKey(tab.key),
    }));

  const defaultTabKey = visibleTabs.length > 0 ? visibleTabs[0].key : 'overview';

  return {
    tabs: visibleTabs,
    isLoading,
    isError,
    defaultTabKey,
    mapServerKeyToUiKey,
    mapUiKeyToServerKey,
  };
}
