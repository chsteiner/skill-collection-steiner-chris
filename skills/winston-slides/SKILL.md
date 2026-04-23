---
name: winston-slides
description: Audit existing presentation slides or draft new ones from scratch using Patrick Winston's curated MIT clarity rules — Empowerment Promise, 5S-Test (Symbol/Slogan/Surprise/Salient-Idea/Story), Slide Crimes, and the Slides-are-Condiments principle. Use this skill whenever the user mentions slides, decks, presentations, talks, lectures, workshop materials, slide audits, slide reviews, or wants to create or improve any kind of presentation content — even if they don't explicitly mention "Winston" or "audit". Works with format-agnostic outlines, Marp markdown, and the DHCraft Google-Slides format.
---

# Winston Slides

This skill applies a curated subset of Patrick Winston's MIT lecture *"How to Speak"* (1985–2018) to slide content — auditing existing decks or drafting new ones. The curation strips the rules that don't survive in modern slide tools (Marp, Google Slides, PowerPoint with master templates) or non-tenure-track settings: 40-point font dogma, anti-branding posture, anti-laser-pointer, the Job-Talk three-slide framework, and physical props.

What stays: the parts that genuinely make slides clearer for academic, workshop, and lecture audiences.

## Mode detection

This skill operates in two modes. Decide which up front:

- **Audit mode** — the user already has slides (a file, a paste, a description of their deck, a link to a Google Slides presentation). The job is to find what Winston would change.
- **Build mode** — there are no slides yet, only an intent ("I have to give a talk on X"). The job is to interview the user, do light research, and draft a slide outline.

If the situation is ambiguous, ask: *"Do you already have slides you want me to review, or are we starting from scratch?"*

## Pre-flight: language and format

Two things need to be settled before you produce the outline or audit: output language and slide format. Don't ritualistically ask both — check the input first, and only ask when something is genuinely ambiguous. Friction up front makes the skill feel bureaucratic.

- **Output language.** If the user's message is clearly in German (or English, or anything else), silently mirror it. The input being in a language IS the answer. Only ask if the user's language is unclear or if they explicitly hint at mixed audiences.
- **Slide format.** If the user has named a format ("Marp deck", "Google-Slides", "outline") or an existing deck implies one (e.g. reviewing an existing `.md` with Marp frontmatter), use it silently. Otherwise default to **format-agnostic outline** — plain markdown with `[SLIDE N]` headings. It's the lowest-commitment format and easiest to convert later. Only ask when the user asks a format question directly, or when commitment to a specific tool (Marp HTML export, DHCraft Apps-Script importer) would visibly shape the output.

The three formats you can produce:

- **Format-agnostic outline** — plain markdown, `[SLIDE N]` headings, one section per slide. For thinking before tooling decisions are locked in.
- **Marp markdown** — standard Marp conventions (`---` separators, `<!-- _class: -->` directives where needed). For ad-hoc decks rendered to PDF/HTML.
- **DHCraft Google-Slides format** — per the `marp-slides` skill: minimal Marp frontmatter, layout mapping via `<!-- _class: cover -->` / `<div class="columns">`, section-slides as lone H1, en-dashes (no em-dashes). For decks that go through the DHCraft Apps-Script importer.

## Audit mode workflow

1. **Get the slide content** into the conversation. If the user paste-dumps it, work with that. If they reference a file, read it. If they describe the deck verbally, ask for the actual content of the 3–5 most important slides — Winston's audit is concrete, not abstract.
2. **Classify each slide** as either *load-bearing* (block opener, key definition, demo intro, conclusion) or *supporting* (overview, list, transition). The 5S-Test applies only to load-bearing slides; Slide Crimes apply to all.
3. **Run the Winston Heuristic** (see below) over the deck. For each finding, give a specific fix, not just a flag. "Reduce wall of text" is useless; "split this slide into two — the methodology bullet on its own, the results table on a new slide" is useful.
4. **Identify the closing slide.** This is the single most-violated rule. If it's "Thank you" or "Questions?", propose a Contributions-style replacement with a concrete imperative.
5. **Report structure.** Use this layout:
   ```
   ## Audit Summary
   - N slides reviewed, M flagged
   - One-line verdict

   ## Slide-by-slide findings
   [per flagged slide: what's wrong, why, concrete fix]

   ## Cross-cutting recommendations
   [patterns spanning multiple slides]

   ## Closing slide
   [Contributions rewrite if needed]
   ```

## Build mode workflow

1. **Settle the three anchors — topic, audience, Empowerment Promise.** Before drafting, you need:
   - **Topic**: what's the talk about, in one sentence.
   - **Audience**: who's in the room, what do they already know, what do they care about.
   - **Empowerment Promise**: what should they be able to *do* at the end that they couldn't at the beginning.

   Check what the user's initial message already provides and only ask for what's missing. If the user has already said *"25-Minuten-Vortrag bei Sysadmins, sie sollen am Ende grünes Licht geben"* — topic, audience, and Empowerment Promise are all there; extract them and proceed. The interview is for filling gaps, not a mandatory gate.

   Optionally useful if not obvious: time budget, setting (workshop / lecture / keynote / pitch), and any constraints (template, branding, must-include topics).

   If the Empowerment Promise is weak or missing and the user hasn't implied it, help them sharpen it — most weak talks fail here. Offer a draft they can correct rather than demanding they produce one from scratch.
2. **Light research.** If the topic is unfamiliar or has a technical core that needs verification, do a quick web search to ground the content in real sources rather than confabulating. Skip this step if the user is the domain expert and is providing the substance themselves.
3. **Draft the outline.** Open with the Empowerment Promise on slide 1 or 2. Apply the 5S-Test to load-bearing slides (mark which ones consciously). End with a Contributions slide containing one concrete imperative.
4. **Hand back to the user** with a short note about which slides are load-bearing, what the central Surprise of the deck is, and which open questions remain (e.g., "I drafted slide 7 with placeholder data — replace with your actual numbers").

## The Winston Heuristic (curated)

### Empowerment Promise

Every block- or talk-opening answers: *"What can the audience do after this block that they couldn't before?"*

Not "we will discuss X", but "you will be able to do Y". If a planned opener can't be re-cast as *"After this block you can ___"*, it's too weak. This is the single most leverage-heavy intervention in a deck.

### 5S-Test for load-bearing slides

A load-bearing slide is one of: a block opener, a key definition, a demo intro, a turning point, the conclusion. **Not** every slide — overviews, transitions, and material lists are exempt.

A load-bearing slide should satisfy at least **two of five**:

- **Symbol** — a concrete visual or linguistic anchor (a named metric, a recurring image, a defined phrase).
- **Slogan** — a repeatable phrase that the audience can quote without explanation.
- **Surprise** — a counterintuitive turn that flips an assumption the audience held. Just being *interesting* doesn't count; it must contradict something.
- **Salient Idea** — *one* idea that survives the slide. Competing ideas get cut, not ranked alongside.
- **Story** — a brief grounding in how or why this matters. One sentence is enough; no anecdote-block.

A slide that satisfies four or five S's is rare and very strong. Most good load-bearing slides hit two.

### Slide Crimes

A slide is in violation if it does any of these:

- **Wall of text.** More than ~40 words in body content. Tables can be denser when comparison is the point, but never as a layout trick for prose.
- **Voice-over.** Text the speaker would read out word-for-word. Slide and speech must complement, not duplicate.
- **Missing Empowerment Promise on the opener.** If slide 1 or 2 doesn't cash out *"After this block/talk you can ___"*, the opener has failed its only job. Agenda bullets ("Wir werden über X sprechen", "In this talk we will discuss Y") do not count — they describe the speaker's plan, not the audience's new capability.
- **"Thanks / Questions? / Contact" as the only closing slide.** This is the most-violated and most fixable. The closing slide stays on screen the longest (during Q&A) — waste it on "Thank you" and the audience leaves with nothing. See the **Contributions Closing** section below for the replacement pattern.
- **Recap of the recap.** A conclusion that just re-lists earlier claims. Synthesis demands a new statement, not re-statement.

### Contributions Closing

The replacement for "Thanks / Questions?". Because that closing crime is simultaneously the most common and the most fixable, the replacement gets its own named pattern — so the model can reach for it by name during audit mode and build mode alike.

A Contributions slide has two halves:

1. **What the audience now has** — two to four bullets that are the Empowerment Promise redeemed. Not a recap of slide titles; the concrete new capability they walk out with.
2. **One concrete imperative, with a deadline or addressee.** A single next action the audience can take. Not "Get in touch if you're interested" — something like *"Schick mir bis Ende der Woche dein 'Go' oder 'Go-wenn-X' per Mail"* or *"Pick one workflow and run through the checklist within two weeks"*.

Contact info (email, handle) can stay, but as an *anchor for the imperative*, not the headline. The imperative is the headline. This slide stays up during Q&A — make sure what's visible then is worth looking at for fifteen minutes.

### Slides Are Condiments

When uncertain whether something belongs on the slide or in the speaker notes / handout: it goes in the notes or handout.

Three layers, three density budgets:

- **Slide** — what the audience must *see* in the moment. Tightest budget.
- **Speaker notes / playbook** — what the speaker must *know*. Medium budget.
- **Handout / takeaway** — what should be *re-readable* after the talk. Loosest budget.

A common move during audits is to *demote* content from slide to notes, not delete it. The information stays available; only the visual surface changes.

## What this skill intentionally does NOT enforce

These Winston rules conflict with modern slide settings and are deliberately curated out:

- **40-point font minimum** — slide themes (Marp, PPT masters, Google Slides templates) regulate typography centrally, not per-slide. Enforcing 40pt would override the theme.
- **Anti-branding posture** — header, footer, and logos in master templates are a feature, not a violation.
- **Anti-laser-pointer** — a projector/AV concern, not a slide-content concern.
- **Physical props / demonstrations** — irrelevant for purely digital decks; live coding or live demos are the modern equivalent and don't need a separate rule.
- **Job-Talk three-slide framework** (Vision / Proof of Work / Contributions) — tenure-track-specific. Most users build workshop, lecture, or pitch decks, where this scaffold misfits.

If a user explicitly invokes one of these dropped rules ("I want strict 40pt"), defer to them — their specific situation may justify it.

## Source

Patrick H. Winston. *How to Speak.* MIT 6.034 / 6.S897 lecture series, repeatedly delivered 1985–2018. [MIT OpenCourseWare recording](https://www.youtube.com/watch?v=Unzc731iCUY).

The curation in this skill emerged from live application during DHCraft workshop production (April 2026); deciding *which* of Winston's rules survive in modern slide tooling is itself part of the heuristic.
