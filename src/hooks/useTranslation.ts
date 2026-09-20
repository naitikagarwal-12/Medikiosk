import { useEffect, useState } from "react";
import { useKiosk } from "../context/KioskContext";
import { translate } from "../services/bhashiniService";
import type { SupportedLang } from "../services/bhashiniService";

const translationCache = new Map<string, string>();

function cacheKey(lang: string, text: string): string {
  return `${lang}:${text}`;
}


export function useTranslation(englishText: string): { t: string; isLoading: boolean } {
  const { language } = useKiosk();
  const [translated, setTranslated] = useState(englishText);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (language === "en" || !englishText) {
      setTranslated(englishText);
      setIsLoading(false);
      return;
    }

    const key = cacheKey(language, englishText);

    const cached = translationCache.get(key);
    if (cached) {
      setTranslated(cached);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    translate(englishText, "en" as SupportedLang, language as SupportedLang)
      .then((result) => {
        if (cancelled) return;
        const text = result.translatedText || englishText;
        translationCache.set(key, text);
        setTranslated(text);
      })
      .catch(() => {
        if (!cancelled) setTranslated(englishText);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [language, englishText]);

  return { t: translated, isLoading };
}


export function useTranslations(englishTexts: string[]): { texts: string[]; isLoading: boolean } {
  const { language } = useKiosk();
  const [results, setResults] = useState<string[]>(englishTexts);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (language === "en" || englishTexts.length === 0) {
      setResults(englishTexts);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    const promises = englishTexts.map((text) => {
      const key = cacheKey(language, text);
      const cached = translationCache.get(key);
      if (cached) return Promise.resolve(cached);

      return translate(text, "en" as SupportedLang, language as SupportedLang)
        .then((r) => {
          const t = r.translatedText || text;
          translationCache.set(key, t);
          return t;
        })
        .catch(() => text);
    });

    Promise.all(promises).then((translated) => {
      if (!cancelled) {
        setResults(translated);
        setIsLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [language, JSON.stringify(englishTexts)]);

  return { texts: results, isLoading };
}
