# check-settings: Fakten-Referenz

Die Fakten, gegen die `check-settings` prüft, stehen hier, getrennt von der Methode
in SKILL.md. Grund: Claude Code ändert sich wöchentlich, Fakten rotieren, die Methode
nicht. Wer die Fakten aktualisiert, ändert nur diese Datei.

**Stand:** 2026-07-22. Die meisten Behauptungen stammen aus dem ursprünglichen
Skill-Entwurf. Am 2026-07-22 wurden F1, F2, F5, F7 gegen `code.claude.com/docs`
verifiziert und korrigiert, und F13/F14 (Permission-Enforcement) neu aus der
permission-modes-Doku belegt (Details in den Zeilen). Der Rest ist weiter **nicht
unabhängig verifiziert**. Genau deshalb koppelt der Skill seinen Ton an die
Confidence-Klasse und prüft `schema`- und `heuristic`-Fakten zur Laufzeit nach
(siehe SKILL.md, Pass 2).

## Confidence-Klassen

- **`logic`**: folgt allein aus der Datei, kein externer Fakt. Rotiert nie. Frei behaupten.
- **`schema`**: in der offiziellen Doku dokumentierbar (Key-Namen, gültige Werte,
  Deprecations). Zur Laufzeit gegen `code.claude.com/docs` prüfen: bestätigt → hart
  behaupten; widerlegt → Befund fällt raus, diese Datei ist veraltet; nicht erreichbar →
  hedgen.
- **`heuristic`**: geglaubtes internes Verhalten (Preis-/Limit-/Feature-Mechanik), das
  **nicht in der Doku steht**. Nachprüfen wird meist „nicht gefunden" liefern. Dann als
  datierte Heuristik ausgeben, nie als harten Fakt, nie mit Lösch-Empfehlung.

## Fakten-Tabelle

| ID | Setting / Muster | Klasse | Behauptung | Prüfen gegen |
|----|------------------|--------|------------|--------------|
| F1 | `model` = Fable-Tier (`claude-fable-5`/`fable`/`best`) als Default | heuristic (Kernpunkt belegt) | Fable ist auf **keinem** Account der Default und muss bewusst gewählt werden; als `model` gepinnt startet jede Session darauf. Fable nutzt **immer** Extended Thinking (nicht abschaltbar), Thinking zählt als Output-Token, also Aufschlag auf jeden Turn. Der frühere Zusatz „50 % Wochendeckel auf Max/Team Premium" ist in der Doku **nicht auffindbar** und wurde am 2026-07-22 entfernt. | Costs-Doku (Adjust extended thinking); model-config (Work with Fable 5). Kein Beleg für 50%-Deckel |
| F2 | `advisorModel` = `"fable"` / `claude-fable-5` | schema | Claude Code bietet Fable 5 **nicht** als Advisor an: ein gesetzter `"fable"`-Wert hängt **keinen** Advisor an und wirft keinen Fehler (still wirkungslos). Gültige Advisor-Werte: `"opus"`, `"sonnet"`, volle Model-ID. **Keine** „Advisor ≥ Main"-Regel. Verifiziert 2026-07-22. Korrigiert die frühere (falsche) Behauptung „Advisor muss ≥ Main, sonst still verworfen" | Settings-Referenz (advisorModel) |
| F3 | `effortLevel` = `xhigh` global | heuristic | Global gesetztes hohes Effort kostet auf jedem Turn mehr Extended-Thinking-Tokens; Empfehlung: Default lassen, per Aufgabe über `/effort` anheben. (Der konkrete Default-Wert ist in der Doku **nicht** genannt, „Default = high" bleibt unbestätigt.) | Costs-Doku (Adjust extended thinking) |
| F4 | `effortLevel` = `max`/`ultracode` | schema | Nur `low`/`medium`/`high`/`xhigh` gültig; `max`/`ultracode` sind Session-Werte, in Settings still ignoriert | Settings-Referenz (effortLevel-Enum) |
| F5 | `skipWorkflowUsageWarning: true` | heuristic | Blendet Warnung aus, dass Agent-Teams/Workflows Tokens ziehen. Key ist in der Settings-Referenz **nicht aufgeführt** (Stand 2026-07-22): Existenz/Wirkung unbestätigt, daher hedgen. Der zugrunde liegende Sachverhalt ist dagegen belegt: Agent-Teams ziehen ~7x Tokens im Plan-Modus | Costs-Doku (Manage agent team costs) für den 7x-Fakt; Key selbst unbestätigt |
| F6 | `fallbackModel` löst zum selben Modell auf wie `model` | logic | Fallback auf dasselbe Modell ist funktionslos. (Nebenbei: `fallbackModel` erwartet laut Doku ein **Array**, bis zu drei Modelle, Spezialwert `"default"`; ein String kann veraltete Form sein, aber das eigentliche Problem ist das gleiche Zielmodell.) | keine (Deduktion); Array-Form: Settings-Referenz |
| F7 | `[1m]`-Suffix, wenn das Modell in der Umgebung ohnehin 1M fährt | schema | **Umgebungsabhängig.** Auf der **Anthropic-API** fahren Fable 5, Sonnet 5, Opus 4.8, Opus 4.7 **immer** 1M → `[1m]` dort **redundant**. Auf Max/Team/Enterprise wird Opus automatisch auf 1M gehoben (auch dort redundant). `[1m]` ist **nur** auf Nicht-Auto-Upgrade-Tiers bzw. Drittanbietern (Bedrock/GCP/Foundry) wirksam, wo ohne Suffix 200K gilt. Sonnet 5 braucht nie ein Suffix. Verifiziert 2026-07-22 (model-config, Zeilen „always run with the 1M window" / „Sonnet 5 context window"). **Achtung:** Ein Verify-Pass, der nur den Nicht-Auto-Upgrade-Absatz liest, verwirft den redundant-Befund fälschlich: den API-Default mitlesen. | model-config-Doku |
| F8 | `autoDreamEnabled` | heuristic | Vom Schema erkannt, im `/memory`-Menü sichtbar, aber an ein server-gegatetes Experiment gebunden, das nie offiziell ausgerollt wurde; meist inert/buggy | Nicht dokumentiert erwartet → hedgen |
| F9 | `ANTHROPIC_SMALL_FAST_MODEL` | schema | Deprecated zugunsten `ANTHROPIC_DEFAULT_HAIKU_MODEL` | Settings/Env-Doku (Deprecations) |
| F10 | `--enable-auto-mode` (in Aliassen/Skripten) | schema | Deprecated seit v2.1.111; stattdessen `--permission-mode auto` oder `defaultMode: "auto"` | Changelog/CLI-Doku |
| F11 | `defaultMode` gültige Werte | schema | Prüfen, welche Werte gültig sind (u. a. `auto`), bevor ein Wert als ungültig geflaggt wird | Settings-Referenz (defaultMode-Enum) |
| F12 | Unbekannter Key | logic | Als „unrecognized, gegen aktuelle Doku prüfen" markieren, nicht als ungültig behaupten | keine |
| F13 | Bare `Bash`/`PowerShell` (bzw. `Bash(*)`) in `allow` **bei `defaultMode: "auto"`** | schema | Auto-Modus **droppt** genau diese Blanket-Allows beim Eintritt: „On entering auto mode, broad allow rules that grant arbitrary code execution are dropped: Blanket `Bash(*)` or `PowerShell(*)`, Wildcarded interpreters like `Bash(python*)`, Package-manager run commands, `Agent` allow rules." Narrow-Rules (`Bash(npm test)`) bleiben. Alles andere geht an den Classifier. Ein bares `Bash`/`PowerShell` gewährt im **Auto**-Modus also **keine** freie Shell (im `default`-Modus dagegen schon → dort ist der Befund berechtigt). `defaultMode: "auto"` wirkt nur in User-Settings, in Projekt/Local wird es ignoriert. Verifiziert 2026-07-22. | permission-modes-Doku (Eliminate prompts with auto mode; How the classifier evaluates actions) |
| F14 | `deny`-Reichweite vs. Shell / sensible Reads | gemischt: schema (Kern) + heuristic (deny-vs-Shell) | **Schema-belegt:** `deny`/`ask` gelten in **jedem** Modus und sind die **einzigen harten** Garantien. Im **Auto**-Modus deckt der Classifier sensible Reads weich ab: blockt u. a. „Printing a live credential or token into the transcript or a file" und Exfil aus Credential-Ordnern (SSH-Keys, Cloud-Creds); **`.env` lesen ist im Auto-Modus dagegen per Default erlaubt** („Reading `.env` and sending credentials to their matching API"). **Heuristik/ungetestet:** dass ein `Read(...)`-deny *file-read-skopiert* ist und einen Shell-`cat` desselben Pfads **nicht** blockt, ist eine Inferenz, die die Doku nicht direkt bestätigt (die Seite sagt „deny … apply to every tool", ohne den Bash-Fall auszubuchstabieren). Daher **immer hedgen** und dem Nutzer einen eigenen Test empfehlen; **nie** einen CRITICAL darauf stützen. Für eine **harte** Shell-Schranke → `ask`-Regel. Kern verifiziert 2026-07-22; deny-vs-Shell unbestätigt. | permission-modes-Doku (What the classifier blocks/allows by default); deny-vs-Shell: keine direkte Doku-Stelle |

## Lösch-Sicherheit

Das Entfernen oder Umbenennen eines Keys darf nur dann die **primäre** Empfehlung sein,
wenn seine Inertness in diesem Lauf `schema`-bestätigt wurde. Bei jeder `heuristic`- oder
unbestätigten Behauptung lautet die Empfehlung „erst verifizieren, dann ggf. entfernen".
Grund: Der teuerste Fehler eines Audit-Skills ist, den Nutzer ein funktionierendes Setting
löschen zu lassen, weil ein veralteter Fakt es fälschlich für tot hält.

## Wartung

Wer einen Fakt verifiziert hat, hebt hier die Klasse an (z. B. `heuristic` → belegte
Quelle) und aktualisiert den Stand oben. Wer einen Fakt als falsch entlarvt, löscht die
Zeile. Diese Datei ist die einzige Stelle, die gepflegt werden muss.
