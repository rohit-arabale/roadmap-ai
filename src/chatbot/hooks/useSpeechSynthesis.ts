import { useState, useEffect, useCallback } from 'react';

export function useSpeechSynthesis() {
  const [speaking, setSpeaking] = useState(false);
  const [speechSynth] = useState<SpeechSynthesis | null>(() => {
    return typeof window !== 'undefined' ? window.speechSynthesis : null;
  });

  const speak = useCallback(({ text }: { text: string }): void => {
    if (!speechSynth) return;
    speechSynth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = (event) => { console.warn('Speech synthesis error:', event); setSpeaking(false); };
    speechSynth.speak(utterance);
  }, [speechSynth]);

  const cancel = useCallback((): void => {
    if (speechSynth) {
      setSpeaking(false);
      speechSynth.cancel();
    }
  }, [speechSynth]);

  useEffect(() => {
    return () => {
      if (speechSynth) {
        speechSynth.cancel();
      }
    };
  }, [speechSynth]);

  return { speak, cancel, speaking };
}