
import { useState, useEffect } from 'react';
import { Volume2, VolumeX, Play, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import ElevenLabsService, { ElevenLabsVoice } from '@/services/elevenLabsService';

interface SpeechControlsProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  currentCaption: string;
}

const SpeechControls = ({ enabled, onToggle, currentCaption }: SpeechControlsProps) => {
  const [volume, setVolume] = useState([0.7]);
  const [selectedVoice, setSelectedVoice] = useState("9BWtsMINqrJLrRacOk9x"); // Aria by default
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [elevenLabsService, setElevenLabsService] = useState<ElevenLabsService | null>(null);
  const [availableVoices, setAvailableVoices] = useState<ElevenLabsVoice[]>([]);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  // Default ElevenLabs voices with their IDs
  const defaultVoices = [
    { voice_id: "9BWtsMINqrJLrRacOk9x", name: "Aria", category: "premade" },
    { voice_id: "CwhRBWXzGAHq8TQ4Fs17", name: "Roger", category: "premade" },
    { voice_id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah", category: "premade" },
    { voice_id: "IKne3meq5aSn9XLyUdCD", name: "Charlie", category: "premade" },
  ];

  useEffect(() => {
    // Initialize ElevenLabs service
    const apiKey = "sk_230890f86cf09816ba049f4f277916bd9e4d2f03eac18e72";
    const service = new ElevenLabsService(apiKey);
    setElevenLabsService(service);

    // Load available voices
    service.getVoices()
      .then(voices => {
        setAvailableVoices(voices);
      })
      .catch(error => {
        console.error("Failed to load ElevenLabs voices:", error);
        // Fallback to default voices
        setAvailableVoices(defaultVoices);
        toast({
          title: "Voice Loading Warning",
          description: "Using default voices. Some voices may not be available.",
          variant: "destructive",
        });
      });
  }, []);

  const handlePlayCaption = async () => {
    if (!currentCaption) {
      toast({
        title: "No Caption Available",
        description: "Wait for a caption to be generated first",
        variant: "destructive",
      });
      return;
    }

    if (!elevenLabsService) {
      toast({
        title: "Service Error",
        description: "ElevenLabs service not initialized",
        variant: "destructive",
      });
      return;
    }

    setIsSpeaking(true);
    
    try {
      // Stop any currently playing audio
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }

      // Generate speech using ElevenLabs
      const audioBuffer = await elevenLabsService.generateSpeech({
        text: currentCaption,
        voiceId: selectedVoice,
      });

      // Create audio blob and play it
      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.volume = volume[0];
      setCurrentAudio(audio);
      
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        setCurrentAudio(null);
      };
      
      audio.onerror = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        setCurrentAudio(null);
        toast({
          title: "Speech Error",
          description: "Failed to play speech audio",
          variant: "destructive",
        });
      };

      await audio.play();
      
      toast({
        title: "Playing Caption",
        description: "Speaking with ElevenLabs AI voice",
      });
      
    } catch (error) {
      console.error("ElevenLabs speech synthesis error:", error);
      setIsSpeaking(false);
      toast({
        title: "Speech Error",
        description: "Failed to generate speech with ElevenLabs",
        variant: "destructive",
      });
    }
  };

  const handleStopSpeech = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }
    setIsSpeaking(false);
  };

  // Auto-speak when caption changes and auto speech is enabled
  useEffect(() => {
    if (enabled && currentCaption && !isSpeaking) {
      handlePlayCaption();
    }
  }, [currentCaption, enabled]);

  return (
    <Card className="p-6 bg-white rounded-2xl shadow-md border border-gray-200">
      <h3 className="text-lg font-medium text-gray-800 mb-2">
        <Volume2 className="h-5 w-5" />
        ElevenLabs Speech Synthesis
      </h3>
      
      <div className="space-y-4">
        {/* Enable/Disable Speech */}
        <div className="flex items-center justify-between">
          <span className="text-gray-700 text-base leading-relaxed">Auto Speech</span>
          <Button
            variant={enabled ? "default" : "secondary"}
            size="sm"
            onClick={() => onToggle(!enabled)}
            className={enabled ? "bg-green-600 hover:bg-green-700" : ""}
          >
            {enabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
        </div>

        {/* Voice Selection */}
        <div className="space-y-2">
          <label className="text-sm text-gray-700">Voice</label>
          <Select value={selectedVoice} onValueChange={setSelectedVoice}>
            <SelectTrigger className="bg-white border-slate-600 text-gray-700">
              <SelectValue placeholder="Select voice" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-600">
              {availableVoices.map((voice) => (
                <SelectItem 
                  key={voice.voice_id} 
                  value={voice.voice_id}
                  className="text-gray-700 hover:bg-slate-700"
                >
                  <div>
                    <div className="font-medium">{voice.name}</div>
                    <div className="text-xs text-slate-400">{voice.category}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Volume Control */}
        <div className="space-y-2">
          <label className="text-sm text-gray-700">
            Volume ({Math.round(volume[0] * 100)}%)
          </label>
          <Slider
            value={volume}
            onValueChange={setVolume}
            max={1}
            min={0}
            step={0.1}
            className="w-full"
          />
        </div>

        {/* Manual Play Control */}
        <div className="space-y-2">
          <label className="text-sm text-gray-700">Manual Control</label>
          <div className="flex gap-2">
            {!isSpeaking ? (
              <Button
                onClick={handlePlayCaption}
                disabled={!currentCaption || !elevenLabsService}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                size="sm"
              >
                <Play className="h-4 w-4 mr-2" />
                Play Caption
              </Button>
            ) : (
              <Button
                onClick={handleStopSpeech}
                className="flex-1 bg-red-600 hover:bg-red-700"
                size="sm"
              >
                <VolumeX className="h-4 w-4 mr-2" />
                Stop
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SpeechControls;
