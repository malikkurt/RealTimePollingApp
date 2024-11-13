// SignalR bağlantısını kur
const connection = new signalR.HubConnectionBuilder()
    .withUrl("https://localhost:7048/pollHub") // SignalR hub URL
    .build();

// SignalR bağlantısını başlat
async function start() {
    try {
        await connection.start();
        console.log("SignalR bağlantısı başarılı.");
    } catch (err) {
        console.error("SignalR bağlantı hatası:", err);
        setTimeout(start, 5000);  // Hata durumunda 5 saniye sonra tekrar dene
    }
}
start();

// Tüm anketleri listeleme
async function loadPolls() {

    const response = await fetch("https://localhost:7048/api/poll"); // Backend API'den anketleri alıyoruz
    const polls = await response.json();

    const pollListContainer = document.getElementById("pollList");
    pollListContainer.innerHTML = ""; // Mevcut anketleri temizle
    


    for (let i = 0; i < polls.length; i++) {
        const poll = polls[i];
        const pollItem = document.createElement("li");
        pollItem.textContent = poll.title;
        pollItem.onclick = () => loadPoll(poll.id);
        pollListContainer.appendChild(pollItem);
    }

}

// Belirli bir anketin bilgilerini yükle
async function loadPoll(pollId) {
    const response = await fetch(`https://localhost:7048/api/poll/${pollId}`);
    const poll = await response.json();

    // PollContainer'ı göster
    document.getElementById("pollListContainer").style.display = "none";
    const pollContainer = document.getElementById("pollContainer");
    pollContainer.style.display = "block";

    document.getElementById("pollTitle").innerText = poll.title;

    const optionsContainer = document.getElementById("options");
    optionsContainer.innerHTML = ''; // Önceki seçenekleri temizle
    poll.options.forEach(option => {
        const optionElement = document.createElement("input");
        optionElement.type = "radio";
        optionElement.name = "pollOption";
        optionElement.value = option;
        optionsContainer.appendChild(optionElement);
        optionsContainer.appendChild(document.createTextNode(option));
        optionsContainer.appendChild(document.createElement("br"));
    });

    // Sonuçları dinle
    connection.on("ReceiveResults", (pollId, results) => {
        const resultsContainer = document.getElementById("results");
        resultsContainer.innerHTML = ""; // Önceki sonuçları temizle

        results.forEach(result => {
            const resultItem = document.createElement("div");
            resultItem.innerText = `${result.option}: ${result.count} oy`;
            resultsContainer.appendChild(resultItem);
        });
    });
}

// Sayfa yüklendiğinde tüm anketleri listele
loadPolls();


// Oy verme işlemi
async function castVote() {
    const selectedOptionElement = document.querySelector('input[name="pollOption"]:checked');

    if (!selectedOptionElement) {
        alert("Lütfen bir seçenek belirleyin.");
        return;  // Eğer seçenek seçilmediyse işlemi durdur
    }

    const selectedOption = selectedOptionElement.value;
    const pollId = document.getElementById("pollTitle").dataset.pollId; // pollId, yüklediğimiz anketin ID'si

    // Oy gönderme isteği
    await fetch(`https://localhost:7048/api/poll/${pollId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedOption)
    });
}



// SignalR ile güncel sonuçları dinleme
connection.on("ReceiveResults", (pollId, results) => {
    const resultsContainer = document.getElementById("results");
    resultsContainer.innerHTML = ""; // Önceki sonuçları temizle

    results.forEach(result => {
        const resultItem = document.createElement("div");
        resultItem.innerText = `${result.option}: ${result.count} oy`;
        resultsContainer.appendChild(resultItem);
    });
});

