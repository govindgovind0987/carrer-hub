'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export function useVoiceInterview() {
  // Permission & Audio context states
  const [hasPermission, setHasPermission] = useState(null); // true, false, null
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Transcripts & Confidence
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [confidence, setConfidence] = useState(0.9);
  
  // Audio playback & VAD levels
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0); // 0 - 100 for VAD visualizer

  // Web API References
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneStreamRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const vadAnimationRef = useRef(null);

  /**
   * Request Microphone Permission & Setup VAD Analyser
   */
  const requestPermission = useCallback(async () => {
    if (typeof window === 'undefined') return false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      microphoneStreamRef.current = stream;
      setHasPermission(true);

      // Setup Web Audio API for Voice Activity Detection (VAD)
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const audioCtx = new AudioCtx();
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        audioContextRef.current = audioCtx;
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateAudioLevel = () => {
          if (analyserRef.current) {
            analyserRef.current.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const average = sum / dataArray.length;
            const normalized = Math.min(100, Math.round((average / 128) * 100));
            setAudioLevel(normalized);
          }
          vadAnimationRef.current = requestAnimationFrame(updateAudioLevel);
        };
        updateAudioLevel();
      }

      return true;
    } catch (err) {
      console.warn('Microphone permission denied or unavailable:', err);
      setHasPermission(false);
      return false;
    }
  }, []);

  /**
   * Setup Web Speech API Recognition (Speech-To-Text)
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let finalStr = '';
        let interimStr = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) {
            finalStr += res[0].transcript + ' ';
            if (res[0].confidence) {
              setConfidence(Math.round(res[0].confidence * 100) / 100);
            }
          } else {
            interimStr += res[0].transcript;
          }
        }

        if (finalStr) {
          setTranscript((prev) => (prev + ' ' + finalStr).trim());
        }
        setInterimTranscript(interimStr);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  /**
   * Start Speech-To-Text Listening
   */
  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Failed to start recognition:', err);
      }
    }
  }, [isListening]);

  /**
   * Stop Speech-To-Text Listening
   */
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
      } catch (err) {
        console.warn('Failed to stop recognition:', err);
      }
    }
  }, [isListening]);

  /**
   * Start Voice Media Recording
   */
  const startRecording = useCallback(async () => {
    let stream = microphoneStreamRef.current;
    if (!stream) {
      const granted = await requestPermission();
      if (!granted) return;
      stream = microphoneStreamRef.current;
    }

    if (!stream) return;

    try {
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      // Start duration counter
      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      // Also start STT listening automatically
      startListening();
    } catch (err) {
      console.error('Failed to start audio recording:', err);
    }
  }, [requestPermission, startListening]);

  /**
   * Stop Voice Media Recording
   */
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      stopListening();
    }
  }, [isRecording, stopListening]);

  /**
   * Text-To-Speech (TTS) Browser Reader
   */
  const speakText = useCallback((text) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel(); // cancel any active speech
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
    stopRecording();
    stopListening();
    stopSpeaking();
    setTranscript('');
    setInterimTranscript('');
    setAudioUrl(null);
    setAudioBlob(null);
    setRecordingDuration(0);
  }, [stopRecording, stopListening, stopSpeaking]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (vadAnimationRef.current) cancelAnimationFrame(vadAnimationRef.current);
      if (microphoneStreamRef.current) {
        microphoneStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    hasPermission,
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
    setTranscript,
  };
}
