export default function ErrorMessage({ error }) {
  if (!error) return null;
  return (
    <div className="error" role="alert">
      {error.message}
      {error.code && error.status > 0 && <span className="muted"> ({error.code})</span>}
    </div>
  );
}
