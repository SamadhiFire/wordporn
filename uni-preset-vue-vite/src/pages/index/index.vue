<template>
  <view class="wh-page-host">
    <view class="wh-page query-page">
      <view class="wh-shell query-shell">
        <view class="brand-stage">
          <image class="brand-logo" src="/static/wordhubporm.png" mode="widthFix"></image>
        </view>

        <view class="composer-card wh-card" :class="{ 'composer-card--loading': isLoading }">
          <view class="composer-toolbar">
            <text class="composer-helper">
              {{ parsedWords.length ? `已解析 ${parsedWords.length} 个单词` : '支持逗号、空格或换行批量输入' }}
            </text>
            <view class="composer-actions">
              <button class="toolbar-link toolbar-link--fill" :disabled="isLoading" @tap="fillDemoWords">
                <view class="toolbar-link__icon toolbar-link__icon--spark">
                  <view class="toolbar-link__spark-core"></view>
                  <view class="toolbar-link__spark-ray toolbar-link__spark-ray--vertical"></view>
                  <view class="toolbar-link__spark-ray toolbar-link__spark-ray--horizontal"></view>
                  <view class="toolbar-link__spark-dot"></view>
                </view>
                <text class="toolbar-link__label">填充示例词库</text>
              </button>
              <button v-if="rawWords" class="toolbar-link toolbar-link--clear" :disabled="isLoading" @tap="clearInput">
                <view class="toolbar-link__icon toolbar-link__icon--clear">
                  <view class="toolbar-link__clear-line toolbar-link__clear-line--left"></view>
                  <view class="toolbar-link__clear-line toolbar-link__clear-line--right"></view>
                </view>
                <text class="toolbar-link__label">清空内容</text>
              </button>
            </view>
          </view>

          <view class="textarea-shell" :class="{ 'textarea-shell--loading': isLoading }">
            <textarea
              v-model="rawWords"
              class="wh-textarea query-textarea"
              maxlength="-1"
              auto-height
              :disabled="isLoading"
              placeholder="请输入单词，支持批量输入（逗号、空格或换行分隔）..."
              @blur="formatInput"
            />
          </view>

          <view v-if="parsedWords.length" class="parsed-row" :class="{ 'parsed-row--loading': isLoading }">
            <text v-for="word in parsedWords" :key="word" class="wh-tag">{{ word }}</text>
          </view>

          <view v-if="hasWordFeedback" class="word-feedback" :class="{ 'word-feedback--loading': isLoading }">
            <view v-if="wordFeedback.accepted.length" class="word-feedback__group">
              <text class="word-feedback__label">已接收</text>
              <view class="word-feedback__tags">
                <text v-for="word in wordFeedback.accepted" :key="`accepted-${word}`" class="word-feedback__tag word-feedback__tag--accepted">{{ word }}</text>
              </view>
            </view>

            <view v-if="wordFeedback.invalid.length" class="word-feedback__group">
              <text class="word-feedback__label">无效词</text>
              <view class="word-feedback__tags">
                <text v-for="word in wordFeedback.invalid" :key="`invalid-${word}`" class="word-feedback__tag word-feedback__tag--invalid">{{ word }}</text>
              </view>
            </view>

            <view v-if="wordFeedback.unsupported.length" class="word-feedback__group">
              <text class="word-feedback__label">暂不支持</text>
              <view class="word-feedback__tags">
                <text v-for="word in wordFeedback.unsupported" :key="`unsupported-${word}`" class="word-feedback__tag word-feedback__tag--unsupported">{{ word }}</text>
              </view>
            </view>
          </view>

          <button
            class="wh-btn wh-btn--primary action-btn"
            :class="{ 'action-btn--loading': isLoading }"
            :disabled="!canGenerate"
            @tap="submitQuery"
          >
            <view class="action-btn__content">
              <view class="action-glyph" :class="{ 'action-glyph--spinning': isLoading }">
                <view class="action-glyph__orbit"></view>
                <view class="action-glyph__core"></view>
                <view class="action-glyph__ray action-glyph__ray--vertical"></view>
                <view class="action-glyph__ray action-glyph__ray--horizontal"></view>
              </view>
              <text>{{ isLoading ? 'AI 魔法正在构建...' : 'AI 智能生成' }}</text>
            </view>
          </button>
        </view>
      </view>
    </view>

    <WordHubTabBar current="query" />

    <view v-if="isLoading" class="magic-overlay">
      <view class="magic-overlay__aurora magic-overlay__aurora--left"></view>
      <view class="magic-overlay__aurora magic-overlay__aurora--right"></view>

      <view class="magic-card" :class="`magic-card--${loadingPhase}`">
        <view class="magic-card__topbar">
          <text class="magic-card__eyebrow">AI Magic</text>
          <view class="magic-card__pill">
            <text>{{ loadingMeta }}</text>
          </view>
        </view>

        <view class="magic-card__headline">
          <text class="magic-card__title">{{ loadingTitle }}</text>
          <text class="magic-card__subtitle">{{ loadingSubtitle }}</text>
        </view>

        <view class="magic-stage">
          <canvas
            id="magicBuilderCanvas"
            canvas-id="magicBuilderCanvas"
            class="magic-canvas"
            :width="magicCanvas.width"
            :height="magicCanvas.height"
          ></canvas>
          <view class="magic-stage__ring magic-stage__ring--outer"></view>
          <view class="magic-stage__ring magic-stage__ring--inner"></view>
          <view class="magic-stage__flash" :class="`magic-stage__flash--${loadingPhase}`"></view>
        </view>

        <view class="terminal-logs">
          <text v-if="isTerminalLogAnimating && previousTerminalLog" class="terminal-log terminal-log--exit">
            {{ previousTerminalLog }}
          </text>
          <text class="terminal-log" :class="{ 'terminal-log--enter': isTerminalLogAnimating }">
            {{ currentTerminalLog }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import WordHubTabBar from '../../components/WordHubTabBar.vue'
import {
  checkBackendHealth,
  createGeneratedResults,
  createGenerationJob,
  isLoggedIn,
  normalizeWords,
  pollGenerationJob,
  saveGeneratedResults,
  syncMyHistory,
} from '../../utils/wordhub-store'

const MAGIC_CANVAS = { width: 540, height: 420 }
const BUILDING_DURATION = 1650
const COLLAPSE_DURATION = 460
const BURST_DURATION = 380
const FRAME_INTERVAL = 16
const THOUGHT_INTERVAL = 760
const TERMINAL_LOG_INTERVAL = 1500
const TERMINAL_LOG_ANIMATION_DURATION = 320
const DEFAULT_PARTICLE_CONFIG = {
  count: 220,
  jumpAmpMin: 20,
  jumpAmpMax: 40,
  jumpOffsetX: 10,
  jumpFreqMin: 1.5,
  jumpFreqMax: 2,
  gravityMin: 0.5,
  gravityMax: 0.8,
  hueShiftMax: 15,
  lightnessPulse: 0.2,
  lifeMin: 3.2,
  lifeMax: 6.4,
  fadeMin: 0.3,
  fadeMax: 0.6,
  bezierSpeedMin: 0.0025,
  bezierSpeedMax: 0.006,
}
const JOB_STAGE_THOUGHTS = {
  queued: '任务进入队列...',
  running: '后端正在执行任务...',
  analyzing: '分析单词语义...',
  classifying: '匹配视觉分类...',
  prompting: '编写图像提示词...',
  generating: '生成记忆卡片...',
  assembling: '组装返回结果...',
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min)
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function normalizeHue(value) {
  const output = value % 360
  return output < 0 ? output + 360 : output
}

function hslToRgba(h, s, l, a) {
  const hue = normalizeHue(h) / 360
  const saturation = clamp(s, 0, 100) / 100
  const lightness = clamp(l, 0, 100) / 100
  const q = lightness < 0.5
    ? lightness * (1 + saturation)
    : lightness + saturation - lightness * saturation
  const p = 2 * lightness - q
  const hueToRgb = (t) => {
    let temp = t
    if (temp < 0) temp += 1
    if (temp > 1) temp -= 1
    if (temp < 1 / 6) return p + (q - p) * 6 * temp
    if (temp < 1 / 2) return q
    if (temp < 2 / 3) return p + (q - p) * (2 / 3 - temp) * 6
    return p
  }
  const r = Math.round(hueToRgb(hue + 1 / 3) * 255)
  const g = Math.round(hueToRgb(hue) * 255)
  const b = Math.round(hueToRgb(hue - 1 / 3) * 255)
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

function cubicBezierPoint(t, p0, p1, p2, p3) {
  const u = 1 - t
  const tt = t * t
  const uu = u * u
  const uuu = uu * u
  const ttt = tt * t
  return {
    x: uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
    y: uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y,
  }
}

function ellipsePoints(cx, cy, rx, ry, count, jitter = 0.18) {
  return Array.from({ length: count }, (_, index) => {
    const angle = (Math.PI * 2 * index) / count
    const offset = 1 + randomBetween(-jitter, jitter)
    return {
      x: cx + Math.cos(angle) * rx * offset,
      y: cy + Math.sin(angle) * ry * offset,
    }
  })
}

function createStageAnchors(width, height) {
  const columns = 12
  const rows = 7
  const cellWidth = width / columns
  const cellHeight = height / rows
  const anchors = []

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const baseX = (column + 0.5) * cellWidth
      const baseY = (row + 0.5) * cellHeight
      const x = Math.min(width, Math.max(0, baseX + randomBetween(-0.35, 0.35) * cellWidth))
      const y = Math.min(height, Math.max(0, baseY + randomBetween(-0.35, 0.35) * cellHeight))
      anchors.push({ x, y })
    }
  }

  return anchors
}

function createBezierPath(width, height) {
  const marginX = width * 0.08
  const marginY = height * 0.08
  const pickX = () => randomBetween(marginX, width - marginX)
  const pickY = () => randomBetween(marginY, height - marginY)
  return {
    p0: { x: pickX(), y: pickY() },
    p1: { x: pickX(), y: pickY() },
    p2: { x: pickX(), y: pickY() },
    p3: { x: pickX(), y: pickY() },
  }
}

function createParticle(index, anchors, width, height, config, time) {
  const anchor = anchors[index % anchors.length]
  const tierRoll = Math.random()
  const tier = tierRoll > 0.84 ? 'core' : (tierRoll > 0.48 ? 'mid' : 'dust')
  const angle = randomBetween(0, Math.PI * 2)
  const distance = width * (0.02 + Math.pow(Math.random(), 1.6) * 0.12)
  const variant = Math.random() > 0.5 ? 'violet' : 'cyan'

  let baseRadius = randomBetween(1.6, 2.2)
  let baseAlpha = randomBetween(0.28, 0.54)
  let orbitRadius = randomBetween(4, 10)
  let drift = randomBetween(0.22, 0.58)
  let glow = 0.52
  let anchorPull = 0.035

  if (tier === 'mid') {
    baseRadius = randomBetween(2.6, 3.8)
    baseAlpha = randomBetween(0.46, 0.76)
    orbitRadius = randomBetween(8, 16)
    drift = randomBetween(0.42, 0.88)
    glow = 0.82
    anchorPull = 0.046
  } else if (tier === 'core') {
    baseRadius = randomBetween(4.2, 5)
    baseAlpha = randomBetween(0.72, 0.98)
    orbitRadius = randomBetween(10, 20)
    drift = randomBetween(0.7, 1.12)
    glow = 1.08
    anchorPull = 0.058
  }

  const startX = anchor.x + Math.cos(angle) * distance + randomBetween(-width * 0.02, width * 0.02)
  const startY = anchor.y + Math.sin(angle) * distance + randomBetween(-height * 0.02, height * 0.02)
  const path = createBezierPath(width, height)
  const hueBase = variant === 'violet' ? 28 : 42
  const saturation = variant === 'violet' ? 92 : 88
  const lightnessBase = variant === 'violet' ? 58 : 64

  return {
    index,
    x: Math.min(width, Math.max(0, startX)),
    y: Math.min(height, Math.max(0, startY)),
    vx: randomBetween(-0.18, 0.18),
    vy: randomBetween(-0.18, 0.18),
    radius: baseRadius,
    baseRadius,
    alpha: baseAlpha,
    baseAlpha,
    twinkle: randomBetween(0, Math.PI * 2),
    orbitRadius,
    drift,
    glow,
    anchorPull,
    breathSpeed: randomBetween(1.2, 2.6),
    breathPhase: randomBetween(0, Math.PI * 2),
    floatAmplitude: randomBetween(1.8, tier === 'core' ? 5 : 3.8),
    floatSpeed: randomBetween(0.7, 1.45),
    anchorX: anchor.x,
    anchorY: anchor.y,
    variant,
    burstAngle: randomBetween(0, Math.PI * 2),
    tier,
    gravity: randomBetween(config.gravityMin, config.gravityMax),
    jumpAmplitude: randomBetween(config.jumpAmpMin, config.jumpAmpMax),
    jumpOffsetX: randomBetween(-config.jumpOffsetX, config.jumpOffsetX),
    jumpFrequency: randomBetween(config.jumpFreqMin, config.jumpFreqMax),
    jumpPhase: randomBetween(0, Math.PI * 2),
    lifeStart: time + randomBetween(0, 0.8),
    lifeDuration: randomBetween(config.lifeMin, config.lifeMax),
    fadeDuration: randomBetween(config.fadeMin, config.fadeMax),
    bezierPath: path,
    bezierT: Math.random(),
    bezierSpeed: randomBetween(config.bezierSpeedMin, config.bezierSpeedMax),
    hueBase,
    hueShift: randomBetween(-config.hueShiftMax, config.hueShiftMax),
    huePulseSpeed: randomBetween(0.4, 1.1),
    huePhase: randomBetween(0, Math.PI * 2),
    saturation,
    lightnessBase,
    lightnessPulseSpeed: randomBetween(0.8, 1.8),
    lightnessPhase: randomBetween(0, Math.PI * 2),
  }
}

function resetParticle(particle, anchors, width, height, config, time) {
  const fresh = createParticle(particle.index, anchors, width, height, config, time)
  Object.assign(particle, fresh)
}

function drawCircle(ctx, x, y, radius, color) {
  ctx.beginPath()
  ctx.setFillStyle(color)
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fill()
}

function primaryMeaning(value) {
  return String(value || '')
    .split(/[；;，,]/)[0]
    .replace(/[。.]$/g, '')
    .trim() || '灵感'
}

export default {
  components: { WordHubTabBar },
  data() {
    return {
      rawWords: '',
      parsedWords: [],
      isLoading: false,
      loadingPhase: 'idle',
      pendingResults: [],
      loadingThoughts: [],
      wordFeedback: {
        accepted: [],
        invalid: [],
        unsupported: [],
      },
      terminalLogs: [
        '褪去所有伪装，只为展现最真实的诱惑...',
        '注入亿点细节，感受前所未有的满足...',
        '正在预热，即将进入最佳状态...',
        '轻拢慢捻，雕琢最动人的曲线...',
        '别心急，精彩总在最后一刻揭晓...',
        '每一次心跳，都加速了这次的亲密接触...',
        '前方高能，请坐稳扶好...',
        '感受这血脉喷张的创作激情...',
        '正在解锁新姿势，请耐心等待...',
        '让灵感与身体，来一次深度碰撞...',
        '即将抵达快乐的巅峰...',
        '调整了颗粒质感，触感更真实...',
        '升温中，别让热情冷却...',
        '释放原始的冲动，创作正在发生...',
        '这次，我们玩点不一样的...',
        '只为取悦你，正在打磨每个细节...',
        '再靠近一点，就能感受到它的呼吸...',
        '灵感已经开始泛滥...',
        '正在探索你的每一个兴奋点...',
        '屏住呼吸，迎接这场视觉盛宴！',
        '注入灵魂，唤醒沉睡的欲望...',
        '光影交错，构建你的专属梦境...',
        '心跳加速，准备好迎接这场放纵...',
        '解开束缚，让想象力自由流淌...',
        '这是一场只属于你的秘密狂欢...',
        '别眨眼，奇迹即将赤裸上演...',
        '深呼吸，感受这令人战栗的创造力...',
        '抛开杂念，与最纯粹的欲望共舞...',
        '最后一次调试，确保每个细节都完美无瑕...',
        '准备好了吗？你的幻想即将成为现实。'
      ],
      terminalLogIndex: 0,
      terminalLogPrev: '',
      isTerminalLogAnimating: false,
      particleConfig: { ...DEFAULT_PARTICLE_CONFIG },
      particlePerf: {
        fps: 0,
        frameTime: 0,
        particleCount: 0,
      },
      perfFrameCount: 0,
      perfLastTime: 0,
      lastFrameTime: 0,
      particleMonitor: null,
      thinkingCursor: 0,
      loadingTimer: null,
      collapseTimer: null,
      burstTimer: null,
      particleTimer: null,
      thinkingTimer: null,
      terminalLogTimer: null,
      terminalLogAnimationTimer: null,
      magicCanvas: MAGIC_CANVAS,
      magicCanvasCtx: null,
      magicAnchors: [],
      particles: [],
      animationTick: 0,
    }
  },
  computed: {
    canGenerate() {
      return !this.isLoading && this.parsedWords.length > 0
    },
    isResolvePhase() {
      return this.loadingPhase === 'collapsing' || this.loadingPhase === 'bursting'
    },
    hasWordFeedback() {
      return Boolean(this.wordFeedback.accepted.length || this.wordFeedback.invalid.length || this.wordFeedback.unsupported.length)
    },
    loadingMeta() {
      return this.pendingResults.length ? `${this.pendingResults.length} 张 3:4` : '3:4 构图'
    },
    loadingTitle() {
      if (this.loadingPhase === 'collapsing') {
        return '正在收束成像'
      }
      if (this.loadingPhase === 'bursting') {
        return '即将呈现'
      }
      return '灵感交织中'
    },
    loadingSubtitle() {
      if (this.loadingPhase === 'collapsing') {
        return '粒子正在压缩为最终亮点...'
      }
      if (this.loadingPhase === 'bursting') {
        return '视觉卡片已构建完成。'
      }
      return '捕捉心动的瞬间，编织成梦...'
    },
    currentTerminalLog() {
      return this.terminalLogs[this.terminalLogIndex] || ''
    },
    previousTerminalLog() {
      return this.terminalLogPrev
    },
    visibleThoughtLines() {
      if (!this.loadingThoughts.length) {
        return []
      }
      if (this.isResolvePhase) {
        return this.loadingThoughts.slice(-3)
      }
      const count = Math.min(3, this.loadingThoughts.length)
      const start = this.thinkingCursor % this.loadingThoughts.length
      return Array.from({ length: count }, (_, index) => this.loadingThoughts[(start + index) % this.loadingThoughts.length])
    },
  },
  watch: {
    rawWords: {
      immediate: true,
      handler(value) {
        this.parsedWords = normalizeWords(value)
        if (!this.isLoading) {
          this.wordFeedback = {
            accepted: [],
            invalid: [],
            unsupported: [],
          }
        }
      },
    },
  },
  beforeUnmount() {
    this.cleanup()
  },
  onUnload() {
    this.cleanup()
  },
  methods: {
    cleanup() {
      this.clearTimers()
      this.stopMagicAnimation()
    },
    clearTimers() {
      if (this.loadingTimer) {
        clearTimeout(this.loadingTimer)
        this.loadingTimer = null
      }
      if (this.collapseTimer) {
        clearTimeout(this.collapseTimer)
        this.collapseTimer = null
      }
      if (this.burstTimer) {
        clearTimeout(this.burstTimer)
        this.burstTimer = null
      }
      if (this.terminalLogTimer) {
        clearInterval(this.terminalLogTimer)
        this.terminalLogTimer = null
      }
      if (this.terminalLogAnimationTimer) {
        clearTimeout(this.terminalLogAnimationTimer)
        this.terminalLogAnimationTimer = null
      }
    },
    stopMagicAnimation() {
      if (this.particleTimer) {
        if (typeof cancelAnimationFrame === 'function') {
          cancelAnimationFrame(this.particleTimer)
        } else {
          clearTimeout(this.particleTimer)
        }
        this.particleTimer = null
      }
      if (this.thinkingTimer) {
        clearInterval(this.thinkingTimer)
        this.thinkingTimer = null
      }
      if (this.particleMonitor && typeof window !== 'undefined') {
        if (window.__wordhubParticleMonitor === this.particleMonitor) {
          window.__wordhubParticleMonitor = null
        }
      }
      this.particleMonitor = null
      this.magicCanvasCtx = null
      this.magicAnchors = []
      this.particles = []
      this.animationTick = 0
      this.perfFrameCount = 0
      this.perfLastTime = 0
      this.lastFrameTime = 0
    },
    resetLoadingState() {
      this.clearTimers()
      this.stopMagicAnimation()
      this.isLoading = false
      this.loadingPhase = 'idle'
      this.pendingResults = []
      this.loadingThoughts = []
      this.thinkingCursor = 0
      this.terminalLogIndex = 0
      this.terminalLogPrev = ''
      this.isTerminalLogAnimating = false
    },
    formatInput() {
      this.rawWords = normalizeWords(this.rawWords).join('\n')
    },
    clearInput() {
      this.rawWords = ''
    },
    fillDemoWords() {
      this.rawWords = 'vivid, anchor, serene, pulse, orchard, glacier'
    },
    buildThoughts(results, words) {
      const first = results[0] || { word: words[0] || 'vivid', meaning: '生动的' }

      return [
        `分析 ${String(first.word).toLowerCase()} 语义...`,
        `锁定 ${primaryMeaning(first.meaning)} 意象...`,
        '渲染霓虹粒子...',
        '锁定 3:4 构图...',
        '构建完毕，即将呈现...',
      ]
    },
    thoughtDepth(index) {
      return Math.max(0, this.visibleThoughtLines.length - 1 - index)
    },
    startThinkingTicker() {
      if (!this.loadingThoughts.length) {
        return
      }
      this.thinkingTimer = setInterval(() => {
        if (this.loadingPhase !== 'building') {
          return
        }
        this.thinkingCursor = (this.thinkingCursor + 1) % this.loadingThoughts.length
      }, THOUGHT_INTERVAL)
    },
    startTerminalLogTicker() {
      if (!this.terminalLogs.length) {
        return
      }
      if (this.terminalLogTimer) {
        clearInterval(this.terminalLogTimer)
      }
      if (this.terminalLogAnimationTimer) {
        clearTimeout(this.terminalLogAnimationTimer)
      }
      this.terminalLogIndex = 0
      this.terminalLogPrev = ''
      this.isTerminalLogAnimating = false
      this.terminalLogTimer = setInterval(() => {
        if (!this.isLoading) {
          return
        }
        const nextIndex = (this.terminalLogIndex + 1) % this.terminalLogs.length
        this.terminalLogPrev = this.currentTerminalLog
        this.terminalLogIndex = nextIndex
        this.isTerminalLogAnimating = true
        if (this.terminalLogAnimationTimer) {
          clearTimeout(this.terminalLogAnimationTimer)
        }
        this.terminalLogAnimationTimer = setTimeout(() => {
          this.isTerminalLogAnimating = false
          this.terminalLogPrev = ''
        }, TERMINAL_LOG_ANIMATION_DURATION)
      }, TERMINAL_LOG_INTERVAL)
    },
    setupParticleMonitor() {
      if (typeof window === 'undefined') {
        return
      }
      this.particleMonitor = {
        getStats: () => ({
          fps: this.particlePerf.fps,
          frameTime: this.particlePerf.frameTime,
          particleCount: this.particlePerf.particleCount,
          config: { ...this.particleConfig },
        }),
        updateConfig: (nextConfig) => this.updateParticleConfig(nextConfig),
      }
      window.__wordhubParticleMonitor = this.particleMonitor
    },
    updateParticleConfig(nextConfig = {}) {
      this.particleConfig = { ...this.particleConfig, ...nextConfig }
      if (this.isLoading) {
        this.rebuildParticles()
      }
    },
    rebuildParticles() {
      const { width, height } = this.magicCanvas
      const time = this.animationTick / 60
      this.magicAnchors = createStageAnchors(width, height)
      this.particles = Array.from({ length: this.particleConfig.count }, (_, index) =>
        createParticle(index, this.magicAnchors, width, height, this.particleConfig, time)
      )
      this.particlePerf.particleCount = this.particles.length
    },
    startMagicAnimation() {
      this.stopMagicAnimation()
      this.magicCanvasCtx = uni.createCanvasContext('magicBuilderCanvas', this)
      const { width, height } = this.magicCanvas
      this.magicAnchors = createStageAnchors(width, height)
      this.particles = Array.from({ length: this.particleConfig.count }, (_, index) =>
        createParticle(index, this.magicAnchors, width, height, this.particleConfig, 0)
      )
      this.particlePerf.particleCount = this.particles.length
      this.perfFrameCount = 0
      this.perfLastTime = 0
      this.lastFrameTime = 0
      this.setupParticleMonitor()
      this.startThinkingTicker()
      this.startTerminalLogTicker()
      this.renderMagicFrame()
      this.scheduleMagicFrame()
    },
    scheduleMagicFrame() {
      if (!this.isLoading) {
        return
      }
      const nextFrame = typeof requestAnimationFrame === 'function'
        ? requestAnimationFrame
        : (callback) => setTimeout(callback, FRAME_INTERVAL)
      this.particleTimer = nextFrame(() => {
        this.particleTimer = null
        this.renderMagicFrame()
        if (this.isLoading) {
          this.scheduleMagicFrame()
        }
      })
    },
    renderMagicFrame() {
      if (!this.isLoading) {
        return
      }
      if (!this.magicCanvasCtx) {
        this.magicCanvasCtx = uni.createCanvasContext('magicBuilderCanvas', this)
      }
      if (!this.magicCanvasCtx) {
        return
      }

      const ctx = this.magicCanvasCtx
      const { width, height } = this.magicCanvas
      const centerX = width / 2
      const centerY = height * 0.56
      const now = typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now()
      const lastFrameTime = this.lastFrameTime || now
      const deltaSec = Math.min(0.05, Math.max(0.012, (now - lastFrameTime) / 1000))
      this.lastFrameTime = now
      const frameScale = deltaSec * 60
      const time = this.animationTick / 60
      this.animationTick += 1
      this.perfFrameCount += 1
      if (!this.perfLastTime) {
        this.perfLastTime = now
      }
      const perfElapsed = now - this.perfLastTime
      if (perfElapsed > 420) {
        this.particlePerf.fps = Math.round((this.perfFrameCount * 1000) / perfElapsed)
        this.particlePerf.frameTime = perfElapsed / this.perfFrameCount
        this.particlePerf.particleCount = this.particles.length
        this.perfFrameCount = 0
        this.perfLastTime = now
      }

      ctx.clearRect(0, 0, width, height)

      const gradient = ctx.createLinearGradient(0, 0, 0, height)
      gradient.addColorStop(0, 'rgba(8, 8, 8, 0.98)')
      gradient.addColorStop(0.54, 'rgba(18, 12, 4, 0.98)')
      gradient.addColorStop(1, 'rgba(5, 5, 5, 0.99)')
      ctx.setFillStyle(gradient)
      ctx.fillRect(0, 0, width, height)

      drawCircle(ctx, centerX - width * 0.18, height * 0.32, width * 0.16, 'rgba(255, 153, 0, 0.12)')
      drawCircle(ctx, centerX + width * 0.15, height * 0.36, width * 0.18, 'rgba(255, 196, 88, 0.12)')
      drawCircle(ctx, centerX, height * 0.62, width * 0.22, 'rgba(255, 133, 0, 0.08)')

      this.magicAnchors.forEach((anchor, index) => {
        if (index % 5 !== 0) {
          return
        }
        const pulse = 0.85 + 0.18 * (0.5 + 0.5 * Math.sin(time * 1.4 + index * 0.35))
        const radius = (index % 2 === 0 ? 10 : 14) * pulse
        const color = index % 3 === 0 ? 'rgba(255, 163, 26, 0.05)' : 'rgba(255, 196, 88, 0.06)'
        drawCircle(ctx, anchor.x, anchor.y, radius, color)
      })

      this.particles.forEach((particle) => {
        const age = time - particle.lifeStart
        if (age > particle.lifeDuration) {
          resetParticle(particle, this.magicAnchors, width, height, this.particleConfig, time)
          return
        }

        const lifeStart = clamp(age / particle.fadeDuration, 0, 1)
        const lifeEnd = clamp((particle.lifeDuration - age) / particle.fadeDuration, 0, 1)
        const lifeScale = Math.min(lifeStart, lifeEnd)
        let targetX = particle.anchorX
        let targetY = particle.anchorY
        let attraction = particle.anchorPull
        let damping = 0.9

        const breath = 0.72 + 0.38 * (0.5 + 0.5 * Math.sin(time * particle.breathSpeed + particle.breathPhase))
        const floatOffsetY = Math.sin(time * particle.floatSpeed + particle.breathPhase) * particle.floatAmplitude
        const floatOffsetX = Math.cos(time * (particle.floatSpeed * 0.82) + particle.twinkle) * particle.floatAmplitude * 0.55
        const jumpPhase = time * particle.jumpFrequency * Math.PI * 2 + particle.jumpPhase
        const jumpY = -Math.abs(Math.sin(jumpPhase)) * particle.jumpAmplitude
        const jumpX = Math.cos(jumpPhase) * particle.jumpOffsetX

        if (this.loadingPhase === 'building') {
          particle.bezierT += particle.bezierSpeed * frameScale
          if (particle.bezierT > 1) {
            particle.bezierT -= 1
            particle.bezierPath = createBezierPath(width, height)
          }
          const bezierPoint = cubicBezierPoint(
            particle.bezierT,
            particle.bezierPath.p0,
            particle.bezierPath.p1,
            particle.bezierPath.p2,
            particle.bezierPath.p3
          )
          targetX = bezierPoint.x + floatOffsetX + jumpX
          targetY = bezierPoint.y + floatOffsetY + jumpY
          particle.alpha = Math.min(1, particle.baseAlpha * (0.78 + breath * 0.62))
          particle.radius = particle.baseRadius * (0.88 + breath * 0.3)
        } else if (this.loadingPhase === 'collapsing') {
          targetX = centerX + floatOffsetX * 0.4 + jumpX * 0.3
          targetY = centerY + floatOffsetY * 0.35 + jumpY * 0.3
          attraction = 0.11 + particle.glow * 0.015
          damping = 0.82
          particle.alpha *= 0.986
          particle.radius = Math.max(1.1, particle.radius * 0.993)
        } else if (this.loadingPhase === 'bursting') {
          const burstSpeed = 0.34 + particle.baseRadius * 0.08 + particle.glow * 0.1
          particle.vx += Math.cos(particle.burstAngle) * burstSpeed
          particle.vy += Math.sin(particle.burstAngle) * burstSpeed
          particle.vx *= 0.91
          particle.vy *= 0.91
          particle.x += particle.vx
          particle.y += particle.vy
          particle.alpha *= particle.tier === 'core' ? 0.958 : 0.944
          particle.radius = Math.max(0.8, particle.radius * 0.994)
        }

        if (this.loadingPhase !== 'bursting') {
          particle.vx += (targetX - particle.x) * attraction * frameScale
          particle.vy += (targetY - particle.y) * attraction * frameScale
          particle.vx += floatOffsetX * 0.004 * particle.drift * frameScale
          particle.vy += floatOffsetY * 0.0045 * particle.drift * frameScale
          particle.vy += particle.gravity * 0.04 * frameScale
          particle.vx *= Math.pow(damping, frameScale)
          particle.vy *= Math.pow(damping, frameScale)
          particle.x = clamp(particle.x + particle.vx, 0, width)
          particle.y = clamp(particle.y + particle.vy, 0, height)
        }

        const lightnessPulse = 1 + Math.sin(time * particle.lightnessPulseSpeed + particle.lightnessPhase) * this.particleConfig.lightnessPulse
        const baseLightness = particle.lightnessBase * lightnessPulse
        const hue = particle.hueBase + particle.hueShift
        const alpha = particle.alpha * lifeScale
        const glowScale = 0.6 + lifeScale * 0.4

        const outerGlow = hslToRgba(hue, particle.saturation, clamp(baseLightness - 14, 0, 100), alpha * 0.1 * particle.glow)
        const halo = hslToRgba(hue, particle.saturation, clamp(baseLightness - 2, 0, 100), alpha * 0.24 * particle.glow)
        const core = hslToRgba(hue, particle.saturation, clamp(baseLightness + 14, 0, 100), alpha * 0.98)
        const innerCore = hslToRgba(hue, particle.saturation, clamp(baseLightness - 22, 0, 100), alpha * 0.46)

        drawCircle(ctx, particle.x, particle.y, particle.radius * (3.4 + particle.glow) * glowScale, outerGlow)
        drawCircle(ctx, particle.x, particle.y, particle.radius * (1.85 + particle.glow * 0.55) * glowScale, halo)
        if (particle.tier !== 'dust') {
          drawCircle(ctx, particle.x, particle.y, Math.max(1.1, particle.radius * 0.72) * glowScale, innerCore)
        }
        drawCircle(ctx, particle.x, particle.y, Math.max(0.95, particle.radius * 0.42) * glowScale, core)
      })

      if (this.loadingPhase === 'collapsing') {
        const pulse = 1 + Math.sin(time * 7.4) * 0.12
        drawCircle(ctx, centerX, centerY, 58 * pulse, 'rgba(255, 153, 0, 0.18)')
        drawCircle(ctx, centerX, centerY, 28 * pulse, 'rgba(255, 255, 255, 0.92)')
      }

      if (this.loadingPhase === 'bursting') {
        const pulse = 1 + Math.sin(time * 7.2) * 0.08
        drawCircle(ctx, centerX, centerY, 118 * pulse, 'rgba(255, 153, 0, 0.1)')
        drawCircle(ctx, centerX, centerY, 72 * pulse, 'rgba(255, 255, 255, 0.16)')
        drawCircle(ctx, centerX, centerY, 32 * pulse, 'rgba(255, 255, 255, 0.94)')
      }

      ctx.draw()
    },
    appendProgressThought(stage, message) {
      const nextThought = JOB_STAGE_THOUGHTS[stage] || message
      if (!nextThought) {
        return
      }
      const current = this.loadingThoughts[this.loadingThoughts.length - 1]
      if (current === nextThought) {
        return
      }
      this.loadingThoughts = this.loadingThoughts.slice(-4).concat(nextThought)
      this.thinkingCursor = 0
    },
    normalizeFeedbackWords(words) {
      return Array.isArray(words) ? words.map((item) => String(item || '').trim()).filter(Boolean) : []
    },
    summarizeFeedbackWords(label, words) {
      if (!words.length) {
        return ''
      }
      const preview = words.slice(0, 3).join('、')
      const suffix = words.length > 3 ? ` 等 ${words.length} 个` : ''
      return `${label}：${preview}${suffix}`
    },
    syncWordFeedback(payload) {
      this.wordFeedback = {
        accepted: this.normalizeFeedbackWords(payload?.acceptedWords),
        invalid: this.normalizeFeedbackWords(payload?.invalidWords),
        unsupported: this.normalizeFeedbackWords(payload?.unsupportedWords),
      }
    },
    consumeWordFeedback(payload) {
      this.syncWordFeedback(payload)
      if (this.wordFeedback.accepted.length) {
        this.pendingResults = createGeneratedResults(this.wordFeedback.accepted)
        this.appendProgressThought('accepted', this.summarizeFeedbackWords('已接收', this.wordFeedback.accepted))
      }
      if (this.wordFeedback.invalid.length) {
        this.appendProgressThought('invalid', this.summarizeFeedbackWords('已跳过无效词', this.wordFeedback.invalid))
      }
      if (this.wordFeedback.unsupported.length) {
        this.appendProgressThought('unsupported', this.summarizeFeedbackWords('暂不支持', this.wordFeedback.unsupported))
      }
    },
    handleError(error) {
      this.resetLoadingState()
      const message =
        error?.statusCode === 401
          ? '登录已失效，请重新登录'
          : error?.statusCode === 403
            ? '当前任务不属于该用户'
            : error?.errorCode === 'INVALID_MODEL_CONFIG'
              ? '模型配置不可用，请先到“我的”页检查并保存'
              : error?.errorCode === 'INVALID_WORDS'
                ? '请输入 1 到 12 个有效单词'
                : error?.errorCode === 'POLL_TIMEOUT'
                  ? '生成超时，请稍后重试'
                  : error?.statusCode === 0
                                          ? '后端未连接，请先启动 8080 服务'
                    : error?.message || '生成失败，请稍后重试'
      uni.showToast({
        title: message,
        icon: 'none',
      })
    },
    resolveConstruction(results) {
      try {
        saveGeneratedResults(results)
      } catch (error) {
        this.handleError()
        return
      }

      this.loadingPhase = 'collapsing'
      this.thinkingCursor = Math.max(this.loadingThoughts.length - 1, 0)

      this.collapseTimer = setTimeout(() => {
        this.loadingPhase = 'bursting'
        this.burstTimer = setTimeout(() => {
          uni.navigateTo({
            url: `/pages/results/index?count=${results.length}`,
            success: () => {
              setTimeout(() => {
                this.resetLoadingState()
              }, 60)
            },
            fail: () => {
              this.handleError()
            },
          })
        }, BURST_DURATION)
      }, COLLAPSE_DURATION)
    },
    beginConstruction(words, results) {
      this.isLoading = true
      this.loadingPhase = 'building'
      this.pendingResults = results
      this.loadingThoughts = this.buildThoughts(results, words)
      this.thinkingCursor = 0
      this.clearTimers()

      this.$nextTick(() => {
        this.startMagicAnimation()
      })


    },
    async submitQuery() {
      this.formatInput()
      const words = normalizeWords(this.rawWords)

      if (!words.length) {
        uni.showToast({
          title: '请至少输入 1 个单词',
          icon: 'none',
        })
        return
      }

      try {
        await checkBackendHealth()
        this.beginConstruction(words, createGeneratedResults(words))

        const created = await createGenerationJob(words)
        this.consumeWordFeedback(created)

        if (!this.wordFeedback.accepted.length) {
          this.resetLoadingState()
          uni.showToast({
            title: '没有可生成的有效单词，请调整输入后重试',
            icon: 'none',
          })
          return
        }

        this.appendProgressThought(created.status, '任务已创建')

        const finalPayload = await pollGenerationJob(created.jobId, {
          onProgress: (payload) => {
            this.consumeWordFeedback(payload)
            this.appendProgressThought(payload.progressStage || payload.status, payload.message)
          },
        })

        this.consumeWordFeedback(finalPayload)
        if (isLoggedIn()) {
          syncMyHistory().catch(() => {})
        }
        this.resolveConstruction(finalPayload.results || [])
      } catch (error) {
        this.handleError(error)
      }
    },
  },
}
</script>

<style scoped>
.wh-page-host { position: relative; }
.query-page { padding-bottom: 224rpx; background: var(--wh-bg); }
.query-shell { max-width: 860rpx; }
.brand-stage { display: flex; justify-content: center; padding: 56rpx 0 64rpx; }
.brand-logo { width: 430rpx; }

.composer-card {
  padding: 28rpx;
  background: var(--wh-surface);
  border: 1rpx solid var(--wh-line);
  box-shadow: var(--wh-shadow-md);
  transition: transform 0.24s ease, border-color 0.24s ease;
}

.composer-card--loading {
  transform: scale(0.996);
  border-color: rgba(255, 153, 0, 0.24);
}

.composer-toolbar,
.composer-actions,
.action-btn__content,
.magic-card__topbar {
  display: flex;
  align-items: center;
}

.composer-toolbar,
.magic-card__topbar {
  justify-content: space-between;
}

.composer-toolbar { margin-bottom: 18rpx; }
.composer-helper { flex: 1; min-width: 0; padding-right: 18rpx; font-size: 22rpx; color: var(--wh-text-muted); }
.composer-actions { justify-content: flex-end; gap: 8rpx; flex-shrink: 0; }

.toolbar-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
  min-height: 42rpx;
  padding: 0 12rpx;
  border: 1rpx solid transparent;
  border-radius: var(--wh-btn-radius);
  background: transparent;
  box-shadow: none;
  font-size: 22rpx;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
  transition: background-color 0.18s ease, color 0.18s ease, border-color 0.18s ease, opacity 0.18s ease;
}

.toolbar-link[disabled] { opacity: 0.38; }
.toolbar-link__label { line-height: 1; }
.toolbar-link__icon { position: relative; width: 20rpx; height: 20rpx; flex-shrink: 0; }
.toolbar-link--fill { color: var(--wh-accent); border-color: rgba(255, 153, 0, 0.18); background: rgba(255, 153, 0, 0.08); }
.toolbar-link--clear { color: var(--wh-text-muted); border-color: rgba(255, 255, 255, 0.08); background: rgba(255, 255, 255, 0.03); }
.toolbar-link__spark-core,
.toolbar-link__spark-ray,
.toolbar-link__spark-dot,
.toolbar-link__clear-line,
.action-glyph__orbit,
.action-glyph__core,
.action-glyph__ray,
.magic-stage__ring,
.magic-stage__flash {
  position: absolute;
}

.toolbar-link__spark-core {
  top: 5rpx;
  left: 5rpx;
  width: 10rpx;
  height: 10rpx;
  border-radius: 4rpx;
  background: currentColor;
  transform: rotate(45deg);
}

.toolbar-link__spark-ray,
.toolbar-link__spark-dot,
.toolbar-link__clear-line,
.action-glyph__ray { background: currentColor; }
.toolbar-link__spark-ray { border-radius: 999rpx; }
.toolbar-link__spark-ray--vertical { top: 0; left: 9rpx; width: 2rpx; height: 6rpx; }
.toolbar-link__spark-ray--horizontal { top: 9rpx; left: 0; width: 6rpx; height: 2rpx; }
.toolbar-link__spark-dot { top: 2rpx; right: 1rpx; width: 4rpx; height: 4rpx; border-radius: 50%; opacity: 0.6; }
.toolbar-link__clear-line { top: 9rpx; left: 2rpx; width: 16rpx; height: 2rpx; border-radius: 999rpx; }
.toolbar-link__clear-line--left { transform: rotate(45deg); }
.toolbar-link__clear-line--right { transform: rotate(-45deg); }

.textarea-shell { transition: filter 0.28s ease, opacity 0.28s ease, transform 0.28s ease; }
.textarea-shell--loading { filter: blur(6rpx); opacity: 0.76; transform: scale(0.998); }
.query-textarea {
  min-height: 340rpx;
  padding: 30rpx;
  background: var(--wh-bg-strong);
  border-color: rgba(255, 255, 255, 0.1);
  font-size: 30rpx;
  line-height: 1.82;
}

.parsed-row {
  display: flex;
  flex-wrap: wrap;
  margin: 24rpx -16rpx -16rpx 0;
  transition: opacity 0.24s ease;
}

.parsed-row--loading { opacity: 0.48; }
.word-feedback { display: flex; flex-direction: column; gap: 14rpx; margin-top: 22rpx; padding: 18rpx 20rpx; border-radius: var(--wh-radius-lg); background: #111111; border: 1rpx solid rgba(255, 255, 255, 0.08); transition: opacity 0.24s ease; }
.word-feedback--loading { opacity: 0.72; }
.word-feedback__group { display: flex; flex-direction: column; gap: 10rpx; }
.word-feedback__label { font-size: 22rpx; font-weight: 700; color: var(--wh-text-main); }
.word-feedback__tags { display: flex; flex-wrap: wrap; gap: 10rpx; }
.word-feedback__tag { display: inline-flex; align-items: center; min-height: 42rpx; padding: 0 16rpx; border-radius: 999rpx; font-size: 20rpx; font-weight: 600; border: 1rpx solid transparent; }
.word-feedback__tag--accepted { background: rgba(48, 194, 103, 0.14); border-color: rgba(48, 194, 103, 0.24); color: #6fe59a; }
.word-feedback__tag--invalid { background: rgba(255, 90, 79, 0.12); border-color: rgba(255, 90, 79, 0.26); color: #ff8d84; }
.word-feedback__tag--unsupported { background: rgba(255, 153, 0, 0.12); border-color: rgba(255, 153, 0, 0.24); color: var(--wh-accent-strong); }
.action-btn { width: 100%; min-height: 80rpx; margin-top: 28rpx; border-radius: var(--wh-btn-radius); }
.action-btn--loading { opacity: 1 !important; }
.action-btn__content { justify-content: center; gap: 12rpx; }
.action-btn__content text { font-size: 30rpx; font-weight: 700; }

.action-glyph {
  position: relative;
  width: 30rpx;
  height: 30rpx;
  flex-shrink: 0;
}

.action-glyph__orbit {
  inset: 1rpx;
  border-radius: 50%;
  border: 2rpx solid rgba(0, 0, 0, 0.28);
}

.action-glyph__core {
  top: 9rpx;
  left: 9rpx;
  width: 12rpx;
  height: 12rpx;
  border-radius: 4rpx;
  background: rgba(0, 0, 0, 0.92);
  transform: rotate(45deg);
}

.action-glyph__ray--vertical {
  top: 2rpx;
  left: 14rpx;
  width: 2rpx;
  height: 26rpx;
}

.action-glyph__ray--horizontal {
  top: 14rpx;
  left: 2rpx;
  width: 26rpx;
  height: 2rpx;
}

.action-glyph--spinning { animation: spinGlyph 1.15s linear infinite; }

.magic-overlay {
  position: fixed;
  inset: 0;
  z-index: 1200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 24px 40px;
  background: rgba(0, 0, 0, 0.82);
  overflow: hidden;
}

.magic-overlay__aurora {
  position: absolute;
  width: 520rpx;
  height: 520rpx;
  border-radius: 50%;
  filter: blur(44rpx);
  opacity: 0.7;
}

.magic-overlay__aurora--left {
  top: 12%;
  left: -12%;
  background: radial-gradient(circle, rgba(255, 153, 0, 0.18) 0%, rgba(255, 153, 0, 0) 72%);
}

.magic-overlay__aurora--right {
  right: -14%;
  bottom: 10%;
  background: radial-gradient(circle, rgba(255, 192, 72, 0.16) 0%, rgba(255, 192, 72, 0) 72%);
}

.magic-card {
  position: relative;
  width: min(320px, calc(100vw - 56px));
  max-width: 320px;
  margin: 40px auto;
  display: grid;
  grid-template-rows: auto auto minmax(188px, auto) auto;
  padding: 16px;
  border-radius: var(--wh-btn-radius);
  background: #131313;
  border: 1px solid rgba(255, 153, 0, 0.2);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55);
  overflow: hidden;
  animation: floatCard 3.6s ease-in-out infinite;
  transition: transform 0.34s ease, box-shadow 0.34s ease;
}

.magic-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255, 153, 0, 0.08) 0%, rgba(255, 153, 0, 0) 32%);
  pointer-events: none;
}

.magic-card--collapsing { animation: none; transform: scale(0.982); }
.magic-card--bursting { animation: none; transform: scale(1.02); box-shadow: 0 24px 68px rgba(0, 0, 0, 0.64); }
.magic-card__topbar,
.magic-card__headline,
.magic-stage,
.magic-thoughts { position: relative; z-index: 1; }
.magic-card__eyebrow { font-size: 12px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--wh-accent); }
.magic-card__pill { display: inline-flex; align-items: center; justify-content: center; min-height: 30px; padding: 0 12px; border-radius: 999px; background: rgba(255, 153, 0, 0.12); color: var(--wh-accent-strong); font-size: 12px; font-weight: 600; white-space: nowrap; border: 1px solid rgba(255, 153, 0, 0.18); }
.magic-card__headline { margin-top: 10px; }
.magic-card__title,
.magic-card__subtitle { display: block; }
.magic-card__title { font-size: 18px; line-height: 1.18; font-weight: 700; color: #ffffff; }
.magic-card__subtitle { margin-top: 6px; font-size: 13px; line-height: 1.5; color: var(--wh-text-muted); }

.magic-stage {
  margin-top: 14px;
  height: 188px;
  min-height: 0;
  border-radius: var(--wh-btn-radius);
  overflow: hidden;
  background: linear-gradient(180deg, #090909 0%, #111111 100%);
  border: 1px solid rgba(255, 153, 0, 0.12);
}

.magic-canvas { display: block; width: 100%; height: 100%; }
.magic-stage__ring { top: 50%; left: 50%; border-radius: 50%; transform: translate(-50%, -50%); pointer-events: none; }
.magic-stage__ring--outer { width: 58%; height: 58%; border: 1px solid rgba(255, 153, 0, 0.18); opacity: 0.32; animation: spinStage 18s linear infinite; }
.magic-stage__ring--inner { width: 30%; height: 30%; border: 1px dashed rgba(255, 195, 87, 0.28); opacity: 0.42; animation: spinStageReverse 11s linear infinite; }

.magic-stage__flash {
  top: 50%;
  left: 50%;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 204, 112, 0.98) 0%, rgba(255, 153, 0, 0.55) 36%, rgba(255, 153, 0, 0) 76%);
  transform: translate(-50%, -50%) scale(0.16);
  opacity: 0;
  pointer-events: none;
}

.magic-stage__flash--collapsing { opacity: 1; transform: translate(-50%, -50%) scale(1); animation: pulseFlash 0.55s ease-in-out infinite; }
.magic-stage__flash--bursting { opacity: 0; transform: translate(-50%, -50%) scale(8.8); transition: transform 0.36s ease-out, opacity 0.36s ease-out; }

.terminal-logs {
  position: relative;
  margin-top: 12px;
  min-height: 28px;
  padding: 10px 12px;
  border-radius: var(--wh-btn-radius);
  background: #0b0b0b;
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.terminal-log {
  position: absolute;
  left: 12px;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  line-height: 1.45;
  color: #c3c3c3;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  opacity: 1;
}

.terminal-log--enter {
  animation: terminalLogEnter 0.32s ease forwards;
}

.terminal-log--exit {
  animation: terminalLogExit 0.32s ease forwards;
}

@keyframes spinGlyph {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes spinStage {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

@keyframes spinStageReverse {
  from { transform: translate(-50%, -50%) rotate(360deg); }
  to { transform: translate(-50%, -50%) rotate(0deg); }
}

@keyframes pulseFlash {
  0%, 100% { opacity: 0.92; }
  50% { opacity: 0.64; }
}

@keyframes terminalLogEnter {
  from { opacity: 0; transform: translateY(calc(-50% + 10px)); }
  to { opacity: 1; transform: translateY(-50%); }
}

@keyframes terminalLogExit {
  from { opacity: 1; transform: translateY(-50%); }
  to { opacity: 0; transform: translateY(calc(-50% - 10px)); }
}

@keyframes floatCard {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

@media (hover: hover) {
  .toolbar-link--fill:hover { background: rgba(255, 153, 0, 0.14); }
  .toolbar-link--clear:hover { color: #ffffff; background: rgba(255, 255, 255, 0.06); }
}

@media screen and (min-width: 768px) {
  .query-shell { max-width: 100%; }
  .brand-stage { padding-top: 92rpx; padding-bottom: 80rpx; }
  .brand-logo { width: 520rpx; }
  .composer-card { padding: 36rpx; }
  .magic-card { margin: 48px auto; }
}

@media screen and (min-width: 1024px) {
  .query-page { padding-bottom: 156px; }
  .brand-stage { padding-top: 42px; padding-bottom: 26px; }
  .brand-logo { width: 280px; }
  .composer-card { padding: 24px; border-radius: var(--wh-btn-radius); background: var(--wh-surface); box-shadow: 0 22px 48px rgba(0, 0, 0, 0.44); }
  .query-textarea { min-height: 240px; }
  .magic-overlay { padding: 32px; }
  .magic-overlay__aurora { width: 320px; height: 320px; filter: blur(32px); }
  .magic-card { width: 320px; max-width: 320px; margin: 56px auto; padding: 18px; border-radius: var(--wh-btn-radius); }
  .magic-card__eyebrow { font-size: 12px; letter-spacing: 1.8px; }
  .magic-card__pill { min-height: 30px; padding: 0 12px; font-size: 12px; }
  .magic-card__headline { margin-top: 10px; }
  .magic-card__title { font-size: 20px; }
  .magic-card__subtitle { margin-top: 6px; font-size: 13px; line-height: 1.45; }
  .magic-stage { margin-top: 14px; height: 192px; border-radius: var(--wh-btn-radius); }
  .magic-stage__flash { width: 42px; height: 42px; }
  .terminal-logs { margin-top: 12px; min-height: 28px; padding: 10px 12px; border-radius: var(--wh-btn-radius); }
  .terminal-log { font-size: 12px; line-height: 1.4; }
}
</style>
