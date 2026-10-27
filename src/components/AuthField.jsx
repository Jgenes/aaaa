/**
 * Shared field for the authentication screens.
 *
 * Owns the label + icon + hint + error wiring so Login, Register and the
 * provider/OTP flows stay structurally identical and every error message is
 * announced through `aria-describedby`. `trailing` renders an interactive
 * adornment (the password visibility toggle).
 */
export default function AuthField({
  id,
  label,
  type = "text",
  icon,
  value,
  onChange,
  placeholder,
  autoComplete,
  error,
  hint,
  trailing,
  inputProps = {},
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  const controlClass = [
    "th-field__control",
    icon ? "th-field__control--icon" : "",
    trailing ? "th-field__control--trailing" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={`th-field${error ? " th-field--invalid" : ""}`}>
      <label className="th-field__label" htmlFor={id}>
        {label}
      </label>

      <div className={controlClass}>
        {icon && <i className={`bi ${icon} th-field__icon`} aria-hidden="true" />}

        <input
          id={id}
          type={type}
          className="form-control"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...inputProps}
        />

        {trailing}
      </div>

      {hint && (
        <p className="th-field__hint" id={hintId}>
          {hint}
        </p>
      )}

      {error && (
        <p className="th-field__error" id={errorId}>
          <i className="bi bi-exclamation-circle" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}
