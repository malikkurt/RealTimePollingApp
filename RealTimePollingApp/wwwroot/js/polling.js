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

    document.getElementById("newPollContainer").style.display = "none"; // Show the new poll form

    // PollContainer'ı göster
    document.getElementById("pollListContainer").style.display = "block"; // Keep sidebar visible
    const pollContainer = document.getElementById("pollContainer");
    pollContainer.style.display = "block"; // Show the poll container

    document.getElementById("pollTitle").innerText = poll.title;
    document.getElementById("pollDescription").innerText = poll.description;

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

    // Oy Ver butonuna pollId'yi ileterek castVote çağrısı yap
    const voteButton = document.querySelector("#pollContainer button");
    voteButton.onclick = () => castVote(pollId);

    // Mevcut sonuçları al ve göster
    getPollResults(pollId);
}

// Sayfa yüklendiğinde tüm anketleri listele
loadPolls();

// Oy verme işlemi
async function castVote(pollId) {
    const selectedOptionElement = document.querySelector('input[name="pollOption"]:checked');

    if (!selectedOptionElement) {
        alert("Lütfen bir seçenek belirleyin.");
        return;  // Eğer seçenek seçilmediyse işlemi durdur
    }

    const selectedOption = selectedOptionElement.value;

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

// Anketin sonuçlarını al
async function getPollResults(pollId) {
    const response = await fetch(`https://localhost:7048/api/poll/${pollId}/results`);
    const results = await response.json();

    const resultsContainer = document.getElementById("results");
    resultsContainer.innerHTML = ""; // Önceki sonuçları temizle

    results.forEach(result => {
        const resultItem = document.createElement("div");
        resultItem.innerText = `${result.option}: ${result.count} oy`;
        resultsContainer.appendChild(resultItem);
    });
}

// Show the new poll form when the button is clicked
function showNewPollForm() {
    // Hide the list and show the form in the main content area
    document.getElementById("pollListContainer").style.display = "block"; // Ensure the sidebar stays visible
    document.getElementById("newPollContainer").style.display = "block"; // Show the new poll form
    document.getElementById("pollContainer").style.display = "none"; // Hide the voting screen
}

// Add new poll (similar to previous function)
async function addPoll() {
    const title = document.getElementById("newPollTitle").value;
    const description = document.getElementById("newPollDescription").value;

    // Seçenekleri al
    const options = [];
    const optionInputs = document.querySelectorAll("#pollOptionsContainer input");

    optionInputs.forEach(input => {
        if (input.value.trim()) {  // Boş olan seçenekleri almayalım
            options.push(input.value.trim());
        }
    });

    if (!title || !description || options.length < 2) {  // En az iki seçenek olmalı
        alert("Lütfen anket başlığı, açıklama ve en az iki seçenek girin.");
        return;
    }

    const newPoll = {
        title: title,
        description: description,
        options: options  // Tüm seçenekleri gönderiyoruz
    };

    const response = await fetch("https://localhost:7048/api/poll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPoll)
    });

    if (response.ok) {
        alert("Anket başarıyla eklendi!");
        loadPolls(); // Anketler listesini güncelle
        document.getElementById("newPollContainer").style.display = "none";  // Formu gizle
    } else {
        alert("Anket eklenirken bir hata oluştu.");
    }
}


// Cancel new poll form
function cancelNewPoll() {
    document.getElementById("newPollContainer").style.display = "none"; // Hide form
    document.getElementById("pollListContainer").style.display = "block"; // Show poll list
}

// Yeni seçenek eklemek için fonksiyon
function addOption() {
    const optionsContainer = document.getElementById("pollOptionsContainer");

    // Yeni input elemanı oluştur
    const newOption = document.createElement("input");
    newOption.type = "text";
    newOption.placeholder = `Seçenek ${optionsContainer.children.length + 1}`;

    // Yeni inputu container'a ekle
    optionsContainer.appendChild(newOption);
    optionsContainer.appendChild(document.createElement("br"));
}
