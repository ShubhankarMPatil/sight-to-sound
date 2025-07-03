
import { Card } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

interface CaptionDisplayProps {
  caption: string;
  isActive: boolean;
}

const CaptionDisplay = ({ caption, isActive }: CaptionDisplayProps) => {
  return (
    <Card className="p-6 bg-white rounded-2xl shadow-md border border-gray-200">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-blue-600 rounded-md flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-white" />
          </div>
        </div>

        <div className="flex-1 min-h-[4rem]">
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            Live Caption
          </h3>

          {isActive ? (
            <div className="bg-gray-100 rounded-lg p-4 min-h-[3rem] flex items-center">
              {caption ? (
                <p className="text-gray-700 text-base leading-relaxed">
                  {caption}
                </p>
              ) : (
                <div className="flex items-center gap-2 text-gray-500">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-200"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-400"></div>
                  </div>
                  <span>Analyzing visual content...</span>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4 min-h-[3rem] flex items-center justify-center border border-gray-200">
              <p className="text-gray-400 italic">
                Start live captioning to see AI-generated descriptions
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>

  );
};

export default CaptionDisplay;
