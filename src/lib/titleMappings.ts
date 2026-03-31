// Tiger Data - Department-Specific Title Mappings
// Maps level codes to actual job titles per department/function

export interface TitleMapping {
  level: string;       // e.g. "P1", "P4", "M5"
  title: string;       // e.g. "Senior Engineer II"
  variant?: string;    // e.g. "75th percentile" for P5-75th
}

export interface DepartmentTitles {
  department: string;
  titles: TitleMapping[];
}

export const DEPARTMENT_TITLE_MAPPINGS: DepartmentTitles[] = [
  {
    department: "Engineering",
    titles: [
      { level: "P1", title: "Associate Engineer" },
      { level: "P2", title: "Engineer" },
      { level: "P3", title: "Senior Engineer" },
      { level: "P4", title: "Senior Engineer II" },
      { level: "P5", title: "Staff Engineer" },
      { level: "P5", title: "Senior Staff Engineer", variant: "75th percentile" },
      { level: "P6", title: "Principal Engineer" },
    ],
  },
  {
    department: "Sales",
    titles: [
      { level: "P1", title: "BDR" },
      { level: "P2", title: "Senior BDR" },
      { level: "P2", title: "Emerging AE", variant: "AE track" },
      { level: "P3", title: "Mid-Market AE" },
      { level: "P4", title: "Enterprise AE" },
    ],
  },
];

/**
 * Get the job title(s) for a given level code and optional department.
 * If department is provided, returns department-specific titles.
 * If no department match, returns the generic level title from the level guide.
 */
export function getTitlesForLevel(
  levelCode: string,
  department?: string
): TitleMapping[] {
  if (!department) {
    // Return all matching titles across all departments
    const allTitles: TitleMapping[] = [];
    for (const dept of DEPARTMENT_TITLE_MAPPINGS) {
      for (const mapping of dept.titles) {
        if (mapping.level.toUpperCase() === levelCode.toUpperCase()) {
          allTitles.push({ ...mapping, title: `${mapping.title} (${dept.department})` });
        }
      }
    }
    return allTitles;
  }

  const deptMapping = DEPARTMENT_TITLE_MAPPINGS.find(
    (d) => d.department.toLowerCase() === department.toLowerCase()
  );

  if (!deptMapping) return [];

  return deptMapping.titles.filter(
    (t) => t.level.toUpperCase() === levelCode.toUpperCase()
  );
}

/**
 * Get the primary (most common) title for a level in a department.
 * Returns the first non-variant title, or the first title if all are variants.
 */
export function getPrimaryTitle(
  levelCode: string,
  department?: string
): string | null {
  const titles = getTitlesForLevel(levelCode, department);
  if (titles.length === 0) return null;
  const primary = titles.find((t) => !t.variant);
  return primary ? primary.title : titles[0].title;
}

/**
 * Generate a complete text representation of title mappings for AI system prompts.
 */
export function getTitleMappingsText(): string {
  let text = "=== TIGER DATA JOB TITLE MAPPINGS BY DEPARTMENT ===\n\n";
  text += "IMPORTANT: When leveling a role, always reference these department-specific titles. ";
  text += "The same level code maps to different job titles depending on the department.\n\n";

  for (const dept of DEPARTMENT_TITLE_MAPPINGS) {
    text += `--- ${dept.department} ---\n`;
    for (const mapping of dept.titles) {
      text += `  ${mapping.level}: ${mapping.title}`;
      if (mapping.variant) {
        text += ` (${mapping.variant})`;
      }
      text += "\n";
    }
    text += "\n";
  }

  text += "--- General (all departments) ---\n";
  text += "  Management Track:\n";
  text += "  M3: Manager\n";
  text += "  M4: Senior Manager\n";
  text += "  M5: Director\n";
  text += "  M6: Senior Director\n";
  text += "  VP: Vice President\n";
  text += "  SVP: Senior Vice President\n";
  text += "\n";

  text += "USAGE RULES:\n";
  text += "1. When you recommend a level, ALWAYS include the department-specific title if the department is known.\n";
  text += '2. Format as: "P4 — Senior Engineer II (Engineering)" or "P3 — Mid-Market AE (Sales)"\n';
  text += "3. If the department has multiple titles at the same level (e.g., P2 in Sales can be Senior BDR or Emerging AE), mention all options and explain which fits better based on the JD.\n";
  text += "4. If the department is not in the mapping, use the generic level title from the level guide.\n";
  text += "5. P5-75th percentile in Engineering is Senior Staff Engineer — only recommend this when the role clearly exceeds standard P5 expectations.\n";

  return text;
}
