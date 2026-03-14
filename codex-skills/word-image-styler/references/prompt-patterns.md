# Prompt Patterns

Use this file after the category is fixed and the style direction is known.

## Prompt Assembly Order

1. Medium or style declaration
2. Primary subject
3. Environment or supporting scene
4. Composition and camera language
5. Lighting and color behavior
6. Material, motion, or time treatment
7. Accuracy or symbolism notes
8. Quality guardrail

## Core Template

```text
{medium_and_style}, {primary_subject}, {environment}, {composition_and_camera},
{lighting_and_color}, {material_or_motion}, {accuracy_or_symbolism},
high detail, visually memorable, clean focal hierarchy
```

## Negative Prompt Template

```text
low detail, generic stock imagery, weak focal point, visual cliche, text overlay,
watermark, duplicated limbs, deformed hands, incorrect cultural details,
style mismatch, oversaturated artificial colors
```

## Category-Specific Requirements

### Concrete objects

- Name the object and one hero material property.
- Use a neutral set or studio background.
- Mention texture, reflection, refraction, or machining detail.

### People and roles

- Name the person and one role-defining prop or gesture.
- Include a background that supports identity without stealing focus.
- Mention gaze, hands, clothing texture, or work environment.

### Spaces and architecture

- Name the space type and local cultural context.
- Mention perspective lines, depth, and structural rhythm.
- Favor believable lighting over flashy concept art.

### Nature and phenomena

- Anchor the image in terrain, weather, or ecology.
- Use real light behavior and large dynamic range.
- Let the scene feel inhabitable, not icon-like.

### Dynamic actions

- Name the exact kinetic instant.
- Include debris, motion path, air disturbance, or collision evidence.
- Use framing that feels like a captured split second.

### Processes and transformations

- Show two states in tension inside one image.
- Use before and after contrast, layered transition, or staged progression.
- Make time visible through physical change.

### Abstract and society

- Build one strong metaphor instead of many weak symbols.
- Keep geometry and symbolism readable.
- Prefer editorial intelligence over decorative surrealism.

### Cross-cultural and historical

- Specify period, region, clothing, material culture, and social atmosphere.
- Avoid flattening multiple cultures into one visual package.
- Verify that props and palette fit the era.

### Sensory and adjectives

- Keep one concrete anchor subject.
- Translate the sensation through color, distortion, wave, texture, or atmospheric cue.
- Make the sensory meaning immediately legible.

### Social and interjections

- Show the emotional beat and the social relation.
- Push expression, body language, and timing.
- Use playful readability over realism when that improves recall.

## Structured JSON Output

When the user wants reusable prompt data, return:

```json
{
  "word": "orchard",
  "sense": "果园",
  "category_id": "nature-phenomena",
  "category_label": "自然生态与气象",
  "style_label": "Epic documentary landscape",
  "art_direction_summary": "National Geographic style environmental photography with realistic ecology and wide dynamic range.",
  "negative_prompt": "low detail, generic stock imagery, text overlay, oversaturated fantasy sky",
  "final_prompt": "epic documentary landscape photography, long rows of fruit trees in a cultivated orchard after rain, warm late-afternoon light, wide-angle framing, realistic foliage texture, immersive ecological atmosphere, high detail, visually memorable, clean focal hierarchy"
}
```

## Example Routing

- `hello`
  - Category: `social-interjections`
  - Prompt language: stylized 3D greeting scene, expressive face, warm body language

- `illuminate`
  - Physical sense: transformation of darkness into light
  - Figurative sense: editorial metaphor of knowledge revealing hidden structure

- `orchard`
  - Prompt language: cultivated fruit landscape, path, rows, season, filtered sunlight, real-world textures
