import { useState, useMemo, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Settings2, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const tabsListRef = useRef<HTMLDivElement>(null);

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

  // Check scroll position
  const checkScroll = () => {
    const element = tabsListRef.current;
    if (element) {
      setCanScrollLeft(element.scrollLeft > 0);
      setCanScrollRight(element.scrollLeft < element.scrollWidth - element.clientWidth - 1);
    }
  };

  // Handle scroll navigation
  const scrollTabs = (direction: 'left' | 'right') => {
    const element = tabsListRef.current;
    if (element) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      element.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Monitor scroll position
  useEffect(() => {
    const element = tabsListRef.current;
    if (element) {
      checkScroll();
      element.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        element.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [resolvedTabs]);

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
        <div className="relative">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Settings2 className="h-5 w-5 text-blue-500 opacity-50" />
          </div>
        </div>
        <p className="mt-4 text-sm font-medium text-gray-600 dark:text-gray-400">Loading patient tabs...</p>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">Setting up your workspace</p>
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
        <div className="relative mb-6">
          {/* Tab List Container with Scroll */}
          <div className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950 border-2 border-blue-200/60 dark:border-blue-800/60 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 shadow-lg sm:shadow-2xl backdrop-blur-lg ring-1 ring-blue-100/50 dark:ring-blue-900/50">
            <TabsList ref={tabsListRef} className="inline-flex w-full h-auto min-h-[70px] sm:min-h-[80px] items-start justify-start gap-2 bg-transparent p-0 overflow-x-auto scrollbar-thin scroll-smooth">
              {resolvedTabs.map((tab) => {
                const IconComponent = SYSTEM_TAB_REGISTRY[tab.key]?.icon || getTabIcon(tab.icon);

                return (
                  <TabsTrigger
                    key={tab.key}
                    value={tab.key}
                    className="flex-shrink-0 flex flex-col items-center justify-center gap-1.5 sm:gap-2 min-w-[90px] sm:min-w-[110px] max-w-[120px] sm:max-w-[140px] text-[11px] sm:text-xs font-semibold px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-300 ease-out data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-xl data-[state=active]:text-blue-900 dark:data-[state=active]:text-blue-100 data-[state=active]:border-2 data-[state=active]:border-blue-500 dark:data-[state=active]:border-blue-600 data-[state=active]:scale-[1.05] data-[state=active]:ring-2 data-[state=active]:ring-blue-200/50 dark:data-[state=active]:ring-blue-800/50 hover:bg-white/80 dark:hover:bg-gray-800/80 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] text-blue-800 dark:text-blue-200 bg-white/50 dark:bg-gray-800/50 border border-blue-200/40 dark:border-blue-800/40 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    data-testid={`tab-${tab.key}`}
                    title={tab.label}
                  >
                    <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 group-data-[state=active]:w-[22px] group-data-[state=active]:h-[22px] sm:group-data-[state=active]:w-[26px] sm:group-data-[state=active]:h-[26px] flex-shrink-0 group-data-[state=active]:text-blue-600 dark:group-data-[state=active]:text-blue-400 transition-all duration-300" />
                    <span className="font-semibold group-data-[state=active]:font-bold truncate w-full text-center leading-tight">{tab.label}</span>
                    {!tab.isSystemDefault && (
                      <span className="text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded whitespace-nowrap">
                        Custom
                      </span>
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* Scroll Navigation - Left */}
            {canScrollLeft && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => scrollTabs('left')}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 backdrop-blur-sm shadow-lg rounded-full w-8 h-8 p-0"
                title="Scroll Left"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}

            {/* Scroll Navigation - Right */}
            {canScrollRight && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => scrollTabs('right')}
                className="absolute right-12 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 backdrop-blur-sm shadow-lg rounded-full w-8 h-8 p-0"
                title="Scroll Right"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            )}

            {/* Manage Tabs Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTabManager(true)}
              className="absolute top-2 right-2 z-10 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 backdrop-blur-sm shadow-md group"
              title="Manage Tabs"
              data-testid="open-tab-manager"
            >
              <Settings2 className="h-4 w-4 sm:h-5 sm:w-5" />
              {resolvedTabs.length > 8 && (
                <span className="ml-1.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/50 px-1.5 py-0.5 rounded">
                  {resolvedTabs.length}
                </span>
              )}
            </Button>

            {/* Scroll Indicator - Left */}
            {canScrollLeft && (
              <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-slate-50 via-blue-50/80 dark:from-slate-900 dark:via-blue-950/80 to-transparent pointer-events-none rounded-l-2xl" />
            )}

            {/* Scroll Indicator - Right */}
            {canScrollRight && (
              <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-indigo-50 via-blue-50/80 dark:from-indigo-950 dark:via-blue-950/80 to-transparent pointer-events-none rounded-r-2xl" />
            )}
          </div>

          {/* Keyboard Navigation Hint */}
          <div className="text-[10px] sm:text-xs text-center mt-2 text-gray-500 dark:text-gray-400">
            <span className="hidden sm:inline">
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600">←</kbd>
              {' '}
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600">→</kbd>
              {' '}
              Navigate tabs •{' '}
            </span>
            <span className="inline sm:hidden">👆 Swipe •{' '}</span>
            Scroll horizontally for more {resolvedTabs.length > 6 && `(${resolvedTabs.length} tabs)`}
          </div>
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
