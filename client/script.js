document.getElementById("fetchUrls").addEventListener("click", async () => {
	const keyword = document.getElementById("keywordInput").value;

	try {
		const response = await fetch("http://localhost:3000/get-urls", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ keyword }),
		});
		const data = await response.json();

		const urlList = document.getElementById("urlList");
		urlList.innerHTML = "";

		data.urls.forEach((url, index) => {
			const urlElement = document.createElement("button");
			urlElement.classList.add("btn", "btn-link");
			urlElement.textContent = url;
			urlElement.addEventListener("click", () => downloadContent(url));
			urlList.appendChild(urlElement);
		});
	} catch (error) {
		console.error("Error fetching URLs:", error);
	}
});

function downloadContent(url) {
	const progressBar = document.getElementById("progressBar");
	const contentFrame = document.getElementById("content");

	const ws = new WebSocket("ws://localhost:3000");

	ws.onopen = () => {
		ws.send(JSON.stringify({ url }));
	};

	ws.onmessage = (event) => {
		const data = JSON.parse(event.data);

		if (data.progress !== undefined) {
			progressBar.style.width = data.progress + "%";
			progressBar.textContent = data.progress + "%";
		}

		if (data.content) {
			const blob = new Blob([data.content], { type: "text/html" });
			const url = URL.createObjectURL(blob);
			contentFrame.src = url;
			saveContent(url, data.content);
			updateSavedContentList();
		}
	};

	ws.onerror = (error) => {
		console.error("WebSocket error:", error);
	};

	ws.onclose = () => {
		console.log("WebSocket connection closed");
	};
}
function saveContent(url, content) {
	const savedContents =
		JSON.parse(localStorage.getItem("savedContents")) || [];
	savedContents.push({ url, content });
	localStorage.setItem("savedContents", JSON.stringify(savedContents));
}

function updateSavedContentList() {
	const savedContents =
		JSON.parse(localStorage.getItem("savedContents")) || [];
	const savedContentList = document.getElementById("savedContentList");
	savedContentList.innerHTML = "<h3>Загруженный контент</h3>";

	savedContents.forEach((item, index) => {
		const contentElement = document.createElement("button");
		contentElement.classList.add("btn", "btn-link");
		contentElement.textContent = item.url;
		contentElement.addEventListener("click", () => {
			const blob = new Blob([item.content], { type: "text/html" });
			const contentUrl = URL.createObjectURL(blob);
			document.getElementById("savedContent").src = contentUrl;
		});
		savedContentList.appendChild(contentElement);
	});
}

// Initialize saved content list on page load
document.addEventListener("DOMContentLoaded", updateSavedContentList);
