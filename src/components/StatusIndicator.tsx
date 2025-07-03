
import { Circle, Loader2 } from 'lucide-react';

interface StatusIndicatorProps {
  isActive: boolean;
  isProcessing: boolean;
}

const StatusIndicator = ({ isActive, isProcessing }: StatusIndicatorProps) => {
  if (!isActive) {
    return (
      <div className="flex items-center gap-2 text-slate-400">
        <Circle className="h-3 w-3 fill-slate-600" />
        <span className="text-sm">Inactive</span>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="flex items-center gap-2 text-yellow-400">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span className="text-sm">Processing...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-green-400">
      <Circle className="h-3 w-3 fill-green-500 animate-pulse" />
      <span className="text-sm">Live</span>
    </div>
  );
};

export default StatusIndicator;
