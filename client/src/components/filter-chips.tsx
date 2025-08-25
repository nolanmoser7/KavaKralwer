import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FilterChipsProps {
  onFiltersChange?: (filters: string[]) => void;
  className?: string;
}

const availableFilters = [
  { id: "open-now", label: "Open Now", color: "bg-coral text-white" },
  { id: "kava", label: "Kava", color: "bg-teal/10 text-teal" },
  { id: "kratom", label: "Kratom", color: "bg-tropical/10 text-tropical" },
  { id: "live-music", label: "Live Music", color: "bg-sunset/10 text-sunset" },
  { id: "chill-vibe", label: "Chill Vibe", color: "bg-bamboo/10 text-wood" },
  { id: "outdoor-seating", label: "Outdoor", color: "bg-gray-100 text-gray-700" },
  { id: "food", label: "Food Menu", color: "bg-gray-100 text-gray-700" },
  { id: "late-night", label: "Late Night", color: "bg-gray-100 text-gray-700" },
];

export default function FilterChips({ onFiltersChange, className }: FilterChipsProps) {
  const [activeFilters, setActiveFilters] = useState<string[]>(["open-now"]);

  const toggleFilter = (filterId: string) => {
    const newFilters = activeFilters.includes(filterId)
      ? activeFilters.filter(f => f !== filterId)
      : [...activeFilters, filterId];
    
    setActiveFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  return (
    <div className={cn("flex space-x-2 overflow-x-auto pb-2", className)}>
      {availableFilters.map((filter) => {
        const isActive = activeFilters.includes(filter.id);
        
        return (
          <Button
            key={filter.id}
            variant="ghost"
            size="sm"
            onClick={() => toggleFilter(filter.id)}
            className={cn(
              "chip-filter whitespace-nowrap transition-all duration-200 hover:scale-105",
              isActive ? filter.color : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
            data-testid={`filter-${filter.id}`}
          >
            {filter.label}
          </Button>
        );
      })}
    </div>
  );
}
