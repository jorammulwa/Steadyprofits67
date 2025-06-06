// script.js
let ws;
let currentSymbol = 'R_25'; // Default to Volatility 25

function connect() {
  ws = new WebSocket('wss://ws.binaryws.com/websockets/v3?app_id=1089');
  ws.onopen = () => {
    console.log('Connected to Deriv API');
    requestTicks(currentSymbol);
  };
  ws.onmessage = (msg) => {
    const data = JSON.parse(msg.data);
    if (data.tick) {
      updateAnalyzer(data.tick);
    }
  };
}

function requestTicks(symbol) {
  ws.send(JSON.stringify({
    ticks: symbol,
    subscribe: 1
  }));
}

let lastDigits = [];

function updateAnalyzer(tick) {
  const lastDigit = parseInt(tick.quote.toString().slice(-1));
  lastDigits.push(lastDigit);
  if (lastDigits.length > 1000) lastDigits.shift();

  const counts = Array(10).fill(0);
  lastDigits.forEach(d => counts[d]++);

  const canvas = document.getElementById('market-strength-chart');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = canvas.width / 10;
    const max = Math.max(...counts);
    for (let i = 0; i < 10; i++) {
      const barHeight = (counts[i] / max) * canvas.height;
      ctx.fillStyle = '#0077cc';
      ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth - 5, barHeight);
    }
  }
}

window.onload = connect;
