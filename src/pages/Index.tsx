
import { useState, useRef, useEffect } from 'react';
import { Camera, Mic, MicOff, Play, Pause, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import CameraFeed from '@/components/CameraFeed';
import CaptionDisplay from '@/components/CaptionDisplay';
import SpeechControls from '@/components/SpeechControls';
import StatusIndicator from '@/components/StatusIndicator';

const Index = () => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [currentCaption, setCurrentCaption] = useState("");
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const handleStartCapturing = async () => {
    try {
      setIsCapturing(true);
      setCameraError(null);
      toast({
        title: "Live Captioning Started",
        description: "Camera feed is now active and generating captions",
      });
    } catch (error) {
      console.error("Error starting capture:", error);
      setCameraError("Failed to start camera");
      setIsCapturing(false);
    }
  };

  const handleStopCapturing = () => {
    setIsCapturing(false);
    setCurrentCaption("");
    toast({
      title: "Live Captioning Stopped",
      description: "Camera feed has been stopped",
    });
  };

  const handleCaptionUpdate = (caption: string) => {
    console.log("New caption received:", caption);
    setCurrentCaption(caption);
  };

  const handleProcessingStateChange = (processing: boolean) => {
    setIsProcessing(processing);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">
            Live Vision Captioning
          </h1>
          <p className="text-gray-600 text-lg">
            Real-time visual understanding with AI-powered speech synthesis
          </p>
        </div>

        {/* Main Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Camera Feed - Takes up 2 columns on large screens */}
          <div className="lg:col-span-2">
            <Card className="p-6 bg-white rounded-2xl shadow-md border border-gray-200">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-medium text-gray-800 flex items-center gap-2">
                    <Camera className="h-5 w-5 text-blue-600" />
                    Live Camera Feed
                  </h2>
                  <StatusIndicator 
                    isActive={isCapturing} 
                    isProcessing={isProcessing} 
                  />
                </div>

                <CameraFeed
                  isCapturing={isCapturing}
                  onCaptionUpdate={handleCaptionUpdate}
                  onProcessingStateChange={handleProcessingStateChange}
                  onError={setCameraError}
                />

                {cameraError && (
                  <div className="text-sm text-red-700 bg-red-100 p-3 rounded-lg border border-red-300">
                    {cameraError}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Controls Panel */}
          <div className="space-y-6">
            {/* Control Buttons */}
            <Card className="p-6 bg-white rounded-2xl shadow-md border border-gray-200">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Controls</h3>
              <div className="space-y-3">
                {!isCapturing ? (
                  <Button
                    onClick={handleStartCapturing}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow"
                    size="lg"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Live Captioning
                  </Button>
                ) : (
                  <Button
                    onClick={handleStopCapturing}
                    className="w-full bg-red-600 hover:bg-red-700 text-white rounded-lg shadow"
                    size="lg"
                  >
                    <Pause className="h-4 w-4 mr-2" />
                    Stop Captioning
                  </Button>
                )}

                {/* <Button
                  variant="outline"
                  className="w-full border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button> */}
              </div>
            </Card>

            {/* Speech Controls */}
            <SpeechControls
              enabled={speechEnabled}
              onToggle={setSpeechEnabled}
              currentCaption={currentCaption}
            />
          </div>
        </div>

        {/* Caption Display */}
        <CaptionDisplay 
          caption={currentCaption}
          isActive={isCapturing}
        />
      </div>
    </div>
  );
};

export default Index;
