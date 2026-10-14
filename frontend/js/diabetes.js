/* ================================================
   HEALTH PREDICTOR — PREMIUM MODERN JS
   ================================================ */

"use strict";

// ================================================
// CONSTANTS & CONFIG
// ================================================

const API_URL        = "http://127.0.0.1:8000/predict/diabetes";
const TOTAL_FIELDS   = 21;
const TOAST_DURATION = 4000;

// ================================================
// DOM REFERENCES
// ================================================

const form           = document.getElementById("diabetesForm");
const resultSection  = document.getElementById("result");
const predictButton  = document.getElementById("predictButton");
const progressFill   = document.getElementById("progressFill");
const progressCount  = document.getElementById("progressCount");
const progressPercent = document.getElementById("progressPercent");
const toastContainer = document.getElementById("toastContainer");
const errorSummary   = document.getElementById("errorSummary");
const errorSummaryText = document.getElementById("errorSummaryText");
const backToTopBtn   = document.getElementById("backToTop");
const navbar         = document.querySelector(".navbar");

// Required fields list (matches form)
const REQUIRED_FIELDS = [
    'HighBP', 'HighChol', 'CholCheck', 'Stroke', 'HeartDiseaseorAttack',
    'DiffWalk', 'BMI', 'Smoker', 'PhysActivity', 'Fruits', 'Veggies',
    'HvyAlcoholConsump', 'AnyHealthcare', 'NoDocbcCost', 'GenHlth',
    'MentHlth', 'PhysHlth', 'Sex', 'Age', 'Education', 'Income'
];

// ================================================
// PROGRESS TRACKER
// ================================================

function updateProgress() {

    let filled = 0;

    REQUIRED_FIELDS.forEach(name => {
        const fields = form.querySelectorAll(`[name="${name}"]`);
        fields.forEach(field => {
            if (field.checked || (field.value && field.value.trim() !== "")) {
                filled++;
            }
        });
    });

    const pct = Math.round((filled / TOTAL_FIELDS) * 100);

    progressFill.style.width = `${pct}%`;
    progressCount.innerHTML = `<strong>${filled}</strong> / ${TOTAL_FIELDS} fields completed`;
    progressPercent.textContent = `${pct}%`;

    // Update step indicators
    updateStepIndicators();

    // Update ARIA
    const track = document.querySelector(".progress-track");
    if (track) track.setAttribute("aria-valuenow", pct);

    if (pct === 100) {
        showToast("All fields completed! Ready to analyze.", "success");
    }
}

function updateStepIndicators() {
    const sections = form.querySelectorAll(".form-section");
    const stepDots = document.querySelectorAll(".step-dot");
    const stepLines = document.querySelectorAll(".step-line");

    sections.forEach((section, idx) => {
        const sectionNum = idx + 1;
        const fields = section.querySelectorAll("input[required], select[required]");
        let allFilled = true;

        fields.forEach(field => {
            const val = field.value ? field.value.trim() : "";
            const checked = form.querySelector(`[name="${field.name}"]:checked`);
            if (!val && !checked) allFilled = false;
        });

        const dot = document.querySelector(`.step-dot[data-step="${sectionNum}"]`);
        if (dot) {
            dot.classList.toggle("completed", allFilled);
            dot.classList.toggle("active", idx === 0 && !allFilled);
        }

        if (idx < stepLines.length) {
            stepLines[idx].classList.toggle("completed", allFilled);
        }
    });
}

// ================================================
// STEP NAVIGATION
// ================================================

document.querySelectorAll(".step-dot").forEach(dot => {
    dot.addEventListener("click", () => {
        const section = dot.dataset.step;
        const target = document.querySelector(`.form-section[data-section="${section}"]`);
        if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
            target.classList.add("highlight");
            setTimeout(() => target.classList.remove("highlight"), 2000);
        }
    });
});

// ================================================
// BMI INDICATOR (Enhanced)
// ================================================

function updateBmiIndicator(value) {
    const bmi = parseFloat(value);
    const indicator = document.getElementById("bmiIndicator");

    if (!indicator) return;

    if (isNaN(bmi) || bmi < 10 || bmi > 100) {
        indicator.classList.remove("visible");
        return;
    }

    indicator.classList.add("visible");

    let category, color, percent;

    if (bmi < 18.5) {
        category = "Underweight";
        color = "#3b82f6";
        percent = ((bmi / 18.5) * 25);
    } else if (bmi < 25) {
        category = "Normal weight";
        color = "var(--success)";
        percent = 25 + ((bmi - 18.5) / 6.5) * 25;
    } else if (bmi < 30) {
        category = "Overweight";
        color = "var(--warning)";
        percent = 50 + ((bmi - 25) / 5) * 25;
    } else {
        category = "Obese";
        color = "var(--danger)";
        percent = Math.min(75 + ((bmi - 30) / 20) * 25, 100);
    }

    const segments = indicator.querySelectorAll(".bmi-segment");
    segments.forEach(seg => {
        seg.classList.toggle("active", seg.dataset.range === category);
        seg.style.color = seg.dataset.range === category ? color : "transparent";
    });

    const marker = document.getElementById("bmiMarker");
    if (marker) {
        marker.style.left = `${Math.min(Math.max(percent, 0), 100)}%`;
        marker.style.background = color;
    }

    const label = document.getElementById("bmiLabel");
    if (label) {
        label.style.color = color;
        label.innerHTML = `<i class="fas fa-circle" style="font-size: 8px;"></i> ${category}`;
    }

    const valueEl = indicator.querySelector(".bmi-value");
    if (valueEl) valueEl.textContent = bmi.toFixed(1);
}

// ================================================
// FIELD VALIDATION
// ================================================

function getFieldValue(name) {
    const checked = form.querySelector(`[name="${name}"]:checked`);
    if (checked) return checked.value;
    const input = form.querySelector(`[name="${name}"]`);
    return input ? input.value : "";
}

function validateField(field) {
    const errorEl = document.getElementById(`${field.id}-error`) ||
                    document.getElementById(`${field.name}-error`);
    const val = field.value ? field.value.trim() : "";
    let msg = "";

    if (!val) {
        msg = "This field is required.";
    } else if (field.type === "number") {
        const num = parseFloat(val);
        const min = parseFloat(field.min);
        const max = parseFloat(field.max);

        if (isNaN(num)) {
            msg = "Please enter a valid number.";
        } else if (!isNaN(min) && num < min) {
            msg = `Minimum value is ${min}.`;
        } else if (!isNaN(max) && num > max) {
            msg = `Maximum value is ${max}.`;
        }
    }

    if (errorEl) {
        if (msg) {
            errorEl.innerHTML = `<i class="fas fa-circle-exclamation"></i> ${msg}`;
            errorEl.classList.add("visible");
        } else {
            errorEl.textContent = "";
            errorEl.classList.remove("visible");
        }
    }

    const group = field.closest(".form-group");
    if (group) {
        group.classList.toggle("invalid", !!msg);
        group.classList.toggle("valid", !msg && !!val);
    }

    return !msg;
}

function validateAll() {
    let allGood = true;
    let firstBad = null;
    const errors = [];

    REQUIRED_FIELDS.forEach(name => {
        const fields = form.querySelectorAll(`[name="${name}"]`);
        const checked = form.querySelector(`[name="${name}"]:checked`);
        const input = form.querySelector(`[name="${name}"]`);

        let field, val;
        if (checked) {
            field = checked;
            val = checked.value;
        } else if (input && input.type !== "radio") {
            field = input;
            val = input.value ? input.value.trim() : "";
        } else {
            field = fields[0];
            val = "";
        }

        if (!val) {
            errors.push(name);
            if (!firstBad && field) firstBad = field;
            allGood = false;
            if (field && errorEl(field)) {
                errorEl(field).innerHTML = `<i class="fas fa-circle-exclamation"></i> This field is required.`;
                errorEl(field).classList.add("visible");
            }
            const group = field?.closest(".form-group");
            if (group) group.classList.add("invalid");
        }
    });

    if (!allGood) {
        showErrorSummary(errors.length);
        if (firstBad) {
            firstBad.closest(".form-section")?.classList.add("highlight");
            firstBad.scrollIntoView({ behavior: "smooth", block: "center" });
            setTimeout(() => firstBad.closest(".form-section")?.classList.remove("highlight"), 2000);
        }
    } else {
        hideErrorSummary();
    }

    return allGood;
}

function errorEl(field) {
    return document.getElementById(`${field.id}-error`) ||
           document.getElementById(`${field.name}-error`);
}

function showErrorSummary(count) {
    errorSummary.hidden = false;
    errorSummaryText.textContent = `Please complete ${count} required field${count > 1 ? 's' : ''} before continuing.`;
}

function hideErrorSummary() {
    errorSummary.hidden = true;
}

// ================================================
// TOAST SYSTEM
// ================================================

function showToast(message, type = "info") {
    const iconMap = {
        success: "fa-circle-check",
        error:   "fa-circle-xmark",
        warning: "fa-triangle-exclamation",
        info:    "fa-circle-info",
    };

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas ${iconMap[type] || iconMap.info}"></i>
        </div>
        <span class="toast-message">${message}</span>
        <button class="toast-close" aria-label="Close notification">
            <i class="fas fa-xmark"></i>
        </button>
    `;

    toastContainer.appendChild(toast);

    const close = () => dismissToast(toast);
    toast.querySelector(".toast-close").addEventListener("click", close);
    const timer = setTimeout(close, TOAST_DURATION);
    toast._timer = timer;
}

function dismissToast(toast) {
    clearTimeout(toast._timer);
    toast.classList.add("leaving");
    toast.addEventListener("animationend", () => toast.remove(), { once: true });
}

// ================================================
// LOADING STATE (Enhanced)
// ================================================

const analyzingMessages = [
    "Analyzing health indicators...",
    "Cross-referencing clinical data...",
    "Evaluating risk factors...",
    "Computing personalized insights...",
    "Generating recommendations..."
];

let analyzingInterval;

function setLoading(isLoading) {
    if (isLoading) {
        predictButton.disabled = true;
        predictButton.classList.add("loading");

        let msgIndex = 0;
        resultSection.innerHTML = `
            <div class="analyzing-card">
                <div class="analyzing-icon">
                    <i class="fas fa-microscope"></i>
                </div>
                <h3>Processing Your Data</h3>
                <p>Our AI model is analyzing your health indicators</p>
                <div class="analyzing-progress">
                    <div class="analyzing-progress-bar">
                        <div class="analyzing-progress-fill"></div>
                    </div>
                    <div class="analyzing-steps" id="analyzingSteps">${analyzingMessages[0]}</div>
                </div>
            </div>
        `;

        analyzingInterval = setInterval(() => {
            msgIndex = (msgIndex + 1) % analyzingMessages.length;
            const el = document.getElementById("analyzingSteps");
            if (el) el.textContent = analyzingMessages[msgIndex];
        }, 1500);

        resultSection.scrollIntoView({ behavior: "smooth", block: "start" });

    } else {
        clearInterval(analyzingInterval);
        predictButton.disabled = false;
        predictButton.classList.remove("loading");
    }
}

// ================================================
// FORM SUBMIT
// ================================================

form.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!validateAll()) {
        showToast("Please complete all required fields.", "warning");
        return;
    }

    setLoading(true);

    try {
        const data = {};
        REQUIRED_FIELDS.forEach(name => {
            const val = getFieldValue(name);
            if (val !== "") {
                data[name] = name === "BMI" ? parseFloat(val) : parseInt(val);
            }
        });

        const response = await fetch(API_URL, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const result = await response.json();
        console.log("API Response:", result);

        displayResult(result, data);
        showToast("Analysis complete! Review your results below.", "success");

    } catch (error) {
        console.error("Prediction Error:", error);

        resultSection.innerHTML = `
            <div class="error-card">
                <div class="error-icon">
                    <i class="fas fa-triangle-exclamation"></i>
                </div>
                <h2>Connection Failed</h2>
                <p>Unable to reach the prediction service. Please make sure the backend server is running and try again.</p>
                <button class="error-retry-btn" id="retryBtn">
                    <i class="fas fa-rotate-right"></i>
                    Try Again
                </button>
            </div>
        `;

        document.getElementById("retryBtn")?.addEventListener("click", () => {
            predictButton.click();
        });

        showToast("Failed to connect to prediction service.", "error");
        resultSection.scrollIntoView({ behavior: "smooth", block: "start" });

    } finally {
        setLoading(false);
    }
});

// ================================================
// DISPLAY RESULT
// ================================================

function displayResult(result, data) {
    const probability   = Number(result.probability);
    const percentage    = (probability * 100).toFixed(1);
    const riskLevel     = (result.risk_level || "Unknown").toLowerCase().trim();
    const predictionMsg = result.prediction_message ||
                          (result.prediction === 1 ? "Higher likelihood detected" : "Lower likelihood detected");
    const isHighRisk    = result.prediction === 1;

    const keyFactors      = result.key_factors      || [];
    const positiveFactors = result.positive_factors || [];
    const recommendations = result.recommendations  || [];

    const riskMeta = getRiskMeta(riskLevel, percentage);

    const keyFactorsHTML = keyFactors.length
        ? `<ul>${keyFactors.map(f => `<li>${f}</li>`).join("")}</ul>`
        : `<p class="empty-msg">No major risk factors identified.</p>`;

    const positiveHTML = positiveFactors.length
        ? `<ul>${positiveFactors.map(f => `<li>${f}</li>`).join("")}</ul>`
        : `<p class="empty-msg">No specific positive factors identified.</p>`;

    const recHTML = recommendations.length
        ? `<ul class="rec-list">
            ${recommendations.map((item, i) => `
                <li>
                    <span class="rec-num">${i + 1}</span>
                    <span>${item}</span>
                </li>
            `).join("")}
           </ul>`
        : `<p class="empty-msg">No specific recommendations available.</p>`;

    const disclaimer = result.disclaimer ||
        "This tool provides an estimate only and is not a medical diagnosis. Please consult a qualified healthcare professional for proper evaluation.";

    resultSection.innerHTML = `
        <div class="result-card">

            <div class="result-header ${riskMeta.cls}">
                <div class="result-header-inner">
                    <div class="result-icon-wrap">
                        <i class="fas ${riskMeta.icon}"></i>
                    </div>
                    <div class="result-header-text">
                        <h2>${riskMeta.title}</h2>
                        <p>${riskMeta.subtitle}</p>
                    </div>
                </div>
            </div>

            <div class="risk-summary-grid">

                <div class="risk-summary-item">
                    <div class="item-label">
                        <i class="fas fa-flag"></i> Risk Level
                    </div>
                    <div class="item-value">
                        <span class="risk-badge ${riskMeta.cls}">
                            <i class="fas ${riskMeta.icon}"></i>
                            ${capitalize(riskLevel)}
                        </span>
                    </div>
                </div>

                <div class="risk-summary-item">
                    <div class="item-label">
                        <i class="fas fa-percent"></i> Probability
                    </div>
                    <div class="item-value">${percentage}%</div>
                    <div class="item-sub">Estimated diabetes likelihood</div>
                </div>

                <div class="risk-summary-item">
                    <div class="item-label">
                        <i class="fas fa-vials"></i> Factors Reviewed
                    </div>
                    <div class="item-value">${Object.keys(data).length}</div>
                    <div class="item-sub">Health indicators analyzed</div>
                </div>

            </div>

            <div class="gauge-container">
                <div class="gauge-title">
                    <i class="fas fa-chart-simple"></i>
                    Risk Probability Meter
                </div>
                <div class="gauge-track">
                    <div class="gauge-fill ${riskMeta.cls}" id="gaugeFill" style="width: 0%"></div>
                </div>
                <div class="gauge-markers">
                    <span>0% Low</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100% High</span>
                </div>
            </div>

            <div class="result-body">

                <div class="prediction-box ${isHighRisk ? "negative" : "positive"}">
                    <i class="fas ${isHighRisk ? "fa-circle-exclamation" : "fa-circle-check"}"></i>
                    <div class="prediction-box-text">
                        <h4>AI Prediction</h4>
                        <p>${predictionMsg}</p>
                    </div>
                </div>

                <div class="info-grid">

                    <div class="info-card risk-card">
                        <div class="info-card-header risk-header">
                            <i class="fas fa-triangle-exclamation"></i>
                            Key Risk Factors
                        </div>
                        <div class="info-card-body">
                            ${keyFactorsHTML}
                        </div>
                    </div>

                    <div class="info-card positive-card">
                        <div class="info-card-header positive-header">
                            <i class="fas fa-thumbs-up"></i>
                            Positive Factors
                        </div>
                        <div class="info-card-body">
                            ${positiveHTML}
                        </div>
                    </div>

                </div>

                <div class="recommendations-section">
                    <div class="recommendations-header">
                        <i class="fas fa-lightbulb"></i>
                        Personalized Recommendations
                    </div>
                    <div class="recommendations-body">
                        ${recHTML}
                    </div>
                </div>

                <div class="result-note-box">
                    <i class="fas fa-robot"></i>
                    <p>This result is generated by an AI-based machine learning model trained on clinical health data. Results are based solely on the information you provided.</p>
                </div>

                <div class="disclaimer-box">
                    <i class="fas fa-shield-halved"></i>
                    <div>
                        <strong>Medical Disclaimer</strong>
                        <p>${disclaimer}</p>
                    </div>
                </div>

            </div>

        </div>
    `;

    requestAnimationFrame(() => {
        setTimeout(() => {
            const gaugeFill = document.getElementById("gaugeFill");
            if (gaugeFill) gaugeFill.style.width = `${percentage}%`;
        }, 200);
    });

    resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ================================================
// RISK META HELPER
// ================================================

function getRiskMeta(riskLevel, percentage) {
    const pct = parseFloat(percentage);

    if (riskLevel.includes("low") || pct < 30) {
        return {
            cls:      "low",
            icon:     "fa-circle-check",
            title:    "Low Diabetes Risk Detected",
            subtitle: "Your indicators suggest a lower likelihood of diabetes.",
        };
    }

    if (riskLevel.includes("moderate") || riskLevel.includes("medium") || pct < 65) {
        return {
            cls:      "moderate",
            icon:     "fa-triangle-exclamation",
            title:    "Moderate Diabetes Risk Detected",
            subtitle: "Some indicators suggest elevated risk. Consider medical evaluation.",
        };
    }

    return {
        cls:      "high",
        icon:     "fa-circle-exclamation",
        title:    "High Diabetes Risk Detected",
        subtitle: "Multiple indicators suggest elevated risk. Please consult a doctor.",
    };
}

// ================================================
// UTILITIES
// ================================================

function capitalize(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// ================================================
// REAL-TIME FIELD EVENTS
// ================================================

form.querySelectorAll("input, select").forEach(field => {
    field.addEventListener("change", () => {
        validateField(field);
        updateProgress();
        hideErrorSummary();
    });

    if (field.id === "BMI") {
        field.addEventListener("input", () => updateBmiIndicator(field.value));
    }

    field.addEventListener("blur", () => {
        if (field.type !== "radio" && field.value.trim()) {
            validateField(field);
        }
    });
});

// ================================================
// SCROLL EFFECTS
// ================================================

window.addEventListener("scroll", () => {
    const scrolled = window.scrollY > 50;
    navbar.classList.toggle("scrolled", scrolled);

    const showBtn = window.scrollY > 400;
    backToTopBtn.classList.toggle("visible", showBtn);
    backToTopBtn.hidden = !showBtn && scrolled === false;
});

backToTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});

// ================================================
// NAV TOGGLE (Mobile)
// ================================================

const navToggle = document.getElementById("navToggle");
if (navToggle) {
    navToggle.addEventListener("click", () => {
        const expanded = navToggle.getAttribute("aria-expanded") === "true";
        navToggle.setAttribute("aria-expanded", !expanded);
    });
}

// ================================================
// INIT
// ================================================

updateProgress();