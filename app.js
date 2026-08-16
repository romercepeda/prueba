(function () {
  "use strict";

  var UNITS = [
    "cero", "uno", "dos", "tres", "cuatro",
    "cinco", "seis", "siete", "ocho", "nueve"
  ];

  var TEENS = [
    "diez", "once", "doce", "trece", "catorce",
    "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve"
  ];

  var TWENTIES = [
    "veinte", "veintiuno", "veintidós", "veintitrés", "veinticuatro",
    "veinticinco", "veintiséis", "veintisiete", "veintiocho", "veintinueve"
  ];

  var TENS = {
    3: "treinta", 4: "cuarenta", 5: "cincuenta",
    6: "sesenta", 7: "setenta", 8: "ochenta", 9: "noventa"
  };

  // Números 0-9 se leen dígito a dígito (ej. 08 -> "cero ocho").
  // Números 10-99 se leen como la palabra completa (ej. 26 -> "veintiséis").
  function numberToWords(n) {
    if (n < 10) {
      return "cero " + UNITS[n];
    }
    if (n < 20) {
      return TEENS[n - 10];
    }
    if (n < 30) {
      return TWENTIES[n - 20];
    }

    var tenDigit = Math.floor(n / 10);
    var unitDigit = n % 10;
    var tenWord = TENS[tenDigit];

    return unitDigit === 0 ? tenWord : tenWord + " y " + UNITS[unitDigit];
  }

  var display = document.getElementById("number-display");
  var fullscreenBtn = document.getElementById("fullscreen-btn");
  var INTERVAL_MS = 20000;

  function showRandomNumber() {
    var n = Math.floor(Math.random() * 100); // 0-99
    display.textContent = numberToWords(n);
  }

  function isFullscreen() {
    return !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.msFullscreenElement
    );
  }

  function requestFullscreen() {
    var el = document.documentElement;
    var request =
      el.requestFullscreen ||
      el.webkitRequestFullscreen ||
      el.msRequestFullscreen;
    if (request) {
      request.call(el).catch(function () {});
    }
  }

  function updateFullscreenButton() {
    fullscreenBtn.classList.toggle("hidden", isFullscreen());
  }

  function requestWakeLock() {
    if ("wakeLock" in navigator) {
      navigator.wakeLock.request("screen").catch(function () {});
    }
  }

  fullscreenBtn.addEventListener("click", function () {
    requestFullscreen();
    requestWakeLock();
  });

  ["fullscreenchange", "webkitfullscreenchange", "msfullscreenchange"].forEach(
    function (evt) {
      document.addEventListener(evt, updateFullscreenButton);
    }
  );

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") {
      requestWakeLock();
    }
  });

  updateFullscreenButton();
  requestFullscreen();
  requestWakeLock();

  showRandomNumber();
  setInterval(showRandomNumber, INTERVAL_MS);
})();
