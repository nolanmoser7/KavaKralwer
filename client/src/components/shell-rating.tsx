import { cn } from "@/lib/utils";

interface ShellRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
}

export default function ShellRating({
  rating,
  maxRating = 5,
  size = "md",
  interactive = false,
  onRatingChange,
  className,
}: ShellRatingProps) {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const handleRatingClick = (newRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(newRating);
    }
  };

  return (
    <div 
      className={cn("shell-rating flex items-center", sizeClasses[size], className)}
      data-testid="shell-rating"
    >
      {Array.from({ length: maxRating }, (_, index) => {
        const shellNumber = index + 1;
        const isFilled = shellNumber <= Math.round(rating);
        
        return (
          <button
            key={index}
            type="button"
            className={cn(
              "transition-colors duration-200",
              interactive ? "cursor-pointer hover:scale-110 transform" : "cursor-default",
              isFilled ? "text-bamboo" : "text-gray-300"
            )}
            onClick={() => handleRatingClick(shellNumber)}
            disabled={!interactive}
            data-testid={`shell-${shellNumber}`}
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2L8.5 8H2l5.5 4.5L5 22l7-5 7 5-2.5-9.5L22 8h-6.5L12 2z" />
            </svg>
          </button>
        );
      })}
      
      {size !== "sm" && (
        <span 
          className="ml-2 text-sm text-gray-600"
          data-testid="rating-text"
        >
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
