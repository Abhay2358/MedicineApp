const BASE_URL = "https://api.fda.gov/drug/label.json";

document.getElementById("searchButton").addEventListener("click", async () => {
    const query = document.getElementById("medicineInput").value.trim();
    const errorElement = document.getElementById("error");
    const medicineInfoCard = document.getElementById("medicineInfo");

    if (!query) {
        errorElement.textContent = "Please enter a medicine name.";
        medicineInfoCard.style.display = "none";
        return;
    }

    errorElement.textContent = "";
    medicineInfoCard.style.display = "none";
    medicineInfoCard.classList.remove("fade-in");

    try {
        const response = await fetch(`${BASE_URL}?search=openfda.brand_name:${query}`);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            const results = data.results[0];
            document.getElementById("medicineName").textContent = results.openfda.brand_name?.[0] || "N/A";
            document.getElementById("genericName").textContent = results.openfda.generic_name?.[0] || "N/A";
            document.getElementById("indications").textContent = results.indications_and_usage?.[0] || "N/A";
            document.getElementById("sideEffects").textContent = results.adverse_reactions?.[0] || "N/A";
            document.getElementById("warnings").textContent = results.warnings?.[0] || "N/A";

            medicineInfoCard.style.display = "block";
            medicineInfoCard.classList.add("fade-in");

            saveSearchHistory(query);
            renderSearchHistory();
        } else {
            errorElement.textContent = "Medicine not found.";
        }
    } catch (err) {
        errorElement.textContent = "An error occurred. Please try again.";
    }
});

const saveSearchHistory = (query) => {
    let history = JSON.parse(localStorage.getItem("searchHistory")) || [];
    if (!history.includes(query)) {
        history.push(query);
        localStorage.setItem("searchHistory", JSON.stringify(history));
    }
};

const renderSearchHistory = () => {
    const historyList = document.getElementById("historyList");
    historyList.innerHTML = "";
    const history = JSON.parse(localStorage.getItem("searchHistory")) || [];
    history.forEach((item) => {
        const listItem = document.createElement("li");
        listItem.textContent = item;
        listItem.classList.add("history-item");
        listItem.addEventListener("click", () => {
            document.getElementById("medicineInput").value = item;
            document.getElementById("searchButton").click();
        });
        historyList.appendChild(listItem);
    });
};

document.getElementById("savePdfButton").addEventListener("click", () => {
    const medicineInfo = document.getElementById("medicineInfo").innerHTML;
    const style = '<style>body{font-family:sans-serif; padding:20px;}</style>';
    const win = window.open("", "", "width=800,height=600");
    win.document.write(`<html><head>${style}</head><body>${medicineInfo}</body></html>`);
    win.document.close();
    win.print();
});

document.addEventListener("DOMContentLoaded", () => {
    renderSearchHistory();
    renderFavorites();
});

document.getElementById("favoriteButton").addEventListener("click", () => {
    const medicineName = document.getElementById("medicineName").textContent;
    const genericName = document.getElementById("genericName").textContent;
    
    if (!medicineName) return;
    
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    if (!favorites.some(item => item.name === medicineName)) {
        favorites.push({ name: medicineName, genericName });
        localStorage.setItem("favorites", JSON.stringify(favorites));
        renderFavorites();
        alert(`${medicineName} added to favorites.`);
    } else {
        alert(`${medicineName} is already in favorites.`);
    }
});

const renderFavorites = () => {
    const favoritesList = document.getElementById("favoritesList");
    favoritesList.innerHTML = "";
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    favorites.forEach((item) => {
        const listItem = document.createElement("li");
        listItem.textContent = `${item.name} (${item.genericName})`;
        
        const removeButton = document.createElement("button");
        removeButton.textContent = "Remove";
        removeButton.addEventListener("click", () => {
            const updatedFavorites = favorites.filter(fav => fav.name !== item.name);
            localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
            renderFavorites();
        });
        
        listItem.appendChild(removeButton);
        favoritesList.appendChild(listItem);
    });
};

document.getElementById("shareButton").addEventListener("click", () => {
    const medicineName = document.getElementById("medicineName").textContent;
    const genericName = document.getElementById("genericName").textContent;
    const indications = document.getElementById("indications").textContent;
    const sideEffects = document.getElementById("sideEffects").textContent;
    const warnings = document.getElementById("warnings").textContent;

    if (!medicineName) {
        alert("No medicine information available to share.");
        return;
    }

    const shareData = {
        title: `Medicine Info: ${medicineName}`,
        text: `\nMedicine Name: ${medicineName}\nGeneric Name: ${genericName}\nIndications: ${indications}\nSide Effects: ${sideEffects}\nWarnings: ${warnings}`,
        url: document.location.href,
    };

    if (navigator.share) {
        navigator.share(shareData)
            .then(() => console.log("Medicine info shared successfully!"))
            .catch((err) => console.error("Error sharing medicine info:", err));
    } else {
        alert("Sharing is not supported on this device.");
    }
});
