'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Play, Pause, Square, RefreshCw, Volume2, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function VoiceRecorder({ voice, onAnswerChange }) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const {
    hasPermission,
    isRecording,
    isListening,
    transcript,
    interimTranscript,
    confidence,
    audioUrl,
    recordingDuration,
    audioLevel,
    requestPermission,
    startRecording,
    stopRecording,
    resetVoiceState,
    setTranscript,
  } = voice;

  const handleToggleRecording = async () => {
    if (isRecording) {
      stopRecording();
      if (transcript && onAnswerChange) {
        onAnswerChange(transcript);
      }
    } else {
      if (hasPermission === false || hasPermission === null) {
        const granted = await requestPermission();
        if (!granted) return;
      }
      startRecording();
    }
  };

  const handleClear = () => {
    resetVoiceState();
    if (onAnswerChange) onAnswerChange('');
  };

  const formatDuration = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-xl">
      <CardContent className="p-6 space-y-6">
        {/* Header Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-violet-500/30 text-violet-500 bg-violet-500/10">
              <Mic className="mr-1.5 h-3.5 w-3.5" /> Speech & Voice Engine
            </Badge>
            {confidence > 0 && (
              <Badge variant="secondary" className="text-xs">
                Confidence: {Math.round(confidence * 100)}%
              </Badge>
            )}
          </div>

          <div className="text-sm font-mono text-muted-foreground">
            {isRecording ? (
              <span className="text-red-500 font-semibold animate-pulse flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500" /> REC {formatDuration(recordingDuration)}
              </span>
            ) : (
              <span>Duration: {formatDuration(recordingDuration)}</span>
            )}
          </div>
        </div>

        {/* VAD Animated Waveform */}
        <div className="h-20 bg-muted/40 rounded-xl border border-border/40 flex items-center justify-center gap-1.5 px-4 overflow-hidden relative">
          {isRecording ? (
            Array.from({ length: 24 }).map((_, i) => {
              // Dynamic height based on audio level and index pattern
              const heightMultiplier = ((i % 5) + 1) / 5;
              const pseudoRandomOffset = (i * 17) % 8;
              const barHeight = Math.max(12, Math.min(64, audioLevel * 0.6 * heightMultiplier + pseudoRandomOffset));
              return (
                <motion.div
                  key={i}
                  animate={{ height: barHeight }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="w-1.5 rounded-full bg-gradient-to-t from-violet-600 to-indigo-400"
                />
              );
            })
          ) : (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Volume2 className="h-4 w-4" />
              <span>Press &apos;Start Voice Recording&apos; to capture spoken response</span>
            </div>
          )}
        </div>

        {/* Live Transcription Display */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
            <span>Live Speech Transcript</span>
            {transcript && (
              <button onClick={handleClear} className="text-xs text-violet-500 hover:underline flex items-center gap-1">
                <RefreshCw className="h-3 w-3" /> Clear Transcript
              </button>
            )}
          </label>
          <div className="min-h-24 max-h-48 overflow-y-auto p-4 rounded-xl bg-muted/20 border border-border/50 text-sm leading-relaxed text-foreground">
            {transcript || interimTranscript ? (
              <p>
                {transcript}
                {interimTranscript && <span className="text-muted-foreground italic"> {interimTranscript}</span>}
              </p>
            ) : (
              <p className="text-muted-foreground italic">Your spoken transcript will appear here automatically in real time...</p>
            )}
          </div>
        </div>

        {/* Audio Player Preview */}
        {audioUrl && !isRecording && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-violet-500/10 border border-violet-500/20">
            <div className="flex items-center gap-3">
              <audio src={audioUrl} id="voice-playback-audio" onEnded={() => setIsPlayingAudio(false)} />
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 rounded-full p-0"
                onClick={() => {
                  const el = document.getElementById('voice-playback-audio');
                  if (el) {
                    if (isPlayingAudio) {
                      el.pause();
                      setIsPlayingAudio(false);
                    } else {
                      el.play();
                      setIsPlayingAudio(true);
                    }
                  }
                }}
              >
                {isPlayingAudio ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
              </Button>
              <span className="text-xs font-medium text-violet-600">Voice Recording Playback</span>
            </div>
            <Badge variant="outline" className="text-[10px]">
              Ready for submission
            </Badge>
          </div>
        )}

        {/* Mic Permission Warning */}
        {hasPermission === false && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Microphone access is blocked in browser settings. Please enable microphone permission to use voice features.</span>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <Button
            onClick={handleToggleRecording}
            variant={isRecording ? 'destructive' : 'default'}
            className={isRecording ? 'animate-pulse' : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white'}
          >
            {isRecording ? (
              <>
                <Square className="mr-2 h-4 w-4" /> Stop Recording
              </>
            ) : (
              <>
                <Mic className="mr-2 h-4 w-4" /> Start Voice Answer
              </>
            )}
          </Button>

          {transcript && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (onAnswerChange) onAnswerChange(transcript);
              }}
            >
              <Sparkles className="mr-2 h-4 w-4 text-violet-500" /> Apply Transcript to Answer
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
