import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

type ParticlePhase = "building" | "collapsing" | "bursting";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  hue: "cyan" | "violet";
  anchorX: number;
  anchorY: number;
  orbitRadius: number;
  seed: number;
  burstAngle: number;
  burstSpeed: number;
};

export type WordHubMagicLoadingOverlayHandle = {
  playComplete: (options?: { onFinish?: () => void }) => void;
  reset: () => void;
};

type WordHubMagicLoadingOverlayProps = {
  open: boolean;
  title?: string;
  subtitle?: string;
  metaLabel?: string;
  thinkingLines?: string[];
  className?: string;
};

const DEFAULT_LINES = [
  "分析语义线索...",
  "锁定视觉意象...",
  "渲染霓虹粒子...",
  "锁定 3:4 构图...",
  "构建完毕，即将呈现...",
];

const BUILDING_PARTICLE_COUNT = 220;
const COLLAPSE_DURATION = 520;
const BURST_DURATION = 540;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function createEllipsePoints(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  count: number,
  jitter = 0.18,
) {
  return Array.from({ length: count }, (_, index) => {
    const angle = (Math.PI * 2 * index) / count;
    const offset = 1 + (Math.random() * 2 - 1) * jitter;
    return {
      x: cx + Math.cos(angle) * rx * offset,
      y: cy + Math.sin(angle) * ry * offset,
    };
  });
}

function createAbstractAnchors(width: number, height: number) {
  const body = createEllipsePoints(width * 0.5, height * 0.56, width * 0.18, height * 0.17, 56, 0.2);
  const head = createEllipsePoints(width * 0.5, height * 0.36, width * 0.14, height * 0.1, 34, 0.18);
  const leftEye = createEllipsePoints(width * 0.41, height * 0.27, width * 0.045, height * 0.04, 10, 0.12);
  const rightEye = createEllipsePoints(width * 0.59, height * 0.27, width * 0.045, height * 0.04, 10, 0.12);
  const leftFoot = createEllipsePoints(width * 0.33, height * 0.71, width * 0.11, height * 0.055, 16, 0.22);
  const rightFoot = createEllipsePoints(width * 0.67, height * 0.71, width * 0.11, height * 0.055, 16, 0.22);

  return [...body, ...head, ...leftEye, ...rightEye, ...leftFoot, ...rightFoot].map((point) => ({
    x: point.x + (Math.random() * 2 - 1) * 12,
    y: point.y + (Math.random() * 2 - 1) * 12,
  }));
}

function createParticle(index: number, anchors: Array<{ x: number; y: number }>, width: number, height: number): Particle {
  const anchor = anchors[index % anchors.length];
  const angle = Math.random() * Math.PI * 2;
  const distance = width * (0.16 + Math.random() * 0.32);

  return {
    x: width / 2 + Math.cos(angle) * distance,
    y: height / 2 + Math.sin(angle) * distance * 0.86,
    vx: (Math.random() * 2 - 1) * 0.8,
    vy: (Math.random() * 2 - 1) * 0.8,
    size: 1.3 + Math.random() * 2.8,
    alpha: 0.24 + Math.random() * 0.66,
    hue: Math.random() > 0.45 ? "violet" : "cyan",
    anchorX: anchor.x,
    anchorY: anchor.y,
    orbitRadius: 8 + Math.random() * 18,
    seed: Math.random() * Math.PI * 2,
    burstAngle: Math.random() * Math.PI * 2,
    burstSpeed: 2 + Math.random() * 4.4,
  };
}

function setupHiDPICanvas(canvas: HTMLCanvasElement, width: number, height: number) {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return null;
  }

  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  return ctx;
}

export const WordHubMagicLoadingOverlay = forwardRef<
  WordHubMagicLoadingOverlayHandle,
  WordHubMagicLoadingOverlayProps
>(function WordHubMagicLoadingOverlay(
  {
    open,
    title = "AI 魔法构建中",
    subtitle = "正在拼合视觉记忆，请稍候...",
    metaLabel = "3:4 AI Card",
    thinkingLines = DEFAULT_LINES,
    className = "",
  },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const phaseRef = useRef<ParticlePhase>("building");
  const particlesRef = useRef<Particle[]>([]);
  const collapseStartRef = useRef<number | null>(null);
  const burstStartRef = useRef<number | null>(null);
  const onFinishRef = useRef<(() => void) | undefined>(undefined);
  const timeRef = useRef(0);
  const typingTimerRef = useRef<number | null>(null);
  const collapseTimerRef = useRef<number | null>(null);
  const finishTimerRef = useRef<number | null>(null);

  const [phase, setPhase] = useState<ParticlePhase>("building");
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const overlayClassName = useMemo(
    () =>
      [
        "fixed inset-0 z-50 flex items-center justify-center bg-white/60 px-4 backdrop-blur-2xl transition-opacity duration-300",
        open ? "opacity-100" : "pointer-events-none opacity-0",
        className,
      ]
        .filter(Boolean)
        .join(" "),
    [className, open],
  );

  useImperativeHandle(ref, () => ({
    playComplete(options) {
      if (!open || phaseRef.current !== "building") {
        return;
      }

      onFinishRef.current = options?.onFinish;
      phaseRef.current = "collapsing";
      collapseStartRef.current = performance.now();
      burstStartRef.current = null;
      setPhase("collapsing");
      setVisibleLines(["分析语义线索...", "锁定 3:4 构图...", "构建完毕，即将呈现..."]);

      if (typingTimerRef.current) {
        window.clearTimeout(typingTimerRef.current);
        typingTimerRef.current = null;
      }

      if (collapseTimerRef.current) {
        window.clearTimeout(collapseTimerRef.current);
      }
      if (finishTimerRef.current) {
        window.clearTimeout(finishTimerRef.current);
      }

      collapseTimerRef.current = window.setTimeout(() => {
        phaseRef.current = "bursting";
        burstStartRef.current = performance.now();
        setPhase("bursting");
      }, COLLAPSE_DURATION);

      finishTimerRef.current = window.setTimeout(() => {
        onFinishRef.current?.();
      }, COLLAPSE_DURATION + BURST_DURATION);
    },
    reset() {
      if (collapseTimerRef.current) {
        window.clearTimeout(collapseTimerRef.current);
        collapseTimerRef.current = null;
      }
      if (finishTimerRef.current) {
        window.clearTimeout(finishTimerRef.current);
        finishTimerRef.current = null;
      }
      phaseRef.current = "building";
      collapseStartRef.current = null;
      burstStartRef.current = null;
      setPhase("building");
      setVisibleLines([]);
    },
  }));

  useEffect(() => {
    if (!open) {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      if (typingTimerRef.current) {
        window.clearTimeout(typingTimerRef.current);
        typingTimerRef.current = null;
      }
      if (collapseTimerRef.current) {
        window.clearTimeout(collapseTimerRef.current);
        collapseTimerRef.current = null;
      }
      if (finishTimerRef.current) {
        window.clearTimeout(finishTimerRef.current);
        finishTimerRef.current = null;
      }
      return;
    }

    phaseRef.current = "building";
    collapseStartRef.current = null;
    burstStartRef.current = null;
    timeRef.current = 0;
    setPhase("building");

    const setup = () => {
      const canvas = canvasRef.current;
      const stage = stageRef.current;
      if (!canvas || !stage) {
        return;
      }

      const rect = stage.getBoundingClientRect();
      const width = Math.max(240, Math.floor(rect.width));
      const height = Math.max(300, Math.floor(rect.height));
      const ctx = setupHiDPICanvas(canvas, width, height);
      if (!ctx) {
        return;
      }

      const anchors = createAbstractAnchors(width, height);
      particlesRef.current = Array.from({ length: BUILDING_PARTICLE_COUNT }, (_, index) =>
        createParticle(index, anchors, width, height),
      );

      const render = () => {
        timeRef.current += 1;
        const t = timeRef.current / 16;
        const centerX = width / 2;
        const centerY = height / 2;

        ctx.clearRect(0, 0, width, height);

        const bg = ctx.createRadialGradient(width * 0.68, height * 0.18, 10, width * 0.5, height * 0.5, width * 0.9);
        bg.addColorStop(0, "rgba(40, 86, 161, 0.38)");
        bg.addColorStop(0.35, "rgba(24, 35, 92, 0.28)");
        bg.addColorStop(1, "rgba(5, 7, 20, 1)");
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, width, height);

        const phaseNow = phaseRef.current;
        const collapseElapsed =
          collapseStartRef.current === null ? 0 : clamp((performance.now() - collapseStartRef.current) / COLLAPSE_DURATION, 0, 1);
        const burstElapsed =
          burstStartRef.current === null ? 0 : clamp((performance.now() - burstStartRef.current) / BURST_DURATION, 0, 1);

        for (const particle of particlesRef.current) {
          let targetX = particle.anchorX + Math.cos(t * 1.8 + particle.seed) * particle.orbitRadius;
          let targetY = particle.anchorY + Math.sin(t * 2.1 + particle.seed) * particle.orbitRadius * 0.72;
          let attraction = 0.026;
          let drag = 0.9;

          if (phaseNow === "collapsing") {
            targetX = centerX;
            targetY = centerY;
            attraction = 0.16 + collapseElapsed * 0.08;
            drag = 0.84;
            particle.alpha = clamp(particle.alpha + 0.005, 0.3, 1);
          }

          if (phaseNow === "bursting") {
            particle.vx += Math.cos(particle.burstAngle) * particle.burstSpeed * 0.06;
            particle.vy += Math.sin(particle.burstAngle) * particle.burstSpeed * 0.06;
            particle.vx *= 0.96;
            particle.vy *= 0.96;
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.alpha *= 0.95;
            particle.size *= 0.992;
          } else {
            particle.vx += (targetX - particle.x) * attraction;
            particle.vy += (targetY - particle.y) * attraction;
            particle.vx += Math.cos(t * 2.8 + particle.seed) * 0.03;
            particle.vy += Math.sin(t * 2.6 + particle.seed) * 0.03;
            particle.vx *= drag;
            particle.vy *= drag;
            particle.x += particle.vx;
            particle.y += particle.vy;
          }

          const alpha = phaseNow === "bursting" ? particle.alpha : particle.alpha * (0.62 + Math.sin(t * 2.4 + particle.seed) * 0.18 + 0.2);
          const glow =
            particle.hue === "violet"
              ? `rgba(196, 118, 255, ${alpha * 0.2})`
              : `rgba(103, 232, 249, ${alpha * 0.22})`;
          const core =
            particle.hue === "violet"
              ? `rgba(216, 180, 254, ${alpha})`
              : `rgba(165, 243, 252, ${alpha})`;

          ctx.beginPath();
          ctx.fillStyle = glow;
          ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.fillStyle = core;
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
        }

        if (phaseNow === "collapsing") {
          const halo = 24 + collapseElapsed * 90;
          ctx.beginPath();
          ctx.fillStyle = `rgba(255,255,255,${0.22 + collapseElapsed * 0.48})`;
          ctx.arc(centerX, centerY, halo, 0, Math.PI * 2);
          ctx.fill();
        }

        if (phaseNow === "bursting") {
          const flashRadius = 40 + burstElapsed * Math.max(width, height) * 1.6;
          ctx.beginPath();
          ctx.fillStyle = `rgba(255,255,255,${1 - burstElapsed})`;
          ctx.arc(centerX, centerY, flashRadius, 0, Math.PI * 2);
          ctx.fill();
        }

        frameRef.current = requestAnimationFrame(render);
      };

      render();
    };

    setup();
    window.addEventListener("resize", setup);

    return () => {
      window.removeEventListener("resize", setup);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      if (collapseTimerRef.current) {
        window.clearTimeout(collapseTimerRef.current);
        collapseTimerRef.current = null;
      }
      if (finishTimerRef.current) {
        window.clearTimeout(finishTimerRef.current);
        finishTimerRef.current = null;
      }
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setVisibleLines([]);
      return;
    }

    let cancelled = false;
    let lineIndex = 0;
    let charIndex = 0;
    let committedLines: string[] = [];

    const tick = () => {
      if (cancelled) {
        return;
      }

      const source = thinkingLines[lineIndex % thinkingLines.length];
      const partial = source.slice(0, charIndex + 1);
      setVisibleLines([...committedLines, partial].slice(-3));
      charIndex += 1;

      if (charIndex <= source.length) {
        typingTimerRef.current = window.setTimeout(tick, 22);
        return;
      }

      committedLines = [...committedLines, source].slice(-2);
      lineIndex += 1;
      charIndex = 0;
      typingTimerRef.current = window.setTimeout(tick, lineIndex >= thinkingLines.length ? 120 : 260);
    };

    tick();

    return () => {
      cancelled = true;
      if (typingTimerRef.current) {
        window.clearTimeout(typingTimerRef.current);
        typingTimerRef.current = null;
      }
    };
  }, [open, thinkingLines]);

  if (!open) {
    return null;
  }

  return (
    <div className={overlayClassName}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-8%] top-[12%] h-64 w-64 rounded-full bg-cyan-300/25 blur-3xl" />
        <div className="absolute bottom-[8%] right-[-10%] h-72 w-72 rounded-full bg-fuchsia-400/25 blur-3xl" />
      </div>

      <div
        className={[
          "relative z-10 flex w-full max-w-md aspect-[3/4] overflow-hidden rounded-3xl",
          "border border-white/70 bg-white shadow-[0_0_40px_rgba(162,75,252,0.15)]",
          "transition-all duration-500",
          phase === "bursting" ? "scale-[1.03] opacity-100" : "scale-100 opacity-100",
        ].join(" ")}
      >
        <div className="grid w-full grid-rows-[minmax(0,1fr)_auto]">
          <div ref={stageRef} className="relative overflow-hidden bg-[radial-gradient(circle_at_70%_18%,rgba(59,130,246,0.35),rgba(10,10,20,0.96)_58%)]">
            <canvas ref={canvasRef} className="h-full w-full" />

            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02),transparent_52%)]" />

            <div
              className={[
                "pointer-events-none absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full",
                "bg-white/90 opacity-0 transition-all duration-500",
                phase === "collapsing" ? "scale-[2.1] opacity-95 shadow-[0_0_48px_rgba(255,255,255,0.9)]" : "",
                phase === "bursting" ? "scale-[24] opacity-0 duration-[540ms]" : "",
              ].join(" ")}
            />
          </div>

          <div className="flex flex-col gap-3 bg-white p-4 sm:gap-4 sm:p-6">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-fuchsia-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-fuchsia-600 sm:px-3">
                AI Magic
              </span>
              <span className="rounded-full bg-sky-100 px-2.5 py-1 text-[10px] font-medium text-sky-600 sm:px-3">{metaLabel}</span>
            </div>

            <div>
              <h3 className="text-sm font-semibold tracking-tight text-slate-900 sm:text-base">{title}</h3>
              <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm sm:leading-6">{subtitle}</p>
            </div>

            <div className="relative h-[66px] overflow-hidden rounded-2xl border border-fuchsia-100/70 bg-slate-50/85 px-3 py-3 sm:h-[78px] sm:px-4">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-5 bg-gradient-to-b from-white via-white/85 to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-white via-white/80 to-transparent" />
              <div className="relative flex h-full flex-col justify-end space-y-1 text-xs leading-5 sm:text-sm">
                {visibleLines.map((line, index) => {
                  const distance = visibleLines.length - 1 - index;
                  const isResolved = phase !== "building" && distance === 0;
                  const toneClass =
                    distance === 0
                      ? "opacity-100 text-slate-700"
                      : distance === 1
                        ? "opacity-50 text-slate-500"
                        : "opacity-20 text-slate-400";

                  return (
                    <p
                      key={`${index}-${line}`}
                      className={[
                        "truncate transition-all duration-300",
                        toneClass,
                        isResolved ? "text-fuchsia-600" : "",
                      ].join(" ")}
                    >
                      {line}
                      {distance === 0 && phase === "building" ? (
                        <span className="ml-0.5 inline-block h-3 w-px animate-pulse bg-fuchsia-500 align-middle" />
                      ) : null}
                    </p>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
