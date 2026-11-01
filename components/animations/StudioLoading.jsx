export default function StudioLoading() {
  return (
    <div className="studio-loading" role="status" aria-live="polite" aria-label="Loading EIU Data Challenge 2027">
      <div className="studio-loading-copy">
        <p>EIU Data Challenge <b>2027</b><span className="studio-loading-dots" aria-hidden="true"><i /><i /><i /></span></p>
        <span className="studio-loading-track" aria-hidden="true"><i /></span>
        <small>Preparing the intelligence lab</small>
      </div>
    </div>
  );
}
