import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { Link } from 'react-router-dom'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
type BadgeTone = 'success' | 'danger' | 'warning' | 'neutral' | 'info'

interface PageLayoutProps {
  children: ReactNode
  width?: 'default' | 'narrow'
}

export function PageLayout({ children, width = 'default' }: PageLayoutProps) {
  return (
    <div className={`ui-page ui-page-${width}`}>
      <style>{pageStyles}</style>
      {children}
    </div>
  )
}

interface PageHeaderProps {
  title: string
  description?: string
  eyebrow?: string
  action?: ReactNode
  backTo?: string
  backLabel?: string
  meta?: ReactNode
}

export function PageHeader({ title, description, eyebrow, action, backTo, backLabel = 'Back', meta }: PageHeaderProps) {
  return (
    <header className="ui-page-header">
      <div>
        {backTo && (
          <Link to={backTo} className="ui-back-link">
            <span aria-hidden="true">←</span>
            <span>{backLabel}</span>
          </Link>
        )}
        {eyebrow && <p className="ui-page-eyebrow">{eyebrow}</p>}
        <div className="ui-title-row">
          <h1>{title}</h1>
          {meta}
        </div>
        {description && <p className="ui-page-description">{description}</p>}
      </div>
      {action && <div className="ui-page-action">{action}</div>}
    </header>
  )
}

interface ContentCardProps {
  children: ReactNode
  className?: string
}

export function ContentCard({ children, className = '' }: ContentCardProps) {
  return <section className={`ui-card ${className}`}>{children}</section>
}

interface EmptyStateProps {
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="ui-empty-state">
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      {action && <div>{action}</div>}
    </div>
  )
}

interface ButtonLinkProps {
  to: string
  children: ReactNode
  variant?: ButtonVariant
  size?: 'sm' | 'md'
}

export function ButtonLink({ to, children, variant = 'secondary', size = 'md' }: ButtonLinkProps) {
  return <Link to={to} className={`ui-button ui-button-${variant} ui-button-${size}`}>{children}</Link>
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: ButtonVariant
  size?: 'sm' | 'md'
}

export function Button({ children, variant = 'secondary', size = 'md', className = '', ...props }: ButtonProps) {
  return <button type="button" className={`ui-button ui-button-${variant} ui-button-${size} ${className}`} {...props}>{children}</button>
}

export function StatusBadge({ children, tone = 'neutral' }: { children: ReactNode; tone?: BadgeTone }) {
  return <span className={`ui-badge ui-badge-${tone}`}>{children}</span>
}

interface FieldProps {
  label: string
  htmlFor: string
  required?: boolean
  error?: string
  children: ReactNode
}

export function Field({ label, htmlFor, required = false, error, children }: FieldProps) {
  return (
    <div className="ui-field">
      <label htmlFor={htmlFor} className="ui-label">
        {label} {required && <span aria-hidden="true">*</span>}
      </label>
      {children}
      {error && <p className="ui-field-error">{error}</p>}
    </div>
  )
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className="ui-input" {...props} />
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className="ui-input ui-textarea" {...props} />
}

export const pageStyles = `
  .ui-page { max-width: 1280px; margin: 0 auto; color: #18181b; font-size: 14px; }
  .ui-page-narrow { max-width: 720px; }
  .ui-page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; margin-bottom: 22px; }
  .ui-page-eyebrow { margin: 0 0 6px; color: #2563eb; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.03em; text-transform: uppercase; }
  .ui-title-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
  .ui-title-row h1 { margin: 0; color: #18181b; font-size: clamp(1.45rem, 2.6vw, 2rem); font-weight: 800; letter-spacing: -0.035em; }
  .ui-page-description { max-width: 640px; margin: 8px 0 0; color: #71717a; font-size: 0.9rem; line-height: 1.6; }
  .ui-page-action { flex: 0 0 auto; }
  .ui-back-link { display: inline-flex; align-items: center; gap: 7px; margin-bottom: 10px; color: #52525b; font-size: 0.84rem; font-weight: 650; text-decoration: none; }
  .ui-back-link:hover { color: #2563eb; }
  .ui-card { border: 1px solid #e4e4e7; border-radius: 16px; background: #ffffff; box-shadow: 0 1px 2px rgba(24, 24, 27, 0.04); padding: 20px; }
  .ui-card + .ui-card { margin-top: 14px; }
  .ui-empty-state { display: grid; place-items: center; gap: 8px; min-height: 220px; text-align: center; border: 1px dashed #d4d4d8; border-radius: 16px; background: #ffffff; padding: 32px; }
  .ui-empty-state h2 { margin: 0; color: #18181b; font-size: 1rem; font-weight: 800; }
  .ui-empty-state p { max-width: 420px; margin: 0; color: #71717a; font-size: 0.88rem; line-height: 1.6; }
  .ui-button { min-height: 38px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 0 14px; border-radius: 10px; border: 1px solid #d4d4d8; background: #ffffff; color: #18181b; cursor: pointer; font: inherit; font-size: 0.86rem; font-weight: 700; text-decoration: none; transition: background 160ms ease, color 160ms ease, border-color 160ms ease, opacity 160ms ease; }
  .ui-button:hover { border-color: #2563eb; color: #2563eb; }
  .ui-button:disabled { cursor: not-allowed; opacity: 0.65; }
  .ui-button-sm { min-height: 32px; padding: 0 10px; border-radius: 8px; font-size: 0.8rem; }
  .ui-button-primary { border-color: #2563eb; background: #2563eb; color: #ffffff; }
  .ui-button-primary:hover { border-color: #1d4ed8; background: #1d4ed8; color: #ffffff; }
  .ui-button-secondary { border-color: #d4d4d8; background: #ffffff; color: #18181b; }
  .ui-button-danger { border-color: #fecaca; background: #ffffff; color: #dc2626; }
  .ui-button-danger:hover { border-color: #dc2626; background: #fef2f2; color: #dc2626; }
  .ui-button-ghost { border-color: transparent; background: transparent; color: #52525b; }
  .ui-button-ghost:hover { background: #f4f4f5; color: #2563eb; }
  .ui-badge { display: inline-flex; align-items: center; justify-content: center; min-height: 24px; padding: 0 9px; border-radius: 999px; font-size: 0.72rem; font-weight: 800; white-space: nowrap; }
  .ui-badge-success { background: #ecfdf5; color: #047857; }
  .ui-badge-danger { background: #fef2f2; color: #dc2626; }
  .ui-badge-warning { background: #fffbeb; color: #b45309; }
  .ui-badge-info { background: #eff6ff; color: #2563eb; }
  .ui-badge-neutral { background: #f4f4f5; color: #52525b; }
  .ui-field { margin-bottom: 16px; }
  .ui-label { display: block; margin-bottom: 7px; color: #52525b; font-size: 0.8rem; font-weight: 700; }
  .ui-label span { color: #dc2626; }
  .ui-input { width: 100%; min-height: 42px; padding: 0 12px; border: 1px solid #d4d4d8; border-radius: 9px; background: #ffffff; color: #18181b; font: inherit; font-size: 0.88rem; outline: none; box-shadow: 0 1px 2px rgba(24, 24, 27, 0.04); transition: border-color 160ms ease, box-shadow 160ms ease; }
  .ui-input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.14); }
  .ui-textarea { min-height: 104px; padding: 10px 12px; resize: vertical; }
  .ui-field-error { margin: 6px 0 0; color: #dc2626; font-size: 0.78rem; }
  @media (max-width: 720px) { .ui-page-header { flex-direction: column; } .ui-page-action, .ui-page-action .ui-button { width: 100%; } .ui-card { padding: 18px; } }
`
