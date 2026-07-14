#!/usr/bin/env npx tsx
/**
 * Code Quality Monitor Agent
 *
 * A lightweight, zero-dependency static analysis tool tailored to this
 * project's conventions.  It scans every .ts / .tsx file, applies a
 * set of pluggable rules, and prints a colour-coded report.
 *
 * Usage:
 *   npm run quality            # run all checks
 *   npm run quality -- --fix   # (future) auto-fix simple issues
 *
 * Exit codes:
 *   0 — no critical or high-severity issues
 *   1 — at least one critical / high issue found
 */

import fs from "node:fs";
import path from "node:path";

// ─── Types ──────────────────────────────────────────────────────────────────

export type Severity = "critical" | "high" | "medium" | "low";

export interface Finding {
  rule: string;
  severity: Severity;
  file: string;
  line?: number;
  message: string;
  suggestion?: string;
}

export interface Rule {
  id: string;
  description: string;
  severity: Severity;
  category: string;
  /** Return findings for a single file */
  check(filePath: string, content: string, lines: string[]): Finding[];
}

// ─── File discovery ─────────────────────────────────────────────────────────

const ROOT = path.resolve(import.meta.dirname, "..");

const IGNORE_DIRS = new Set([
  "node_modules",
  "dist",
  ".git",
  ".vercel",
  "scripts",
]);

function collectFiles(dir: string, ext: string[]): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectFiles(full, ext));
    } else if (ext.some((e) => entry.name.endsWith(e))) {
      results.push(full);
    }
  }
  return results;
}

// ─── Rules ──────────────────────────────────────────────────────────────────

const rules: Rule[] = [];

// 1 ── Missing error handling in async store actions ─────────────────────────
rules.push({
  id: "error-handling/async-no-try-catch",
  description: "Async functions that call API methods should use try/catch",
  severity: "critical",
  category: "Error Handling",
  check(_fp, _content, lines) {
    const findings: Finding[] = [];
    let insideAsync = false;
    let hasTryCatch = false;
    let asyncStart = 0;
    let braceDepth = 0;
    let funcName = "";

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Detect start of an async function / arrow
      if (/async\s+\w*\s*\(/.test(line) || /=\s*async\s*\(/.test(line)) {
        insideAsync = true;
        hasTryCatch = false;
        asyncStart = i;
        braceDepth = 0;
        const nameMatch = line.match(
          /(?:async\s+)?(\w+)\s*[:=]\s*async|async\s+(\w+)/
        );
        funcName = nameMatch?.[1] ?? nameMatch?.[2] ?? "<anonymous>";
      }

      if (insideAsync) {
        braceDepth += (line.match(/{/g) || []).length;
        braceDepth -= (line.match(/}/g) || []).length;

        if (/\btry\s*{/.test(line)) hasTryCatch = true;

        // Check if function body references api / fetch
        if (/\bapi\.\w+|fetch\(/.test(line) && !hasTryCatch) {
          // scan forward for try
          let foundTry = false;
          for (let j = asyncStart; j <= Math.min(i + 20, lines.length - 1); j++) {
            if (/\btry\s*{/.test(lines[j])) {
              foundTry = true;
              break;
            }
          }
          if (!foundTry) {
            findings.push({
              rule: "error-handling/async-no-try-catch",
              severity: "critical",
              file: _fp,
              line: i + 1,
              message: `Async function \`${funcName}\` calls an API but has no try/catch — errors will be silently swallowed or leave the UI in a broken state.`,
              suggestion:
                "Wrap the API call in a try/catch/finally block and handle errors (e.g. set an error state, show a toast).",
            });
            insideAsync = false; // avoid duplicate
          }
        }

        if (braceDepth <= 0) insideAsync = false;
      }
    }
    return findings;
  },
});

// 2 ── Missing loading / error state consumption ─────────────────────────────
rules.push({
  id: "ux/unused-loading-state",
  description:
    "Stores define `loading` state but components never show a loading indicator",
  severity: "high",
  category: "UX / Error Handling",
  check(fp, content) {
    const findings: Finding[] = [];
    // Only check route-level or page-level components
    if (!fp.includes("/routes/") && !fp.includes("/components/")) return [];

    if (
      /useSnapshot|useSettings/.test(content) &&
      !/loading/.test(content) &&
      !/Skeleton|Spinner|Loading/.test(content)
    ) {
      findings.push({
        rule: "ux/unused-loading-state",
        severity: "high",
        file: fp,
        message:
          "This component uses a store that has a `loading` flag, but never reads it — users see no feedback while data is fetching.",
        suggestion:
          "Destructure `loading` from the store and conditionally render a spinner or skeleton.",
      });
    }
    return findings;
  },
});

// 3 ── useEffect missing dependency ──────────────────────────────────────────
rules.push({
  id: "react/useeffect-missing-deps",
  description: "useEffect callbacks reference outer variables not in the dependency array",
  severity: "medium",
  category: "React Patterns",
  check(fp, _content, lines) {
    const findings: Finding[] = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Quick heuristic: empty dep array but body uses variables from outer scope
      if (/useEffect\(\s*\(\)\s*=>/.test(line)) {
        // Look for the closing ], [])
        for (let j = i; j < Math.min(i + 30, lines.length); j++) {
          if (/\[\s*\]\s*\)/.test(lines[j]) && j > i + 2) {
            // Check if the body references destructured store values (common pattern)
            const body = lines.slice(i, j).join("\n");
            const refs = body.match(/\b(activeUser|selectedId|fetch\w+)\b/g);
            if (refs && refs.length > 0) {
              findings.push({
                rule: "react/useeffect-missing-deps",
                severity: "medium",
                file: fp,
                line: i + 1,
                message: `useEffect has an empty dependency array but references: ${[...new Set(refs)].join(", ")}`,
                suggestion:
                  "Add the missing variables to the dependency array, or extract stable references with useCallback.",
              });
            }
            break;
          }
        }
      }
    }
    return findings;
  },
});

// 4 ── Array index used as React key ─────────────────────────────────────────
rules.push({
  id: "react/no-array-index-key",
  description: "Using array index as a React key causes issues when items are reordered",
  severity: "medium",
  category: "React Patterns",
  check(fp, _content, lines) {
    const findings: Finding[] = [];
    for (let i = 0; i < lines.length; i++) {
      if (/\.map\(\s*\(\s*\w+\s*,\s*(\w+)\s*\)/.test(lines[i])) {
        const idxName = lines[i].match(
          /\.map\(\s*\(\s*\w+\s*,\s*(\w+)\s*\)/
        )![1];
        // Look ahead for key={idxName}
        for (let j = i; j < Math.min(i + 10, lines.length); j++) {
          if (new RegExp(`key=\\{${idxName}\\}`).test(lines[j])) {
            findings.push({
              rule: "react/no-array-index-key",
              severity: "medium",
              file: fp,
              line: j + 1,
              message: `Array index \`${idxName}\` is used as a React key.`,
              suggestion:
                "Use a stable, unique identifier (e.g. item.id) as the key instead.",
            });
            break;
          }
        }
      }
    }
    return findings;
  },
});

// 5 ── Missing accessibility attributes ──────────────────────────────────────
rules.push({
  id: "a11y/missing-aria-label",
  description: "Interactive elements need accessible names",
  severity: "medium",
  category: "Accessibility",
  check(fp, _content, lines) {
    const findings: Finding[] = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Buttons with only icon content (e.g. ×, ✕, single char, SVG)
      if (
        /<button[^>]*>/.test(line) &&
        !(/aria-label/.test(line) || /title=/.test(line))
      ) {
        // Check if the button content is just an icon / symbol
        const contentMatch = line.match(/<button[^>]*>([^<]{1,3})<\/button>/);
        if (contentMatch) {
          findings.push({
            rule: "a11y/missing-aria-label",
            severity: "medium",
            file: fp,
            line: i + 1,
            message: `Button with icon-only content "${contentMatch[1].trim()}" has no aria-label.`,
            suggestion:
              'Add aria-label="descriptive text" to the button element.',
          });
        }
      }
      // Modal divs without role
      if (/fixed\s+inset-0/.test(line) && !/role=/.test(line)) {
        findings.push({
          rule: "a11y/missing-aria-label",
          severity: "medium",
          file: fp,
          line: i + 1,
          message: "Modal overlay is missing `role=\"dialog\"` and `aria-modal`.",
          suggestion:
            'Add role="dialog" and aria-modal="true" to the overlay container.',
        });
      }
    }
    return findings;
  },
});

// 6 ── API endpoint missing input validation ─────────────────────────────────
rules.push({
  id: "api/missing-validation",
  description: "API handlers should validate request body before processing",
  severity: "high",
  category: "API Security",
  check(fp, content, lines) {
    const findings: Finding[] = [];
    if (!fp.includes("/api/")) return [];

    // Check PUT/POST handlers
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/req\.method\s*===?\s*['"]PUT['"]/.test(line)) {
        // Scan next 20 lines for body validation
        const block = lines.slice(i, i + 25).join("\n");
        if (!/if\s*\(!.*body|!.*req\.body|validation|validate|schema/.test(block)) {
          findings.push({
            rule: "api/missing-validation",
            severity: "high",
            file: fp,
            line: i + 1,
            message:
              "PUT handler does not validate the request body — malformed input can crash the server.",
            suggestion:
              "Validate required fields (e.g. `date`, `assets`) before processing the request.",
          });
        }
      }
    }
    return findings;
  },
});

// 7 ── API endpoint missing authentication ───────────────────────────────────
rules.push({
  id: "api/missing-auth",
  description: "API endpoints have no authentication — anyone can read/write data",
  severity: "high",
  category: "API Security",
  check(fp, content) {
    const findings: Finding[] = [];
    if (!fp.includes("/api/")) return [];
    if (fp.includes("_lib/")) return []; // utility files

    if (!/auth|token|session|cookie|jwt|bearer/i.test(content)) {
      findings.push({
        rule: "api/missing-auth",
        severity: "high",
        file: fp,
        message:
          "This API endpoint has no authentication — all data is publicly accessible.",
        suggestion:
          "Add authentication middleware (e.g. JWT verification, session cookie check) before processing requests.",
      });
    }
    return findings;
  },
});

// 8 ── Env var access without fallback ───────────────────────────────────────
rules.push({
  id: "safety/env-no-fallback",
  description: "Accessing process.env without a fallback can crash at runtime",
  severity: "high",
  category: "Runtime Safety",
  check(fp, _content, lines) {
    const findings: Finding[] = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/process\.env\.\w+\s*!/.test(line) || /process\.env\.\w+\s+as\s+string/.test(line)) {
        findings.push({
          rule: "safety/env-no-fallback",
          severity: "high",
          file: fp,
          line: i + 1,
          message:
            "Environment variable is accessed with a non-null assertion — will throw an opaque error if missing.",
          suggestion:
            'Validate at startup: `const URI = process.env.MONGODB_URI ?? throw new Error("MONGODB_URI not set")`',
        });
      }
    }
    return findings;
  },
});

// 9 ── Duplicate type definitions ────────────────────────────────────────────
rules.push({
  id: "types/duplicate-definition",
  description: "Types defined in both frontend and backend can drift out of sync",
  severity: "high",
  category: "Type Safety",
  check(fp, content) {
    const findings: Finding[] = [];
    // Only flag the backend file to avoid double-reporting
    if (!fp.includes("/api/")) return [];

    const typeNames = [
      ...content.matchAll(/(?:export\s+)?(?:interface|type)\s+(\w+)/g),
    ].map((m) => m[1]);

    // Check if frontend also has these types
    const frontendTypesPath = path.join(ROOT, "src/types/index.ts");
    if (!fs.existsSync(frontendTypesPath)) return [];
    const feContent = fs.readFileSync(frontendTypesPath, "utf-8");

    for (const name of typeNames) {
      const re = new RegExp(`(?:interface|type)\\s+${name}\\b`);
      if (re.test(feContent)) {
        findings.push({
          rule: "types/duplicate-definition",
          severity: "high",
          file: fp,
          message: `Type \`${name}\` is defined in both frontend and backend — changes must be manually synchronised.`,
          suggestion:
            "Extract shared types into a shared package or a `shared/types.ts` file imported by both sides.",
        });
      }
    }
    return findings;
  },
});

// 10 ── Unused imports / variables ────────────────────────────────────────────
rules.push({
  id: "hygiene/unused-variable",
  description: "Variables that are assigned but never referenced are dead code",
  severity: "low",
  category: "Code Hygiene",
  check(fp, content, lines) {
    const findings: Finding[] = [];
    // Simple heuristic: `const x = ...` where x appears only once in the file
    for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(
        /(?:const|let)\s+(\w+)\s*=(?!=)/
      );
      if (match) {
        const varName = match[1];
        // Skip common patterns: destructuring, exports, _prefixed
        if (varName.startsWith("_") || varName === "default") continue;
        if (lines[i].includes("export")) continue;
        // Count occurrences in entire file
        const count = (
          content.match(new RegExp(`\\b${varName}\\b`, "g")) || []
        ).length;
        if (count === 1) {
          findings.push({
            rule: "hygiene/unused-variable",
            severity: "low",
            file: fp,
            line: i + 1,
            message: `\`${varName}\` is assigned but never used elsewhere in this file.`,
            suggestion: "Remove the variable or use it.",
          });
        }
      }
    }
    return findings;
  },
});

// 11 ── Inconsistent export style ────────────────────────────────────────────
rules.push({
  id: "consistency/export-style",
  description: "Mixing default and named exports in components leads to inconsistency",
  severity: "low",
  category: "Consistency",
  check(fp, content) {
    const findings: Finding[] = [];
    if (!fp.endsWith(".tsx")) return [];
    if (/export\s+default\s+function/.test(content)) {
      findings.push({
        rule: "consistency/export-style",
        severity: "low",
        file: fp,
        message:
          "This component uses `export default` while other components use named exports.",
        suggestion:
          "Use named exports (`export function X`) for consistency across the codebase.",
      });
    }
    return findings;
  },
});

// 12 ── No lazy loading for routes ───────────────────────────────────────────
rules.push({
  id: "perf/no-lazy-routes",
  description: "Route components are eagerly imported — consider lazy loading for better initial load",
  severity: "low",
  category: "Performance",
  check(fp, content) {
    const findings: Finding[] = [];
    if (!fp.endsWith("App.tsx")) return [];
    if (
      /import\s+.*from\s+['"].*routes\//.test(content) &&
      !/lazy\(/.test(content)
    ) {
      findings.push({
        rule: "perf/no-lazy-routes",
        severity: "low",
        file: fp,
        message:
          "Route components are eagerly imported — the entire app is bundled into one chunk.",
        suggestion:
          "Use React.lazy() and <Suspense> to code-split route components.",
      });
    }
    return findings;
  },
});

// 13 ── Delete without confirmation ──────────────────────────────────────────
rules.push({
  id: "ux/no-delete-confirmation",
  description: "Destructive actions should ask for user confirmation",
  severity: "medium",
  category: "UX",
  check(fp, _content, lines) {
    const findings: Finding[] = [];
    for (let i = 0; i < lines.length; i++) {
      if (/delete|remove/i.test(lines[i]) && /api\.|\.delete|\.remove/.test(lines[i])) {
        // Look backward for a confirm() call
        const block = lines.slice(Math.max(0, i - 10), i + 1).join("\n");
        if (!/confirm\(|modal|dialog|confirmation/i.test(block)) {
          findings.push({
            rule: "ux/no-delete-confirmation",
            severity: "medium",
            file: fp,
            line: i + 1,
            message:
              "Destructive action (delete) is performed without asking for user confirmation.",
            suggestion:
              "Show a confirmation dialog before executing the delete operation.",
          });
        }
      }
    }
    return findings;
  },
});

// 14 ── Magic numbers / hardcoded values ─────────────────────────────────────
rules.push({
  id: "hygiene/magic-numbers",
  description: "Hardcoded pixel values or repeated constants should be extracted",
  severity: "low",
  category: "Code Hygiene",
  check(fp, _content, lines) {
    const findings: Finding[] = [];
    const magicPattern = /\[(\d{2,})(px|rem|em)\]/g;
    for (let i = 0; i < lines.length; i++) {
      let match;
      while ((match = magicPattern.exec(lines[i])) !== null) {
        findings.push({
          rule: "hygiene/magic-numbers",
          severity: "low",
          file: fp,
          line: i + 1,
          message: `Hardcoded value \`${match[0]}\` — consider extracting to a Tailwind theme token or CSS variable.`,
          suggestion:
            "Define a custom spacing/size in your Tailwind theme config instead of using arbitrary values.",
        });
      }
    }
    return findings;
  },
});

// ─── Runner ─────────────────────────────────────────────────────────────────

const SEVERITY_ORDER: Record<Severity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const SEVERITY_COLORS: Record<Severity, string> = {
  critical: "\x1b[31m", // red
  high: "\x1b[33m", // yellow
  medium: "\x1b[36m", // cyan
  low: "\x1b[90m", // gray
};

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";

function relPath(fp: string): string {
  return path.relative(ROOT, fp);
}

function run() {
  console.log();
  console.log(
    `${BOLD}🔍 Code Quality Monitor Agent${RESET}  ${DIM}— scanning ${ROOT}${RESET}`
  );
  console.log();

  const files = collectFiles(ROOT, [".ts", ".tsx"]);
  const allFindings: Finding[] = [];

  for (const fp of files) {
    const content = fs.readFileSync(fp, "utf-8");
    const lines = content.split("\n");

    for (const rule of rules) {
      const results = rule.check(fp, content, lines);
      allFindings.push(...results);
    }
  }

  // Sort by severity
  allFindings.sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
  );

  // Group by category
  const byCategory = new Map<string, Finding[]>();
  for (const f of allFindings) {
    const cat = rules.find((r) => r.id === f.rule)?.category ?? "Other";
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(f);
  }

  // Print report
  if (allFindings.length === 0) {
    console.log("  ✅ No issues found — great job!\n");
    process.exit(0);
  }

  // Summary table
  const counts: Record<Severity, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  };
  for (const f of allFindings) counts[f.severity]++;

  console.log(`${BOLD}  Summary${RESET}`);
  console.log(
    `  ${SEVERITY_COLORS.critical}● ${counts.critical} critical${RESET}` +
      `  ${SEVERITY_COLORS.high}● ${counts.high} high${RESET}` +
      `  ${SEVERITY_COLORS.medium}● ${counts.medium} medium${RESET}` +
      `  ${SEVERITY_COLORS.low}● ${counts.low} low${RESET}`
  );
  console.log(
    `  ${DIM}${"─".repeat(60)}${RESET}`
  );
  console.log();

  for (const [category, findings] of byCategory) {
    console.log(`  ${BOLD}📁 ${category}${RESET}`);
    console.log();

    for (const f of findings) {
      const color = SEVERITY_COLORS[f.severity];
      const loc = f.line
        ? `${DIM}${relPath(f.file)}:${f.line}${RESET}`
        : `${DIM}${relPath(f.file)}${RESET}`;
      const badge = `${color}[${f.severity.toUpperCase()}]${RESET}`;

      console.log(`    ${badge} ${f.message}`);
      console.log(`      ${loc}  ${DIM}(${f.rule})${RESET}`);
      if (f.suggestion) {
        console.log(`      ${DIM}💡 ${f.suggestion}${RESET}`);
      }
      console.log();
    }
  }

  // Score
  const maxScore = 100;
  const penalties: Record<Severity, number> = {
    critical: 15,
    high: 8,
    medium: 3,
    low: 1,
  };
  const totalPenalty = allFindings.reduce(
    (sum, f) => sum + penalties[f.severity],
    0
  );
  const score = Math.max(0, maxScore - totalPenalty);
  const scoreColor =
    score >= 80
      ? "\x1b[32m"
      : score >= 60
        ? "\x1b[33m"
        : "\x1b[31m";

  console.log(
    `  ${DIM}${"─".repeat(60)}${RESET}`
  );
  console.log(
    `  ${BOLD}Quality Score: ${scoreColor}${score} / 100${RESET}  ${DIM}(${allFindings.length} findings across ${files.length} files)${RESET}`
  );
  console.log();

  // Rules reference
  console.log(`  ${BOLD}Rules checked (${rules.length}):${RESET}`);
  for (const r of rules) {
    const color = SEVERITY_COLORS[r.severity];
    console.log(
      `    ${color}${r.severity.padEnd(8)}${RESET}  ${r.id.padEnd(40)} ${DIM}${r.description}${RESET}`
    );
  }
  console.log();

  // Exit code
  const hasCritical = counts.critical > 0 || counts.high > 0;
  if (hasCritical) {
    console.log(
      `  ${SEVERITY_COLORS.critical}${BOLD}✖ Exiting with code 1 — fix critical/high issues before merging.${RESET}`
    );
    console.log();
    process.exit(1);
  } else {
    console.log(
      `  ${DIM}✔ No critical or high issues — all clear for merge.${RESET}`
    );
    console.log();
    process.exit(0);
  }
}

run();
