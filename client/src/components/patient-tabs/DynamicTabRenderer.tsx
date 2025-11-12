import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Settings2 } from 'lucide-react';
import { SYSTEM_TAB_REGISTRY, TabRenderProps, getTabIcon } from './dynamic-tab-registry';
import { TabManager } from '../tab-manager';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

interface TabConfig {
  id: number;
  key: string;
  label: string;
  icon: string;
  contentType: string;
  settings: any;
  isVisible: boolean;
  isSystemDefault: boolean;
  displayOrder: number;
  scope: string;
}

interface DynamicTabRendererProps extends TabRenderProps {
  patient: any;
  defaultTab?: string;
}

export function DynamicTabRenderer({ patient, defaultTab = 'overview', ...props }: DynamicTabRendererProps) {
  const [showTabManager, setShowTabManager] = useState(false);

  // Fetch tab configurations from API
  const { data: tabConfigs, isLoading } = useQuery<TabConfig[]>({
    queryKey: ['/api/tab-configs'],
    retry: 1,
  });

  // Merge API configs with system registry
  // Fall back to registry defaults if API fails
  const resolvedTabs = tabConfigs 
    ? tabConfigs
        .filter(tab => tab.isVisible)
        .sort((a, b) => a.displayOrder - b.displayOrder)
    : Object.values(SYSTEM_TAB_REGISTRY).map((tab, index) => ({
        id: index,
        key: tab.key,
        label: tab.defaultLabel,
        icon: tab.icon.name,
        contentType: 'builtin_component',
        settings: {},
        isVisible: true,
        isSystemDefault: true,
        displayOrder: (index + 1) * 10,
        scope: 'system',
      }));

  // Sanitize and render markdown content safely
  function sanitizeMarkdown(markdown: string): string {
    try {
      // Convert markdown to HTML
      const rawHtml = marked.parse(markdown) as string;
      // Sanitize HTML to prevent XSS
      const cleanHtml = DOMPurify.sanitize(rawHtml, {
        ALLOWED_TAGS: [
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'p', 'br', 'ul', 'ol', 'li',
          'strong', 'em', 'code', 'pre',
          'blockquote', 'a', 'img',
          'table', 'thead', 'tbody', 'tr', 'th', 'td'
        ],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class'],
        ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
      });
      return cleanHtml;
    } catch (error) {
      console.error('Error sanitizing markdown:', error);
      return '<p>Error rendering content</p>';
    }
  }

  // Render tab content based on content type
  function renderTabContent(tab: TabConfig): JSX.Element {
    // Builtin component - use system registry
    if (tab.contentType === 'builtin_component' && SYSTEM_TAB_REGISTRY[tab.key]) {
      const systemTab = SYSTEM_TAB_REGISTRY[tab.key];
      return systemTab.render({ patient, ...props });
    }

    // Markdown content - sanitized
    if (tab.contentType === 'markdown') {
      const sanitizedHtml = sanitizeMarkdown(tab.settings?.markdown || '# No Content\n\nThis tab is empty.');
      return (
        <div className="p-4 prose dark:prose-invert max-w-none">
          <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
        </div>
      );
    }

    // iframe embed
    if (tab.contentType === 'iframe') {
      return (
        <div className="p-4">
          <iframe
            src={tab.settings?.url}
            title={tab.label}
            className="w-full h-96 border border-gray-200 dark:border-gray-700 rounded-lg"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      );
    }

    // Query widget (future implementation)
    if (tab.contentType === 'query_widget') {
      return (
        <div className="p-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-yellow-800 dark:text-yellow-200">
              Query widgets are coming soon!
            </p>
          </div>
        </div>
      );
    }

    // Fallback for unknown content types
    return (
      <div className="p-4">
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <p className="text-gray-600 dark:text-gray-400">
            Content type "{tab.contentType}" is not supported yet.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading tabs...</p>
      </div>
    );
  }

  if (resolvedTabs.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">No tabs configured.</p>
        <Button onClick={() => setShowTabManager(true)} className="mt-4">
          <Settings2 className="h-4 w-4 mr-2" />
          Configure Tabs
        </Button>
        <TabManager open={showTabManager} onOpenChange={setShowTabManager} />
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      <Tabs defaultValue={defaultTab} className="w-full">
        <div className="relative">
          {/* Tab List with Manage Button */}
          <TabsList className="grid w-full grid-cols-12 mb-8 h-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950 border-2 border-blue-200/60 dark:border-blue-800/60 rounded-2xl p-3 shadow-2xl backdrop-blur-lg ring-1 ring-blue-100/50 dark:ring-blue-900/50">
            {resolvedTabs.map((tab) => {
              const IconComponent = SYSTEM_TAB_REGISTRY[tab.key]?.icon || getTabIcon(tab.icon);
              
              return (
                <TabsTrigger
                  key={tab.key}
                  value={tab.key}
                  className="flex flex-col items-center gap-1.5 text-xs font-bold px-3 py-4 rounded-xl transition-all duration-300 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-xl data-[state=active]:text-blue-900 dark:data-[state=active]:text-blue-100 data-[state=active]:border-2 data-[state=active]:border-blue-300 dark:data-[state=active]:border-blue-600 data-[state=active]:scale-105 hover:bg-white/80 dark:hover:bg-gray-800/80 hover:shadow-lg hover:scale-102 text-blue-800 dark:text-blue-200 group"
                  data-testid={`tab-${tab.key}`}
                >
                  <IconComponent className="w-6 h-6 group-data-[state=active]:text-blue-600 dark:group-data-[state=active]:text-blue-400" />
                  <span className="font-semibold">{tab.label}</span>
                  {!tab.isSystemDefault && (
                    <span className="text-xs px-1 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded">
                      Custom
                    </span>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Manage Tabs Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTabManager(true)}
            className="absolute top-2 right-2 z-10"
            title="Manage Tabs"
            data-testid="open-tab-manager"
          >
            <Settings2 className="h-5 w-5" />
          </Button>
        </div>

        {/* Tab Contents */}
        {resolvedTabs.map((tab) => (
          <TabsContent key={tab.key} value={tab.key} className="mt-0">
            {renderTabContent(tab)}
          </TabsContent>
        ))}
      </Tabs>

      {/* Tab Manager Dialog */}
      <TabManager open={showTabManager} onOpenChange={setShowTabManager} />
    </div>
  );
}
