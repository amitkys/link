"use client";

import { useCallback, useState, useTransition } from "react";
import {
  IconChevronRight,
  IconArrowLeft,
  IconWorld,
  IconFolder,
  IconFolderOpen,
  IconMoodEmpty,
  IconLoader2,
} from "@tabler/icons-react";
import {
  getCategoriesForPlatform,
  getSubcategories,
} from "../lib/action";
import "./platform-explorer.css";

// ── Types ──────────────────────────────────────────────────────

/** Platform row from the DB */
interface Platform {
  id: string;
  name: string;
  icon: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Category row from the DB */
interface Category {
  id: string;
  name: string;
  parentId: string | null;
  platformId: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

/** A single entry in the navigation breadcrumb trail */
interface BreadcrumbEntry {
  id: string;
  name: string;
  type: "root" | "platform" | "category";
}

// ── Props ──────────────────────────────────────────────────────

interface PlatformExplorerProps {
  platforms: Platform[];
}

// ── Component ──────────────────────────────────────────────────

export default function PlatformExplorer({ platforms }: PlatformExplorerProps) {
  // Navigation breadcrumb stack — starts at root
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbEntry[]>([
    { id: "root", name: "Platforms", type: "root" },
  ]);

  // Items currently displayed in the grid
  const [items, setItems] = useState<(Platform | Category)[]>(platforms);

  // What kind of items we're showing right now
  const [currentView, setCurrentView] = useState<"platforms" | "categories">(
    "platforms"
  );

  // Loading / transition
  const [isPending, startTransition] = useTransition();

  // Slide direction for animation
  const [slideDirection, setSlideDirection] = useState<"forward" | "backward">(
    "forward"
  );

  // Trigger re-mount for animation via key
  const [animationKey, setAnimationKey] = useState(0);

  // ── Handlers ───────────────────────────────────────────────

  /** Click a platform → fetch its top-level categories */
  const handlePlatformClick = useCallback(
    (platform: Platform) => {
      setSlideDirection("forward");
      startTransition(async () => {
        const result = await getCategoriesForPlatform(platform.id);
        if (result.success && result.data) {
          setBreadcrumb((prev) => [
            ...prev,
            { id: platform.id, name: platform.name, type: "platform" },
          ]);
          setItems(result.data);
          setCurrentView("categories");
          setAnimationKey((k) => k + 1);
        }
      });
    },
    []
  );

  /** Click a category → fetch its subcategories */
  const handleCategoryClick = useCallback(
    (category: Category) => {
      setSlideDirection("forward");
      startTransition(async () => {
        const result = await getSubcategories(category.id);
        if (result.success && result.data) {
          setBreadcrumb((prev) => [
            ...prev,
            { id: category.id, name: category.name, type: "category" },
          ]);
          setItems(result.data);
          setCurrentView("categories");
          setAnimationKey((k) => k + 1);
        }
      });
    },
    []
  );

  /** Navigate to a specific breadcrumb level */
  const handleBreadcrumbClick = useCallback(
    (index: number) => {
      const target = breadcrumb[index];
      if (!target) return;

      setSlideDirection("backward");

      // Going back to root → show platforms
      if (target.type === "root") {
        startTransition(async () => {
          setBreadcrumb([{ id: "root", name: "Platforms", type: "root" }]);
          setItems(platforms);
          setCurrentView("platforms");
          setAnimationKey((k) => k + 1);
        });
        return;
      }

      // Going back to a platform level → re-fetch its categories
      if (target.type === "platform") {
        startTransition(async () => {
          const result = await getCategoriesForPlatform(target.id);
          if (result.success && result.data) {
            setBreadcrumb(breadcrumb.slice(0, index + 1));
            setItems(result.data);
            setCurrentView("categories");
            setAnimationKey((k) => k + 1);
          }
        });
        return;
      }

      // Going back to a category level → re-fetch its subcategories
      if (target.type === "category") {
        startTransition(async () => {
          const result = await getSubcategories(target.id);
          if (result.success && result.data) {
            setBreadcrumb(breadcrumb.slice(0, index + 1));
            setItems(result.data);
            setCurrentView("categories");
            setAnimationKey((k) => k + 1);
          }
        });
      }
    },
    [breadcrumb, platforms]
  );

  /** Go back one level */
  const handleBack = useCallback(() => {
    if (breadcrumb.length <= 1) return;
    handleBreadcrumbClick(breadcrumb.length - 2);
  }, [breadcrumb, handleBreadcrumbClick]);

  // ── Derived state ──────────────────────────────────────────

  const isAtRoot = breadcrumb.length <= 1;
  const currentLevel = breadcrumb[breadcrumb.length - 1];

  // ── Render ─────────────────────────────────────────────────

  return (
    <div className="explorer-container">
      {/* ── Header: Back + Breadcrumb ── */}
      <div className="explorer-header">
        {!isAtRoot && (
          <button
            onClick={handleBack}
            className="back-button"
            disabled={isPending}
            aria-label="Go back"
          >
            <IconArrowLeft size={18} />
          </button>
        )}

        <nav className="breadcrumb" aria-label="Navigation">
          {breadcrumb.map((entry, index) => {
            const isLast = index === breadcrumb.length - 1;
            return (
              <span key={`${entry.id}-${index}`} className="breadcrumb-segment">
                <button
                  onClick={() => handleBreadcrumbClick(index)}
                  className={`breadcrumb-item ${isLast ? "breadcrumb-item--active" : ""}`}
                  disabled={isLast || isPending}
                >
                  {entry.name}
                </button>
                {!isLast && (
                  <IconChevronRight
                    size={14}
                    className="breadcrumb-separator"
                  />
                )}
              </span>
            );
          })}
        </nav>
      </div>

      {/* ── Loading overlay ── */}
      {isPending && (
        <div className="explorer-loading">
          <IconLoader2 size={28} className="spinner" />
          <span>Loading…</span>
        </div>
      )}

      {/* ── Card grid ── */}
      {!isPending && items.length > 0 && (
        <div
          key={animationKey}
          className={`explorer-grid ${slideDirection === "forward" ? "slide-in-right" : "slide-in-left"}`}
        >
          {currentView === "platforms"
            ? (items as Platform[]).map((platform) => (
                <button
                  key={platform.id}
                  className="explorer-card explorer-card--platform"
                  onClick={() => handlePlatformClick(platform)}
                >
                  <div className="card-icon-wrap card-icon-wrap--platform">
                    {platform.icon ? (
                      <img
                        src={platform.icon}
                        alt={platform.name}
                        className="card-icon-img"
                      />
                    ) : (
                      <IconWorld size={24} />
                    )}
                  </div>
                  <span className="card-label">{platform.name}</span>
                  <IconChevronRight size={16} className="card-arrow" />
                </button>
              ))
            : (items as Category[]).map((category) => (
                <button
                  key={category.id}
                  className="explorer-card explorer-card--category"
                  onClick={() => handleCategoryClick(category)}
                >
                  <div className="card-icon-wrap card-icon-wrap--category">
                    <IconFolder size={22} />
                  </div>
                  <span className="card-label">{category.name}</span>
                  <IconChevronRight size={16} className="card-arrow" />
                </button>
              ))}
        </div>
      )}

      {/* ── Empty state ── */}
      {!isPending && items.length === 0 && (
        <div
          key={animationKey}
          className={`explorer-empty ${slideDirection === "forward" ? "slide-in-right" : "slide-in-left"}`}
        >
          <div className="empty-icon-wrap">
            {currentView === "platforms" ? (
              <IconWorld size={48} strokeWidth={1.2} />
            ) : (
              <IconFolderOpen size={48} strokeWidth={1.2} />
            )}
          </div>
          <p className="empty-title">
            {currentView === "platforms"
              ? "No platforms yet"
              : `No subcategories in "${currentLevel?.name}"`}
          </p>
          <p className="empty-subtitle">
            {currentView === "platforms"
              ? "Add a platform from your dashboard to get started."
              : "This category has no deeper levels."}
          </p>
        </div>
      )}
    </div>
  );
}
