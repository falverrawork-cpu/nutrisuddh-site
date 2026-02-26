import { useEffect } from "react";

type ExternalScriptProps = {
  src: string;
  strategy?: "afterInteractive" | "lazyOnload" | "beforeInteractive";
  onLoad?: () => void;
  onError?: () => void;
};

export default function Script({ src, onLoad, onError }: ExternalScriptProps) {
  useEffect(() => {
    const existing = document.querySelector(`script[src=\"${src}\"]`) as HTMLScriptElement | null;

    if (existing) {
      if ((existing as HTMLScriptElement & { dataset: { loaded?: string } }).dataset.loaded === "true") {
        onLoad?.();
      } else {
        const handleLoad = () => {
          existing.dataset.loaded = "true";
          onLoad?.();
        };
        const handleError = () => onError?.();
        existing.addEventListener("load", handleLoad, { once: true });
        existing.addEventListener("error", handleError, { once: true });
        return () => {
          existing.removeEventListener("load", handleLoad);
          existing.removeEventListener("error", handleError);
        };
      }
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;

    const handleLoad = () => {
      script.dataset.loaded = "true";
      onLoad?.();
    };
    const handleError = () => onError?.();

    script.addEventListener("load", handleLoad);
    script.addEventListener("error", handleError);
    document.body.appendChild(script);

    return () => {
      script.removeEventListener("load", handleLoad);
      script.removeEventListener("error", handleError);
    };
  }, [src, onLoad, onError]);

  return null;
}
