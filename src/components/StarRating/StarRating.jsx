import './StarRating.css';

/** Read-only stars. */
export function StarRating({ value, size = 'md' }) {
  return (
    <span className={`stars stars--${size}`} role="img" aria-label={`${value} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={`stars__star ${n <= value ? 'stars__star--on' : ''}`} aria-hidden="true">★</span>
      ))}
    </span>
  );
}

/** Star picker built on radio buttons, so it works with keyboard and screen readers. */
export function StarInput({ value, onChange, name = 'rating' }) {
  return (
    <fieldset className="stars stars--input stars--lg">
      <legend className="visually-hidden">Calificación</legend>
      {[1, 2, 3, 4, 5].map((n) => (
        <label key={n} className={`stars__star ${n <= value ? 'stars__star--on' : ''}`}>
          <input
            type="radio"
            name={name}
            value={n}
            checked={value === n}
            onChange={() => onChange(n)}
            className="visually-hidden"
          />
          <span aria-hidden="true">★</span>
          <span className="visually-hidden">{n} {n === 1 ? 'estrella' : 'estrellas'}</span>
        </label>
      ))}
    </fieldset>
  );
}
