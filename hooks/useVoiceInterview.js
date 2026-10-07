'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Robust Web Speech & Audio hook for live AI mock interviews.
 * Supports continuous transcription, pause/silence resilience, VAD waveform, and audio playback.
 */
export function useVoiceInterview() {
  const [isSupported, setIsSupported] = useState(true);
  const [hasPermission, setHasPermission] = useState(null); // true, false, null
  const [permissionError, setPermissionError] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Transcripts & Confidence
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [confidence, setConfidence] = useState(0.85);

  // Audio Playback & VAD visualizer levels
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0); // 0 - 100 for VAD animation

  // Web API References
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneStreamRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const vadAnimationRef = useRef(null);
  const isRecordingRef = useRef(false);

  // Check browser SpeechRecognition support on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      const timer = setTimeout(() => {
        setIsSupported(false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, []);

  /**
   * Request Microphone Permission & Setup VAD Analyser
   */
  const requestPermission = useCallback(async () => {
    if (typeof window === 'undefined') return false;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setHasPermission(false);
      setPermissionError('Audio input devices are not supported by this browser environment.');
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      microphoneStreamRef.current = stream;
      setHasPermission(true);
      setPermissionError(null);

      // Setup Web Audio API for Voice Activity Detection (VAD)
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        try {
          const audioCtx = new AudioCtx();
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 256;
          const source = audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);

          audioContextRef.current = audioCtx;
          analyserRef.current = analyser;

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const updateAudioLevel = () => {
            if (analyserRef.current && isRecordingRef.current) {
              analyserRef.current.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
              }
              const average = sum / dataArray.length;
              const normalized = Math.min(100, Math.round((average / 128) * 100));
              setAudioLevel(normalized);
            } else if (!isRecordingRef.current) {
              setAudioLevel(0);
            }
            vadAnimationRef.current = requestAnimationFrame(updateAudioLevel);
          };
          updateAudioLevel();
        } catch (audioCtxErr) {
          console.warn('AudioContext VAD visualizer init note:', audioCtxErr);
        }
      }

      return true;
    } catch (err) {
      console.warn('Microphone permission denied or unavailable:', err);
      setHasPermission(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionError('Microphone access was denied. Please allow microphone permissions in your browser address bar.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setPermissionError('No microphone hardware detected on your device.');
      } else {
        setPermissionError('Could not access microphone: ' + (err.message || 'Unknown error'));
      }
      return false;
    }
  }, []);

  /**
   * Initialize or retrieve SpeechRecognition instance
   */
  const getOrCreateRecognition = useCallback(() => {
    if (typeof window === 'undefined') return null;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    if (recognitionRef.current) return recognitionRef.current;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let finalChunk = '';
      let interimChunk = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const item = event.results[i];
        const text = item[0]?.transcript || '';
        if (item.isFinal) {
          finalChunk += text + ' ';
          if (item[0]?.confidence) {
            setConfidence(Math.round(item[0].confidence * 100) / 100);
          }
        } else {
          interimChunk += text;
        }
      }

      if (finalChunk) {
        setTranscript((prev) => {
          const merged = (prev ? `${prev} ${finalChunk}` : finalChunk).replace(/\s+/g, ' ').trim();
          return merged;
        });
      }
      setInterimTranscript(interimChunk.trim());
    };

    recognition.onerror = (event) => {
      if (event.error === 'no-speech') {
        // Natural candidate pause/silence. Do not terminate recording or wipe transcript.
        return;
      }
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setHasPermission(false);
        setPermissionError('Microphone permission was blocked by the browser.');
        isRecordingRef.current = false;
        setIsRecording(false);
        setIsListening(false);
        return;
      }
      console.warn('SpeechRecognition warning:', event.error);
    };

    recognition.onend = () => {
      // If the candidate is still actively recording, safely restart recognition
      // Browsers often stop recognition after short silence pauses.
      if (isRecordingRef.current && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (_) {
          // Ignore if transition already active
        }
      } else {
        setIsListening(false);
        setInterimTranscript('');
      }
    };

    recognitionRef.current = recognition;
    return recognition;
  }, []);

  /**
   * Start Speech-To-Text Listening
   */
  const startListening = useCallback(() => {
    const recognition = getOrCreateRecognition();
    if (recognition && !isListening) {
      try {
        recognition.start();
        setIsListening(true);
      } catch (err) {
        // Recognition might already be running or transitioning
      }
    }
  }, [getOrCreateRecognition, isListening]);

  /**
   * Stop Speech-To-Text Listening
   */
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
      setIsListening(false);
      setInterimTranscript('');
    }
  }, []);

  /**
   * Start Voice Media Recording & Continuous Speech Recognition
   */
  const startRecording = useCallback(async () => {
    let stream = microphoneStreamRef.current;
    if (!stream) {
      const granted = await requestPermission();
      if (!granted) return false;
      stream = microphoneStreamRef.current;
    }

    if (!stream) return false;

    try {
      isRecordingRef.current = true;
      setIsRecording(true);
      setRecordingDuration(0);

      // Setup MediaRecorder for audio playback
      if (typeof window !== 'undefined' && window.MediaRecorder) {
        try {
          audioChunksRef.current = [];
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;

          mediaRecorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
              audioChunksRef.current.push(e.data);
            }
          };

          mediaRecorder.onstop = () => {
            if (audioChunksRef.current.length > 0) {
              const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
              const url = URL.createObjectURL(blob);
              setAudioBlob(blob);
              setAudioUrl(url);
            }
          };

          mediaRecorder.start(500); // 500ms chunk slices
        } catch (recErr) {
          console.warn('MediaRecorder init note:', recErr);
        }
      }

      // Start duration counter
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      // Start Speech Recognition
      const recognition = getOrCreateRecognition();
      if (recognition) {
        try {
          recognition.start();
          setIsListening(true);
        } catch (_) {}
      }

      return true;
    } catch (err) {
      console.error('Failed to start voice recording:', err);
      isRecordingRef.current = false;
      setIsRecording(false);
      return false;
    }
  }, [requestPermission, getOrCreateRecognition]);

  /**
   * Stop Voice Media Recording & Finalize Transcript
   */
  const stopRecording = useCallback(() => {
    isRecordingRef.current = false;
    setIsRecording(false);
    setIsListening(false);
    setInterimTranscript('');
    setAudioLevel(0);

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (_) {}
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }
  }, []);

  /**
   * Text-To-Speech (TTS) Browser Reader
   */
  const speakText = useCallback((text) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, []);

  /**
   * Stop TTS Reader
   */
  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  /**
   * Reset Audio State
   */
  const resetVoiceState = useCallback(() => {
    isRecordingRef.current = false;
    stopRecording();
    stopSpeaking();
    setTranscript('');
    setInterimTranscript('');
    setAudioUrl(null);
    setAudioBlob(null);
    setRecordingDuration(0);
    setAudioLevel(0);
  }, [stopRecording, stopSpeaking]);

  const clearTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isRecordingRef.current = false;
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (vadAnimationRef.current) cancelAnimationFrame(vadAnimationRef.current);
      if (microphoneStreamRef.current) {
        microphoneStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        try {
          audioContextRef.current.close();
        } catch (_) {}
      }
    };
  }, []);

  return {
    isSupported,
    hasPermission,
    permissionError,
    isRecording,
    isListening,
    isSpeaking,
    transcript,
    interimTranscript,
    confidence,
    audioUrl,
    audioBlob,
    recordingDuration,
    audioLevel,
    requestPermission,
    startRecording,
    stopRecording,
    startListening,
    stopListening,
    speakText,
    stopSpeaking,
    resetVoiceState,
    clearTranscript,
    setTranscript,
  };
}
