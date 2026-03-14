const STORAGE_KEYS = {
  bootstrapped: 'wordhub:bootstrapped',
  authVersion: 'wordhub:auth-version',
  legacySession: 'wordhub:session',
  token: 'wordhub:auth-token',
  user: 'wordhub:user',
  stats: 'wordhub:stats',
  results: 'wordhub:results',
  reviewDeck: 'wordhub:review-deck',
  aiConfig: 'wordhub:ai-config',
  historyJobs: 'wordhub:history-jobs',
  historyCards: 'wordhub:history-cards',
}

const DEFAULT_BACKEND_PORT = '8080'
const DEFAULT_BACKEND_BASE_URL = 'https://fsxnvufgnaiz.sealosbja.site'
const DEFAULT_POLL_INTERVAL_MS = 1000
const DEFAULT_TIMEOUT_MS = 10000
const DEFAULT_MAX_POLL_ATTEMPTS = 180
const DEFAULT_APP_VERSION = 'wordhub-web'
const DEFAULT_USER = {
  nickname: 'Luna Moss',
  account: 'luna@wordhub.ai',
  plan: 'CET-6 Visual Sprint',
  streak: 12,
  avatar: 'LM',
  avatarUrl: '',
}

const EMPTY_STATS = {
  reviewed: 0,
  mastered: 0,
  accuracy: 0,
  streak: 0,
  todayGoal: 24,
  todayDone: 0,
  totalSessions: 0,
  librarySize: 0,
  correctCount: 0,
}

const DEFAULT_AI_MODEL_CONFIG = {
  textProvider: 'deepseek',
  textApiKey: '',
  imageProvider: 'openai',
  imageApiKey: '',
  imageLinked: true,
  hasTextApiKey: false,
  hasImageApiKey: false,
  textApiKeyMasked: '',
  imageApiKeyMasked: '',
  updatedAt: '',
}

const PHOTO_PALETTES = [
  ['rgba(17, 19, 34, 0.96)', 'rgba(66, 154, 255, 0.55)', 'rgba(162, 75, 252, 0.18)'],
  ['rgba(24, 20, 34, 0.96)', 'rgba(255, 152, 92, 0.52)', 'rgba(255, 216, 120, 0.16)'],
  ['rgba(16, 21, 32, 0.96)', 'rgba(92, 194, 160, 0.48)', 'rgba(214, 244, 238, 0.16)'],
  ['rgba(23, 19, 33, 0.96)', 'rgba(250, 93, 125, 0.48)', 'rgba(255, 206, 214, 0.16)'],
  ['rgba(15, 22, 33, 0.96)', 'rgba(110, 143, 255, 0.52)', 'rgba(208, 223, 255, 0.16)'],
  ['rgba(28, 23, 36, 0.96)', 'rgba(130, 120, 255, 0.44)', 'rgba(235, 229, 255, 0.18)'],
]

const WORD_BANK = {
  vivid: {
    meaning: '生动的；鲜明的',
    visualCueZh: '雨林绿叶上一只色彩极其鲜艳的红毒箭蛙',
    note: '避免抽象写成“鲜艳色块”，要直接落到真实可拍摄的高对比微距场景。',
    example: 'The vivid frog makes the new word impossible to ignore.',
    promptSections: {
      subjectAction: 'A macro photography shot of a bright red poison dart frog gripping a wet tropical leaf',
      setting: 'deep in a lush rainforest filled with dense emerald foliage',
      lighting: 'fresh raindrops glistening under crisp natural daylight with intense color contrast',
      camera: 'macro lens, shallow depth of field, ultra realistic wildlife photography',
    },
  },
  anchor: {
    meaning: '锚；使固定',
    visualCueZh: '清晨港口木码头旁，一只沉重铁锚挂着海水和锈迹',
    note: '通过重量感、材质和海港环境，把“锚定”变成具体且稳定的视觉对象。',
    example: 'A strong image can anchor a new word in your long-term memory.',
    promptSections: {
      subjectAction: 'A heavy iron ship anchor resting on weathered wooden planks beside a harbor dock',
      setting: 'in a quiet seaside port with blurred fishing boats and calm seawater in the background',
      lighting: 'cool sea mist mixing with warm sunrise light on wet metal and thick rope',
      camera: 'low-angle documentary shot, 35mm lens, highly realistic texture detail',
    },
  },
  serene: {
    meaning: '宁静的；安详的',
    visualCueZh: '黎明薄雾中的山间湖面，一只木船静静停在镜面般的水上',
    note: '宁静感要来自真实环境中的“静止、薄雾、平静水面”，而不是空泛的柔和色块。',
    example: 'The serene lake scene slows the whole memory down.',
    promptSections: {
      subjectAction: 'A small wooden rowboat floating motionless on a glassy mountain lake',
      setting: 'surrounded by misty pine-covered hills at dawn',
      lighting: 'soft blue morning light and thin fog creating a peaceful atmosphere',
      camera: 'wide-angle landscape shot, clean composition, photorealistic style',
    },
  },
  pulse: {
    meaning: '脉搏；跳动',
    visualCueZh: '安静诊室里，医生两根手指正搭在病人手腕上测脉搏',
    note: '比起发光心跳线，更适合用“真实手腕脉搏检查”这种具体医疗动作来承载词义。',
    example: 'The doctor checked the patient’s pulse before speaking.',
    promptSections: {
      subjectAction: 'A doctor gently checking a patient’s pulse on the wrist with two fingers',
      setting: 'inside a quiet clinic room with a stethoscope and medical chart nearby',
      lighting: 'soft window light falling across the skin with calm clinical detail',
      camera: 'close-up documentary photography, 50mm lens, shallow depth of field',
    },
  },
  orchard: {
    meaning: '果园',
    visualCueZh: '傍晚夕阳穿透树叶，结满红苹果的整齐果园',
    note: '重点是“成排果树 + 成熟果实 + 纵深路径”，让果园一眼就能被识别。',
    example: 'We walked through the orchard after the summer rain.',
    promptSections: {
      subjectAction: 'A realistic wide-angle shot of long rows of apple trees heavy with ripe red fruit',
      setting: 'in a well-kept orchard with a narrow dirt path running through the center',
      lighting: 'golden hour sunlight filtering through the leaves and casting warm highlights',
      camera: 'wide-angle lens, cinematic composition, photorealistic landscape photography',
    },
  },
  glacier: {
    meaning: '冰川',
    visualCueZh: '蓝白色冰川裂隙在极地山谷中向远处延伸',
    note: '要拍出冰川的体量、冰裂纹理和寒冷空气感，而不是简单的蓝白渐变背景。',
    example: 'The glacier looked ancient and impossibly cold.',
    promptSections: {
      subjectAction: 'A towering blue glacier with deep ice cracks stretching into the distance',
      setting: 'in a remote arctic valley beside dark rocky terrain',
      lighting: 'cold overcast daylight reflecting through translucent ice surfaces',
      camera: 'wide-angle travel photography, cinematic realism, ultra detailed',
    },
  },
  agile: {
    meaning: '敏捷的；灵活的',
    visualCueZh: '城市屋顶之间，一名跑酷运动员正腾空跃起',
    note: '敏捷感最好通过被定格的动作瞬间来表现，避免只写“快”或“灵活”。',
    example: 'Agile teams react quickly because they keep moving.',
    promptSections: {
      subjectAction: 'A parkour athlete mid-leap between two concrete rooftops',
      setting: 'above a modern city alley with distant buildings softly blurred',
      lighting: 'clear afternoon light freezing the motion and highlighting muscle tension',
      camera: 'telephoto action shot, sharp focus, photorealistic sports photography',
    },
  },
  bloom: {
    meaning: '开花；繁荣',
    visualCueZh: '春雨过后，粉色樱花在枝头近距离绽放',
    note: '把“绽放”落到花瓣、雨滴、枝头的真实细节上，比抽象的成长概念更容易记。',
    example: 'New ideas bloom when the environment feels safe.',
    promptSections: {
      subjectAction: 'A close-up of pink cherry blossoms opening on thin branches',
      setting: 'in a quiet city park just after a spring rain',
      lighting: 'soft morning sunlight catching water droplets on the petals',
      camera: 'macro floral photography, shallow depth of field, photorealistic',
    },
  },
  lantern: {
    meaning: '灯笼；提灯',
    visualCueZh: '雨后的老街夜巷里，一盏暖光纸灯笼挂在木质店铺门前',
    note: '暖光与冷色街巷的反差是这个词最强的视觉记忆点。',
    example: 'A single lantern guided them through the dark alley.',
    promptSections: {
      subjectAction: 'A glowing paper lantern hanging outside a narrow old street shop',
      setting: 'in a rain-washed night alley lined with dark wooden walls',
      lighting: 'warm amber light contrasting with cool blue evening shadows',
      camera: 'cinematic street photography, 50mm lens, highly detailed',
    },
  },
  horizon: {
    meaning: '地平线；眼界',
    visualCueZh: '海边悬崖上，一个旅人正望向远处发光的海天交界线',
    note: '不要只写“远方”，要给出人物、地形和海天相接的具体空间关系。',
    example: 'Travel helps expand your horizon beyond familiar places.',
    promptSections: {
      subjectAction: 'A lone traveler standing on a cliff edge looking toward the ocean horizon',
      setting: 'above a vast coastline with layers of sea and sky meeting in the distance',
      lighting: 'orange sunrise light breaking through low clouds and sea mist',
      camera: 'wide cinematic shot, dramatic depth, photorealistic landscape photography',
    },
  },
  prism: {
    meaning: '棱镜',
    visualCueZh: '阳光照进房间，一只透明玻璃棱镜在木桌上折射出清晰彩虹',
    note: '核心不是“彩虹色”，而是“棱镜折射白光”的真实物理场景。',
    example: 'The prism bent the light into separate colors.',
    promptSections: {
      subjectAction: 'A clear glass prism placed on a wooden table splitting sunlight into a visible rainbow',
      setting: 'in a bright studio corner with soft shadows on a white wall',
      lighting: 'clean natural sunlight creating sharp refraction and vivid spectral color',
      camera: 'close-up still life photography, crisp focus, photorealistic',
    },
  },
  forge: {
    meaning: '锻造；逐步形成',
    visualCueZh: '昏暗铁匠铺里，铁匠正挥锤敲打一块发红的钢铁，火花四溅',
    note: '“锻造”最适合用热铁、铁砧、火花这些高能量细节强化记忆。',
    example: 'Daily practice helps forge stronger habits.',
    promptSections: {
      subjectAction: 'A blacksmith striking a glowing piece of steel on an anvil',
      setting: 'inside a dark metal workshop with tools and sparks surrounding the frame',
      lighting: 'hot orange firelight contrasting against the dim industrial background',
      camera: 'mid-action cinematic photography, high shutter speed, photorealistic',
    },
  },
}

const EXTRA_MEANINGS = ['敏捷的；灵活的', '开花；繁荣', '灯笼；提灯', '地平线；眼界', '棱镜', '锻造；逐步形成']
const PROMPT_SUFFIX = 'photorealistic, 8k resolution, highly detailed.'

function readJSON(key, fallback) {
  try {
    const value = uni.getStorageSync(key)
    if (!value) {
      return fallback
    }
    return JSON.parse(value)
  } catch (error) {
    return fallback
  }
}

function writeJSON(key, value) {
  uni.setStorageSync(key, JSON.stringify(value))
}

function hasStoredJSON(key) {
  const value = uni.getStorageSync(key)
  return value !== '' && value !== null && typeof value !== 'undefined'
}

function slugifyWord(word) {
  return String(word || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
}

function titleizeWord(word) {
  const trimmed = String(word || '').trim()
  if (!trimmed) {
    return ''
  }
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
}

function composePrompt(promptSections) {
  return [
    promptSections.subjectAction,
    promptSections.setting,
    promptSections.lighting,
    promptSections.camera,
    PROMPT_SUFFIX,
  ].join(', ')
}

function createPosterBackground(index) {
  const palette = PHOTO_PALETTES[index % PHOTO_PALETTES.length]
  return [
    `radial-gradient(circle at 82% 18%, ${palette[1]} 0%, transparent 34%)`,
    `radial-gradient(circle at 18% 80%, ${palette[2]} 0%, transparent 30%)`,
    `linear-gradient(145deg, ${palette[0]} 0%, rgba(10, 12, 22, 0.98) 100%)`,
  ].join(', ')
}

function clearLegacySessionFlag() {
  uni.removeStorageSync(STORAGE_KEYS.legacySession)
}

function bootstrapAuthStorage() {
  const authVersion = String(uni.getStorageSync(STORAGE_KEYS.authVersion) || '').trim()
  if (authVersion !== '5') {
    uni.setStorageSync(STORAGE_KEYS.authVersion, '5')
    if (!readAuthToken()) {
      uni.removeStorageSync(STORAGE_KEYS.user)
      uni.removeStorageSync(STORAGE_KEYS.stats)
      uni.removeStorageSync(STORAGE_KEYS.aiConfig)
    }
    clearLegacySessionFlag()
  }

  const bootstrapped = uni.getStorageSync(STORAGE_KEYS.bootstrapped)
  if (bootstrapped) {
    clearLegacySessionFlag()
    return
  }

  uni.setStorageSync(STORAGE_KEYS.bootstrapped, '1')
  clearLegacySessionFlag()
}
function buildChoices(currentMeaning, index, pool) {
  const uniquePool = pool.filter((item) => item !== currentMeaning)
  const picks = uniquePool.slice(index, index + 3)
  while (picks.length < 3) {
    picks.push(uniquePool[picks.length % uniquePool.length] || '待补充释义')
  }
  const choices = [currentMeaning].concat(picks).slice(0, 4)
  return choices
    .map((item, choiceIndex) => ({
      item,
      score: (choiceIndex * 17 + index * 11) % 31,
    }))
    .sort((a, b) => a.score - b.score)
    .map((entry) => entry.item)
}

function getFallbackPrompt(displayWord) {
  return {
    meaning: '待补充释义',
    visualCueZh: `${displayWord} 的专属写实视觉脚本待补充`,
    note: '该单词暂无专属视觉脚本。接入真实词义服务后，应先解析词义，再生成具体、写实、可拍摄的场景提示词。',
    example: `${displayWord} needs a concrete real-world scene before calling the image model.`,
    promptSections: {
      subjectAction: `A realistic editorial photograph of a tangible object that clearly represents the word "${displayWord}"`,
      setting: 'placed in a believable real-world environment with supporting contextual details',
      lighting: 'natural light with strong texture, contrast, and realistic shadows',
      camera: '50mm lens, documentary photography style',
    },
  }
}

function buildResultItem(word, index) {
  const normalized = slugifyWord(word)
  const displayWord = titleizeWord(word) || `Word ${index + 1}`
  const preset = WORD_BANK[normalized] || getFallbackPrompt(displayWord)
  const imagePrompt = composePrompt(preset.promptSections)

  return {
    id: `${normalized || 'word'}-${index}`,
    word: displayWord,
    meaning: preset.meaning,
    note: preset.note,
    scene: preset.visualCueZh,
    visualCueZh: preset.visualCueZh,
    example: preset.example,
    imagePrompt,
    promptSections: preset.promptSections,
    cameraStyle: preset.promptSections.camera,
    posterBackground: createPosterBackground(index),
    accentColor: '#429AFF',
    promptVersion: 'photorealistic-v1',
  }
}

function normalizeImageAsset(asset) {
  const source = asset && typeof asset === 'object' ? asset : {}
  const width = Number(source.width)
  const height = Number(source.height)
  return {
    format: String(source.format || '').trim() || 'png',
    width: Number.isFinite(width) && width > 0 ? width : 768,
    height: Number.isFinite(height) && height > 0 ? height : 1024,
    ratio: String(source.ratio || '').trim() || '3:4',
    authRequired: Boolean(source.authRequired),
    expiresAt: String(source.expiresAt || '').trim(),
    directDownload: source.directDownload !== false,
    safeArea: source.safeArea && typeof source.safeArea === 'object' ? source.safeArea : null,
  }
}

function normalizeResultItem(item, index, pool) {
  const source = item && typeof item === 'object' ? item : {}
  const fallback = buildResultItem(source.word || source.id || '', index)
  const meaning = String(source.meaning || fallback.meaning || '').trim()
  const visualCueZh = String(source.visualCueZh || source.scene || fallback.visualCueZh || '').trim() || fallback.visualCueZh

  const normalizedItem = {
    ...fallback,
    ...source,
    word: titleizeWord(source.word || fallback.word) || fallback.word,
    meaning: meaning || fallback.meaning,
    note: String(source.note || fallback.note || '').trim() || fallback.note,
    scene: String(source.scene || visualCueZh || fallback.scene || '').trim() || fallback.scene,
    visualCueZh,
    imageUrl: String(source.imageUrl || '').trim(),
    downloadUrl: String(source.downloadUrl || source.imageUrl || '').trim(),
    imageAsset: normalizeImageAsset(source.imageAsset),
    posterBackground: String(source.posterBackground || fallback.posterBackground || '').trim() || fallback.posterBackground,
    accentColor: String(source.accentColor || fallback.accentColor || '').trim() || fallback.accentColor,
    promptVersion: String(source.promptVersion || fallback.promptVersion || '').trim() || fallback.promptVersion,
  }

  normalizedItem.choices = Array.isArray(source.choices) && source.choices.length
    ? source.choices.map((choice) => String(choice || '').trim()).filter(Boolean)
    : buildChoices(normalizedItem.meaning, index, pool)

  return normalizedItem
}

function migrateStoredResults(stored) {
  const items = Array.isArray(stored) ? stored : []
  const fallbackPool = items.map((item, index) => {
    const source = item && typeof item === 'object' ? item : {}
    const fallback = buildResultItem(source.word || source.id || '', index)
    return String(source.meaning || fallback.meaning || '').trim() || fallback.meaning
  })
  const pool = fallbackPool.concat(EXTRA_MEANINGS)

  return items.map((item, index) => normalizeResultItem(item, index, pool))
}

function getReviewItemKey(item, index) {
  const normalizedWord = slugifyWord(item?.word || '')
  if (normalizedWord) {
    return `word:${normalizedWord}`
  }
  const normalizedId = slugifyWord(item?.id || '')
  if (normalizedId) {
    return `id:${normalizedId}`
  }
  return `index:${index}`
}

function mergeReviewDeckResults(latestResults, existingResults) {
  const merged = []
  const seen = new Set()
  const sources = [
    Array.isArray(latestResults) ? latestResults : [],
    Array.isArray(existingResults) ? existingResults : [],
  ]

  sources.forEach((group) => {
    group.forEach((item, index) => {
      const key = getReviewItemKey(item, index)
      if (seen.has(key)) {
        return
      }
      seen.add(key)
      merged.push(item)
    })
  })

  return migrateStoredResults(merged)
}

function readStoredReviewDeck() {
  bootstrapAuthStorage()
  if (hasStoredJSON(STORAGE_KEYS.reviewDeck)) {
    return migrateStoredResults(readJSON(STORAGE_KEYS.reviewDeck, []))
  }

  const legacyResults = migrateStoredResults(readJSON(STORAGE_KEYS.results, []))
  if (legacyResults.length) {
    writeJSON(STORAGE_KEYS.reviewDeck, legacyResults)
  }
  return legacyResults
}

export function normalizeWords(rawInput) {
  return String(rawInput || '')
    .replace(/[，、；;]/g, ',')
    .replace(/\s+/g, ' ')
    .split(/[,\s]/)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
    .filter((item, index, list) => list.indexOf(item) === index)
    .slice(0, 12)
}

export function createGeneratedResults(words) {
  const sourceWords = words && words.length ? words : ['vivid', 'anchor', 'serene', 'pulse', 'orchard', 'glacier']
  const items = sourceWords.map((word, index) => buildResultItem(word, index))
  const pool = items.map((item) => item.meaning).concat(EXTRA_MEANINGS)

  return items.map((item, index) => ({
    ...item,
    choices: buildChoices(item.meaning, index, pool),
  }))
}

export function saveGeneratedResults(results) {
  bootstrapAuthStorage()
  const existingReviewDeck = readStoredReviewDeck()
  const nextResults = migrateStoredResults(results)
  writeJSON(STORAGE_KEYS.results, nextResults)
  const nextReviewDeck = mergeReviewDeckResults(nextResults, existingReviewDeck)
  writeJSON(STORAGE_KEYS.reviewDeck, nextReviewDeck)
  if (!isLoggedIn()) {
    return nextResults
  }
  const stats = getReviewStats()
  stats.librarySize = nextReviewDeck.length
  stats.todayDone = Math.min(stats.todayGoal, stats.todayDone + Math.min(nextResults.length, 4))
  writeJSON(STORAGE_KEYS.stats, stats)
  return nextResults
}

export function getGeneratedResults() {
  bootstrapAuthStorage()
  return migrateStoredResults(readJSON(STORAGE_KEYS.results, []))
}

export function getReviewDeck() {
  return readStoredReviewDeck()
}

export function removeReviewDeckItem(targetItem) {
  bootstrapAuthStorage()
  const currentDeck = readStoredReviewDeck()
  const targetWord = slugifyWord(targetItem?.word || '')
  const targetId = String(targetItem?.id || '').trim()
  const nextDeck = currentDeck.filter((item) => {
    if (targetWord) {
      return slugifyWord(item?.word || '') !== targetWord
    }
    if (targetId) {
      return String(item?.id || '').trim() !== targetId
    }
    return item !== targetItem
  })

  writeJSON(STORAGE_KEYS.reviewDeck, nextDeck)
  if (isLoggedIn()) {
    const stats = getReviewStats()
    stats.librarySize = nextDeck.length
    writeJSON(STORAGE_KEYS.stats, stats)
  }
  return nextDeck
}

function deriveAvatarLabel(user) {
  const nickname = String(user?.nickname || '').trim()
  const email = String(user?.email || user?.account || '').trim()
  const seed = nickname || email || DEFAULT_USER.nickname
  const clean = seed.replace(/[^A-Za-z0-9\u4e00-\u9fa5]/g, '')
  return clean.slice(0, 2).toUpperCase() || DEFAULT_USER.avatar
}

function normalizeAvatarUrl(value) {
  const candidate = value == null ? '' : String(value).trim()
  return /^https?:\/\//i.test(candidate) ? candidate : ''
}

function normalizeUser(user) {
  const source = user && typeof user === 'object' ? user : {}
  const email = String(source.email || source.account || '').trim()
  const nickname = String(source.nickname || source.name || '').trim() || DEFAULT_USER.nickname
  const avatarUrl = normalizeAvatarUrl(source.avatarUrl || source.avatar_url)
  return {
    ...DEFAULT_USER,
    ...source,
    email,
    account: email || DEFAULT_USER.account,
    nickname,
    avatar: String(source.avatar || '').trim() || deriveAvatarLabel({ nickname, email }),
    avatarUrl,
    streak: Number.isFinite(source.streak) ? source.streak : 0,
    plan: String(source.plan || '').trim(),
  }
}

function normalizeModelConfig(config) {
  const source = config && typeof config === 'object' ? config : {}
  const textProvider = String(source.textProvider || DEFAULT_AI_MODEL_CONFIG.textProvider).trim() || DEFAULT_AI_MODEL_CONFIG.textProvider
  const imageProvider = String(source.imageProvider || source.textProvider || DEFAULT_AI_MODEL_CONFIG.imageProvider).trim() || DEFAULT_AI_MODEL_CONFIG.imageProvider
  return {
    ...DEFAULT_AI_MODEL_CONFIG,
    ...source,
    textProvider,
    imageProvider,
    imageLinked: source.imageLinked !== false,
    hasTextApiKey: Boolean(source.hasTextApiKey),
    hasImageApiKey: Boolean(source.hasImageApiKey),
    textApiKeyMasked: String(source.textApiKeyMasked || '').trim(),
    imageApiKeyMasked: String(source.imageApiKeyMasked || '').trim(),
    textApiKey: '',
    imageApiKey: '',
    updatedAt: String(source.updatedAt || '').trim(),
  }
}

function cacheAiModelConfig(config) {
  const nextConfig = normalizeModelConfig(config)
  writeJSON(STORAGE_KEYS.aiConfig, nextConfig)
  return nextConfig
}

function readAuthToken() {
  return String(uni.getStorageSync(STORAGE_KEYS.token) || '').trim()
}

function seedReviewStats() {
  const nextStats = { ...EMPTY_STATS }
  writeJSON(STORAGE_KEYS.stats, nextStats)
  return nextStats
}

export function getAuthToken() {
  bootstrapAuthStorage()
  return readAuthToken()
}

export function saveAuthSession(token, user, options = {}) {
  bootstrapAuthStorage()
  const normalizedToken = String(token || '').trim()
  if (!normalizedToken) {
    throw new WordHubApiError('missing auth token', {
      errorCode: 'AUTH_TOKEN_MISSING',
      baseUrl: getBackendBaseUrl(),
    })
  }

  const normalizedUser = normalizeUser(user)
  uni.setStorageSync(STORAGE_KEYS.token, normalizedToken)
  clearLegacySessionFlag()
  writeJSON(STORAGE_KEYS.user, normalizedUser)

  const stats = readJSON(STORAGE_KEYS.stats, null) || seedReviewStats()
  let modelConfig = getAiModelConfig()
  if (options.modelConfig) {
    modelConfig = cacheAiModelConfig(options.modelConfig)
  }

  return {
    token: normalizedToken,
    user: normalizedUser,
    stats,
    modelConfig,
  }
}

export function clearAuthSession(options = {}) {
  const keepResults = Boolean(options.keepResults)
  clearLegacySessionFlag()
  uni.removeStorageSync(STORAGE_KEYS.token)
  uni.removeStorageSync(STORAGE_KEYS.user)
  uni.removeStorageSync(STORAGE_KEYS.stats)
  uni.removeStorageSync(STORAGE_KEYS.aiConfig)
  uni.removeStorageSync(STORAGE_KEYS.historyJobs)
  uni.removeStorageSync(STORAGE_KEYS.historyCards)
  if (!keepResults) {
    uni.removeStorageSync(STORAGE_KEYS.results)
    uni.removeStorageSync(STORAGE_KEYS.reviewDeck)
  }
}

export function isLoggedIn() {
  bootstrapAuthStorage()
  return Boolean(readAuthToken())
}

export function getCurrentUser() {
  if (!isLoggedIn()) {
    return null
  }
  const stored = readJSON(STORAGE_KEYS.user, null)
  return stored ? normalizeUser(stored) : null
}

export function getReviewStats() {
  bootstrapAuthStorage()
  if (!isLoggedIn()) {
    return { ...EMPTY_STATS }
  }
  const stats = readJSON(STORAGE_KEYS.stats, null)
  if (stats) {
    return {
      ...EMPTY_STATS,
      ...stats,
    }
  }
  return seedReviewStats()
}

export function recordReviewResult(correct) {
  if (!isLoggedIn()) {
    return getReviewStats()
  }
  const stats = getReviewStats()
  const reviewed = stats.reviewed + 1
  const correctCount = stats.correctCount + (correct ? 1 : 0)
  const mastered = stats.mastered + (correct ? 1 : 0)

  stats.reviewed = reviewed
  stats.correctCount = correctCount
  stats.mastered = mastered
  stats.totalSessions = stats.totalSessions + 1
  stats.todayDone = Math.min(stats.todayGoal, stats.todayDone + 1)
  stats.accuracy = reviewed ? Math.round((correctCount / reviewed) * 100) : 0
  writeJSON(STORAGE_KEYS.stats, stats)
  return stats
}
export class WordHubApiError extends Error {
  constructor(message, options = {}) {
    super(message || 'request failed')
    this.name = 'WordHubApiError'
    this.statusCode = options.statusCode || 0
    this.errorCode = options.errorCode || ''
    this.data = options.data
    this.baseUrl = options.baseUrl || ''
  }
}

function normalizeBaseUrl(baseUrl) {
  return String(baseUrl || '').trim().replace(/\/+$/, '')
}

function inferBrowserBaseUrl() {
  if (typeof window === 'undefined' || !window.location) {
    return ''
  }
  const host = window.location.hostname === '0.0.0.0' ? '127.0.0.1' : window.location.hostname
  return `http://${host}:${DEFAULT_BACKEND_PORT}`
}

function parseResponseData(data) {
  if (typeof data !== 'string') {
    return data
  }
  const trimmed = data.trim()
  if (!trimmed) {
    return {}
  }
  try {
    return JSON.parse(trimmed)
  } catch (error) {
    return { message: trimmed }
  }
}

function buildClientInfo(extraClient) {
  let platform = 'unknown'
  try {
    const systemInfo = uni.getSystemInfoSync()
    platform = systemInfo.uniPlatform || systemInfo.platform || (typeof window !== 'undefined' ? 'h5' : 'unknown')
  } catch (error) {
    platform = typeof window !== 'undefined' ? 'h5' : 'unknown'
  }

  return {
    platform,
    appVersion: DEFAULT_APP_VERSION,
    ...(extraClient || {}),
  }
}

function createApiError(baseUrl, statusCode, data, fallbackMessage) {
  const payload = parseResponseData(data)
  return new WordHubApiError(payload?.message || fallbackMessage, {
    statusCode,
    errorCode: payload?.errorCode || '',
    data: payload,
    baseUrl,
  })
}

function buildRequestHeaders(extraHeaders) {
  bootstrapAuthStorage()
  const token = readAuthToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(extraHeaders || {}),
  }
}

function request({ path, method = 'GET', data, timeout = DEFAULT_TIMEOUT_MS, headers }) {
  const baseUrl = getBackendBaseUrl()
  const url = `${baseUrl}${path}`

  return new Promise((resolve, reject) => {
    uni.request({
      url,
      method,
      data,
      timeout,
      header: buildRequestHeaders(headers),
      success: (response) => {
        resolve({
          ...response,
          data: parseResponseData(response.data),
          baseUrl,
        })
      },
      fail: (error) => {
        reject(new WordHubApiError(error?.errMsg || 'network request failed', { baseUrl }))
      },
    })
  })
}

function sleep(timeoutMs) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeoutMs)
  })
}

export function getBackendBaseUrl() {
  const envBaseUrl = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_API_BASE_URL || '' : ''
  const baseUrl = envBaseUrl || DEFAULT_BACKEND_BASE_URL || inferBrowserBaseUrl() || 'http://127.0.0.1:8080'
  return normalizeBaseUrl(baseUrl)
}

export async function checkBackendHealth() {
  const response = await request({ path: '/health' })
  if (response.statusCode !== 200 || response.data?.status !== 'ok') {
    throw createApiError(response.baseUrl, response.statusCode, response.data, 'backend health check failed')
  }
  return {
    ...response.data,
    baseUrl: response.baseUrl,
  }
}

export async function createGenerationJob(words, extraClient) {
  const response = await request({
    path: '/generation-jobs',
    method: 'POST',
    data: {
      words,
      client: buildClientInfo(extraClient),
    },
  })

  if (response.statusCode !== 202 || !response.data?.jobId) {
    throw createApiError(response.baseUrl, response.statusCode, response.data, 'failed to create generation job')
  }

  return {
    ...response.data,
    baseUrl: response.baseUrl,
  }
}

export async function getGenerationJob(jobId) {
  const response = await request({
    path: `/generation-jobs/${encodeURIComponent(jobId)}`,
  })

  if (response.statusCode !== 200) {
    throw createApiError(response.baseUrl, response.statusCode, response.data, 'failed to fetch generation job')
  }

  return {
    ...response.data,
    baseUrl: response.baseUrl,
  }
}

export async function pollGenerationJob(jobId, options = {}) {
  const intervalMs = options.intervalMs || DEFAULT_POLL_INTERVAL_MS
  const maxAttempts = options.maxAttempts || DEFAULT_MAX_POLL_ATTEMPTS

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const payload = await getGenerationJob(jobId)

    if (typeof options.onProgress === 'function') {
      options.onProgress(payload)
    }

    if (payload.status === 'success') {
      return payload
    }

    if (payload.status === 'failed') {
      throw new WordHubApiError(payload.message || 'generation failed', {
        statusCode: 200,
        errorCode: payload.errorCode || 'GENERATION_FAILED',
        data: payload,
        baseUrl: payload.baseUrl,
      })
    }

    await sleep(intervalMs)
  }

  throw new WordHubApiError('generation timed out', {
    errorCode: 'POLL_TIMEOUT',
    baseUrl: getBackendBaseUrl(),
  })
}

export function getAiModelConfig() {
  bootstrapAuthStorage()
  const stored = readJSON(STORAGE_KEYS.aiConfig, null)
  return normalizeModelConfig(stored)
}

export function saveAiModelConfig(config) {
  return cacheAiModelConfig(config)
}

function extractUserPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return null
  }
  if (payload.user && typeof payload.user === 'object') {
    return payload.user
  }
  if (payload.data && typeof payload.data.user === 'object') {
    return payload.data.user
  }
  if (payload.id || payload.email || payload.nickname) {
    return payload
  }
  return null
}

function extractModelConfigPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return null
  }
  if (payload.modelConfig && typeof payload.modelConfig === 'object') {
    return payload.modelConfig
  }
  if (payload.data && typeof payload.data.modelConfig === 'object') {
    return payload.data.modelConfig
  }
  if (payload.textProvider || payload.imageProvider || typeof payload.imageLinked === 'boolean') {
    return payload
  }
  return null
}

function extractListPayload(payload, key) {
  if (Array.isArray(payload)) {
    return payload
  }
  if (Array.isArray(payload?.[key])) {
    return payload[key]
  }
  if (Array.isArray(payload?.data?.[key])) {
    return payload.data[key]
  }
  return []
}

function persistAuthResponse(response, fallbackMessage) {
  const token = String(response?.data?.token || response?.data?.data?.token || '').trim()
  const user = extractUserPayload(response?.data)
  if (!token || !user) {
    throw createApiError(response.baseUrl, response.statusCode, response.data, fallbackMessage)
  }

  const session = saveAuthSession(token, user, {
    modelConfig: extractModelConfigPayload(response.data),
  })

  return {
    ...session,
    baseUrl: response.baseUrl,
  }
}

function sanitizeModelConfigPayload(payload) {
  const source = payload && typeof payload === 'object' ? payload : {}
  const nextPayload = {
    textProvider: String(source.textProvider || DEFAULT_AI_MODEL_CONFIG.textProvider).trim() || DEFAULT_AI_MODEL_CONFIG.textProvider,
    imageProvider: String(source.imageProvider || source.textProvider || DEFAULT_AI_MODEL_CONFIG.imageProvider).trim() || DEFAULT_AI_MODEL_CONFIG.imageProvider,
    imageLinked: source.imageLinked !== false,
  }

  const textApiKey = String(source.textApiKey || '').trim()
  const imageApiKey = String(source.imageApiKey || '').trim()

  if (textApiKey) {
    nextPayload.textApiKey = textApiKey
  }
  if (imageApiKey) {
    nextPayload.imageApiKey = imageApiKey
  }

  return nextPayload
}

export async function registerUser(payload) {
  const response = await request({
    path: '/auth/register',
    method: 'POST',
    data: payload,
  })

  if (![200, 201].includes(response.statusCode)) {
    throw createApiError(response.baseUrl, response.statusCode, response.data, 'failed to register user')
  }

  return persistAuthResponse(response, 'failed to register user')
}

export async function loginUser(payload) {
  const response = await request({
    path: '/auth/login',
    method: 'POST',
    data: payload,
  })

  if (response.statusCode !== 200) {
    throw createApiError(response.baseUrl, response.statusCode, response.data, 'failed to login user')
  }

  return persistAuthResponse(response, 'failed to login user')
}

export async function logoutUser() {
  const hasToken = Boolean(readAuthToken())
  try {
    if (hasToken) {
      const response = await request({
        path: '/auth/logout',
        method: 'POST',
      })

      if (![200, 204].includes(response.statusCode)) {
        throw createApiError(response.baseUrl, response.statusCode, response.data, 'failed to logout user')
      }
    }
  } finally {
    clearAuthSession()
  }

  return { ok: true }
}

export async function getMe() {
  const response = await request({ path: '/me' })

  if (response.statusCode !== 200) {
    if (response.statusCode === 401) {
      clearAuthSession({ keepResults: true })
    }
    throw createApiError(response.baseUrl, response.statusCode, response.data, 'failed to fetch current user')
  }

  const user = extractUserPayload(response.data)
  if (!user) {
    throw createApiError(response.baseUrl, response.statusCode, response.data, 'failed to parse current user')
  }

  writeJSON(STORAGE_KEYS.user, normalizeUser(user))
  const modelConfig = extractModelConfigPayload(response.data)
  const cachedModelConfig = modelConfig ? cacheAiModelConfig(modelConfig) : getAiModelConfig()

  return {
    user: getCurrentUser(),
    modelConfig: cachedModelConfig,
    baseUrl: response.baseUrl,
  }
}

export async function updateMyAvatar(avatarUrl) {
  const payload = {
    avatarUrl: avatarUrl == null ? null : String(avatarUrl).trim() || null,
  }
  const response = await request({
    path: '/me/avatar',
    method: 'PATCH',
    data: payload,
  })

  if (response.statusCode !== 200) {
    if (response.statusCode === 401) {
      clearAuthSession({ keepResults: true })
    }
    throw createApiError(response.baseUrl, response.statusCode, response.data, 'failed to update avatar')
  }

  const user = extractUserPayload(response.data)
  if (!user) {
    throw createApiError(response.baseUrl, response.statusCode, response.data, 'failed to parse updated avatar user')
  }

  const nextUser = normalizeUser({ ...(getCurrentUser() || {}), ...user })
  writeJSON(STORAGE_KEYS.user, nextUser)

  return {
    user: nextUser,
    baseUrl: response.baseUrl,
  }
}

export async function hydrateAuthSession() {
  bootstrapAuthStorage()
  const token = readAuthToken()
  if (!token) {
    clearLegacySessionFlag()
    return {
      isLoggedIn: false,
      user: null,
      modelConfig: getAiModelConfig(),
      baseUrl: getBackendBaseUrl(),
      expired: false,
    }
  }

  try {
    const payload = await getMe()
    return {
      isLoggedIn: true,
      user: payload.user || getCurrentUser(),
      modelConfig: payload.modelConfig || getAiModelConfig(),
      baseUrl: payload.baseUrl || getBackendBaseUrl(),
      expired: false,
    }
  } catch (error) {
    if (error?.statusCode === 401) {
      clearLegacySessionFlag()
      return {
        isLoggedIn: false,
        user: null,
        modelConfig: getAiModelConfig(),
        baseUrl: error.baseUrl || getBackendBaseUrl(),
        expired: true,
      }
    }
    throw error
  }
}

export async function getModelConfig() {
  const response = await request({ path: '/me/model-config' })

  if (response.statusCode !== 200) {
    if (response.statusCode === 401) {
      clearAuthSession({ keepResults: true })
    }
    throw createApiError(response.baseUrl, response.statusCode, response.data, 'failed to fetch model config')
  }

  const modelConfig = extractModelConfigPayload(response.data)
  if (!modelConfig) {
    throw createApiError(response.baseUrl, response.statusCode, response.data, 'failed to parse model config')
  }

  return {
    modelConfig: cacheAiModelConfig(modelConfig),
    baseUrl: response.baseUrl,
  }
}

export async function updateModelConfig(payload) {
  const response = await request({
    path: '/me/model-config',
    method: 'PUT',
    data: sanitizeModelConfigPayload(payload),
  })

  if (response.statusCode !== 200) {
    if (response.statusCode === 401) {
      clearAuthSession({ keepResults: true })
    }
    throw createApiError(response.baseUrl, response.statusCode, response.data, 'failed to update model config')
  }

  const modelConfig = extractModelConfigPayload(response.data)
  if (!modelConfig) {
    throw createApiError(response.baseUrl, response.statusCode, response.data, 'failed to parse updated model config')
  }

  return {
    modelConfig: cacheAiModelConfig(modelConfig),
    baseUrl: response.baseUrl,
  }
}

export async function listMyGenerationJobs() {
  const response = await request({ path: '/me/generation-jobs' })
  if (response.statusCode !== 200) {
    if (response.statusCode === 401) {
      clearAuthSession({ keepResults: true })
    }
    throw createApiError(response.baseUrl, response.statusCode, response.data, 'failed to list generation jobs')
  }
  const jobs = extractListPayload(response.data, 'jobs')
  writeJSON(STORAGE_KEYS.historyJobs, jobs)
  return {
    jobs,
    baseUrl: response.baseUrl,
  }
}

export async function listMyGeneratedCards() {
  const response = await request({ path: '/me/generated-cards' })
  if (response.statusCode !== 200) {
    if (response.statusCode === 401) {
      clearAuthSession({ keepResults: true })
    }
    throw createApiError(response.baseUrl, response.statusCode, response.data, 'failed to list generated cards')
  }
  const cards = extractListPayload(response.data, 'cards')
  writeJSON(STORAGE_KEYS.historyCards, cards)
  return {
    cards,
    baseUrl: response.baseUrl,
  }
}

export async function fetchMyReviewDeck() {
  const response = await request({ path: '/me/review-deck' })
  if (response.statusCode !== 200) {
    if (response.statusCode === 401) {
      clearAuthSession({ keepResults: true })
    }
    throw createApiError(response.baseUrl, response.statusCode, response.data, 'failed to fetch review deck')
  }
  const cards = extractListPayload(response.data, 'cards')
  const localDeck = readStoredReviewDeck()
  const merged = mergeReviewDeckResults(cards, localDeck)
  writeJSON(STORAGE_KEYS.reviewDeck, merged)
  return { cards: merged, baseUrl: response.baseUrl }
}

export function getCachedGenerationJobs() {
  return readJSON(STORAGE_KEYS.historyJobs, [])
}

export function getCachedGeneratedCards() {
  return readJSON(STORAGE_KEYS.historyCards, [])
}

export async function syncMyHistory() {
  if (!isLoggedIn()) {
    return { jobs: [], cards: [], reviewDeck: [] }
  }
  const [jobsPayload, cardsPayload, deckPayload] = await Promise.all([
    listMyGenerationJobs(),
    listMyGeneratedCards(),
    fetchMyReviewDeck().catch(() => ({ cards: [] })),
  ])
  return {
    jobs: jobsPayload.jobs,
    cards: cardsPayload.cards,
    reviewDeck: deckPayload.cards,
  }
}

export async function getMyGeneratedCard(cardId) {
  const response = await request({
    path: `/me/generated-cards/${encodeURIComponent(cardId)}`,
  })
  if (response.statusCode !== 200) {
    if (response.statusCode === 401) {
      clearAuthSession({ keepResults: true })
    }
    throw createApiError(response.baseUrl, response.statusCode, response.data, 'failed to fetch generated card')
  }
  return {
    card: response.data?.card || response.data?.data?.card || response.data,
    baseUrl: response.baseUrl,
  }
}
