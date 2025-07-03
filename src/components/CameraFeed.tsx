import { useRef, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Wifi } from 'lucide-react';

interface CameraFeedProps {
  isCapturing: boolean;
  ipWebcamUrl?: string; // Optional: e.g., 'http://192.168.1.100:8080/shot.jpg'
  onCaptionUpdate: (caption: string) => void;
  onProcessingStateChange: (processing: boolean) => void;
  onError: (error: string | null) => void;
}

const CameraFeed = ({
  isCapturing,
  ipWebcamUrl,
  onCaptionUpdate,
  onProcessingStateChange,
  onError,
}: CameraFeedProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const displayImageRef = useRef<HTMLImageElement>(null); // Separate ref for display
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [useIpCamera, setUseIpCamera] = useState(false);
  const [ipUrl, setIpUrl] = useState(ipWebcamUrl || '');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [lastImageUpdate, setLastImageUpdate] = useState(0);

  const generateCaption = async (imageData: string) => {
    onProcessingStateChange(true);

    try {
      const response = await fetch(imageData);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append('image', blob, 'frame.jpg');

      const apiResponse = await fetch('http://127.0.0.1:5000/generate-caption', {
        method: 'POST',
        body: formData,
      });

      if (!apiResponse.ok) {
        throw new Error(`API error: ${apiResponse.status}`);
      }

      const result = await apiResponse.json();
      const caption = result.caption || 'Unable to generate caption';
      onCaptionUpdate(caption);
    } catch (error) {
      console.error('Error generating caption:', error);
      onError('Failed to connect to caption generation service. Check backend.');
      onCaptionUpdate('Caption generation unavailable - check backend connection');
    } finally {
      onProcessingStateChange(false);
    }
  };

  const captureFrameFromIpCamera = async () => {
    if (!canvasRef.current || !ipUrl) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      // Create a fresh image element for capturing
      const captureImg = new Image();
      captureImg.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        captureImg.onload = () => {
          canvas.width = captureImg.naturalWidth;
          canvas.height = captureImg.naturalHeight;
          ctx.drawImage(captureImg, 0, 0);
          const imageData = canvas.toDataURL('image/jpeg', 0.8);
          generateCaption(imageData);
          resolve(void 0);
        };
        captureImg.onerror = reject;
        // Add timestamp to prevent caching
        captureImg.src = `${ipUrl}?capture=${Date.now()}`;
      });
    } catch (error) {
      console.error('Error capturing IP camera frame:', error);
      onError('Failed to capture frame from IP camera');
    }
  };

  const captureFrameFromWebcam = () => {
    if (!canvasRef.current || !videoRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const video = videoRef.current;
    
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    generateCaption(imageData);
  };

  const captureFrame = () => {
    if (useIpCamera) {
      captureFrameFromIpCamera();
    } else {
      captureFrameFromWebcam();
    }
  };

  // Handle integrated camera
  useEffect(() => {
    if (!isCapturing || useIpCamera) {
      // Stop existing stream if switching to IP camera or not capturing
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
      return;
    }

    navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'user',
      },
    })
      .then((mediaStream) => {
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
        }
      })
      .catch((error) => {
        console.error('Error accessing webcam:', error);
        onError('Webcam access denied or unavailable.');
      });

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
    };
  }, [isCapturing, useIpCamera]);

  // Handle IP camera display refresh (more frequent for smooth display)
  useEffect(() => {
    if (!useIpCamera || !ipUrl || !isCapturing) return;

    const refreshDisplay = () => {
      if (displayImageRef.current) {
        const timestamp = Date.now();
        displayImageRef.current.src = `${ipUrl}?display=${timestamp}`;
        setLastImageUpdate(timestamp);
      }
    };

    // Initial load
    refreshDisplay();

    // Refresh display every 200ms for smooth video-like experience
    const displayInterval = setInterval(refreshDisplay, 200);

    return () => clearInterval(displayInterval);
  }, [useIpCamera, ipUrl, isCapturing]);

  // Handle IP camera image loading events
  useEffect(() => {
    if (!useIpCamera || !displayImageRef.current) return;

    const img = displayImageRef.current;
    
    const handleLoad = () => setImageLoaded(true);
    const handleError = () => {
      setImageLoaded(false);
      onError('Failed to load IP camera image. Check URL and connection.');
    };

    img.addEventListener('load', handleLoad);
    img.addEventListener('error', handleError);

    return () => {
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
    };
  }, [useIpCamera]);

  // Capture frames for captioning (less frequent to avoid overloading)
  useEffect(() => {
    if (!isCapturing) return;

    const interval = setInterval(() => {
      captureFrame();
    }, 5000); // every 5 seconds for captioning

    return () => clearInterval(interval);
  }, [isCapturing, useIpCamera, ipUrl]);

  const handleCameraSwitch = () => {
    setUseIpCamera(!useIpCamera);
    setImageLoaded(false);
    onError(null); // Clear any existing errors
  };

  const handleIpUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIpUrl(e.target.value);
    setImageLoaded(false);
  };

  return (
    <div className="space-y-4">
      {/* Camera Controls */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Camera Source</h3>
          <Button
            variant={useIpCamera ? "default" : "outline"}
            size="sm"
            onClick={handleCameraSwitch}
            className="flex items-center gap-2"
          >
            {useIpCamera ? <Wifi className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
            {useIpCamera ? 'IP Camera' : 'Integrated Camera'}
          </Button>
        </div>

        {useIpCamera && (
          <div className="space-y-2">
            <label htmlFor="ipUrl" className="text-sm font-medium">
              IP Camera URL:
            </label>
            <input
              id="ipUrl"
              type="text"
              value={ipUrl}
              onChange={handleIpUrlChange}
              placeholder="http://192.168.1.100:8080/shot.jpg"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500">
              Enter the direct image URL from your IP camera
            </p>
          </div>
        )}
      </Card>

      {/* Camera Feed */}
      <Card className="p-2">
        {!useIpCamera ? (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full rounded" 
          />
        ) : (
          <div className="relative">
            <img
              ref={displayImageRef}
              alt="IP Webcam Stream"
              className={`w-full rounded ${imageLoaded ? 'block' : 'hidden'}`}
              style={{ 
                imageRendering: 'auto',
                maxWidth: '100%',
                height: 'auto'
              }}
            />
            {!imageLoaded && ipUrl && (
              <div className="flex items-center justify-center h-64 bg-gray-100 rounded">
                <div className="text-center">
                  <Wifi className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">Loading IP camera feed...</p>
                </div>
              </div>
            )}
            {!ipUrl && (
              <div className="flex items-center justify-center h-64 bg-gray-100 rounded">
                <div className="text-center">
                  <Wifi className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">Enter IP camera URL above</p>
                </div>
              </div>
            )}
          </div>
        )}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </Card>
    </div>
  );
};

export default CameraFeed;