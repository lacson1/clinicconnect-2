import { useState } from "react";
import { Search, Command } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QuickMedicationSearch } from "./quick-medication-search";
import { useToast } from "@/hooks/use-toast";

interface Medication {
  id: number;
  name: string;
  genericName?: string | null;
  brandName?: string | null;
  category?: string | null;
  dosageForm?: string | null;
  strength?: string | null;
  manufacturer?: string | null;
  description?: string | null;
  isActive?: boolean | null;
}

export function GlobalQuickSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleMedicationSelect = (medication: Medication) => {
    // Show medication details in a toast
    toast({
      title: "Medication Found",
      description: `${medication.name} - ${medication.category || 'Medication'} ${medication.dosageForm ? `(${medication.dosageForm})` : ''}`,
      duration: 3000,
    });
    
    // Close the search dialog
    setIsOpen(false);
    
    // Could add navigation to medication details page here
    // navigate(`/medications/${medication.id}`);
  };

  // Keyboard shortcut to open search
  useState(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="hidden md:flex items-center gap-2 text-gray-500 hover:text-gray-700 border-gray-200 hover:border-gray-300"
      >
        <Search className="h-4 w-4" />
        <span className="text-sm">Search medications...</span>
        <div className="flex items-center gap-1 ml-2">
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <Command className="h-3 w-3" />K
          </kbd>
        </div>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2"
      >
        <Search className="h-4 w-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-blue-500" />
              Quick Medication Search
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <QuickMedicationSearch
              onSelect={handleMedicationSelect}
              placeholder="Type to search medications by name, category, or description..."
              showDetails={true}
              autoFocus={true}
              className="w-full"
            />
            
            <div className="text-sm text-gray-500 space-y-1">
              <p>💡 <strong>Tips:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Search by medication name, generic name, or brand name</li>
                <li>Filter by category (e.g., "antibiotic", "analgesic")</li>
                <li>Use arrow keys to navigate results</li>
                <li>Press Enter to select or Escape to close</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}