"use client";

import { useState } from "react";
import {
  IconFolderPlus,
  IconPlus,
  IconX,
  IconLoader2,
  IconWorld,
} from "@tabler/icons-react";
import { createPlatform } from "../lib/action";
import { CreatePlatformSchema, Platform } from "../types";

interface AddPlatformModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (platform: Platform) => void;
}

export default function AddPlatformModal({
  isOpen,
  onClose,
  onSuccess,
}: AddPlatformModalProps) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: name.trim(),
      icon: icon.trim() || undefined,
    };

    // Client-side Zod validation
    const validation = CreatePlatformSchema.safeParse(payload);
    if (!validation.success) {
      const issue = validation.error.issues[0];
      setError(issue ? issue.message : "Please enter a valid folder name");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await createPlatform(payload);
    setIsSubmitting(false);

    if (result.success && result.data) {
      // Reset form
      setName("");
      setIcon("");
      setError(null);

      onSuccess(result.data);
      onClose();
    } else {
      setError(result.message || "Failed to create parent folder");
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-platform-title"
      >
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-wrap modal-icon-wrap--platform">
              <IconFolderPlus size={20} />
            </div>
            <div>
              <h3 id="add-platform-title" className="modal-title">
                Create Parent Folder
              </h3>
              <p className="modal-subtitle">
                Create a top-level platform to organize sub-folders & links
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
          {/* Platform / Parent Folder Name Input */}
          <div className="form-group">
            <label htmlFor="platform-name-input" className="modal-label">
              Parent Folder / Platform Name <span className="required-star">*</span>
            </label>
            <input
              id="platform-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Instagram, GitHub, Work Projects, Design"
              className="modal-input"
              autoFocus
              required
              maxLength={50}
              disabled={isSubmitting}
            />
          </div>

          {/* Optional Icon URL */}
          <div className="form-group">
            <label htmlFor="platform-icon-input" className="modal-label">
              Icon URL <span className="optional-tag">(optional)</span>
            </label>
            <div className="input-with-icon">
              <IconWorld size={16} className="input-icon" />
              <input
                id="platform-icon-input"
                type="url"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="https://example.com/icon.png"
                className="modal-input padded-left"
                disabled={isSubmitting}
              />
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
              disabled={isSubmitting || !name.trim()}
            >
              {isSubmitting ? (
                <>
                  <IconLoader2 size={16} className="spinner" />
                  <span>Creating…</span>
                </>
              ) : (
                <>
                  <IconPlus size={16} />
                  <span>Create Parent Folder</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
