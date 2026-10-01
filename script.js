const API_URL =
    'https://script.google.com/macros/s/AKfycbzy1JJ1pMJ1NH77-cQaPbLl31g3AcXL6JdhRFw-9Z8P4IqH1eOWT84QkilVTob6Y2s/exec'

function getBrowserInfo() {
    return {
        userAgent: navigator.userAgent,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        platform: navigator.platform,
        screen: `${window.screen.width}x${window.screen.height}`
    };
}

async function getMetaData() {
    let batteryData = await navigator.getBattery();
    return `Battery Level: ${batteryData.level * 100}% - Charging: ${batteryData.charging ? "Yes" : "No"}`
}

async function getSubjects() {
    try {
        // console.log("Loading subjects...");
        // Get browser information
        const browser = getBrowserInfo();
        // Request payload
        const payload = {
            clientId: await getMetaData(),
            message: "Get Subjects",
            browser,
            // location
        };
        // console.log("Request payload:", payload);
        // API URL
        const url =
            `${API_URL}?sheet=Subjects&operation=get-subjects`;

        // API request
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "text/plain"
            },
            body: JSON.stringify(payload)
        });

        // Read response as text first
        const responseText =
            await response.text();

        console.log(
            "Raw API response:",
            responseText
        );

        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}`
            );
        }

        // Parse JSON
        let result;

        try {
            result =
                JSON.parse(responseText);
        } catch (error) {
            console.error(
                "API did not return JSON:",
                responseText
            );
            throw new Error(
                "API returned an invalid response"
            );
        }
        // Check API status
        if (result.status !== 200) {

            throw new Error(
                result.message ||
                "Failed to get subjects"
            );

        }
        // console.log(
        //     "Subjects:",
        //     result.data
        // );

        // Render subjects
        renderSubjects(
            result.data || []
        );
        return result.data || [];

    } catch (error) {
        // console.error(
        //     "Get subjects failed:",
        //     error
        // );

        showError(
            error.message ||
            "Unable to load subjects"
        );
        return [];
    }

}

// ============================================================
// Render Subjects
// ============================================================

function renderSubjects(subjects) {

    const container =
        document.getElementById(
            "subjectsContainer"
        );

    if (!container) {

        console.error(
            "subjectsContainer element not found"
        );

        return;


    }

    container.innerHTML = "";

    if (!subjects.length) {

        container.innerHTML = `
            <div class="empty">
                <div class="empty-icon">📚</div>
                <div>No subjects found</div>
            </div>
        `;

        return;


    }

    subjects.forEach(
        (subject, index) => {

            const card =
                document.createElement("div");

            card.className =
                "subject-card";

            // Find subject title
            const title = subject.name;
            const link = subject.link;
            card.innerHTML = `
                <h2 class="subject-title" onclick="gotoDrive('${escapeHTML(link)}', '${escapeHTML(title)}')">
                    ${escapeHTML(String(title))}
                </h2>
            `;
            container.appendChild(card);
        }
    );

}

// ============================================================
// Format object keys
// ============================================================

function formatKey(key) {

    return key
        .replace(/_/g, " ")
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, char =>
            char.toUpperCase()
        );

}

// ============================================================
// Escape HTML
// ============================================================

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value;

    return div.innerHTML;

}

// ============================================================
// Show error
// ============================================================

function showError(message) {

    const container =
        document.getElementById(
            "errorContainer"
        );

    if (!container) {
        return;
    }

    container.innerHTML = `
        <div class="error">
        <strong>
            Unable to load subjects
        </strong>
        <br>
            ${escapeHTML(message)}
        </div>
        `;

}


// ============================================================
// Load when page opens
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        getSubjects();


    }
);

async function gotoDrive(link, subject){
    try{
        const browser = getBrowserInfo();
        // Request payload
        const payload = {
            clientId: await getMetaData(),
            message: `Visting ${subject}`,
            browser,
            // location
        };
        // console.log("Request payload:", payload);
        // API URL
        const url =
            `${API_URL}?sheet=Logs&operation=log-action`;

        // API request
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "text/plain"
            },
            body: JSON.stringify(payload)
        });


        window.location.href = link
    } catch(e){

    }
}
