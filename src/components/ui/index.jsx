"use client";
import { useEffect, useRef, useId } from "react";
import { X, ChevronDown } from "lucide-react";
export function Button({
  children,
  secondary = false,
  className = "",
  ...props
}) {
  return (
    <button
      className={`${secondary ? "secondary" : "primary"} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
export function IconButton({ label, children, ...props }) {
  return (
    <button className="icon-button" title={label} aria-label={label} {...props}>
      {children}
    </button>
  );
}
export function Select({ label, children, ...props }) {
  return (
    <label className="field">
      {label}
      <span className="select-wrap">
        <select {...props}>{children}</select>
        <ChevronDown size={14} />
      </span>
    </label>
  );
}
export function Accordion({ title, children, open = false }) {
  return (
    <details open={open}>
      <summary>
        {title}
        <ChevronDown size={15} />
      </summary>
      <div className="accordion-content">{children}</div>
    </details>
  );
}
export function Modal({ title, children, onClose, wide = false }) {
  const id = useId();
  const ref = useRef();
  useEffect(() => {
    const previous = document.activeElement;
    ref.current.showModal();
    return () => previous?.focus();
  }, []);
  return (
    <dialog
      aria-labelledby={id}
      ref={ref}
      className={wide ? "modal wide" : "modal"}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <header>
        <h2 id={id}>{title}</h2>
        <IconButton label="Close dialog" onClick={onClose}>
          <X size={20} />
        </IconButton>
      </header>
      {children}
    </dialog>
  );
}
export function EmptyState({ icon: Icon, title, children }) {
  return (
    <div className="empty">
      <Icon size={36} strokeWidth={1} />
      <h2>{title}</h2>
      <p>{children}</p>
    </div>
  );
}
export function Slider({ label, ...props }) {
  return (
    <label className="field">
      {label}
      <input type="range" {...props} />
    </label>
  );
}
export function Skeleton() {
  return <div className="skeleton" aria-label="Loading demo image" />;
}
