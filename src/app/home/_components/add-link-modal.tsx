"use client";

import { useState } from "react";
import {
  IconLink,
  IconPlus,
  IconX,
  IconLoader2,
  IconStar,
  IconStarFilled,
  IconTag,
} from "@tabler/icons-react";
import { createLink } from "../lib/action";
import { CreateLinkSchema, LinkItem } from "../types";

interface AddLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (link: LinkItem) => void;
  platformId: string;
  categoryId?: string | null;
  targetName: string;
}

export default function AddLinkModal({
  isOpen,
  onClose,
  onSuccess,
  platformId,
  categoryId = null,
  targetName,
}: AddLinkModalProps) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [tagsInput, setTagsInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const tagList = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const payload = {
      url: url.trim(),
      title: title.trim() || undefined,
      description: description.trim() || undefined,
      platformId,
      categoryId: categoryId || null,
      isFavorite,
      tags: tagList,
    };

    // Client side Zod validation
    const validation = CreateLinkSchema.safeParse(payload);
    if (!validation.success) {
      const issue = validation.error.issues[0];
      setError(issue ? issue.message : "Please check your inputs");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await createLink(payload);
    setIsSubmitting(false);

    if (result.success && result.data) {
      // Reset form
      setUrl("");
      setTitle("");
      setDescription("");
      setIsFavorite(false);
      setTagsInput("");
      setError(null);

      onSuccess(result.data);
      onClose();
    } else {
      setError(result.message || "Failed to save link");
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content modal-content--wide"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-link-title"
      >
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-wrap modal-icon-wrap--link">
              <IconLink size={20} />
            </div>
            <div>
              <h3 id="add-link-title" className="modal-title">
                Save New Link
              </h3>
              <p className="modal-subtitle">
                Adding to <span className="highlight-target">{targetName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="modal-close-btn"
            aria-label="Close modal"
          >
            <IconX size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {/* URL Input */}
          <div className="form-group">
            <label htmlFor="link-url-input" className="modal-label">
              URL <span className="required-star">*</span>
            </label>
            <input
              id="link-url-input"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/article"
              className="modal-input"
              autoFocus
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Title Input */}
          <div className="form-group">
            <label htmlFor="link-title-input" className="modal-label">
              Title <span className="optional-tag">(optional)</span>
            </label>
            <input
              id="link-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Descriptive title"
              className="modal-input"
              maxLength={200}
              disabled={isSubmitting}
            />
          </div>

          {/* Description Input */}
          <div className="form-group">
            <label htmlFor="link-desc-input" className="modal-label">
              Notes / Description <span className="optional-tag">(optional)</span>
            </label>
            <textarea
              id="link-desc-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add key takeaways or comments..."
              className="modal-textarea"
              rows={2}
              maxLength={1000}
              disabled={isSubmitting}
            />
          </div>

          {/* Tags + Favorite row */}
          <div className="form-row">
            <div className="form-group flex-1">
              <label htmlFor="link-tags-input" className="modal-label">
                Tags <span className="optional-tag">(comma-separated)</span>
              </label>
              <div className="input-with-icon">
                <IconTag size={16} className="input-icon" />
                <input
                  id="link-tags-input"
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="react, tutorial, video"
                  className="modal-input padded-left"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="form-group flex-initial justify-end">
              <button
                type="button"
                onClick={() => setIsFavorite(!isFavorite)}
                className={`favorite-toggle-btn ${
                  isFavorite ? "favorite-toggle-btn--active" : ""
                }`}
                disabled={isSubmitting}
                title={isFavorite ? "Remove favorite" : "Mark as favorite"}
              >
                {isFavorite ? (
                  <IconStarFilled size={18} className="star-active" />
                ) : (
                  <IconStar size={18} />
                )}
                <span>Favorite</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="modal-error">
              <span>{error}</span>
            </div>
          )}

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="modal-btn modal-btn--secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="modal-btn modal-btn--primary"
              disabled={isSubmitting || !url.trim()}
            >
              {isSubmitting ? (
                <>
                  <IconLoader2 size={16} className="spinner" />
                  <span>Saving…</span>
                </>
              ) : (
                <>
                  <IconPlus size={16} />
                  <span>Save Link</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
