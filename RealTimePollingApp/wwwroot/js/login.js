document.getElementById("loginForm").addEventListener("submit", async function (event) {
    event.preventDefault(); // Formun varsayılan davranışını engelle

    const username = document.getElementById("username").value;

    if (username) {
        // Kullanıcı adını backend'e POST olarak gönder
        const response = await fetch("/api/user/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ userName: username })
        });

        const data = await response.json();
        if (response.ok) {
            // Giriş başarılıysa yönlendirme yap
            window.location.href = data.redirectUrl;
        } else {
            alert(data.message);
        }
    } else {
        alert("Lütfen bir kullanıcı adı girin.");
    }
});