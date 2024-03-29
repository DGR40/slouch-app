export default function Announcement({ text, onChange, hideAnnouncement }) {
  return (
    <div className={`announcement ${hideAnnouncement ? "hide" : ""}`}>
      <div className="announcement__inner">
        <p className="announcement__inner__text">{text}</p>
        <button
          className="start-button announcement__button"
          onClick={onChange}
        >
          Click here to begin!
        </button>
      </div>
    </div>
  );
}
