function StartButton({ onChange }) {
  return (
    <button className="start-button" onClick={onChange}>
      Calibrate
    </button>
  );
}

export default StartButton;
