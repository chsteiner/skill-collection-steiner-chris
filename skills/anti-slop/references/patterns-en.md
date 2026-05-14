# English Patterns

Pattern tables for English prose. Load this when self-checking or auditing English text.

## Contents

- [Tier 1: Remove](#tier-1-remove) — words and phrases that signal unedited AI output
- [Tier 2: Check context](#tier-2-check-context) — often legitimate, slop when clustered or used as filler
- [Phrase families](#phrase-families) — binary contrasts, future-hype, false agency, attribution, announcements
- [Claude-specific tells](#claude-specific-tells) — patterns Claude 4.x / Opus 4.7 produces more than other models

How the tiers differ: **Tier 1** words are rarely the best choice in real prose — replace them. **Tier 2** words are normal English that becomes a tell when it clusters or stands in for a specific. Count occurrences before acting on Tier 2: one is fine, three in a paragraph is slop. When a Tier 1 word genuinely has a precise meaning in context (statistics, law, finance), keep it — a wrongly cut word damages the text.

## Tier 1: Remove

### Words

| Banned | Use instead | Note |
|--------|-------------|------|
| delve / delve into | examine, explore, look at, analyze | fading — peaked Feb 2024, still a tell in older text |
| tapestry (metaphorical) | mix, combination, range | fading |
| meticulous | careful, thorough, precise | fading |
| multifaceted | complex, varied | |
| commendable | drop it, or say what was good | |
| cutting-edge | current, recent, new | |
| game-changer / game-changing | say what changed | |
| groundbreaking | new, first, original | |
| spearhead | lead, start, initiate | |
| paradigm shift | change, new approach | |
| seamless / seamlessly | smooth, easy, without interruption | |
| synergy / synergies | cooperation, combined effect | |
| testament (to) | evidence, proof, sign | |

### Phrases

| Banned | Fix |
|--------|-----|
| "It's worth noting that" / "It is important to note" | Delete. State the thing. |
| "In today's [X] landscape" | Delete, or name the actual context. |
| "Let's delve into" | Delete. Start. |
| "Here's the thing:" | Delete. Say the thing. |
| "Let that sink in." | Delete. |
| "The uncomfortable truth is" | Delete. State the truth. |
| "At the end of the day" | Delete. Say what you mean. |
| "It turns out that" | Delete. State it. |
| "Let me be clear:" | Delete. Be clear without announcing it. |
| "I'm going to be honest" | Delete. Be honest without announcing it. |
| "shed light on" | show, explain, clarify |
| "a treasure trove of" | a lot of, a rich collection of |
| "plays a crucial / pivotal role" | say what it does |
| "paving the way for" | enabling, leading to |
| "in the realm of" | in |
| "navigate the complexities of" | deal with, handle |
| "at its core" | Delete, or say what the core is. |
| "stands as a" | Delete. Say what it is. |
| "serves as a testament" | shows, proves |
| "a deep dive into" | an analysis of, a look at |
| "it's no secret that" | Delete. State the fact. |
| "rich cultural heritage" / "enduring legacy" | say what specifically endures |
| "leaves an indelible mark" | say what changed |
| "nestled in the heart of" | in, near |

## Tier 2: Check context

These are normal English words. They become slop when they cluster, or when they stand in for a concrete detail. One use is usually fine; three in a paragraph means rewrite.

### Words

| Word | Slop when... | Better |
|------|-------------|--------|
| leverage (verb) | used for plain "use" outside finance | use, apply, exploit |
| robust | used for "strong" outside statistics/engineering | strong, reliable, solid |
| comprehensive | used for "thorough" outside legal/compliance | thorough, complete, full |
| holistic | used as a vague positive | complete, integrated |
| streamline | used as a vague positive | simplify, speed up |
| encompass | used for plain "include" | include, cover |
| elevate | used metaphorically for "improve" | improve, raise, strengthen |
| foster (verb) | used for "encourage" | support, encourage, build |
| underscore | used for "show" or "emphasize" | show, highlight, emphasize |
| pivotal | used as filler praise | important, key, central |
| realm | used for "field" or "area" | field, area, domain |
| resonate | used for "connect" or "matter" | connect, appeal, matter |
| empower | used as a vague positive | enable, equip, give tools to |
| intricate | used for plain "complex" | complex, detailed |
| noteworthy / notably | used to flag something instead of just saying it | drop it; the reader decides what's notable |
| landscape (metaphorical) | used for "field" or "situation" | field, area, domain, situation |
| nuanced | used as filler praise | describe what makes it complex |
| enhance | used as a vague positive | improve, add to, strengthen |
| showcase | used for plain "show" | show, present |
| highlight | used for plain "show" | show, point out |
| bolster | used for plain "support" | support, strengthen |
| garner | used for plain "get" or "receive" | get, attract, receive |

### Connectors and transitions

AI over-uses connectors and places them with mechanical precision at the start of every paragraph. Humans vary them and often drop them. Flag density, not single uses.

| Pattern | Limit | Fix |
|---------|-------|-----|
| "However," starting a paragraph | max 1 per ~1000 words | restructure, or use "but" mid-sentence |
| "Moreover," / "Furthermore," | max 1 per ~500 words | "also", "and", or restructure |
| "Additionally," / "In addition," | max 1 per ~500 words | "also", or merge sentences |
| "Firstly," "Secondly," "Thirdly" | avoid | "First," or restructure entirely |
| "That being said," | max 1 per text | "but", "still", or restructure |
| "Importantly," | avoid | the reader decides importance |
| "Interestingly," | avoid | the reader decides interest |
| "Notably," | avoid | same problem as "noteworthy" |
| "Specifically," | avoid when what follows is already specific | delete |
| "Ultimately," | avoid | usually deletable |

The numeric limits are heuristics for auditing, not exact counts to compute. The real test: if connectors stand out when you read the text back, there are too many.

### Hedging clusters

AI over-hedges to sound balanced. Two or more of these in one paragraph means rewrite:

- "It's important to consider"
- "Keep in mind that"
- "There are various factors"
- "It depends on the context"
- "While there are many perspectives"
- "Both sides have valid points"
- "There's no one-size-fits-all answer"
- "Your mileage may vary"

### Filler amplifiers

Words that add volume without meaning. Delete unless they carry real weight — the test is: remove the word, and if the sentence loses nothing, it stays out.

- significantly, substantially, incredibly, remarkably
- very, really, truly, quite, extremely, highly
- certainly, definitely, undoubtedly, undeniably
- effectively, essentially, fundamentally, inherently
- literally, genuinely, honestly, simply, deeply, inevitably

If an adjective needs propping up by "really" or "truly", pick a stronger adjective instead.

## Phrase families

These are constructions, not single words — AI reaches for the *shape* repeatedly.

### Binary contrasts

The single most recognizable AI sentence shape. One per text at most; usually cut entirely.

- "It's not X, it's Y" / "It's not just X — it's Y"
- "Not X, but Y"
- "X isn't the problem. Y is."
- "The question isn't X. It's Y."
- "Less X, more Y."
- "Forget X. Embrace Y."
- "Stop X-ing. Start Y-ing."
- "Not only X, but also Y" → "X. And Y." or merge

### Future-hype

- "poised to transform / revolutionize"
- "on the brink / cusp / verge of"
- "heralds a new era" / "ushers in a new chapter"
- "watershed moment" / "inflection point" / "tipping point"

Fix: say what actually changed, or will change, and when.

### Metaphor clusters

- "a perfect storm of"
- "at the intersection of"
- "at the forefront of"
- "a meteoric rise"

### False agency

Abstract or inanimate subjects made to act. Name the actual agent.

- "the data tells us" → say who concluded what
- "the market rewards" / "the culture shifts" / "the decision emerges"
- "a complaint becomes a fix"

### Vague attribution

Authority claimed without a source.

- "Experts argue / agree" → name one, or cut the claim
- "Industry reports suggest" / "Observers have noted" / "Some critics argue"
- "It's widely known that" / "Studies show" (without the study)

### Paired adjectives

AI doubles adjectives that mean nearly the same thing. Keep one.

- "clear and concise" / "comprehensive and thorough"
- "simple and straightforward" / "complex and nuanced"

### Announcement and email openers

- "I'm excited / thrilled / proud to announce" / "Big news!"
- "I hope this email finds you well"
- "As per my last email"
- "Please don't hesitate to reach out"
- "Without further ado"
- "By the end of this article, you'll..."

## Claude-specific tells

Patterns Claude 4.x and Opus 4.7 produce more than other models. Anthropic's own system prompts and system cards confirm most of these as known, measured tendencies.

### Agreement and flattery

| Pattern | Fix |
|---------|-----|
| "You're absolutely right" / "You're right" as a reflexive opener | Just continue. If you were wrong, say what you're correcting — don't perform agreement. |
| Agreement cluster: "That's a great point", "Good catch", "Ah, I see the issue", "I see the issue now", "Apologies for the confusion" | Drop the preamble. Make the correction or the point directly. |
| "Great question!" / "That's a really interesting X" | Never open by calling a question or idea good, great, fascinating, profound, excellent, insightful, or thoughtful. Just answer. |
| "Absolutely!" / "Certainly!" as an opener | Drop. Start with content. |
| "This is a great approach" | Delete. Evaluate specifically, or not at all. |

### Preamble and meta-commentary

| Pattern | Fix |
|---------|-----|
| "I'd be happy to help with that" | Just help. No preamble. |
| "Let me break this down" / "Let me walk you through" | Just break it down. |
| "Here's a breakdown:" / "Here's what I'll cover:" | Present it. Don't announce it. |
| "There are several key..." | Name them. Don't announce that they exist. |
| Starting a list with "Here are some..." | Delete the intro. Start the list. |
| Repeating the user's question back before answering | Answer directly. Don't mirror. |
| Compliance announcements: "No fluff —", "Straight to the point:", "Here's the no-BS version:" | If asked for brevity, just be brief. Don't narrate that you're complying. |

### Closers and follow-ups

| Pattern | Fix |
|---------|-----|
| Ending with a motivational one-liner | Delete the last sentence if it adds no information. |
| "Hope this helps!" | Delete. |
| "Does that make sense?" | Delete unless you're genuinely asking. |
| Unsolicited next-step offers: "Want me to also...?", "Should I go ahead and...?", "I can also do X if you'd like" | Cut, unless the next step is genuinely unclear and the user needs to choose. |

### Style

| Pattern | Fix |
|---------|-----|
| "That said," as a transition | Use "but", or restructure. |
| Tying an unrelated topic back to the user's profession with a forced metaphor | Drop the metaphor. Explain the thing directly. |
| Over-formatting — bullets, headers, bold where flowing prose belongs | This is the dominant Opus 4.7 regression. See [structural-tells.md](structural-tells.md). Write prose for explanations; reserve bullets for genuinely enumerable items. |
| Em-dash overuse | Mostly a GPT tell; Opus 4.7 already suppresses it. Low priority for self-check, keep it for auditing other models. See [structural-tells.md](structural-tells.md). |
