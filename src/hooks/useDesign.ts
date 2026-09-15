import { useCallback, useEffect, useState } from "react";

export type Design = "classic" | "modern";

const DESIGN_KEY = "geosphere-design";
const THEME_COLORS: Record<Design, string> = {
  classic: "#0f766e",
  modern: "#2563eb",
};

function readDesign(): Design {
  try {
    const raw = window.localStorage.getItem(DESIGN_KEY);
    return raw === "classic" || raw === "modern" ? raw : "modern";
  } catch {
    return "modern";
  }
}

export function useDesign() {
  const [design, setDesignState] = useState<Design>(readDesign);

  useEffect(() => {
    document.documentElement.dataset.design = design;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (meta) meta.content = THEME_COLORS[design];
  }, [design]);

  const setDesign = useCallback((next: Design) => {
    setDesignState(next);
    try {
      window.localStorage.setItem(DESIGN_KEY, next);
    } catch {
      // The choice still applies for this session when storage is unavailable.
    }
  }, []);

  return { design, setDesign };
}
