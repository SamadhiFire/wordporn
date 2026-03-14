#!/usr/bin/env node

const CATEGORY_PROFILES = {
  "concrete-objects": {
    label: "实体物件与微观细节",
    styleLabel: "Micro studio macro",
    medium: "macro still-life photography",
    direction: "ultra high resolution object study with clean studio control",
    composition: "tight close-up framing, clean focal hierarchy",
    lighting: "neutral studio lighting with crisp specular highlights",
    effect: "surface texture, material detail, reflection or refraction emphasized",
    negative: "generic stock props, cluttered background, weak texture, low detail",
  },
  "people-roles": {
    label: "人物肖像与职业特征",
    styleLabel: "Cinematic environmental portrait",
    medium: "cinematic environmental portraiture",
    direction: "story-rich portrait anchored in role and identity",
    composition: "85mm medium shot, shallow depth of field, readable hands and face",
    lighting: "strong eye light, sculpted face lighting, subtle role-specific bokeh",
    effect: "role-defining tools, posture, clothing texture, emotional tension",
    negative: "generic stock portrait, anonymous background, weak role signal",
  },
  "spaces-architecture": {
    label: "空间、城市与建筑景观",
    styleLabel: "Atmospheric spatial photography",
    medium: "ultra-wide architectural photography",
    direction: "geometry-first spatial image with cultural specificity",
    composition: "wide-angle view with deep perspective lines and structural rhythm",
    lighting: "layered ambient light, atmospheric depth, grounded materials",
    effect: "space hierarchy, civic scale, believable urban or architectural atmosphere",
    negative: "game-like rendering, empty scene, vague location cues",
  },
  "nature-phenomena": {
    label: "自然生态与气象",
    styleLabel: "Epic documentary landscape",
    medium: "epic documentary landscape photography",
    direction: "immersive environment-focused scene with realistic ecological detail",
    composition: "wide landscape framing with deep horizon or layered terrain",
    lighting: "high dynamic range, natural weather behavior, realistic sky response",
    effect: "terrain, atmosphere, seasonality, and environmental scale",
    negative: "fantasy oversaturation, synthetic sky, flat environmental detail",
  },
  "dynamic-actions": {
    label: "瞬间动能与物理状态",
    styleLabel: "High-speed impact frame",
    medium: "high-speed action photography",
    direction: "frozen explosive moment with strong kinetic readability",
    composition: "mid-impact framing with aggressive directional energy",
    lighting: "hard directional light with visible debris and shock detail",
    effect: "particles, impact path, tension, fracture, air disturbance",
    negative: "static pose, no kinetic evidence, weak motion language",
  },
  "processes-transformations": {
    label: "渐进过程与状态转化",
    styleLabel: "Time-lapse transformation",
    medium: "conceptual time-lapse aesthetic",
    direction: "single-frame depiction of change over time",
    composition: "stable frame or split composition showing two stages in tension",
    lighting: "progressive light shift or staged contrast between old and new states",
    effect: "visible evolution, decay, fermentation, ignition, or illumination",
    negative: "abstract fog, unreadable state change, no temporal cue",
  },
  "abstract-society": {
    label: "抽象概念与社会哲学",
    styleLabel: "Editorial surreal metaphor",
    medium: "editorial illustration with restrained surrealism",
    direction: "intelligent symbolic image with one strong conceptual metaphor",
    composition: "graphic, readable, poster-like structure",
    lighting: "controlled contrast and idea-driven color blocking",
    effect: "geometric symbolism, systemic tension, civic or philosophical meaning",
    negative: "empty symbolism, cliche icons, overloaded metaphor stack",
  },
  "cross-cultural-historical": {
    label: "跨文化与历史符号",
    styleLabel: "Period drama cinematic frame",
    medium: "historically grounded cinematic still",
    direction: "era-specific scene with culturally accurate dress, materials, and atmosphere",
    composition: "medium-wide scene balancing costume, props, and environment",
    lighting: "cinematic but believable period-appropriate lighting",
    effect: "historical texture, cultural symbols, social atmosphere",
    negative: "stereotypes, cosplay feeling, mixed-period inaccuracies",
  },
  "sensory-adjectives": {
    label: "感官体验与特质形容词",
    styleLabel: "Synesthetic sensory art",
    medium: "sensory-driven visual art with a concrete anchor subject",
    direction: "translate sound, smell, vividness, or intensity into image language",
    composition: "concrete anchor plus stylized sensory overlay",
    lighting: "sense-specific color grading and atmospheric treatment",
    effect: "wave patterns, scent trails, distortion, texture amplification",
    negative: "vague abstraction, no sensory anchor, unreadable sensation",
  },
  "social-interjections": {
    label: "社交互动与情绪口语",
    styleLabel: "Expressive social reaction",
    medium: "high-quality stylized 3D character art",
    direction: "playful emotional storytelling through face and gesture",
    composition: "medium shot with readable expression and interaction beat",
    lighting: "bright inviting lighting with emotionally legible color",
    effect: "facial exaggeration, body language, social timing",
    negative: "deadpan pose, emoji simplification, weak emotional clarity",
  },
}

const ALIASES = {
  microscope: "concrete-objects",
  sapphire: "concrete-objects",
  gears: "concrete-objects",
  protagonist: "people-roles",
  blacksmith: "people-roles",
  pioneer: "people-roles",
  metropolis: "spaces-architecture",
  slum: "spaces-architecture",
  sanctuary: "spaces-architecture",
  oasis: "nature-phenomena",
  avalanche: "nature-phenomena",
  drizzle: "nature-phenomena",
  orchard: "nature-phenomena",
  sprint: "dynamic-actions",
  shatter: "dynamic-actions",
  ricochet: "dynamic-actions",
  evolve: "processes-transformations",
  decay: "processes-transformations",
  ferment: "processes-transformations",
  illuminate: "processes-transformations",
  democracy: "abstract-society",
  paradox: "abstract-society",
  ethics: "abstract-society",
  renaissance: "cross-cultural-historical",
  samurai: "cross-cultural-historical",
  fiesta: "cross-cultural-historical",
  vivid: "sensory-adjectives",
  deafening: "sensory-adjectives",
  fragrant: "sensory-adjectives",
  hello: "social-interjections",
  ouch: "social-interjections",
  euphoria: "social-interjections",
}

function parseArgs(argv) {
  const args = {}
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index]
    if (!token.startsWith("--")) {
      continue
    }
    const key = token.slice(2)
    const next = argv[index + 1]
    if (!next || next.startsWith("--")) {
      args[key] = "true"
      continue
    }
    args[key] = next
    index += 1
  }
  return args
}

function normalizeWord(word) {
  return String(word || "").trim().toLowerCase()
}

function inferCategory(word, meaning) {
  const normalized = normalizeWord(word)
  if (ALIASES[normalized]) {
    if (normalized === "illuminate" && /启发|启蒙|clarify|enlighten|insight/i.test(String(meaning || ""))) {
      return "abstract-society"
    }
    return ALIASES[normalized]
  }

  const text = `${normalized} ${String(meaning || "").toLowerCase()}`

  if (/hello|ouch|euphoria|greet|emotion|interjection|问候|疼|狂喜/.test(text)) {
    return "social-interjections"
  }
  if (/democracy|ethics|paradox|justice|society|哲学|社会|伦理|悖论/.test(text)) {
    return "abstract-society"
  }
  if (/renaissance|samurai|fiesta|dynasty|ritual|历史|文化|时代/.test(text)) {
    return "cross-cultural-historical"
  }
  if (/sprint|shatter|ricochet|collision|impact|冲刺|粉碎|反弹/.test(text)) {
    return "dynamic-actions"
  }
  if (/evolve|decay|ferment|illuminate|change|transform|进化|腐烂|发酵|照亮/.test(text)) {
    return "processes-transformations"
  }
  if (/oasis|avalanche|drizzle|orchard|forest|rain|mountain|果园|雨|雪崩|绿洲/.test(text)) {
    return "nature-phenomena"
  }
  if (/metropolis|slum|sanctuary|city|building|architecture|都市|建筑|庇护所/.test(text)) {
    return "spaces-architecture"
  }
  if (/protagonist|blacksmith|pioneer|person|worker|hero|主角|铁匠|先驱/.test(text)) {
    return "people-roles"
  }
  if (/microscope|sapphire|gears|metal|gem|device|显微镜|蓝宝石|齿轮/.test(text)) {
    return "concrete-objects"
  }
  if (/vivid|deafening|fragrant|smell|sound|sensory|生动|芳香|震耳/.test(text)) {
    return "sensory-adjectives"
  }
  return "concrete-objects"
}

function buildPrompt({ word, meaning, category, note }) {
  const chosenCategory = category || inferCategory(word, meaning)
  const profile = CATEGORY_PROFILES[chosenCategory]

  if (!profile) {
    throw new Error(`Unknown category: ${chosenCategory}`)
  }

  const subject = meaning
    ? `${word}, expressing the sense "${meaning}"`
    : `${word} as the primary visual subject`

  const finalPrompt = [
    profile.medium,
    subject,
    profile.direction,
    profile.composition,
    profile.lighting,
    profile.effect,
    note || "visually memorable for vocabulary learning",
    "high detail, clean focal hierarchy",
  ].join(", ")

  return {
    word,
    sense: meaning || "",
    category_id: chosenCategory,
    category_label: profile.label,
    style_label: profile.styleLabel,
    art_direction_summary: profile.direction,
    negative_prompt: profile.negative,
    final_prompt: finalPrompt,
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  const word = args.word || args.w

  if (!word) {
    console.error("Usage: node scripts/build_prompt.js --word <word> [--meaning <sense>] [--category <id>] [--note <text>]")
    process.exit(1)
  }

  const payload = buildPrompt({
    word,
    meaning: args.meaning || args.sense || "",
    category: args.category || "",
    note: args.note || "",
  })

  console.log(JSON.stringify(payload, null, 2))
}

main()
