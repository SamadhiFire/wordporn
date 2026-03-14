# Taxonomy

Use these ten categories as the primary routing layer for image generation. Choose the category that best teaches the word visually.

## Decision Rules

1. Classify by intended sense, not by part of speech alone.
2. Prefer the most imageable physical sense when the user provides only a bare word.
3. Use one dominant category even if secondary traits are present.
4. For culture-heavy words, prioritize historical and regional accuracy over aesthetic novelty.
5. For abstract words, reject cliche symbols when they flatten meaning.

## Category Table

| ID | Label | Use When | Notes |
| --- | --- | --- | --- |
| `concrete-objects` | 实体物件与微观细节 | The word names a tangible object, mechanism, gem, device, or material detail. | Favor surface texture, manufacturing detail, refraction, metal, glass, or other physical properties. |
| `people-roles` | 人物肖像与职业特征 | The word centers on a human role, archetype, profession, or identity-bearing figure. | The person is the anchor, while tools and setting support the identity. |
| `spaces-architecture` | 空间、城市与建筑景观 | The word is mainly about built space, urban order, shelter, density, or architectural atmosphere. | Capture geometry, depth, structural rhythm, and local context. |
| `nature-phenomena` | 自然生态与气象 | The word is a landscape, biome, weather condition, or ecological environment. | Includes cultivated natural environments such as `orchard` unless architecture is the true focus. |
| `dynamic-actions` | 瞬间动能与物理状态 | The word describes explosive action, impact, collision, speed, or force. | Freeze the most intense physical moment. |
| `processes-transformations` | 渐进过程与状态转化 | The word describes change over time, growth, breakdown, fermentation, ignition, illumination, or becoming. | Show transformation inside one frame or through staged contrast. |
| `abstract-society` | 抽象概念与社会哲学 | The word is conceptual, political, ethical, logical, or systemic. | Use metaphor, editorial symbolism, or surreal visual logic. |
| `cross-cultural-historical` | 跨文化与历史符号 | The word is tied to a historical era, civilization, ritual, or culture-specific symbol system. | Be precise about period, region, costume, and material culture. |
| `sensory-adjectives` | 感官体验与特质形容词 | The word describes intensity, sound, smell, color vividness, tactility, or a sensory quality. | Translate sensation into image through color, distortion, texture, or synesthetic cues. |
| `social-interjections` | 社交互动与情绪口语 | The word is an interjection, social exchange, emotional outburst, or reaction. | Favor readable expression, gesture, and immediate emotional clarity. |

## Tie-Breakers

### `hello`

- Default to `social-interjections`.
- The communicative moment matters more than literal text or signage.

### `illuminate`

- Choose `processes-transformations` for the physical sense: lighting a room, a lamp turning on, a manuscript being revealed by light.
- Choose `abstract-society` for the figurative sense: insight, enlightenment, revelation of truth.

### `orchard`

- Default to `nature-phenomena`.
- Move to `spaces-architecture` only if the teaching goal is spatial layout, geometry, or designed land use.

### `protagonist`

- Default to `people-roles`.
- Use `cross-cultural-historical` only when the protagonist is anchored to a specific era or culture and that context is the true learning target.

### `sanctuary`

- Use `spaces-architecture` when it means refuge, temple, protected room, or physical safe haven.
- Use `nature-phenomena` only when it clearly means wildlife sanctuary or protected natural habitat.

## Anti-Cliche Rules

- `democracy`: avoid generic ballot-box stock imagery if a richer symbol of collective agency is available.
- `ethics`: avoid default courtroom scales unless the user asks for legal symbolism.
- `paradox`: avoid random impossible stairs unless the contradiction relates to the word's intended meaning.
- `samurai`: avoid fantasy armor blends and game-like exaggeration.
- `fiesta`: avoid flattening all celebration into one generic Latin festival aesthetic.
