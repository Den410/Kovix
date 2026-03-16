function CustomSpinner({ size = 'medium', label, color }) {
  const sizeClass = size === 'small' ? 'custom-spinner--small' : size === 'large' ? 'custom-spinner--large' : '';

  return (
    <div
      className={`custom-spinner ${sizeClass}`}
      role="status"
      aria-label={label || 'Loading'}
      style={color ? { color } : undefined}
    >
      <svg
        className="custom-spinner__svg"
        viewBox="0 0 50 50"
        aria-hidden="true"
      >
        <circle
          className="custom-spinner__ring"
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </svg>

      {label && <div className="custom-spinner__label">{label}</div>}
    </div>
  );
}

export default CustomSpinner;