import React, { useMemo, useRef, useState } from "react";
import {
  WordHubMagicLoadingOverlay,
  WordHubMagicLoadingOverlayHandle,
} from "./WordHubMagicLoadingOverlay";

function parseWords(input: string) {
  return Array.from(
    new Set(
      input
        .split(/[\n,\s]+/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

function fakeGenerateCards(words: string[]) {
  return new Promise<{ words: string[] }>((resolve) => {
    window.setTimeout(() => resolve({ words }), 1800);
  });
}

export default function WordHubQueryPageDemo() {
  const overlayRef = useRef<WordHubMagicLoadingOverlayHandle | null>(null);
  const [query, setQuery] = useState("vivid\norchard\nilluminate");
  const [isLoading, setIsLoading] = useState(false);

  const words = useMemo(() => parseWords(query), [query]);

  const handleGenerate = async () => {
    if (!words.length || isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fakeGenerateCards(words);

      overlayRef.current?.playComplete({
        onFinish: () => {
          setIsLoading(false);
          console.log("ready to route to result page", response.words);
        },
      });
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.12),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.12),transparent_18%),linear-gradient(180deg,#fbfbfe_0%,#f4f5fb_100%)] px-4 py-8 text-slate-700">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col rounded-[2rem] border border-white/70 bg-white/65 p-6 shadow-[0_28px_80px_rgba(52,40,96,0.12)] backdrop-blur-2xl">
        <div className="flex justify-center pb-10 pt-6">
          <img
            alt="WordHub"
            src="/brand-logo.png"
            className="h-auto w-60 object-contain"
          />
        </div>

        <div className="rounded-[2rem] border border-white/80 bg-white/90 p-5 shadow-[0_24px_60px_rgba(52,40,96,0.08)]">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-slate-400">支持逗号、空格或换行批量输入</p>
            <button
              type="button"
              onClick={() => setQuery("vivid, orchard, illuminate, hello")}
              disabled={isLoading}
              className="rounded-full border border-fuchsia-200 bg-white px-3 py-1.5 text-xs font-medium text-fuchsia-500 transition hover:bg-fuchsia-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              填充示例词库
            </button>
          </div>

          <div className={["transition duration-300", isLoading ? "pointer-events-none blur-sm opacity-70" : ""].join(" ")}>
            <textarea
              value={query}
              disabled={isLoading}
              onChange={(event) => setQuery(event.target.value)}
              className="min-h-[220px] w-full resize-none rounded-[1.75rem] border border-slate-200 bg-white px-5 py-5 text-lg leading-8 text-slate-700 outline-none transition focus:border-fuchsia-300 focus:ring-4 focus:ring-fuchsia-100 disabled:cursor-not-allowed"
              placeholder="请输入单词，支持批量输入..."
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {words.map((word) => (
              <span
                key={word}
                className={["rounded-full px-3 py-1.5 text-xs font-semibold", isLoading ? "bg-fuchsia-100/60 text-fuchsia-400 blur-[0.4px]" : "bg-fuchsia-100 text-fuchsia-600"].join(" ")}
              >
                {word}
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={!words.length || isLoading}
            className={[
              "mt-6 flex w-full items-center justify-center gap-3 rounded-2xl px-6 py-4 text-base font-semibold text-white transition",
              "bg-[linear-gradient(135deg,#60a5fa_0%,#a855f7_100%)] shadow-[0_12px_28px_rgba(139,92,246,0.28)]",
              !words.length || isLoading ? "cursor-not-allowed opacity-80" : "hover:scale-[0.995] active:scale-[0.985]",
            ].join(" ")}
          >
            <span
              className={[
                "inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/40",
                isLoading ? "animate-pulse shadow-[0_0_18px_rgba(255,255,255,0.45)]" : "",
              ].join(" ")}
            >
              ✦
            </span>
            <span className={isLoading ? "animate-pulse" : ""}>
              {isLoading ? "AI 魔法正在构建..." : "AI 智能生成"}
            </span>
          </button>
        </div>
      </div>

      <WordHubMagicLoadingOverlay
        ref={overlayRef}
        open={isLoading}
        metaLabel={`3:4 / ${Math.max(words.length, 1)} 张`}
      />
    </div>
  );
}
