---
name: anti-slop
description: "Detect and eliminate AI-generated writing patterns (slop). Three tiers: banned phrases, suspicious patterns, structural tells. EN/DE. Invoke with 'check for slop', 'deslop this', or 'anti-slop mode'."
---

# Anti-Slop

> **If it could be sent to anyone in any industry without modification, it's slop.**

This skill eliminates AI-generated writing patterns. It works as a self-check during generation and as an explicit audit tool when invoked.

## When This Skill Activates

- **Always:** When explicitly invoked ("check for slop", "deslop this", "anti-slop mode")
- **Automatically:** When generating prose, reports, articles, emails, or similar text longer than 200 words
- **Never:** On short answers, code output, commit messages, terminal commands, structured data, or when the user asks for a quick draft

## Core Principles

1. **Specificity over generality.** Every claim needs a concrete detail. If a sentence works for any company in any field, rewrite it.
2. **Cut throat-clearing.** If a sentence can be removed without losing information, remove it.
3. **Respect the reader.** No manufactured enthusiasm, no fake conversational tone, no motivational closers.
4. **Vary rhythm.** Mix short and long sentences. Break patterns.
5. **Context matters.** A word that's slop in a blog post may be correct in a legal document or technical spec. Apply judgment, not just pattern-matching.

## Tier 1: Banned (Remove in Prose)

These words and phrases are so strongly AI-associated that they signal unedited output. Based on the Finnish study (56,878 essays, "delve" +10.45x post-ChatGPT), Georgia Tech analysis (168.3M articles), and Wikipedia WikiProject AI Cleanup.

**Exception:** Technical/domain-specific usage where the word has a precise meaning (e.g., "robust" in statistics, "comprehensive" in legal/compliance contexts). When in doubt, replace.

### Words

| Banned | Use instead |
|--------|-------------|
| delve / delve into | examine, explore, look at, analyze |
| foster (as verb) | support, encourage, build, create |
| landscape (metaphorical) | field, area, domain, situation |
| tapestry (metaphorical) | mix, combination, range |
| multifaceted | complex, varied |
| nuanced (as filler praise) | describe what makes it complex |
| leverage (as verb, non-financial) | use, apply, exploit |
| pivotal | important, key, central |
| commendable | drop or say what was good |
| meticulous | careful, thorough, precise |
| cutting-edge | current, recent, new |
| game-changer / game-changing | say what changed |
| seamless | smooth, easy, without interruption |
| robust (non-technical) | strong, reliable, solid |
| realm | field, area, domain |
| testament (to) | evidence, proof, sign |
| resonate | connect, appeal, matter |
| empower | enable, equip, give tools to |
| underscore | show, highlight, emphasize |
| noteworthy | worth mentioning, notable (or just say it) |
| intricate | complex, detailed |
| comprehensive (non-legal) | thorough, complete, full |
| encompass | include, cover |
| groundbreaking | new, first, original |
| spearhead | lead, start, initiate |
| elevate | improve, raise, strengthen |
| synergy / synergies | cooperation, combined effect |
| paradigm shift | change, new approach |
| holistic | complete, full, integrated |
| streamline | simplify, speed up |

### Phrases

| Banned | Fix |
|--------|-----|
| "It's worth noting that" | Delete. State the thing. |
| "It is important to note" | Delete. State the thing. |
| "In today's [X] landscape" | Delete or name the actual context. |
| "Let's delve into" | Delete. Start. |
| "Here's the thing:" | Delete. Say the thing. |
| "Let that sink in." | Delete. |
| "The uncomfortable truth is" | Delete. State the truth. |
| "This matters because" | Restructure: cause before effect. |
| "At the end of the day" | Delete. Say what you mean. |
| "It turns out that" | Delete. State it. |
| "Let me be clear:" | Delete. Be clear without announcing it. |
| "I'm going to be honest" | Delete. Be honest without announcing it. |
| "Moreover" / "Furthermore" | "also", "and", or restructure. |
| "In summary" / "Overall" | Delete. The reader can summarize. |
| "Not only X, but also Y" | "X. And Y." or merge. |
| "shed light on" | show, explain, clarify |
| "a treasure trove of" | a lot of, a rich collection of |
| "plays a crucial/pivotal role" | say what it does |
| "paving the way for" | enabling, leading to |
| "in the realm of" | in |
| "navigate the complexities of" | deal with, handle |
| "at its core" | Delete or say what the core is. |
| "stands as a" | Delete. Just say what it is. |
| "serves as a testament" | shows, proves |
| "a deep dive into" | an analysis of, a look at |
| "it's no secret that" | Delete. State the fact. |

### Claude-Specific Tells

Patterns Claude produces more than other LLMs:

| Pattern | Fix |
|---------|-----|
| "I'd be happy to help with that" | Just help. No preamble. |
| "Great question!" | Never. Just answer. |
| "Absolutely!" as opener | Drop. Start with content. |
| "That said," | Use "but" or restructure. |
| "Let me break this down" | Just break it down. |
| "That's a really interesting X" | Delete. Answer the question. |
| Ending with a motivational one-liner | Delete the last sentence if it adds no information. |
| "Hope this helps!" | Delete. |
| "Does that make sense?" | Delete unless genuinely asking. |
| "Here's a breakdown:" | Just present the breakdown. |
| "This is a great approach" | Delete. Evaluate specifically or not at all. |
| Starting lists with "Here are some..." | Delete the intro. Start the list. |
| "There are several key..." | Name them. Don't announce that they exist. |
| Repeating the user's question back | Answer directly. Don't mirror. |
| "Really" / "truly" / "quite" as intensifiers | Delete. If the adjective needs propping up, pick a stronger one. |

## Tier 2: Suspicious (Check Context)

Fine once. Problematic when clustered. Count occurrences -- two in one paragraph is a warning, three is slop.

### Connectors & Transitions

| Pattern | Limit | Fix |
|---------|-------|-----|
| "However," starting a paragraph | max 1 per 1000 words | restructure or use "but" |
| "Firstly," "Secondly," "Thirdly" | avoid | "First," or restructure entirely |
| "Additionally," / "In addition," | max 1 per 500 words | "also" or merge sentences |
| "Importantly," | avoid | the reader decides importance |
| "Interestingly," | avoid | the reader decides interest |
| "Specifically," | avoid if what follows is specific | delete |
| "Ultimately," | avoid | usually deletable |
| "Notably," | avoid | same problem as "noteworthy" |
| "That being said," | max 1 per text | "but", "still", or restructure |

### Hedging Clusters

AI over-hedges to sound balanced. If you find 2+ of these in one paragraph, rewrite:

- "It's important to consider"
- "Keep in mind that"
- "There are various factors"
- "It depends on the context"
- "While there are many perspectives"
- "Both sides have valid points"
- "There's no one-size-fits-all answer"
- "Your mileage may vary"

### Filler Amplifiers

Words that add volume without meaning. Delete unless they carry real weight:

- significantly, substantially, incredibly, remarkably
- very, really, truly, quite, extremely, highly
- certainly, definitely, undoubtedly, undeniably
- effectively, essentially, fundamentally, inherently

**Test:** Remove the word. Does the sentence lose meaning? If not, delete it.

## Tier 1 Deutsch: Verboten (Immer ersetzen)

AI-generierter deutscher Text hat eigene Muster. Diese sind ebenso verräterisch wie die englischen.

### Wörter

| Verboten | Verwende stattdessen |
|----------|---------------------|
| maßgeblich (als Filler) | wichtig, wesentlich -- oder sag was genau |
| eindrucksvoll / eindrücklich | beschreib was beeindruckt |
| wegweisend | neu, richtungsgebend -- oder sag was sich ändert |
| richtungsweisend | neu, wichtig -- oder konkreter |
| bahnbrechend | neu, erstmals |
| ganzheitlich | vollständig, umfassend, integriert |
| Synergie / Synergien | Zusammenarbeit, Zusammenwirken |
| Mehrwert (als Filler) | Nutzen, Vorteil -- oder sag welchen |
| nachhaltig (nicht-ökologisch) | dauerhaft, langfristig, stabil |
| innovativ (als Adjektivschmuck) | neu -- oder beschreib die Innovation |

### Phrasen

| Verboten | Fix |
|----------|-----|
| "Es ist wichtig zu beachten, dass" | Streich es. Sag es direkt. |
| "In der heutigen [X]-Landschaft" | Streich es oder benenne den Kontext. |
| "Darüber hinaus" / "Des Weiteren" | "Auch", "Und", oder umstrukturieren. |
| "Zusammenfassend lässt sich sagen" | Streich es. |
| "eine entscheidende/zentrale Rolle spielen" | Sag was es konkret tut. |
| "vielschichtig" / "facettenreich" | komplex, vielfältig, oder konkreter |
| "einen Beitrag leisten zu" | beitragen, helfen, ermöglichen |
| "nicht zuletzt" | Streich es oder sag "auch". |
| "Es sei darauf hingewiesen" | Streich es. Sag es direkt. |
| "auf vielfältige Weise" | Sag auf welche Weise. |
| "einen wertvollen Beitrag" | Sag was der Beitrag ist. |
| "in diesem Zusammenhang" | Streich es. Der Zusammenhang ist klar. |
| "im Rahmen von" | bei, in, während -- oder streich es. |
| "stellt ... dar" | ist |
| "ist hervorzuheben, dass" | Streich es. Sag es direkt. |
| "von großer Bedeutung" | wichtig -- oder sag warum. |
| "trägt dazu bei" | hilft, ermöglicht -- oder konkreter. |
| "sowohl ... als auch" (als Aufzählungskrücke) | Umstrukturieren. Zwei Sätze. |
| "gilt als" (ohne Quellenangabe) | ist -- oder sag wer das sagt. |
| "lässt sich feststellen" | Streich es. Stell fest. |
| "Vor diesem Hintergrund" | Streich es oder benenne den Hintergrund kurz. |
| "zeigt sich, dass" | Streich es. Zeig es. |

### Claude-spezifische Muster (Deutsch)

| Muster | Fix |
|--------|-----|
| "Ich helfe gerne dabei" | Einfach helfen. |
| "Das ist eine gute Frage" | Nie. Einfach antworten. |
| "Lass mich das aufschlüsseln" | Einfach aufschlüsseln. |
| Motivationssatz am Ende | Letzten Satz streichen wenn er keine Info enthält. |
| Die Frage des Users paraphrasieren | Direkt antworten. |
| "Hier ist eine Übersicht:" | Übersicht direkt zeigen. |

## Tier 3: Structural Tells

### Formatting

| Pattern | Rule |
|---------|------|
| Em dashes (—) | Max 1 per 300 words. Replace with comma, colon, or parentheses. |
| Bullet lists for prose | Bullets only for genuinely enumerable items. Prose for explanations. |
| Bold emphasis | Max 1 bold phrase per 300 words. |
| Headers in short responses | No headers under 200 words. |
| Excessive structure | More headers than paragraphs = restructure. |
| Nested bullets | Max 2 levels. More = restructure as prose or table. |

### Rhythm

| Pattern | Rule |
|---------|------|
| Uniform sentence length | If 3+ consecutive sentences have similar word count (within 20%), vary them. |
| Staccato fragments | "Short. Punchy. Sentences." -- always slop. |
| Reflexive triplets | Don't default to three examples/reasons/aspects. Use the actual number. Two is fine. Four is fine. |
| Rhetorical Q + immediate answer | "But why? Because..." -- restructure as statement. |
| Symmetric sections | Sections of similar length suggest template thinking. Vary them. |
| Parallel sentence openings | 3+ sentences starting with the same word/structure = rewrite. |

### Composition

| Pattern | Rule |
|---------|------|
| Diplomatic balance | Don't present "both sides" unless asked. Take a position. |
| Manufactured enthusiasm | No exclamation marks in analytical writing. |
| Importance inflation | "pivotal moment", "significant contribution", "transformative" -- say what happened. |
| Present participle tagging | "...establishing itself as a leader" -- rewrite or delete. |
| Premature summarizing | No "In conclusion" unless text is 1000+ words. |
| Opening with context everyone knows | "In an era of rapid technological change..." -- delete. Start with your point. |
| Closing with a call to action nobody asked for | Delete the last paragraph if it's just encouragement. |
| Listing qualifications before the answer | Answer first, qualify after if needed. |

## Self-Check Protocol

Run this before outputting prose (>200 words):

```
1. Scan for Tier 1 words/phrases (EN + DE). Any found? → Replace.
2. Could this paragraph be sent to anyone in any field? → Add specifics.
3. Does the opening sentence announce what you'll do? → Delete it. Do it.
4. Does the closing sentence motivate, summarize, or encourage? → Delete it.
5. Count em dashes. More than 1 per 300 words? → Replace most.
6. Do 3+ sentences have similar length? → Vary them.
7. Do 3+ sentences start with the same structure? → Rewrite openings.
8. Did you default to exactly 3 examples? → Check if 3 is the real number.
9. Is there a bullet list? Could it be prose? → Convert if explanatory.
10. Read the last sentence. Does it add information? → If not, delete.
```

## Scoring (for explicit audits)

When asked to check content for slop ("check for slop", "deslop this"):

| Dimension | 10 = | 1 = |
|-----------|------|-----|
| **Specificity** | Every claim has a concrete detail | Generic statements anyone could write |
| **Rhythm** | Varied sentence length, natural flow | Uniform, metronomic, or staccato |
| **Trust** | Respects reader intelligence | Over-explains, hedges, patronizes |
| **Authenticity** | Sounds like a specific person wrote it | Sounds like a committee avoiding offense |
| **Density** | Every sentence earns its place | Padding, filler, throat-clearing |

**Score < 35/50:** Revise before delivering.
**Score 35-42/50:** Acceptable but could be tighter.
**Score > 42/50:** Clean.

Report: list each Tier 1 hit with line reference, flag Tier 2 clusters, note structural patterns. Give the score and specific revision suggestions.

## Sources

Detection patterns informed by:
- Finnish study on post-ChatGPT writing changes (56,878 essays, Liang et al.)
- Georgia Tech analysis of AI markers in 168.3M academic articles
- Wikipedia WikiProject AI Cleanup: "Signs of AI writing" (2025)
- hardikpandya/stop-slop (MIT)
- aplaceforallmystuff/claude-slop-detector (MIT)
- HxHippy/DeSlop (600+ patterns)
- Community analyses on Claude-specific patterns (2024-2026)
