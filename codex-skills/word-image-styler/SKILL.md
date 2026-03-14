---
name: word-image-styler
description: Build style-aware image prompts for vocabulary learning cards by classifying English words into visual categories, mapping each category to a distinct art direction, and outputting structured prompts. Use when Codex needs to turn words such as hello, illuminate, orchard, democracy, samurai, or shatter into category-specific image prompts, visual taxonomies, or reusable prompt templates for language-learning products.
---

# Word Image Styler

## Overview

Turn a vocabulary item into a stable visual direction instead of using one generic prompt style for every word. Classify the word by intended sense, map the category to one dominant visual language, then output a prompt that is suitable for image generation and flashcard-style learning.

## Workflow

1. Normalize the input word and intended meaning.
If the user gives a gloss, example sentence, or Chinese meaning, use that to disambiguate the sense. If the word is polysemous and no sense is provided, prefer the most imageable physical sense over a metaphorical one.

2. Classify the word using [references/taxonomy.md](references/taxonomy.md).
Use the category whose visual teaching value is strongest, not just the surface part of speech.

3. Choose exactly one primary art direction from [references/style-map.md](references/style-map.md).
Do not mix multiple unrelated aesthetics unless the user explicitly asks for hybrid styling. A single dominant style is more memorable and more controllable.

4. Assemble the final prompt with [references/prompt-patterns.md](references/prompt-patterns.md).
Keep the prompt concrete: subject, environment, light, lens or medium, motion or time treatment, material cues, and category-specific exclusions.

5. When deterministic JSON output is useful, run `scripts/build_prompt.js`.
Pass `--category` whenever the sense is already known. Treat automatic category detection as a convenience for common words, not as ground truth for ambiguous vocabulary.

## Classification Rules

- Classify by meaning first, not by spelling alone.
- Prefer the visually concrete sense unless the user explicitly wants the abstract sense.
- Keep `hello`, `ouch`, and `euphoria` in the social or emotional lane rather than forcing them into generic portrait photography.
- Keep `orchard`, `oasis`, and other landscape nouns in the nature lane unless the spatial order itself is the learning target.
- Treat `illuminate` as:
  - `processes-transformations` when the word means "light up" or "become illuminated"
  - `abstract-society` when the word means "clarify" or "enlighten"
- Reject stale visual cliches when they weaken memorability.
Examples:
  - `democracy` should not default to a generic ballot box if a stronger visual metaphor exists.
  - `ethics` should not default to courtroom scales unless the user explicitly wants that symbol.
  - `samurai` should anchor to a specific historical context, not a fantasy mash-up.

## Output Contract

Return these fields whenever practical:

- `word`
- `sense`
- `category_id`
- `category_label`
- `style_label`
- `art_direction_summary`
- `negative_prompt`
- `final_prompt`
- `rationale`

## Resources

- Read [references/taxonomy.md](references/taxonomy.md) to choose the category and apply tie-breakers.
- Read [references/style-map.md](references/style-map.md) to select the dominant camera language, medium, color behavior, and exclusions.
- Read [references/prompt-patterns.md](references/prompt-patterns.md) to format the final prompt.
- Run `scripts/build_prompt.js` when you want a structured JSON scaffold or want to reuse the category profiles in code.

## Quick Examples

`hello`
- Category: `social-interjections`
- Style: stylized 3D social interaction
- Why: the communicative gesture matters more than literal typography

`orchard`
- Category: `nature-phenomena`
- Style: epic but realistic ecological landscape
- Why: the orchard should feel like a place you can enter, not a floating icon set

`illuminate`
- Category: `processes-transformations` by default
- Style: transformation-driven light event
- Switch to `abstract-society` only when the intended meaning is intellectual enlightenment
