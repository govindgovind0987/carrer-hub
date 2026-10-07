'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Play, Pause, Square, RefreshCw, Volume2, Sparkles, AlertCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function VoiceRecorder({ voice, onAnswerChange }) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [applied, setApplied] = useState(false);

  const {
    isSupported,
    hasPermission,
    permissionError,
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
    clearTranscript,
  } = voice;

  const lastSyncedTranscriptRef = useRef('');

  // Sync transcript to answer box continuously when speech is transcribed
  useEffect(() => {
    if (transcript && transcript !== lastSyncedTranscriptRef.current) {
      lastSyncedTranscriptRef.current = transcript;
      onAnswerChange?.(transcript);
    }
  }, [transcript, onAnswerChange]);

  const handleToggleRecording = async () => {
    if (isRecording) {
      stopRecording();
      if (transcript && transcript !== lastSyncedTranscriptRef.current) {
        lastSyncedTranscriptRef.current = transcript;
        onAnswerChange?.(transcript);
      }
    } else {
      if (hasPermission === false || hasPermission === null) {
        const granted = await requestPermission();
        if (!granted) return;
      }
      await startRecording();
    }
  };

  const handleClear = () => {
    lastSyncedTranscriptRef.current = '';
    clearTranscript();
    resetVoiceState();
    if (onAnswerChange) onAnswerChange('');
  };

  const handleApply = () => {
    if (transcript && onAnswerChange) {
      onAnswerChange(transcript);
      setApplied(true);
      setTimeout(() => setApplied(false), 2000);
    }
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
            <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10">
              <Mic className="mr-1.5 h-3.5 w-3.5" /> Speech & Voice Engine
            </Badge>
            {confidence > 0 && isRecording && (
              <Badge variant="secondary" className="text-xs">
                Confidence: {Math.round(confidence * 100)}%
              </Badge>
            )}
          </div>

          <div className="text-sm font-mono text-muted-foreground">
            {isRecording ? (
              <span className="text-red-500 font-semibold animate-pulse flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" /> REC {formatDuration(recordingDuration)}
              </span>
            ) : (
              <span>Duration: {formatDuration(recordingDuration)}</span>
            )}
          </div>
        </div>

        {/* Browser Support Warning */}
        {!isSupported && (
          <div className="p-3 rounded-md bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Voice speech recognition is not supported in this browser. Please use Chrome, Edge, or type your answer manually.</span>
          </div>
        )}

        {/* Mic Permission Warning */}
        {hasPermission === false && (
          <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{permissionError || 'Microphone access is blocked in browser settings. Please enable microphone permission to record.'}</span>
          </div>
        )}

        {/* VAD Animated Waveform */}
        <div className="h-20 bg-muted/40 rounded-md border border-border/40 flex items-center justify-center gap-1.5 px-4 overflow-hidden relative">
          {isRecording ? (
            Array.from({ length: 28 }).map((_, i) => {
              const heightMultiplier = ((i % 5) + 1) / 5;
              const pseudoRandomOffset = (i * 17) % 8;
              const barHeight = Math.max(10, Math.min(68, audioLevel * 0.65 * heightMultiplier + pseudoRandomOffset));
              return (
                <motion.div
                  key={i}
                  animate={{ height: barHeight }}
                  transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                  className="w-1.5 rounded-full bg-primary"
                />
              );
            })
          ) : (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Volume2 className="h-4 w-4" />
              <span>Click &apos;Start Voice Answer&apos; to speak naturally into your microphone</span>
            </div>
          )}
        </div>

        {/* Live Transcription Display */}
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              Live Speech Transcript {isRecording && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />}
            </span>
            {transcript && (
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="h-3 w-3" /> Clear Transcript
              </button>
            )}
          </div>
          <div className="min-h-24 max-h-48 overflow-y-auto p-4 rounded-md bg-muted/20 border border-border/50 text-sm leading-relaxed text-foreground">
            {transcript || interimTranscript ? (
              <p className="whitespace-pre-wrap">
                {transcript}
                {interimTranscript && <span className="text-muted-foreground italic"> {interimTranscript}</span>}
              </p>
            ) : (
              <p className="text-muted-foreground italic">
                {isRecording ? 'Listening... start speaking your answer now.' : 'Your spoken words will transcribe here in real-time.'}
              </p>
            )}
          </div>
        </div>

        {/* Audio Player Preview */}
        {audioUrl && !isRecording && (
          <div className="flex items-center justify-between p-3 rounded-md bg-primary/10 border border-primary/20">
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
              <span className="text-xs font-medium text-primary">Recording Playback ({formatDuration(recordingDuration)})</span>
            </div>
            <Badge variant="outline" className="text-[10px]">
              Ready for submission
            </Badge>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/40">
          <Button
            type="button"
            onClick={handleToggleRecording}
            variant={isRecording ? 'destructive' : 'default'}
            className={isRecording ? 'animate-pulse' : 'bg-primary text-primary-foreground'}
            disabled={!isSupported}
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
              type="button"
              variant="outline"
              size="sm"
              onClick={handleApply}
              className="text-xs"
            >
              {applied ? (
                <>
                  <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-500" /> Synced to Answer Box
                </>
              ) : (
                <>
                  <Sparkles className="mr-1.5 h-3.5 w-3.5 text-primary" /> Sync Transcript to Answer Box
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
