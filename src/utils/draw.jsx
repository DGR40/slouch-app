export function drawCanvas(
  keypoints,
  canvasRef,
  videoWidth,
  videoHeight,
  color
) {
  const ctx = canvasRef.current.getContext("2d");
  ctx.clearRect(0, 0, videoWidth, videoHeight);
  drawTriangle(keypoints, canvasRef, color);
  drawCircles(keypoints, canvasRef, color);
}

export function drawCircles(keypoints, canvasRef, color) {
  // Get canvas context
  const ctx = canvasRef.current.getContext("2d");
  // Draw circle
  let criticalKeyPoints = [keypoints[0], keypoints[5], keypoints[6]];

  criticalKeyPoints.forEach((point) => {
    let y = point.y;
    let x = point.x;
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = color; // Set fill color
    ctx.fill(); // Fill the circle
  });
}

export function drawTriangle(keypoints, canvasRef, color) {
  // Get canvas context
  const ctx = canvasRef.current.getContext("2d");
  // Draw triangle connecting keypoints 0, 5, and 6
  ctx.beginPath();
  ctx.moveTo(keypoints[0].x, keypoints[0].y);
  ctx.lineTo(keypoints[5].x, keypoints[5].y);
  ctx.lineTo(keypoints[6].x, keypoints[6].y);
  ctx.closePath();
  // Set stroke color
  ctx.strokeStyle = color;
  // Set line width
  ctx.lineWidth = 3;

  // Draw the triangle
  ctx.stroke();
}
