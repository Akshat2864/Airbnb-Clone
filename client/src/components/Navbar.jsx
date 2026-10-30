
export default function Navbar() {
  return (
    <header className="navbar">
      <a href="/" className="brand">
        <span className="brand-icon">⌂</span>
        <span>airbnb</span>
      </a>

      <div className="nav-center">
        <button className="nav-tab active">Stays</button>
        <button className="nav-tab">Experiences</button>
      </div>

      <div className="nav-actions">
        <button className="host-button">
          Become a host
        </button>
        <button className="profile-button" aria-label="Menu">
          ☰　●
        </button>
      </div>
    </header>
  );
}
