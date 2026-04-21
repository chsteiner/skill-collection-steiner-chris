/**
 * DHCraft Marp Import — Phase 3: Layout resolver
 *
 * Looks up the five dh-* layouts in the bound presentation's master and
 * returns a map from slide type to Layout object.
 *
 * If a named layout is missing, the map entry is null and the renderer
 * falls back to PredefinedLayout.BLANK plus a warning.
 */

const LAYOUT_NAMES = {
  title:     'dh-title',
  section:   'dh-section',
  content:   'dh-content',
  twocolumn: 'dh-twocolumn',
  blank:     'dh-blank'
};

/**
 * Build the type → Layout map for the given presentation.
 *
 * Uses the Advanced Slides Service to look up layouts by their DISPLAY
 * name (e.g., "dh-title"), because Apps Script's standard
 * `layout.getLayoutName()` returns the internal layout type or auto-ID,
 * not the name you set in the theme editor's rename dialog.
 *
 * Requires the Slides Advanced Service to be enabled in the project
 * (see appsscript.json dependencies).
 *
 * @param {GoogleAppsScript.Slides.Presentation} presentation
 * @param {string[]} warnings
 * @return {Object<string, GoogleAppsScript.Slides.Layout|null>}
 */
function buildLayoutMap(presentation, warnings) {
  const displayNameToObjectId = getLayoutDisplayNames(presentation, warnings);

  // Index Apps Script Layout objects by objectId for fast lookup
  const byId = {};
  presentation.getLayouts().forEach(l => {
    byId[l.getObjectId()] = l;
  });

  const map = {};
  Object.keys(LAYOUT_NAMES).forEach(type => {
    const target = LAYOUT_NAMES[type];
    const objectId = displayNameToObjectId[target];
    if (objectId && byId[objectId]) {
      map[type] = byId[objectId];
    } else {
      map[type] = null;
      warnings.push('Template is missing layout "' + target +
                    '"; slides of type "' + type + '" will use a blank fallback');
    }
  });
  return map;
}

/**
 * Use the Advanced Slides Service to fetch the display name of every
 * layout in the presentation. Returns a { displayName: objectId } map.
 *
 * Requires the Slides Advanced Service to be enabled (identifier "Slides",
 * version v1) and the `presentations` OAuth scope.
 */
function getLayoutDisplayNames(presentation, warnings) {
  const map = {};
  try {
    const id = presentation.getId();
    const resp = Slides.Presentations.get(id);
    if (resp && resp.layouts) {
      resp.layouts.forEach(l => {
        const dn = l.layoutProperties && l.layoutProperties.displayName;
        if (dn && l.objectId) map[dn] = l.objectId;
      });
    }
  } catch (e) {
    warnings.push('Could not read layout display names: ' + e.message +
                  '. Confirm the Slides Advanced Service is enabled (Services → Google Slides API).');
  }
  return map;
}

/**
 * Menu helper: print all layout names in the template to the log,
 * so you can verify the setup before running an import.
 */
function verifyLayouts() {
  const p = SlidesApp.getActivePresentation();
  const warnings = [];

  // Get display names via Advanced Slides Service
  const displayNames = getLayoutDisplayNames(p, warnings);

  // Build reverse map: objectId → displayName
  const idToDisplay = {};
  Object.keys(displayNames).forEach(dn => {
    idToDisplay[displayNames[dn]] = dn;
  });

  const layouts = p.getLayouts();
  console.log('--- Template layouts (' + layouts.length + ') ---');
  layouts.forEach((l, i) => {
    const id = l.getObjectId();
    const display = idToDisplay[id] || '(no display name)';
    console.log('  ' + (i + 1) + '. display="' + display +
                '"  internal="' + l.getLayoutName() + '"  ' +
                '(' + l.getPlaceholders().length + ' placeholders)');
  });

  const map = buildLayoutMap(p, warnings);
  console.log('--- dh-* layout resolution ---');
  Object.keys(map).forEach(type => {
    const layout = map[type];
    console.log('  ' + type.padEnd(10) + ' → ' +
                (layout ? '"' + LAYOUT_NAMES[type] + '" OK' : 'MISSING'));
  });
  if (warnings.length > 0) {
    console.log('--- Warnings ---');
    warnings.forEach(w => console.log('  •', w));
  }

  const problemCount = Object.values(map).filter(l => !l).length;
  SlidesApp.getUi().alert(
    'Layout check',
    'Found ' + layouts.length + ' layouts in template.\n' +
    (problemCount === 0
      ? 'All 5 dh-* layouts found.'
      : problemCount + ' dh-* layout(s) missing. See Executions → Logs.'),
    SlidesApp.getUi().ButtonSet.OK
  );
}
