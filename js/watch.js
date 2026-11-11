// Apple Watch pages: show the real time in the top right corner
function showClock() {
  const now = new Date();
  const time = now.getHours() + ":" + String(now.getMinutes()).padStart(2, "0");
  document.querySelectorAll(".watch-time").forEach(function (el) {
    el.textContent = time;
  });
}

showClock();
setInterval(showClock, 10000);
