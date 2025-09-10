// main.js
console.log("JS connected");

let currentScreen = 0;
let config = null;

function trackEvent(name, data = {}) {
  console.log("📊 Event:", name, data);

  // Telegram event tracking
  fetch("https://api.telegram.org/bot7546557267:AAFiftlaR8TTXx1_s2u4AGn5wy16I81X2XA/sendMessage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: 222212349,
      text: `Event: ${name}\nData: ${JSON.stringify(data)}`,
    }),
  });

  // Firebase Analytics event tracking
  if (typeof logEvent === "function") {
  try {
    logEvent(firebaseAnalytics, name, {
      ...data,
      debug_mode: true  // принудительно
    });
  } catch (err) {
    console.warn("⚠️ Firebase logEvent error:", err);
  }
}
}

function renderScreen() {
  const app = document.getElementById("app");
  if (!config || !config.screens || !config.screens[currentScreen]) {
    console.log("⚠️ Ошибка: экран не найден", { currentScreen, config });
    app.innerHTML = "<h2>Ошибка: экран не найден</h2>";
    return;
  }

  const screen = config.screens[currentScreen];
  console.log("➡️ Показываем экран:", screen);
  app.style.backgroundImage = `url('${screen.image}')`;

  // Paywall screen with redirect
  // Paywall screen with redirect
if (screen.type === "paywall" && screen.link) {
  app.innerHTML = `
    <button id="mainButton" class="button paywall-btn">${screen.button}</button>
  `;

  document.getElementById("mainButton").addEventListener("click", () => {
    trackEvent("subscribe_button_click", { button: screen.button });
    window.location.href = screen.link;
  });
} else {
  app.innerHTML = `
    <button id="mainButton" class="button">${screen.button}</button>
  `;

  document.getElementById("mainButton").addEventListener("click", () => {
    const eventName = `button_click_${screen.type}_${currentScreen}`;
    trackEvent(eventName, { button: screen.button });
    nextScreen();
  });
}

  trackEvent(`screen_view_${screen.type}_${currentScreen}`);
}

function nextScreen() {
  currentScreen++;
  if (currentScreen < config.screens.length) {
    renderScreen();
  } else {
    const app = document.getElementById("app");
    app.innerHTML = "<h2>Спасибо!</h2>";
    trackEvent("flow_complete");
  }
}

fetch("config.json")
  .then((res) => {
    console.log("⏬ Загружаем config.json...");
    return res.json();
  })
  .then((data) => {
    console.log("✅ Конфиг загружен:", data);
    config = data;
    renderScreen();
  })
  .catch((err) => {
    console.error("❌ Ошибка загрузки конфигурации:", err);
    document.getElementById("app").innerHTML = "<h2>Ошибка загрузки конфига</h2>";
  });