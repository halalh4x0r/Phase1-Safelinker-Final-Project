document.addEventListener("DOMContentLoaded", () => {
  const scanButton = document.getElementById('scanButton');
  const urlInput = document.getElementById('urlInput');
  const resultDiv = document.getElementById('result');
  const historyList = document.getElementById('historyList');
  const loading = document.getElementById('loading');
  const scanOutput = document.getElementById('scanOutput');


  function renderHistory() {
    historyList.innerHTML = '';
    const history = JSON.parse(localStorage.getItem('scanHistory')) || [];
    history.forEach(url => {
      const li = document.createElement('li');
      li.textContent = url;
      historyList.appendChild(li);
    });
  }

  
  function showResult(url, status, type) {
    resultDiv.className = '';
    resultDiv.classList.add(status);
    resultDiv.textContent = `URL "${url}" is classified as: ${status.toUpperCase()} (${type})`;
  }


  function saveToHistory(url) {
    const history = JSON.parse(localStorage.getItem('scanHistory')) || [];
    if (!history.includes(url)) {
      history.push(url);
      localStorage.setItem('scanHistory', JSON.stringify(history));
    }
  }


  async function checkURLAgainstLocalDB(url) {
    try {
      const res = await fetch('https://phase1-safelinker-final-project.onrender.com/urls');
      const data = await res.json();
      const match = data.find(entry => entry.url === url);
      if (match) {
        return match.reported
          ? { status: 'danger', type: match.threatType }
          : { status: 'safe', type: 'Clean' };
      } else {
        return { status: 'safe', type: 'Unknown (not reported)' };
      }
    } catch (err) {
      console.error("Error fetching from db.json", err);
      return { status: 'error', type: 'Connection issue' };
    }
  }

  
  scanButton.addEventListener('click', async () => {
    const url = urlInput.value.trim();
    if (!url) return;

    loading.style.display = 'block';
    resultDiv.classList.add('hidden');

    const { status, type } = await checkURLAgainstLocalDB(url);

    loading.style.display = 'none';

    if (status === 'error') {
      resultDiv.textContent = 'Something went wrong while checking the URL.';
      resultDiv.className = '';
      resultDiv.classList.remove('hidden');
      return;
    }

    showResult(url, status, type);
    resultDiv.classList.remove('hidden');
    saveToHistory(url);
    renderHistory();
    urlInput.value = '';
  });

  urlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') scanButton.click();
  });

  
  document.addEventListener('dblclick', () => {
    document.body.classList.toggle('dark-mode');
  });

  renderHistory();

  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        scrollObserver.unobserve(entry.target); 
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.scroll-item, .fade-in').forEach(el => {
    scrollObserver.observe(el);
  });
});
document.getElementById("scanButton").addEventListener("click", function () {
  const loading = document.getElementById("loading");
  const result = document.getElementById("result");

  loading.style.display = "block";
  result.style.display = "none";
  result.classList.remove("safe", "unsafe");
  setTimeout(() => {
    loading.style.display = "none";
    result.style.display = "block";

    const isSafe = Math.random() > 0.5;

    if (isSafe) {
      result.textContent = "URL is safe ";
      result.classList.add("safe");
    } else {
      result.textContent = "URL is unsafe ";
      result.classList.add("unsafe");
    }
  }, 2000);
});
