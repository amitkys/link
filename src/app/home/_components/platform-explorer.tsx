"use client";

import { useCallback, useState, useTransition } from "react";
import {
  IconChevronRight,
  IconArrowLeft,
  IconWorld,
  IconFolder,
  IconFolderOpen,
  IconFolderPlus,
  IconPlus,
  IconX,
  IconLoader2,
  IconLink,
  IconExternalLink,
  IconStarFilled,
  IconTag,
} from "@tabler/icons-react";
import {
  createFolder,
  getCategoriesForPlatform,
  getLinksForContext,
  getSubcategories,
} from "../lib/action";
import { LinkItem } from "../types";
import AddLinkModal from "./add-link-modal";
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

// ── Helper ─────────────────────────────────────────────────────

function extractDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

// ── Component ──────────────────────────────────────────────────

export default function PlatformExplorer({ platforms }: PlatformExplorerProps) {
  // Navigation breadcrumb stack — starts at root
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbEntry[]>([
    { id: "root", name: "Platforms", type: "root" },
  ]);

  // Items (platforms or categories) currently displayed in grid
  const [items, setItems] = useState<(Platform | Category)[]>(platforms);

  // Links saved directly in current platform or category
  const [links, setLinks] = useState<LinkItem[]>([]);

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

  // Folder creation modal state
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [folderError, setFolderError] = useState<string | null>(null);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  // Link creation modal state
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);

  // ── Handlers ───────────────────────────────────────────────

  /** Click a platform → fetch its top-level categories & direct links */
  const handlePlatformClick = useCallback(
    (platform: Platform) => {
      setSlideDirection("forward");
      startTransition(async () => {
        const [catResult, linkResult] = await Promise.all([
          getCategoriesForPlatform(platform.id),
          getLinksForContext({ platformId: platform.id }),
        ]);

        if (catResult.success && catResult.data) {
          setBreadcrumb((prev) => [
            ...prev,
            { id: platform.id, name: platform.name, type: "platform" },
          ]);
          setItems(catResult.data);
          setLinks(linkResult.success && linkResult.data ? linkResult.data : []);
          setCurrentView("categories");
          setAnimationKey((k) => k + 1);
        }
      });
    },
    []
  );

  /** Click a category → fetch its subcategories & category links */
  const handleCategoryClick = useCallback(
    (category: Category) => {
      setSlideDirection("forward");
      startTransition(async () => {
        const [subResult, linkResult] = await Promise.all([
          getSubcategories(category.id),
          getLinksForContext({ categoryId: category.id }),
        ]);

        if (subResult.success && subResult.data) {
          setBreadcrumb((prev) => [
            ...prev,
            { id: category.id, name: category.name, type: "category" },
          ]);
          setItems(subResult.data);
          setLinks(linkResult.success && linkResult.data ? linkResult.data : []);
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
          setLinks([]);
          setCurrentView("platforms");
          setAnimationKey((k) => k + 1);
        });
        return;
      }

      // Going back to a platform level → re-fetch categories & platform links
      if (target.type === "platform") {
        startTransition(async () => {
          const [catResult, linkResult] = await Promise.all([
            getCategoriesForPlatform(target.id),
            getLinksForContext({ platformId: target.id }),
          ]);

          if (catResult.success && catResult.data) {
            setBreadcrumb(breadcrumb.slice(0, index + 1));
            setItems(catResult.data);
            setLinks(linkResult.success && linkResult.data ? linkResult.data : []);
            setCurrentView("categories");
            setAnimationKey((k) => k + 1);
          }
        });
        return;
      }

      // Going back to a category level → re-fetch subcategories & category links
      if (target.type === "category") {
        startTransition(async () => {
          const [subResult, linkResult] = await Promise.all([
            getSubcategories(target.id),
            getLinksForContext({ categoryId: target.id }),
          ]);

          if (subResult.success && subResult.data) {
            setBreadcrumb(breadcrumb.slice(0, index + 1));
            setItems(subResult.data);
            setLinks(linkResult.success && linkResult.data ? linkResult.data : []);
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

  /** Submit folder creation */
  const handleCreateFolderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newFolderName.trim();
    if (!trimmed) return;

    setIsCreatingFolder(true);
    setFolderError(null);

    const currentLvl = breadcrumb[breadcrumb.length - 1];
    const platformEntry = breadcrumb.find((b) => b.type === "platform");
    const platformId = platformEntry?.id || null;

    const parentId = currentLvl?.type === "category" ? currentLvl.id : null;

    const result = await createFolder({
      name: trimmed,
      platformId,
      parentId,
    });

    setIsCreatingFolder(false);

    if (result.success && result.data) {
      setNewFolderName("");
      setFolderError(null);
      setIsFolderModalOpen(false);

      setItems((prev) => [...prev, result.data as Category]);
      setAnimationKey((k) => k + 1);
    } else {
      setFolderError(result.message || "Failed to create folder");
    }
  };

  /** Callback when a new link is successfully created */
  const handleLinkCreated = (newLink: LinkItem) => {
    setLinks((prev) => [newLink, ...prev]);
    setAnimationKey((k) => k + 1);
  };

  // ── Derived state ──────────────────────────────────────────

  const isAtRoot = breadcrumb.length <= 1;
  const currentLevel = breadcrumb[breadcrumb.length - 1];
  const activePlatform = breadcrumb.find((b) => b.type === "platform");
  const isCategoryView = currentLevel?.type === "category";

  const targetPlatformId = activePlatform?.id || "";
  const targetCategoryId = isCategoryView ? currentLevel.id : null;

  const hasItems = items.length > 0;
  const hasLinks = links.length > 0;
  const isEmpty = !hasItems && !hasLinks;

  // ── Render ─────────────────────────────────────────────────

  return (
    <div className="explorer-container">
      {/* ── Header: Back + Breadcrumb + Actions ── */}
      <div className="explorer-header">
        <div className="explorer-header-left">
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

        {!isAtRoot && (
          <div className="explorer-actions">
            <button
              onClick={() => setIsLinkModalOpen(true)}
              className="create-link-button"
              disabled={isPending}
            >
              <IconLink size={16} />
              <span>Add Link</span>
            </button>

            <button
              onClick={() => {
                setFolderError(null);
                setNewFolderName("");
                setIsFolderModalOpen(true);
              }}
              className="create-folder-button"
              disabled={isPending}
            >
              <IconFolderPlus size={16} />
              <span>New Folder</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Loading overlay ── */}
      {isPending && (
        <div className="explorer-loading">
          <IconLoader2 size={28} className="spinner" />
          <span>Loading…</span>
        </div>
      )}

      {/* ── Content Grid ── */}
      {!isPending && !isEmpty && (
        <div
          key={animationKey}
          className={`explorer-content ${
            slideDirection === "forward" ? "slide-in-right" : "slide-in-left"
          }`}
        >
          {/* Folders / Categories Section */}
          {hasItems && (
            <div className="section-group">
              {currentView === "categories" && hasLinks && (
                <h4 className="section-title">Folders</h4>
              )}
              <div className="explorer-grid">
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
            </div>
          )}

          {/* Links Section */}
          {hasLinks && (
            <div className="section-group margin-top-lg">
              <h4 className="section-title">Saved Links ({links.length})</h4>
              <div className="explorer-grid explorer-grid--links">
                {links.map((link) => (
                  <div key={link.id} className="link-card">
                    <div className="link-card-header">
                      <div className="link-domain-badge">
                        <IconWorld size={14} />
                        <span>{extractDomain(link.url)}</span>
                      </div>
                      {link.isFavorite && (
                        <div className="favorite-badge" title="Favorite">
                          <IconStarFilled size={14} />
                        </div>
                      )}
                    </div>

                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-card-title-link"
                    >
                      <h5 className="link-card-title">
                        {link.title || link.url}
                      </h5>
                    </a>

                    {link.description && (
                      <p className="link-card-desc">{link.description}</p>
                    )}

                    {link.tags && link.tags.length > 0 && (
                      <div className="link-tags-row">
                        {link.tags.map((tag, idx) => (
                          <span key={idx} className="tag-pill">
                            <IconTag size={10} />
                            <span>{tag}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="link-card-footer">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="open-link-btn"
                      >
                        <span>Visit</span>
                        <IconExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Empty state ── */}
      {!isPending && isEmpty && (
        <div
          key={animationKey}
          className={`explorer-empty ${
            slideDirection === "forward" ? "slide-in-right" : "slide-in-left"
          }`}
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
              : `No folders or links in "${currentLevel?.name}"`}
          </p>
          <p className="empty-subtitle">
            {currentView === "platforms"
              ? "Add a platform from your dashboard to get started."
              : "This location is currently empty. Add a link or create a folder to get organized!"}
          </p>

          {!isAtRoot && (
            <div className="empty-actions-row">
              <button
                onClick={() => setIsLinkModalOpen(true)}
                className="empty-create-btn empty-create-btn--primary"
              >
                <IconLink size={16} />
                <span>Save Link Here</span>
              </button>

              <button
                onClick={() => {
                  setFolderError(null);
                  setNewFolderName("");
                  setIsFolderModalOpen(true);
                }}
                className="empty-create-btn empty-create-btn--secondary"
              >
                <IconFolderPlus size={16} />
                <span>Create Folder</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Create Folder Modal ── */}
      {isFolderModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsFolderModalOpen(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="modal-header">
              <div className="modal-title-group">
                <div className="modal-icon-wrap">
                  <IconFolderPlus size={20} />
                </div>
                <div>
                  <h3 id="modal-title" className="modal-title">
                    Create New Folder
                  </h3>
                  <p className="modal-subtitle">
                    Inside <span className="highlight-target">{currentLevel?.name}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFolderModalOpen(false)}
                className="modal-close-btn"
                aria-label="Close modal"
              >
                <IconX size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateFolderSubmit} className="modal-body">
              <label htmlFor="folder-name-input" className="modal-label">
                Folder Name
              </label>
              <input
                id="folder-name-input"
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="e.g. Memes, React Hooks, Design"
                className="modal-input"
                autoFocus
                maxLength={50}
                disabled={isCreatingFolder}
              />

              {folderError && (
                <div className="modal-error">
                  <span>{folderError}</span>
                </div>
              )}

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsFolderModalOpen(false)}
                  className="modal-btn modal-btn--secondary"
                  disabled={isCreatingFolder}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="modal-btn modal-btn--primary"
                  disabled={isCreatingFolder || !newFolderName.trim()}
                >
                  {isCreatingFolder ? (
                    <>
                      <IconLoader2 size={16} className="spinner" />
                      <span>Creating…</span>
                    </>
                  ) : (
                    <>
                      <IconPlus size={16} />
                      <span>Create Folder</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Add Link Modal ── */}
      <AddLinkModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        onSuccess={handleLinkCreated}
        platformId={targetPlatformId}
        categoryId={targetCategoryId}
        targetName={currentLevel?.name || "Platform"}
      />
    </div>
  );
}

