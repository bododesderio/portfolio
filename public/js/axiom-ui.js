/**
 * ============================================================================
 *  AXIOM UI — Custom Component Library
 * ============================================================================
 *  Replaces every native browser popup, dropdown, and UI primitive with
 *  fully styled, theme-aware custom implementations.
 *
 *  Reads existing CSS custom properties:
 *    --surface, --surface-2, --card, --muted, --ink, --ink-muted,
 *    --hairline, --hairline-a, --brand, --brand-600, --brand-dark,
 *    --font-inter, --font-playfair
 *
 *  Adapts automatically to .dark class on <html> (next-themes).
 *  Zero external dependencies. Single file. Full ARIA + keyboard support.
 *
 *  Usage:
 *    <script src="/js/axiom-ui.js" defer></script>
 *    — or —
 *    import { initCustomUI } from '/js/axiom-ui.js'
 *    initCustomUI()
 *
 *  @author  Axiom
 *  @version 1.0.0
 * ============================================================================
 */

;(function (root) {
  'use strict'

  /* ─── Constants ─────────────────────────────────────────────────────── */

  const NAMESPACE = 'axiom'
  const ANIM_MS = 220
  const Z_MODAL = 99999
  const Z_DROPDOWN = 99998
  const Z_TOOLTIP = 99997
  const Z_CONTEXT = 99996

  /* ─── Theme Helpers ─────────────────────────────────────────────────── */

  /** Read a CSS var as `rgb(R G B)` format used in the portfolio theme. */
  function cv(name) {
    return `rgb(var(--${name}))`
  }
  function cva(name, alpha) {
    return `rgb(var(--${name}) / ${alpha})`
  }

  /* ─── Style Injection ───────────────────────────────────────────────── */

  function injectStyles() {
    if (document.getElementById(`${NAMESPACE}-styles`)) return

    const style = document.createElement('style')
    style.id = `${NAMESPACE}-styles`
    style.textContent = /* css */ `
      /* ================================================================
         AXIOM UI — Injected Styles
         All values resolve through CSS custom properties.
         ================================================================ */

      /* ── Shared reset ─────────────────────────────────────────────── */
      .axm-overlay {
        position: fixed; inset: 0;
        z-index: ${Z_MODAL};
        display: flex; align-items: center; justify-content: center;
        background: rgba(0,0,0,0.45);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        opacity: 0;
        transition: opacity ${ANIM_MS}ms cubic-bezier(0.16, 1, 0.3, 1);
        font-family: var(--font-inter, 'Inter', system-ui, sans-serif);
      }
      .axm-overlay.axm-open { opacity: 1; }

      /* ── Modal (alert / confirm / prompt) ─────────────────────────── */
      .axm-modal {
        position: relative;
        width: 92%; max-width: 420px;
        background: ${cv('card')};
        border: 1px solid ${cva('hairline', 'var(--hairline-a)')};
        border-radius: 1.25rem;
        box-shadow: 0 24px 64px -16px rgba(0,0,0,0.35),
                    0 0 0 1px ${cva('hairline', '0.06')};
        padding: 2rem;
        transform: translateY(12px) scale(0.97);
        opacity: 0;
        transition: transform ${ANIM_MS}ms cubic-bezier(0.16, 1, 0.3, 1),
                    opacity ${ANIM_MS}ms cubic-bezier(0.16, 1, 0.3, 1);
      }
      .axm-open .axm-modal {
        transform: translateY(0) scale(1);
        opacity: 1;
      }

      .axm-modal-title {
        font-family: var(--font-playfair, 'Playfair Display', Georgia, serif);
        font-size: 1.25rem;
        color: ${cv('ink')};
        margin: 0 0 0.5rem;
        letter-spacing: -0.02em;
      }
      .axm-modal-body {
        font-size: 0.9375rem;
        line-height: 1.6;
        color: ${cv('ink-muted')};
        margin: 0 0 1.5rem;
        word-break: break-word;
      }
      .axm-modal-input {
        display: block; width: 100%;
        padding: 0.75rem 1rem;
        font-size: 0.9375rem;
        color: ${cv('ink')};
        background: ${cv('muted')};
        border: 1px solid ${cva('hairline', 'var(--hairline-a)')};
        border-radius: 0.75rem;
        outline: none;
        margin-bottom: 1.25rem;
        transition: border-color 0.2s, box-shadow 0.2s;
        font-family: inherit;
      }
      .axm-modal-input:focus {
        border-color: ${cv('brand')};
        box-shadow: 0 0 0 3px ${cva('brand', '0.15')};
      }
      .axm-modal-actions {
        display: flex; gap: 0.75rem; justify-content: flex-end;
      }
      .axm-btn {
        display: inline-flex; align-items: center; justify-content: center;
        padding: 0.625rem 1.5rem;
        font-size: 0.8125rem;
        font-weight: 600;
        border-radius: 9999px;
        border: none;
        cursor: pointer;
        transition: background 0.2s, box-shadow 0.2s, transform 0.1s;
        font-family: inherit;
        line-height: 1;
      }
      .axm-btn:active { transform: scale(0.97); }
      .axm-btn:focus-visible {
        outline: 2px solid ${cv('brand')};
        outline-offset: 2px;
      }
      .axm-btn-primary {
        background: ${cv('brand')};
        color: #fff;
      }
      .axm-btn-primary:hover {
        background: ${cv('brand-600')};
        box-shadow: 0 2px 16px -4px ${cva('brand', '0.4')};
      }
      .axm-btn-secondary {
        background: ${cv('muted')};
        color: ${cv('ink')};
      }
      .axm-btn-secondary:hover {
        background: ${cva('hairline', '0.12')};
      }

      /* ── Tooltip ──────────────────────────────────────────────────── */
      .axm-tooltip {
        position: fixed;
        z-index: ${Z_TOOLTIP};
        max-width: 280px;
        padding: 0.5rem 0.875rem;
        font-size: 0.8125rem;
        line-height: 1.4;
        color: #fff;
        background: ${cv('ink')};
        border-radius: 0.5rem;
        box-shadow: 0 4px 16px rgba(0,0,0,0.25);
        pointer-events: none;
        opacity: 0;
        transform: translateY(4px);
        transition: opacity 160ms ease, transform 160ms ease;
        font-family: var(--font-inter, 'Inter', system-ui, sans-serif);
      }
      .axm-tooltip.axm-open {
        opacity: 1;
        transform: translateY(0);
      }
      .axm-tooltip::after {
        content: '';
        position: absolute;
        top: 100%; left: 50%;
        transform: translateX(-50%);
        border: 5px solid transparent;
        border-top-color: ${cv('ink')};
      }
      .axm-tooltip.axm-tooltip-top::after {
        top: 100%; bottom: auto;
        border-top-color: ${cv('ink')};
        border-bottom-color: transparent;
      }
      .axm-tooltip.axm-tooltip-bottom::after {
        bottom: 100%; top: auto;
        border-bottom-color: ${cv('ink')};
        border-top-color: transparent;
      }

      /* ── Custom Select / Dropdown ─────────────────────────────────── */
      .axm-select-wrap {
        position: relative;
        display: inline-block;
        font-family: var(--font-inter, 'Inter', system-ui, sans-serif);
      }
      .axm-select-trigger {
        display: flex; align-items: center; justify-content: space-between;
        gap: 0.5rem;
        width: 100%;
        padding: 0.75rem 1rem;
        font-size: 0.875rem;
        color: ${cv('ink')};
        background: ${cv('muted')};
        border: 1px solid ${cva('hairline', 'var(--hairline-a)')};
        border-radius: 0.75rem;
        cursor: pointer;
        transition: border-color 0.2s, box-shadow 0.2s;
        font-family: inherit;
        user-select: none;
        line-height: 1.4;
      }
      .axm-select-trigger:hover {
        border-color: ${cva('brand', '0.4')};
      }
      .axm-select-trigger:focus,
      .axm-select-trigger.axm-active {
        outline: none;
        border-color: ${cv('brand')};
        box-shadow: 0 0 0 3px ${cva('brand', '0.15')};
      }
      .axm-select-trigger svg {
        width: 1rem; height: 1rem;
        color: ${cv('ink-muted')};
        transition: transform 0.2s;
        flex-shrink: 0;
      }
      .axm-select-trigger.axm-active svg {
        transform: rotate(180deg);
      }
      .axm-select-placeholder {
        color: ${cv('ink-muted')};
      }
      .axm-select-menu {
        position: absolute; top: calc(100% + 6px); left: 0; right: 0;
        z-index: ${Z_DROPDOWN};
        background: ${cv('card')};
        border: 1px solid ${cva('hairline', 'var(--hairline-a)')};
        border-radius: 0.75rem;
        box-shadow: 0 12px 40px -8px rgba(0,0,0,0.25);
        max-height: 260px;
        overflow-y: auto;
        overscroll-behavior: contain;
        padding: 0.25rem;
        opacity: 0;
        transform: translateY(-4px);
        transition: opacity 160ms ease, transform 160ms ease;
        pointer-events: none;
      }
      .axm-select-menu.axm-open {
        opacity: 1; transform: translateY(0); pointer-events: auto;
      }
      .axm-select-option {
        display: flex; align-items: center; justify-content: space-between;
        padding: 0.625rem 0.875rem;
        font-size: 0.875rem;
        color: ${cv('ink')};
        border-radius: 0.5rem;
        cursor: pointer;
        transition: background 0.15s;
        user-select: none;
      }
      .axm-select-option:hover,
      .axm-select-option.axm-focused {
        background: ${cv('muted')};
      }
      .axm-select-option.axm-selected {
        color: ${cv('brand')};
        font-weight: 600;
      }
      .axm-select-option.axm-selected::after {
        content: '';
        display: inline-block;
        width: 0.5rem; height: 0.5rem;
        border-radius: 50%;
        background: ${cv('brand')};
      }

      /* ── Context Menu ─────────────────────────────────────────────── */
      .axm-context {
        position: fixed;
        z-index: ${Z_CONTEXT};
        min-width: 180px;
        background: ${cv('card')};
        border: 1px solid ${cva('hairline', 'var(--hairline-a)')};
        border-radius: 0.75rem;
        box-shadow: 0 12px 40px -8px rgba(0,0,0,0.3);
        padding: 0.25rem;
        opacity: 0;
        transform: scale(0.95);
        transform-origin: top left;
        transition: opacity 140ms ease, transform 140ms ease;
        font-family: var(--font-inter, 'Inter', system-ui, sans-serif);
      }
      .axm-context.axm-open {
        opacity: 1; transform: scale(1);
      }
      .axm-context-item {
        display: flex; align-items: center; gap: 0.75rem;
        padding: 0.5625rem 0.875rem;
        font-size: 0.8125rem;
        color: ${cv('ink')};
        border-radius: 0.5rem;
        cursor: pointer;
        transition: background 0.15s;
        border: none;
        background: transparent;
        width: 100%;
        text-align: left;
        font-family: inherit;
      }
      .axm-context-item:hover,
      .axm-context-item.axm-focused {
        background: ${cv('muted')};
      }
      .axm-context-item kbd {
        margin-left: auto;
        font-size: 0.6875rem;
        color: ${cv('ink-muted')};
        font-family: inherit;
      }
      .axm-context-sep {
        height: 1px;
        background: ${cva('hairline', 'var(--hairline-a)')};
        margin: 0.25rem 0.5rem;
      }

      /* ── File Picker ──────────────────────────────────────────────── */
      .axm-filepicker {
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        gap: 0.75rem;
        padding: 2rem;
        border: 2px dashed ${cva('hairline', '0.2')};
        border-radius: 1rem;
        background: ${cva('muted', '0.5')};
        cursor: pointer;
        transition: border-color 0.2s, background 0.2s;
        text-align: center;
        font-family: var(--font-inter, 'Inter', system-ui, sans-serif);
      }
      .axm-filepicker:hover,
      .axm-filepicker.axm-dragover {
        border-color: ${cv('brand')};
        background: ${cva('brand', '0.05')};
      }
      .axm-filepicker-icon {
        width: 2.5rem; height: 2.5rem;
        color: ${cv('ink-muted')};
      }
      .axm-filepicker-text {
        font-size: 0.875rem;
        color: ${cv('ink-muted')};
      }
      .axm-filepicker-text strong {
        color: ${cv('brand')};
        font-weight: 600;
      }
      .axm-filepicker-files {
        display: flex; flex-wrap: wrap; gap: 0.5rem;
        margin-top: 0.5rem;
      }
      .axm-filepicker-tag {
        display: inline-flex; align-items: center; gap: 0.375rem;
        padding: 0.25rem 0.625rem;
        font-size: 0.75rem;
        background: ${cv('muted')};
        color: ${cv('ink')};
        border-radius: 0.5rem;
      }
      .axm-filepicker-tag button {
        background: none; border: none; cursor: pointer;
        color: ${cv('ink-muted')};
        font-size: 0.875rem;
        line-height: 1;
        padding: 0;
      }
      .axm-filepicker-tag button:hover { color: ${cv('ink')}; }

      /* ── Date Picker ──────────────────────────────────────────────── */
      .axm-datepicker-wrap {
        position: relative;
        display: inline-block;
        font-family: var(--font-inter, 'Inter', system-ui, sans-serif);
      }
      .axm-datepicker-input {
        width: 100%;
        padding: 0.75rem 1rem;
        padding-right: 2.5rem;
        font-size: 0.875rem;
        color: ${cv('ink')};
        background: ${cv('muted')};
        border: 1px solid ${cva('hairline', 'var(--hairline-a)')};
        border-radius: 0.75rem;
        outline: none;
        font-family: inherit;
        transition: border-color 0.2s, box-shadow 0.2s;
        cursor: pointer;
      }
      .axm-datepicker-input:focus {
        border-color: ${cv('brand')};
        box-shadow: 0 0 0 3px ${cva('brand', '0.15')};
      }
      .axm-datepicker-icon {
        position: absolute; right: 0.75rem; top: 50%;
        transform: translateY(-50%);
        width: 1rem; height: 1rem;
        color: ${cv('ink-muted')};
        pointer-events: none;
      }
      .axm-calendar {
        position: absolute; top: calc(100% + 6px); left: 0;
        z-index: ${Z_DROPDOWN};
        width: 300px;
        background: ${cv('card')};
        border: 1px solid ${cva('hairline', 'var(--hairline-a)')};
        border-radius: 1rem;
        box-shadow: 0 12px 40px -8px rgba(0,0,0,0.25);
        padding: 1rem;
        opacity: 0;
        transform: translateY(-4px);
        transition: opacity 160ms ease, transform 160ms ease;
        pointer-events: none;
      }
      .axm-calendar.axm-open {
        opacity: 1; transform: translateY(0); pointer-events: auto;
      }
      .axm-cal-header {
        display: flex; align-items: center; justify-content: space-between;
        margin-bottom: 0.75rem;
      }
      .axm-cal-header span {
        font-weight: 600;
        font-size: 0.9375rem;
        color: ${cv('ink')};
      }
      .axm-cal-nav {
        display: flex; align-items: center; justify-content: center;
        width: 2rem; height: 2rem;
        border-radius: 0.5rem;
        border: none; background: transparent;
        cursor: pointer;
        color: ${cv('ink-muted')};
        font-size: 1rem;
        transition: background 0.15s;
      }
      .axm-cal-nav:hover { background: ${cv('muted')}; }
      .axm-cal-grid {
        display: grid; grid-template-columns: repeat(7, 1fr);
        gap: 2px;
        text-align: center;
      }
      .axm-cal-dow {
        font-size: 0.6875rem;
        font-weight: 600;
        color: ${cv('ink-muted')};
        padding: 0.375rem 0;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .axm-cal-day {
        display: flex; align-items: center; justify-content: center;
        width: 2.25rem; height: 2.25rem;
        margin: 0 auto;
        font-size: 0.8125rem;
        color: ${cv('ink')};
        border-radius: 0.5rem;
        border: none; background: transparent;
        cursor: pointer;
        transition: background 0.15s;
        font-family: inherit;
      }
      .axm-cal-day:hover { background: ${cv('muted')}; }
      .axm-cal-day.axm-today {
        font-weight: 700;
        color: ${cv('brand')};
      }
      .axm-cal-day.axm-selected {
        background: ${cv('brand')};
        color: #fff;
        font-weight: 600;
      }
      .axm-cal-day.axm-outside {
        color: ${cv('ink-muted')};
        opacity: 0.4;
      }

      /* ── Color Picker ─────────────────────────────────────────────── */
      .axm-colorpicker-wrap {
        position: relative;
        display: inline-flex; align-items: center; gap: 0.5rem;
        font-family: var(--font-inter, 'Inter', system-ui, sans-serif);
      }
      .axm-color-swatch {
        width: 2.25rem; height: 2.25rem;
        border-radius: 0.5rem;
        border: 2px solid ${cva('hairline', 'var(--hairline-a)')};
        cursor: pointer;
        transition: box-shadow 0.2s;
      }
      .axm-color-swatch:hover {
        box-shadow: 0 0 0 3px ${cva('brand', '0.2')};
      }
      .axm-color-input {
        width: 7rem;
        padding: 0.5rem 0.75rem;
        font-size: 0.8125rem;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        color: ${cv('ink')};
        background: ${cv('muted')};
        border: 1px solid ${cva('hairline', 'var(--hairline-a)')};
        border-radius: 0.5rem;
        outline: none;
        transition: border-color 0.2s;
      }
      .axm-color-input:focus {
        border-color: ${cv('brand')};
        box-shadow: 0 0 0 3px ${cva('brand', '0.15')};
      }
      .axm-color-panel {
        position: absolute; top: calc(100% + 8px); left: 0;
        z-index: ${Z_DROPDOWN};
        width: 240px;
        background: ${cv('card')};
        border: 1px solid ${cva('hairline', 'var(--hairline-a)')};
        border-radius: 1rem;
        box-shadow: 0 12px 40px -8px rgba(0,0,0,0.25);
        padding: 1rem;
        opacity: 0;
        transform: translateY(-4px);
        transition: opacity 160ms ease, transform 160ms ease;
        pointer-events: none;
      }
      .axm-color-panel.axm-open {
        opacity: 1; transform: translateY(0); pointer-events: auto;
      }
      .axm-color-area {
        position: relative;
        width: 100%; height: 140px;
        border-radius: 0.5rem;
        cursor: crosshair;
        margin-bottom: 0.75rem;
        overflow: hidden;
      }
      .axm-color-area-thumb {
        position: absolute;
        width: 14px; height: 14px;
        border: 2px solid #fff;
        border-radius: 50%;
        box-shadow: 0 0 0 1px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2);
        transform: translate(-50%, -50%);
        pointer-events: none;
      }
      .axm-color-hue {
        -webkit-appearance: none;
        appearance: none;
        width: 100%; height: 12px;
        border-radius: 6px;
        background: linear-gradient(to right,
          hsl(0,100%,50%), hsl(60,100%,50%), hsl(120,100%,50%),
          hsl(180,100%,50%), hsl(240,100%,50%), hsl(300,100%,50%), hsl(360,100%,50%)
        );
        outline: none;
        cursor: pointer;
        margin-bottom: 0.75rem;
      }
      .axm-color-hue::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 16px; height: 16px;
        border-radius: 50%;
        background: #fff;
        border: 2px solid rgba(0,0,0,0.2);
        box-shadow: 0 1px 4px rgba(0,0,0,0.2);
        cursor: pointer;
      }
      .axm-color-hue::-moz-range-thumb {
        width: 16px; height: 16px;
        border-radius: 50%;
        background: #fff;
        border: 2px solid rgba(0,0,0,0.2);
        box-shadow: 0 1px 4px rgba(0,0,0,0.2);
        cursor: pointer;
      }
      .axm-color-preview-row {
        display: flex; align-items: center; gap: 0.5rem;
      }
      .axm-color-preview-swatch {
        width: 2rem; height: 2rem;
        border-radius: 0.375rem;
        border: 1px solid ${cva('hairline', 'var(--hairline-a)')};
        flex-shrink: 0;
      }

      /* ── Popover ──────────────────────────────────────────────────── */
      .axm-popover {
        position: absolute;
        z-index: ${Z_DROPDOWN};
        background: ${cv('card')};
        border: 1px solid ${cva('hairline', 'var(--hairline-a)')};
        border-radius: 0.75rem;
        box-shadow: 0 12px 40px -8px rgba(0,0,0,0.25);
        padding: 1rem;
        min-width: 200px;
        opacity: 0;
        transform: translateY(-4px);
        transition: opacity 160ms ease, transform 160ms ease;
        pointer-events: none;
        font-family: var(--font-inter, 'Inter', system-ui, sans-serif);
      }
      .axm-popover.axm-open {
        opacity: 1; transform: translateY(0); pointer-events: auto;
      }

      /* ── Autocomplete / Datalist ──────────────────────────────────── */
      .axm-autocomplete-wrap {
        position: relative;
        display: inline-block;
        font-family: var(--font-inter, 'Inter', system-ui, sans-serif);
      }
      .axm-autocomplete-input {
        width: 100%;
        padding: 0.75rem 1rem;
        font-size: 0.875rem;
        color: ${cv('ink')};
        background: ${cv('muted')};
        border: 1px solid ${cva('hairline', 'var(--hairline-a)')};
        border-radius: 0.75rem;
        outline: none;
        font-family: inherit;
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .axm-autocomplete-input:focus {
        border-color: ${cv('brand')};
        box-shadow: 0 0 0 3px ${cva('brand', '0.15')};
      }
      .axm-autocomplete-menu {
        position: absolute; top: calc(100% + 4px); left: 0; right: 0;
        z-index: ${Z_DROPDOWN};
        background: ${cv('card')};
        border: 1px solid ${cva('hairline', 'var(--hairline-a)')};
        border-radius: 0.75rem;
        box-shadow: 0 12px 40px -8px rgba(0,0,0,0.25);
        max-height: 200px;
        overflow-y: auto;
        padding: 0.25rem;
        opacity: 0;
        transform: translateY(-4px);
        transition: opacity 120ms ease, transform 120ms ease;
        pointer-events: none;
      }
      .axm-autocomplete-menu.axm-open {
        opacity: 1; transform: translateY(0); pointer-events: auto;
      }
      .axm-autocomplete-item {
        padding: 0.5rem 0.75rem;
        font-size: 0.875rem;
        color: ${cv('ink')};
        border-radius: 0.5rem;
        cursor: pointer;
        transition: background 0.15s;
      }
      .axm-autocomplete-item:hover,
      .axm-autocomplete-item.axm-focused {
        background: ${cv('muted')};
      }
      .axm-autocomplete-item mark {
        background: ${cva('brand', '0.2')};
        color: ${cv('brand')};
        border-radius: 2px;
        padding: 0 1px;
      }

      /* ── Reduced motion ───────────────────────────────────────────── */
      @media (prefers-reduced-motion: reduce) {
        .axm-overlay, .axm-modal, .axm-tooltip,
        .axm-select-menu, .axm-context, .axm-calendar,
        .axm-color-panel, .axm-popover, .axm-autocomplete-menu {
          transition-duration: 1ms !important;
        }
      }
    `
    document.head.appendChild(style)
  }

  /* ─── SVG Icons (inline, no deps) ───────────────────────────────── */

  const ICONS = {
    chevronDown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>',
    chevronLeft: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',
    chevronRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
  }

  function icon(name, cls) {
    const span = document.createElement('span')
    span.innerHTML = ICONS[name] || ''
    const svg = span.firstElementChild
    if (svg && cls) svg.setAttribute('class', cls)
    return svg || span
  }

  /* ─── Utility: Focus trap ───────────────────────────────────────── */

  function trapFocus(container) {
    const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])'
    function getFocusable() {
      return Array.from(container.querySelectorAll(FOCUSABLE)).filter(
        el => el.offsetParent !== null
      )
    }
    function handler(e) {
      if (e.key !== 'Tab') return
      const items = getFocusable()
      if (!items.length) return
      const first = items[0], last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus()
      }
    }
    container.addEventListener('keydown', handler)
    return () => container.removeEventListener('keydown', handler)
  }

  /* ─── Utility: Animate out then remove ──────────────────────────── */

  function animateOut(overlay, cb) {
    overlay.classList.remove('axm-open')
    setTimeout(() => { overlay.remove(); if (cb) cb() }, ANIM_MS)
  }

  /* =================================================================
     1. MODAL — replaces alert(), confirm(), prompt()
     ================================================================= */

  function createModal({ title, message, input, showCancel, inputDefault }) {
    return new Promise(resolve => {
      const overlay = document.createElement('div')
      overlay.className = 'axm-overlay'
      overlay.setAttribute('role', 'dialog')
      overlay.setAttribute('aria-modal', 'true')
      if (title) overlay.setAttribute('aria-label', title)

      const modal = document.createElement('div')
      modal.className = 'axm-modal'

      if (title) {
        const h = document.createElement('h2')
        h.className = 'axm-modal-title'
        h.textContent = title
        modal.appendChild(h)
      }

      const body = document.createElement('p')
      body.className = 'axm-modal-body'
      body.textContent = message || ''
      modal.appendChild(body)

      let inputEl = null
      if (input) {
        inputEl = document.createElement('input')
        inputEl.className = 'axm-modal-input'
        inputEl.type = 'text'
        inputEl.value = inputDefault || ''
        inputEl.setAttribute('aria-label', message || 'Input')
        modal.appendChild(inputEl)
      }

      const actions = document.createElement('div')
      actions.className = 'axm-modal-actions'

      if (showCancel) {
        const cancel = document.createElement('button')
        cancel.className = 'axm-btn axm-btn-secondary'
        cancel.textContent = 'Cancel'
        cancel.onclick = () => animateOut(overlay, () => resolve(input ? null : false))
        actions.appendChild(cancel)
      }

      const ok = document.createElement('button')
      ok.className = 'axm-btn axm-btn-primary'
      ok.textContent = 'OK'
      ok.onclick = () => {
        const val = input ? (inputEl.value) : true
        animateOut(overlay, () => resolve(val))
      }
      actions.appendChild(ok)
      modal.appendChild(actions)
      overlay.appendChild(modal)
      document.body.appendChild(overlay)

      // Animate in
      requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add('axm-open')))

      // Focus
      setTimeout(() => (inputEl || ok).focus(), 50)

      // Focus trap + Escape
      const releaseTrap = trapFocus(overlay)
      function onKey(e) {
        if (e.key === 'Escape') {
          e.preventDefault()
          animateOut(overlay, () => resolve(input ? null : showCancel ? false : undefined))
          document.removeEventListener('keydown', onKey)
          releaseTrap()
        } else if (e.key === 'Enter' && input) {
          e.preventDefault()
          ok.click()
        }
      }
      document.addEventListener('keydown', onKey)
    })
  }

  function customAlert(message) {
    return createModal({ title: 'Notice', message, showCancel: false, input: false })
  }

  function customConfirm(message) {
    return createModal({ title: 'Confirm', message, showCancel: true, input: false })
  }

  function customPrompt(message, defaultValue) {
    return createModal({ title: 'Input', message, showCancel: true, input: true, inputDefault: defaultValue || '' })
  }

  /* =================================================================
     2. TOOLTIP — replaces title attribute
     ================================================================= */

  let activeTooltip = null

  function showTooltip(el) {
    if (activeTooltip) activeTooltip.remove()

    const text = el.getAttribute('data-tooltip') || el.getAttribute('title')
    if (!text) return
    // Prevent native tooltip
    if (el.hasAttribute('title')) {
      el.setAttribute('data-tooltip', text)
      el.removeAttribute('title')
    }

    const tip = document.createElement('div')
    tip.className = 'axm-tooltip axm-tooltip-top'
    tip.setAttribute('role', 'tooltip')
    tip.textContent = text
    document.body.appendChild(tip)

    const rect = el.getBoundingClientRect()
    const tipRect = tip.getBoundingClientRect()

    let top = rect.top - tipRect.height - 8
    let left = rect.left + rect.width / 2 - tipRect.width / 2

    // Flip if clipped at top
    if (top < 4) {
      top = rect.bottom + 8
      tip.classList.remove('axm-tooltip-top')
      tip.classList.add('axm-tooltip-bottom')
    }
    // Clamp to viewport
    left = Math.max(4, Math.min(left, window.innerWidth - tipRect.width - 4))

    tip.style.top = top + 'px'
    tip.style.left = left + 'px'
    requestAnimationFrame(() => tip.classList.add('axm-open'))
    activeTooltip = tip
  }

  function hideTooltip() {
    if (!activeTooltip) return
    activeTooltip.classList.remove('axm-open')
    const t = activeTooltip
    setTimeout(() => t.remove(), 180)
    activeTooltip = null
  }

  /* =================================================================
     3. CUSTOM SELECT — replaces <select>
     ================================================================= */

  function upgradeSelect(nativeSelect) {
    if (nativeSelect._axmUpgraded) return
    nativeSelect._axmUpgraded = true
    nativeSelect.style.display = 'none'

    const wrap = document.createElement('div')
    wrap.className = 'axm-select-wrap'
    wrap.style.width = nativeSelect.style.width || '100%'

    const trigger = document.createElement('button')
    trigger.className = 'axm-select-trigger'
    trigger.setAttribute('role', 'combobox')
    trigger.setAttribute('aria-haspopup', 'listbox')
    trigger.setAttribute('aria-expanded', 'false')
    trigger.type = 'button'

    const label = document.createElement('span')
    const chevron = icon('chevronDown')

    trigger.appendChild(label)
    trigger.appendChild(chevron)

    const menu = document.createElement('ul')
    menu.className = 'axm-select-menu'
    menu.setAttribute('role', 'listbox')

    let focusIdx = -1

    function buildOptions() {
      menu.innerHTML = ''
      const options = Array.from(nativeSelect.options)
      options.forEach((opt, idx) => {
        const li = document.createElement('li')
        li.className = 'axm-select-option'
        li.setAttribute('role', 'option')
        li.setAttribute('aria-selected', opt.selected ? 'true' : 'false')
        li.textContent = opt.textContent
        if (opt.selected) li.classList.add('axm-selected')
        li.addEventListener('click', e => {
          e.stopPropagation()
          nativeSelect.selectedIndex = idx
          nativeSelect.dispatchEvent(new Event('change', { bubbles: true }))
          updateLabel()
          close()
        })
        menu.appendChild(li)
      })
    }

    function updateLabel() {
      const sel = nativeSelect.options[nativeSelect.selectedIndex]
      if (sel && sel.value) {
        label.textContent = sel.textContent
        label.classList.remove('axm-select-placeholder')
      } else {
        label.textContent = nativeSelect.getAttribute('placeholder') || 'Select...'
        label.classList.add('axm-select-placeholder')
      }
      // Update selected state
      Array.from(menu.children).forEach((li, i) => {
        li.classList.toggle('axm-selected', i === nativeSelect.selectedIndex)
        li.setAttribute('aria-selected', i === nativeSelect.selectedIndex ? 'true' : 'false')
      })
    }

    function open() {
      buildOptions()
      trigger.classList.add('axm-active')
      trigger.setAttribute('aria-expanded', 'true')
      menu.classList.add('axm-open')
      focusIdx = nativeSelect.selectedIndex
      highlightIdx(focusIdx)
    }

    function close() {
      trigger.classList.remove('axm-active')
      trigger.setAttribute('aria-expanded', 'false')
      menu.classList.remove('axm-open')
      focusIdx = -1
    }

    function highlightIdx(idx) {
      Array.from(menu.children).forEach((li, i) => li.classList.toggle('axm-focused', i === idx))
      if (menu.children[idx]) menu.children[idx].scrollIntoView({ block: 'nearest' })
    }

    trigger.addEventListener('click', () => menu.classList.contains('axm-open') ? close() : open())
    trigger.addEventListener('keydown', e => {
      const isOpen = menu.classList.contains('axm-open')
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        if (!isOpen) { open(); return }
        focusIdx = Math.min(focusIdx + 1, nativeSelect.options.length - 1)
        highlightIdx(focusIdx)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        if (!isOpen) { open(); return }
        focusIdx = Math.max(focusIdx - 1, 0)
        highlightIdx(focusIdx)
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        if (isOpen && focusIdx >= 0) {
          nativeSelect.selectedIndex = focusIdx
          nativeSelect.dispatchEvent(new Event('change', { bubbles: true }))
          updateLabel()
          close()
        } else if (!isOpen) {
          open()
        }
      } else if (e.key === 'Escape') {
        close()
      }
    })

    document.addEventListener('mousedown', e => {
      if (!wrap.contains(e.target)) close()
    })

    wrap.appendChild(trigger)
    wrap.appendChild(menu)
    nativeSelect.parentNode.insertBefore(wrap, nativeSelect)
    wrap.appendChild(nativeSelect)

    buildOptions()
    updateLabel()

    // Sync on programmatic changes
    new MutationObserver(() => { buildOptions(); updateLabel() })
      .observe(nativeSelect, { childList: true, attributes: true, subtree: true })
  }

  /* =================================================================
     4. AUTOCOMPLETE — replaces <datalist>
     ================================================================= */

  function upgradeDatalist(input) {
    if (input._axmUpgraded) return
    input._axmUpgraded = true

    const listId = input.getAttribute('list')
    const datalist = listId ? document.getElementById(listId) : null
    if (!datalist) return

    input.removeAttribute('list')
    const options = Array.from(datalist.querySelectorAll('option')).map(o => o.value || o.textContent)
    datalist.remove()

    const wrap = document.createElement('div')
    wrap.className = 'axm-autocomplete-wrap'
    wrap.style.width = input.style.width || '100%'
    input.parentNode.insertBefore(wrap, input)
    wrap.appendChild(input)
    input.classList.add('axm-autocomplete-input')
    input.setAttribute('role', 'combobox')
    input.setAttribute('aria-autocomplete', 'list')
    input.setAttribute('aria-expanded', 'false')

    const menu = document.createElement('ul')
    menu.className = 'axm-autocomplete-menu'
    menu.setAttribute('role', 'listbox')
    wrap.appendChild(menu)

    let focusIdx = -1

    function render(query) {
      menu.innerHTML = ''
      const q = (query || '').toLowerCase()
      const matches = q ? options.filter(o => o.toLowerCase().includes(q)) : options
      if (!matches.length) { close(); return }

      matches.forEach((opt, idx) => {
        const li = document.createElement('li')
        li.className = 'axm-autocomplete-item'
        li.setAttribute('role', 'option')
        // Highlight match
        if (q) {
          const start = opt.toLowerCase().indexOf(q)
          li.innerHTML = opt.slice(0, start) + '<mark>' + opt.slice(start, start + q.length) + '</mark>' + opt.slice(start + q.length)
        } else {
          li.textContent = opt
        }
        li.addEventListener('click', () => {
          input.value = opt
          input.dispatchEvent(new Event('input', { bubbles: true }))
          input.dispatchEvent(new Event('change', { bubbles: true }))
          close()
        })
        menu.appendChild(li)
      })

      menu.classList.add('axm-open')
      input.setAttribute('aria-expanded', 'true')
      focusIdx = -1
    }

    function close() {
      menu.classList.remove('axm-open')
      input.setAttribute('aria-expanded', 'false')
      focusIdx = -1
    }

    function highlightIdx(idx) {
      Array.from(menu.children).forEach((li, i) => li.classList.toggle('axm-focused', i === idx))
      if (menu.children[idx]) menu.children[idx].scrollIntoView({ block: 'nearest' })
    }

    input.addEventListener('input', () => render(input.value))
    input.addEventListener('focus', () => { if (input.value) render(input.value) })
    input.addEventListener('keydown', e => {
      const items = menu.children
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        focusIdx = Math.min(focusIdx + 1, items.length - 1)
        highlightIdx(focusIdx)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        focusIdx = Math.max(focusIdx - 1, 0)
        highlightIdx(focusIdx)
      } else if (e.key === 'Enter' && focusIdx >= 0) {
        e.preventDefault()
        items[focusIdx]?.click()
      } else if (e.key === 'Escape') {
        close()
      }
    })

    document.addEventListener('mousedown', e => {
      if (!wrap.contains(e.target)) close()
    })
  }

  /* =================================================================
     5. CONTEXT MENU
     ================================================================= */

  let activeContext = null
  const defaultContextItems = [
    { label: 'Back', shortcut: 'Alt+\u2190', action: () => history.back() },
    { label: 'Forward', shortcut: 'Alt+\u2192', action: () => history.forward() },
    { type: 'separator' },
    { label: 'Reload', shortcut: 'Ctrl+R', action: () => location.reload() },
    { type: 'separator' },
    { label: 'Copy Link', action: () => navigator.clipboard?.writeText(location.href) },
  ]

  function showContextMenu(x, y, items) {
    closeContextMenu()
    const menu = document.createElement('div')
    menu.className = 'axm-context'
    menu.setAttribute('role', 'menu')

    let focusIdx = -1
    const actionItems = []

    items.forEach(item => {
      if (item.type === 'separator') {
        const sep = document.createElement('div')
        sep.className = 'axm-context-sep'
        sep.setAttribute('role', 'separator')
        menu.appendChild(sep)
        return
      }
      const btn = document.createElement('button')
      btn.className = 'axm-context-item'
      btn.setAttribute('role', 'menuitem')
      btn.type = 'button'

      const labelSpan = document.createElement('span')
      labelSpan.textContent = item.label
      btn.appendChild(labelSpan)

      if (item.shortcut) {
        const kbd = document.createElement('kbd')
        kbd.textContent = item.shortcut
        btn.appendChild(kbd)
      }

      btn.addEventListener('click', () => {
        closeContextMenu()
        if (item.action) item.action()
      })
      menu.appendChild(btn)
      actionItems.push(btn)
    })

    document.body.appendChild(menu)

    // Position: keep in viewport
    const rect = menu.getBoundingClientRect()
    const vw = window.innerWidth, vh = window.innerHeight
    if (x + rect.width > vw - 8) x = vw - rect.width - 8
    if (y + rect.height > vh - 8) y = vh - rect.height - 8
    menu.style.left = Math.max(4, x) + 'px'
    menu.style.top = Math.max(4, y) + 'px'

    requestAnimationFrame(() => menu.classList.add('axm-open'))
    activeContext = menu

    function highlightIdx(idx) {
      actionItems.forEach((btn, i) => btn.classList.toggle('axm-focused', i === idx))
      if (actionItems[idx]) actionItems[idx].focus()
    }

    menu.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        focusIdx = Math.min(focusIdx + 1, actionItems.length - 1)
        highlightIdx(focusIdx)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        focusIdx = Math.max(focusIdx - 1, 0)
        highlightIdx(focusIdx)
      } else if (e.key === 'Escape') {
        closeContextMenu()
      }
    })

    setTimeout(() => actionItems[0]?.focus(), 60)
  }

  function closeContextMenu() {
    if (!activeContext) return
    activeContext.classList.remove('axm-open')
    const m = activeContext
    setTimeout(() => m.remove(), 160)
    activeContext = null
  }

  /* =================================================================
     6. FILE PICKER — replaces <input type="file">
     ================================================================= */

  function upgradeFileInput(nativeInput) {
    if (nativeInput._axmUpgraded) return
    nativeInput._axmUpgraded = true
    nativeInput.style.display = 'none'

    const zone = document.createElement('div')
    zone.className = 'axm-filepicker'
    zone.setAttribute('role', 'button')
    zone.setAttribute('tabindex', '0')
    zone.setAttribute('aria-label', 'Choose files or drag and drop')

    const iconEl = icon('upload', 'axm-filepicker-icon')
    zone.appendChild(iconEl)

    const text = document.createElement('p')
    text.className = 'axm-filepicker-text'
    text.innerHTML = '<strong>Click to upload</strong> or drag and drop'
    zone.appendChild(text)

    const filesContainer = document.createElement('div')
    filesContainer.className = 'axm-filepicker-files'
    zone.appendChild(filesContainer)

    nativeInput.parentNode.insertBefore(zone, nativeInput)
    zone.appendChild(nativeInput)

    function showFiles() {
      filesContainer.innerHTML = ''
      if (!nativeInput.files || nativeInput.files.length === 0) return
      Array.from(nativeInput.files).forEach(file => {
        const tag = document.createElement('span')
        tag.className = 'axm-filepicker-tag'
        tag.textContent = file.name
        filesContainer.appendChild(tag)
      })
    }

    zone.addEventListener('click', e => {
      if (e.target === nativeInput) return
      nativeInput.click()
    })
    zone.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); nativeInput.click() }
    })

    nativeInput.addEventListener('change', showFiles)

    zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('axm-dragover') })
    zone.addEventListener('dragleave', () => zone.classList.remove('axm-dragover'))
    zone.addEventListener('drop', e => {
      e.preventDefault()
      zone.classList.remove('axm-dragover')
      if (e.dataTransfer?.files?.length) {
        nativeInput.files = e.dataTransfer.files
        nativeInput.dispatchEvent(new Event('change', { bubbles: true }))
      }
    })
  }

  /* =================================================================
     7. DATE PICKER — replaces <input type="date">
     ================================================================= */

  const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const DOW = ['Su','Mo','Tu','We','Th','Fr','Sa']

  function upgradeDateInput(nativeInput) {
    if (nativeInput._axmUpgraded) return
    nativeInput._axmUpgraded = true

    const wrap = document.createElement('div')
    wrap.className = 'axm-datepicker-wrap'
    wrap.style.width = nativeInput.style.width || '100%'
    nativeInput.parentNode.insertBefore(wrap, nativeInput)

    // Replace native with text input
    const display = document.createElement('input')
    display.className = 'axm-datepicker-input'
    display.type = 'text'
    display.readOnly = true
    display.placeholder = nativeInput.placeholder || 'Pick a date'
    if (nativeInput.id) display.id = nativeInput.id + '-display'
    if (nativeInput.required) display.required = true

    const calIcon = icon('calendar', 'axm-datepicker-icon')
    nativeInput.type = 'hidden'
    wrap.appendChild(display)
    wrap.appendChild(calIcon)
    wrap.appendChild(nativeInput)

    const cal = document.createElement('div')
    cal.className = 'axm-calendar'
    wrap.appendChild(cal)

    let viewYear, viewMonth, selectedDate = null

    if (nativeInput.value) {
      const d = new Date(nativeInput.value + 'T00:00:00')
      if (!isNaN(d)) {
        selectedDate = d
        viewYear = d.getFullYear()
        viewMonth = d.getMonth()
        display.value = formatDate(d)
      }
    }
    if (!viewYear) {
      const now = new Date()
      viewYear = now.getFullYear()
      viewMonth = now.getMonth()
    }

    function formatDate(d) {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }
    function isoDate(d) {
      return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
    }
    function sameDay(a, b) {
      return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
    }

    function renderCalendar() {
      cal.innerHTML = ''
      const header = document.createElement('div')
      header.className = 'axm-cal-header'

      const prev = document.createElement('button')
      prev.type = 'button'; prev.className = 'axm-cal-nav'
      prev.appendChild(icon('chevronLeft'))
      prev.onclick = () => { viewMonth--; if (viewMonth < 0) { viewMonth = 11; viewYear-- } renderCalendar() }

      const title = document.createElement('span')
      title.textContent = MONTH_NAMES[viewMonth] + ' ' + viewYear

      const next = document.createElement('button')
      next.type = 'button'; next.className = 'axm-cal-nav'
      next.appendChild(icon('chevronRight'))
      next.onclick = () => { viewMonth++; if (viewMonth > 11) { viewMonth = 0; viewYear++ } renderCalendar() }

      header.appendChild(prev)
      header.appendChild(title)
      header.appendChild(next)
      cal.appendChild(header)

      const grid = document.createElement('div')
      grid.className = 'axm-cal-grid'
      DOW.forEach(d => {
        const dow = document.createElement('div')
        dow.className = 'axm-cal-dow'; dow.textContent = d
        grid.appendChild(dow)
      })

      const firstDay = new Date(viewYear, viewMonth, 1).getDay()
      const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
      const today = new Date()

      // Fill leading blanks from previous month
      const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate()
      for (let i = firstDay - 1; i >= 0; i--) {
        const btn = document.createElement('button')
        btn.type = 'button'; btn.className = 'axm-cal-day axm-outside'
        btn.textContent = prevMonthDays - i
        grid.appendChild(btn)
      }

      for (let day = 1; day <= daysInMonth; day++) {
        const d = new Date(viewYear, viewMonth, day)
        const btn = document.createElement('button')
        btn.type = 'button'; btn.className = 'axm-cal-day'
        btn.textContent = day
        if (sameDay(d, today)) btn.classList.add('axm-today')
        if (sameDay(d, selectedDate)) btn.classList.add('axm-selected')
        btn.onclick = () => {
          selectedDate = d
          nativeInput.value = isoDate(d)
          display.value = formatDate(d)
          nativeInput.dispatchEvent(new Event('change', { bubbles: true }))
          closeCal()
        }
        grid.appendChild(btn)
      }

      // Trailing days
      const total = firstDay + daysInMonth
      const remaining = (7 - (total % 7)) % 7
      for (let i = 1; i <= remaining; i++) {
        const btn = document.createElement('button')
        btn.type = 'button'; btn.className = 'axm-cal-day axm-outside'
        btn.textContent = i
        grid.appendChild(btn)
      }

      cal.appendChild(grid)
    }

    function openCal() {
      renderCalendar()
      cal.classList.add('axm-open')
    }
    function closeCal() {
      cal.classList.remove('axm-open')
    }

    display.addEventListener('click', () => cal.classList.contains('axm-open') ? closeCal() : openCal())
    display.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openCal() }
      if (e.key === 'Escape') closeCal()
    })
    document.addEventListener('mousedown', e => {
      if (!wrap.contains(e.target)) closeCal()
    })
  }

  /* =================================================================
     8. COLOR PICKER — replaces <input type="color">
     ================================================================= */

  function upgradeColorInput(nativeInput) {
    if (nativeInput._axmUpgraded) return
    nativeInput._axmUpgraded = true
    nativeInput.type = 'hidden'

    const wrap = document.createElement('div')
    wrap.className = 'axm-colorpicker-wrap'
    nativeInput.parentNode.insertBefore(wrap, nativeInput)
    wrap.appendChild(nativeInput)

    const swatch = document.createElement('button')
    swatch.type = 'button'; swatch.className = 'axm-color-swatch'
    swatch.style.background = nativeInput.value || '#000000'
    swatch.setAttribute('aria-label', 'Pick color')

    const hexInput = document.createElement('input')
    hexInput.className = 'axm-color-input'
    hexInput.value = nativeInput.value || '#000000'
    hexInput.maxLength = 7

    wrap.appendChild(swatch)
    wrap.appendChild(hexInput)

    // Panel
    const panel = document.createElement('div')
    panel.className = 'axm-color-panel'
    wrap.appendChild(panel)

    let currentHue = 0, currentSat = 100, currentLight = 50
    // Parse initial color
    const initRgb = hexToRgb(nativeInput.value || '#000000')
    if (initRgb) {
      const hsl = rgbToHsl(initRgb.r, initRgb.g, initRgb.b)
      currentHue = hsl.h; currentSat = hsl.s; currentLight = hsl.l
    }

    // Saturation/Lightness area
    const area = document.createElement('div')
    area.className = 'axm-color-area'
    const areaThumb = document.createElement('div')
    areaThumb.className = 'axm-color-area-thumb'
    area.appendChild(areaThumb)
    panel.appendChild(area)

    function updateAreaBg() {
      area.style.background = `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${currentHue}, 100%, 50%))`
    }

    function updateThumb() {
      const x = currentSat
      const y = 100 - currentLight * (100 / (100 - currentSat / 2 || 1))
      // Simpler: map sat to X%, brightness to Y%
      areaThumb.style.left = currentSat + '%'
      areaThumb.style.top = (100 - currentLight) + '%'
    }

    // Hue slider
    const hueSlider = document.createElement('input')
    hueSlider.type = 'range'; hueSlider.min = 0; hueSlider.max = 360
    hueSlider.value = currentHue
    hueSlider.className = 'axm-color-hue'
    panel.appendChild(hueSlider)

    // Preview row
    const previewRow = document.createElement('div')
    previewRow.className = 'axm-color-preview-row'
    const previewSwatch = document.createElement('div')
    previewSwatch.className = 'axm-color-preview-swatch'
    const previewHex = document.createElement('input')
    previewHex.className = 'axm-color-input'
    previewHex.style.flex = '1'
    previewHex.maxLength = 7
    previewRow.appendChild(previewSwatch)
    previewRow.appendChild(previewHex)
    panel.appendChild(previewRow)

    function syncAll(hex) {
      swatch.style.background = hex
      hexInput.value = hex
      nativeInput.value = hex
      previewSwatch.style.background = hex
      previewHex.value = hex
      nativeInput.dispatchEvent(new Event('input', { bubbles: true }))
      nativeInput.dispatchEvent(new Event('change', { bubbles: true }))
    }

    function hslToHex(h, s, l) {
      const rgb = hslToRgb(h, s, l)
      return '#' + [rgb.r, rgb.g, rgb.b].map(c => c.toString(16).padStart(2, '0')).join('')
    }

    function recalc() {
      const hex = hslToHex(currentHue, currentSat, currentLight)
      syncAll(hex)
      updateAreaBg()
      updateThumb()
    }

    // Area interaction
    function areaPointer(e) {
      const rect = area.getBoundingClientRect()
      currentSat = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
      currentLight = Math.max(0, Math.min(100, (1 - (e.clientY - rect.top) / rect.height) * 100))
      recalc()
    }
    area.addEventListener('pointerdown', e => {
      areaPointer(e)
      function onMove(ev) { areaPointer(ev) }
      function onUp() { document.removeEventListener('pointermove', onMove); document.removeEventListener('pointerup', onUp) }
      document.addEventListener('pointermove', onMove)
      document.addEventListener('pointerup', onUp)
    })

    hueSlider.addEventListener('input', () => {
      currentHue = parseInt(hueSlider.value, 10)
      recalc()
    })

    // Hex input editing
    hexInput.addEventListener('change', () => {
      const hex = hexInput.value.startsWith('#') ? hexInput.value : '#' + hexInput.value
      if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
        const rgb = hexToRgb(hex)
        if (rgb) {
          const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
          currentHue = hsl.h; currentSat = hsl.s; currentLight = hsl.l
          hueSlider.value = currentHue
          recalc()
        }
      }
    })
    previewHex.addEventListener('change', () => {
      hexInput.value = previewHex.value
      hexInput.dispatchEvent(new Event('change'))
    })

    function openPanel() { updateAreaBg(); updateThumb(); panel.classList.add('axm-open') }
    function closePanel() { panel.classList.remove('axm-open') }

    swatch.addEventListener('click', () => panel.classList.contains('axm-open') ? closePanel() : openPanel())
    document.addEventListener('mousedown', e => {
      if (!wrap.contains(e.target)) closePanel()
    })

    recalc()
  }

  /* ─── Color math helpers ────────────────────────────────────────── */

  function hexToRgb(hex) {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : null
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255
    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    let h = 0, s = 0, l = (max + min) / 2
    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
        case g: h = ((b - r) / d + 2) / 6; break
        case b: h = ((r - g) / d + 4) / 6; break
      }
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
  }

  function hslToRgb(h, s, l) {
    h /= 360; s /= 100; l /= 100
    let r, g, b
    if (s === 0) {
      r = g = b = l
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1; if (t > 1) t -= 1
        if (t < 1/6) return p + (q - p) * 6 * t
        if (t < 1/2) return q
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
        return p
      }
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q
      r = hue2rgb(p, q, h + 1/3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1/3)
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) }
  }

  /* =================================================================
     9. POPOVER — replaces [popover] attribute
     ================================================================= */

  function upgradePopover(el) {
    if (el._axmUpgraded) return
    el._axmUpgraded = true

    el.removeAttribute('popover')
    el.classList.add('axm-popover')
    el.style.display = 'none'

    // Find trigger: [popovertarget] pointing to this element's ID
    const trigger = el.id ? document.querySelector(`[popovertarget="${el.id}"]`) : null
    if (!trigger) return

    trigger.removeAttribute('popovertarget')

    function open() {
      el.style.display = ''
      const rect = trigger.getBoundingClientRect()
      el.style.position = 'fixed'
      el.style.top = (rect.bottom + 8) + 'px'
      el.style.left = rect.left + 'px'
      requestAnimationFrame(() => el.classList.add('axm-open'))
    }

    function close() {
      el.classList.remove('axm-open')
      setTimeout(() => { el.style.display = 'none' }, 180)
    }

    trigger.addEventListener('click', () => {
      el.classList.contains('axm-open') ? close() : open()
    })

    document.addEventListener('mousedown', e => {
      if (!el.contains(e.target) && !trigger.contains(e.target)) close()
    })

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && el.classList.contains('axm-open')) close()
    })
  }

  /* =================================================================
     INITIALISER — Auto-patches everything
     ================================================================= */

  function initCustomUI(options = {}) {
    injectStyles()

    /* ── Patch globals ──────────────────────────────────────────────── */
    if (options.patchGlobals !== false) {
      root.alert = customAlert
      root.confirm = customConfirm
      root.prompt = customPrompt
    }

    /* ── Tooltip: title attributes + [data-tooltip] ─────────────── */
    document.addEventListener('mouseenter', e => {
      const el = e.target.closest?.('[data-tooltip], [title]')
      if (el) showTooltip(el)
    }, true)
    document.addEventListener('mouseleave', e => {
      const el = e.target.closest?.('[data-tooltip], [title]')
      if (el) hideTooltip()
    }, true)
    document.addEventListener('focusin', e => {
      const el = e.target.closest?.('[data-tooltip], [title]')
      if (el) showTooltip(el)
    }, true)
    document.addEventListener('focusout', hideTooltip, true)

    /* ── Context menu (public pages only, not admin) ─────────────── */
    if (!options.skipContextMenu && !location.pathname.startsWith('/admin')) {
      document.addEventListener('contextmenu', e => {
        // Let inputs/textareas/contenteditable use native context
        const tag = e.target.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return

        e.preventDefault()
        const items = options.contextMenuItems || defaultContextItems
        showContextMenu(e.clientX, e.clientY, items)
      })
      document.addEventListener('mousedown', e => {
        if (activeContext && !activeContext.contains(e.target)) closeContextMenu()
      })
    }

    /* ── Upgrade existing elements ──────────────────────────────────── */
    function upgradeAll() {
      // Admin forms are React-controlled and CSS-themed. Upgrading their native
      // <select>/<input type=file> mutates React-managed DOM, which causes
      // hydration mismatches and a double file-chooser. Leave admin native.
      if (location.pathname.startsWith('/admin')) return
      // Selects (skip already-styled ones from React components)
      document.querySelectorAll('select:not(.axm-skip):not([data-axm-skip])').forEach(upgradeSelect)
      // Datalists
      document.querySelectorAll('input[list]').forEach(upgradeDatalist)
      // File inputs
      document.querySelectorAll('input[type="file"]:not(.axm-skip)').forEach(upgradeFileInput)
      // Date inputs
      document.querySelectorAll('input[type="date"]:not(.axm-skip)').forEach(upgradeDateInput)
      // Color inputs
      document.querySelectorAll('input[type="color"]:not(.axm-skip)').forEach(upgradeColorInput)
      // Popovers
      document.querySelectorAll('[popover]').forEach(upgradePopover)
    }

    upgradeAll()

    // Watch for dynamically added elements (React renders, SPA nav)
    const observer = new MutationObserver(mutations => {
      let needsUpgrade = false
      for (const m of mutations) {
        if (m.addedNodes.length) { needsUpgrade = true; break }
      }
      if (needsUpgrade) upgradeAll()
    })
    observer.observe(document.body, { childList: true, subtree: true })

    /* ── Return the public API ──────────────────────────────────── */
    return {
      alert: customAlert,
      confirm: customConfirm,
      prompt: customPrompt,
      showTooltip,
      hideTooltip,
      showContextMenu,
      closeContextMenu,
      upgradeSelect,
      upgradeDatalist,
      upgradeFileInput,
      upgradeDateInput,
      upgradeColorInput,
      upgradePopover,
      upgradeAll,
      destroy: () => observer.disconnect(),
    }
  }

  /* ─── Export ────────────────────────────────────────────────────── */

  // CommonJS / ESM / global
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initCustomUI, customAlert, customConfirm, customPrompt }
  }
  root.AxiomUI = { initCustomUI, customAlert, customConfirm, customPrompt }

  // Auto-init when loaded via <script> (defer ensures DOM is ready)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initCustomUI())
  } else {
    initCustomUI()
  }

})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this)
