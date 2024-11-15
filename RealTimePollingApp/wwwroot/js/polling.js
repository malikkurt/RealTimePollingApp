// SignalR bağlantısını kur
const connection = new signalR.HubConnectionBuilder()
    .withUrl(`${window.location.protocol}//${window.location.hostname}:7048/pollHub`) // Dinamik URL
    .build();

const apiUrl = `${window.location.protocol}//${window.location.hostname}:7048/api`;

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
    const response = await fetch(`${apiUrl}/poll`);
    const polls = await response.json();

    const pollListContainer = document.getElementById("pollList");
    pollListContainer.innerHTML = ""; // Mevcut anketleri temizle

    polls.forEach(poll => {
        const pollItem = document.createElement("li");
        pollItem.textContent = poll.title;
        pollItem.onclick = () => loadPoll(poll.id);
        pollListContainer.appendChild(pollItem);
    });
}

// Belirli bir anketin bilgilerini yükle
async function loadPoll(pollId) {
    const response = await fetch(`${apiUrl}/poll/${pollId}`);
    const poll = await response.json();

    document.getElementById("newPollContainer").style.display = "none"; // Yeni anket formunu gizle
    document.getElementById("pollListContainer").style.display = "block"; // Sidebar'ı görünür tut
    document.getElementById("pollContainer").style.display = "block"; // Anket konteynerini göster

    document.getElementById("pollTitle").innerText = poll.title;
    document.getElementById("pollTitle").setAttribute("data-poll-id", poll.id); // Poll ID'yi sakla
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

    // Oy Ver butonuna tıklandığında oy kullanma işlemi
    const voteButton = document.querySelector("#pollContainer button");
    voteButton.onclick = () => castVote(pollId);

    // Sonuçları gizle
    document.getElementById("results").style.display = "none"; // Sonuçları başlangıçta gizle
}


// Sayfa yüklendiğinde tüm anketleri listele
loadPolls();

// Oy verme işlemi
async function castVote(pollId) {
    const selectedOptionElement = document.querySelector('input[name="pollOption"]:checked');
    if (!selectedOptionElement) {
        alert("Lütfen bir seçenek belirleyin.");
        return; // Eğer seçenek seçilmediyse işlemi durdur
    }

    const selectedOption = selectedOptionElement.value;

    // Oy gönderme isteği
    const response = await fetch(`${apiUrl}/poll/${pollId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedOption)
    });

    if (response.ok) {
        alert("Oy kullanıldı!");

        // Sonuçları göster
        document.getElementById("results").style.display = "block";
        getPollResults(pollId); // Sonuçları yükle
    } else {
        alert("Oy kullanılırken bir hata oluştu.");
    }
}


// SignalR ile güncel sonuçları dinleme
connection.on("ReceiveResults", (pollId, results) => {
    const resultsContainer = document.getElementById("results");
    resultsContainer.innerHTML = ""; // Önceki sonuçları temizle

    updateResults(results);
});

// Anketin sonuçlarını al
async function getPollResults(pollId) {
    const response = await fetch(`https://localhost:7048/api/poll/${pollId}/results`);
    const results = await response.json();

    const resultsContainer = document.getElementById("results");
    resultsContainer.innerHTML = ""; // Önceki sonuçları temizle

    updateResults(results);
}

// Sonuçları alıp, % hesaplayarak güncelleyen fonksiyon
function updateResults(results) {
    const totalVotes = results.reduce((total, result) => total + result.count, 0);

    results.forEach(result => {
        const percentage = (result.count / totalVotes) * 100;

        // Yeni bir sonuç öğesi oluştur
        const resultItem = document.createElement('div');
        resultItem.classList.add('result-item');

        // Sonuç metnini ekle
        const resultText = document.createElement('div');
        resultText.classList.add('result-text');
        const optionText = document.createElement('span');
        optionText.classList.add('option-text');
        optionText.textContent = result.option;

        const voteCount = document.createElement('span');
        voteCount.classList.add('vote-count');
        voteCount.textContent = `${result.count} Oy`;

        resultText.appendChild(optionText);
        resultText.appendChild(voteCount);

        // Yüzdelik çemberi ekle
        const resultCircle = document.createElement('div');
        resultCircle.classList.add('result-circle');
        resultCircle.style.setProperty('--percentage', percentage);

        const percentageText = document.createElement('span');
        percentageText.classList.add('percentage-text');
        percentageText.textContent = `${Math.round(percentage)}%`;

        resultCircle.appendChild(percentageText);

        // Sonuç öğesini tamamla
        resultItem.appendChild(resultText);
        resultItem.appendChild(resultCircle);

        // Sonucu ekrana yerleştir
        document.getElementById('results').appendChild(resultItem);
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
    document.getElementById("newPollContainer").style.display = "none";  // Yeni anket formunu gizle
}

// Yeni seçenek ekleme
function addOption() {
    const container = document.getElementById("pollOptionsContainer");
    const newOptionInput = document.createElement("input");
    newOptionInput.type = "text";
    newOptionInput.placeholder = `Seçenek ${container.children.length + 1}`;
    container.appendChild(newOptionInput);
}

// Delete Poll function
async function deletePoll() {
    const pollId = document.getElementById("pollTitle").getAttribute("data-poll-id");

    if (!pollId) {
        alert("Anket ID bulunamadı.");
        return;
    }

    const confirmation = confirm("Bu anketi silmek istediğinizden emin misiniz?");
    if (confirmation) {
        const response = await fetch(`https://localhost:7048/api/poll/${pollId}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
            alert("Anket başarıyla silindi!");
            loadPolls(); // Refresh the poll list
            document.getElementById("pollContainer").style.display = "none"; // Hide the poll container
        } else {
            alert("Anket silinirken bir hata oluştu.");
        }
    }
}

// Sayfa yüklendiğinde session kontrolü yapalım
fetch("/api/user/login")
    .then(response => {
        if (!response.ok) {
            window.location.href = "login.html";  // Giriş yapılmamışsa login sayfasına yönlendir
        }
    });

async function loadUserName() {
    try {
        const response = await fetch('/api/user/get-username'); 
        if (response.ok) {
            const data = await response.json();
            document.getElementById('userName').textContent = data.userName;
        } else {
            document.getElementById('userName').textContent = "Ziyaretçi";
        }
    } catch (error) {
        console.error("Error fetching username:", error);
        document.getElementById('userName').textContent = "Hata oluştu";
    }
}

// Sayfa yüklendiğinde kullanıcı adını yükleyelim
loadUserName();
