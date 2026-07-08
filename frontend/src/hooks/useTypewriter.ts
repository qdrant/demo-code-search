import { useEffect, useState } from "react";

/**
 * Cycles a placeholder-style string through a list of phrases, typing each
 * out character by character then pausing before the next one.
 */
export function useTypewriter(phrases: string[], enabled = true): string {
  const [index, setIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    if (!enabled) return;
    const phrase = phrases[index];
    let charIndex = 0;
    setDisplayed("");

    const typeInterval = setInterval(() => {
      charIndex += 1;
      setDisplayed(phrase.slice(0, charIndex));
      if (charIndex >= phrase.length) {
        clearInterval(typeInterval);
      }
    }, 55);

    const nextPhraseTimeout = setTimeout(() => {
      setIndex((i) => (i + 1) % phrases.length);
    }, phrase.length * 55 + 2400);

    return () => {
      clearInterval(typeInterval);
      clearTimeout(nextPhraseTimeout);
    };
  }, [index, phrases, enabled]);

  return displayed;
}
