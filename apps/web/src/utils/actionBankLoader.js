// Utility to load and parse WALA Action Bank Markdown files
import { AREAS_CONFIG } from "@/stores/performanceStore";

// Eager load all action bank Markdown files from assets using relative path
const modules = import.meta.glob("../assets/BANCO ACCIONES/BA - *.md", {
  query: "?raw",
  eager: true,
});

/**
 * Parses the Markdown contents of a single BA file.
 * Returns an object mapping indicator keys (e.g. '6.2') to their level tranches.
 */
export function parseActionsMarkdown(content) {
  const indicators = {};

  if (!content || typeof content !== "string") return indicators;

  // Split by indicator header: "## Indicador "
  const indicatorSections = content.split(/##\s+Indicador\s+/i);

  // Skip index 0 as it contains the file header
  for (let i = 1; i < indicatorSections.length; i++) {
    const section = indicatorSections[i];

    // Extract indicator key (e.g. "6.2")
    const keyMatch = section.match(/^(\d+\.\d+)/);
    if (!keyMatch) continue;
    const indicatorKey = keyMatch[1];

    indicators[indicatorKey] = {
      "0-1": [],
      "1-2": [],
      "2-3": [],
    };

    // Split by level tranche header: "### Nivel "
    const levelSections = section.split(/###\s+Nivel\s+/i);
    for (let j = 1; j < levelSections.length; j++) {
      const levelSection = levelSections[j];

      // Extract level numbers from e.g. "0 → 1" or "0 - 1"
      const trancheMatch = levelSection.match(/^(\d+)\s*[→\-to]\s*(\d+)/i);
      if (!trancheMatch) continue;

      const fromVal = trancheMatch[1];
      const toVal = trancheMatch[2];
      const trancheKey = `${fromVal}-${toVal}`; // e.g. "0-1", "1-2", "2-3"

      // Parse rows of the table
      const lines = levelSection.split("\n");
      const tableRows = [];

      for (const line of lines) {
        // Regex to parse a row with 4 columns: # | Acción | Frecuencia | Registro
        const rowMatch = line.match(
          /^\s*\|\s*(\d+)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*$/
        );
        if (rowMatch) {
          const num = parseInt(rowMatch[1], 10);
          const actionText = rowMatch[2].trim();
          const frequency = rowMatch[3].trim();
          const walaSection = rowMatch[4].trim();

          // Skip headers like "| # | Acción |"
          if (actionText.toLowerCase() === "acción") continue;

          tableRows.push({
            id: num,
            action: actionText,
            frequency: frequency,
            wala: walaSection,
          });
        }
      }

      if (indicators[indicatorKey] && indicators[indicatorKey][trancheKey]) {
        indicators[indicatorKey][trancheKey] = tableRows;
      }
    }
  }

  return indicators;
}

// Global parsed cache
let cachedActions = null;

/**
 * Returns the fully loaded and parsed Action Bank dictionary
 */
export function getActionBank() {
  if (cachedActions) return cachedActions;

  const allActions = {};

  for (const path in modules) {
    // Eager loading imports the module, the raw content is in the default export or direct
    const rawContent = modules[path].default || modules[path];
    if (rawContent && typeof rawContent === "string") {
      const parsed = parseActionsMarkdown(rawContent);
      Object.assign(allActions, parsed);
    }
  }

  cachedActions = allActions;
  return allActions;
}

/**
 * Returns the recommended action items for a given indicator based on the current score
 * Score values map to:
 * - 0 -> "0-1"
 * - 1 -> "1-2"
 * - 2 -> "2-3"
 * - 3 -> "2-3" (Option A: continue reinforcing)
 */
export function getActionsForIndicator(indicatorKey, score) {
  const bank = getActionBank();
  const indicatorActions = bank[indicatorKey];
  if (!indicatorActions) {
    console.warn(`[ActionBankLoader] No actions found for indicator: ${indicatorKey}`);
    return [];
  }

  const numericScore =
    score !== undefined && score !== null ? Math.floor(Number(score)) : 0;

  if (numericScore === 0) {
    return indicatorActions["0-1"] || [];
  } else if (numericScore === 1) {
    return indicatorActions["1-2"] || [];
  } else {
    // Score 2 or 3 loads the 2->3 tranche
    return indicatorActions["2-3"] || [];
  }
}
