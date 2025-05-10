// Global variables
let selectedImages = [];
const maxImages = 3;
let capsules = JSON.parse(localStorage.getItem("timeCapsules")) || [];
let currentCapsuleId = null;

// DOM elements
const landingPage = document.getElementById("landing-page");
const createPage = document.getElementById("create-page");
const viewCapsulesPage = document.getElementById("view-capsules-page");
const viewCapsulePage = document.getElementById("view-capsule-page");
const capsulesContainer = document.getElementById("capsules-container");
const noCapsuleMessage = document.getElementById("no-capsules-message");
const singleCapsuleContainer = document.getElementById(
  "single-capsule-container"
);

// Theme toggle
const themeToggle = document.getElementById("theme-toggle");
themeToggle.addEventListener("change", () => {
  if (themeToggle.checked) {
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem("theme", "dark");
  } else {
    document.documentElement.setAttribute("data-theme", "light");
    localStorage.setItem("theme", "light");
  }
});

// Load saved theme
const savedTheme = localStorage.getItem("theme") || "light";
document.documentElement.setAttribute("data-theme", savedTheme);
themeToggle.checked = savedTheme === "dark";

// Navigation event listeners
document
  .getElementById("create-new-btn")
  .addEventListener("click", showCreatePage);
document
  .getElementById("view-capsules-btn")
  .addEventListener("click", showViewCapsulesPage);
document
  .getElementById("back-to-landing")
  .addEventListener("click", showLandingPage);
document
  .getElementById("back-from-list")
  .addEventListener("click", showLandingPage);
document
  .getElementById("back-to-list")
  .addEventListener("click", showViewCapsulesPage);
document
  .getElementById("create-first-capsule")
  .addEventListener("click", showCreatePage);

// Form handling
const capsuleForm = document.getElementById("capsule-form");
capsuleForm.addEventListener("submit", saveCapsule);

// Real-time preview
document
  .getElementById("capsule-title")
  .addEventListener("input", updatePreview);
document
  .getElementById("capsule-message")
  .addEventListener("input", updatePreview);
document
  .getElementById("unlock-date")
  .addEventListener("change", updatePreview);

// Image upload handling
document
  .getElementById("image-upload")
  .addEventListener("change", handleImageUpload);

// Initialize the app
init();

// Functions
function init() {
  // Set minimum date for unlock date input to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  document.getElementById("unlock-date").min = tomorrow
    .toISOString()
    .split("T")[0];

  // Check if there are any capsules
  updateCapsulesList();
}

function showLandingPage() {
  landingPage.classList.remove("hidden");
  createPage.classList.add("hidden");
  viewCapsulesPage.classList.add("hidden");
  viewCapsulePage.classList.add("hidden");
  resetCapsuleForm();
}

function showCreatePage() {
  landingPage.classList.add("hidden");
  createPage.classList.remove("hidden");
  viewCapsulesPage.classList.add("hidden");
  viewCapsulePage.classList.add("hidden");
  currentCapsuleId = null;
}

function showViewCapsulesPage() {
  landingPage.classList.add("hidden");
  createPage.classList.add("hidden");
  viewCapsulesPage.classList.remove("hidden");
  viewCapsulePage.classList.add("hidden");
  updateCapsulesList();
}

function showViewCapsulePage(capsuleId) {
  landingPage.classList.add("hidden");
  createPage.classList.add("hidden");
  viewCapsulesPage.classList.add("hidden");
  viewCapsulePage.classList.remove("hidden");
  displayCapsule(capsuleId);
}

function updatePreview() {
  const title =
    document.getElementById("capsule-title").value || "Your Capsule Title";
  const message =
    document.getElementById("capsule-message").value ||
    "Your message will appear here...";
  const date = document.getElementById("unlock-date").value
    ? new Date(
        document.getElementById("unlock-date").value
      ).toLocaleDateString()
    : "Select a date";

  document.getElementById("preview-title").textContent = title;
  document.getElementById("preview-message").textContent = message;
  document.getElementById("preview-date").textContent = date;
}

function handleImageUpload(e) {
  const files = e.target.files;
  if (files.length > maxImages) {
    showToast(`You can only upload a maximum of ${maxImages} images.`, "error");
    document.getElementById("image-upload").value = "";
    return;
  }

  // Clear previous selections
  selectedImages = [];
  document.getElementById("image-preview-container").innerHTML = "";
  document.getElementById("preview-images").innerHTML = "";

  // Process each selected file
  Array.from(files).forEach((file) => {
    if (!file.type.match("image.*")) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      const imgData = e.target.result;
      selectedImages.push(imgData);

      // Add to preview container
      addImagePreview(imgData);
      addImageToCardPreview(imgData);

      if (selectedImages.length > maxImages) {
        selectedImages = selectedImages.slice(0, maxImages);
      }
    };
    reader.readAsDataURL(file);
  });
}

function addImagePreview(imgData) {
  const previewContainer = document.getElementById("image-preview-container");
  const imgElement = document.createElement("img");
  imgElement.src = imgData;
  imgElement.className = "w-full h-24 object-cover rounded";
  previewContainer.appendChild(imgElement);
}

function addImageToCardPreview(imgData) {
  const previewContainer = document.getElementById("preview-images");
  const imgElement = document.createElement("img");
  imgElement.src = imgData;
  imgElement.className = "w-full h-20 object-cover rounded";
  previewContainer.appendChild(imgElement);
}

function saveCapsule(e) {
  e.preventDefault();

  const title = document.getElementById("capsule-title").value;
  const message = document.getElementById("capsule-message").value;
  const unlockDate = document.getElementById("unlock-date").value;

  // Validation
  if (!title || !message || !unlockDate) {
    showToast("Please fill in all required fields.", "error");
    return;
  }

  const unlockDateTime = new Date(unlockDate).getTime();
  const now = new Date().getTime();

  if (unlockDateTime <= now) {
    showToast("Unlock date must be in the future.", "error");
    return;
  }

  // Create capsule object
  const capsule = {
    id: currentCapsuleId || Date.now().toString(),
    title: title,
    message: message,
    unlockDate: unlockDate,
    images: selectedImages,
    createdAt: currentCapsuleId ? null : new Date().toISOString(),
  };

  // Save to localStorage
  if (currentCapsuleId) {
    // Update existing capsule
    const index = capsules.findIndex((c) => c.id === currentCapsuleId);
    if (index !== -1) {
      capsule.createdAt = capsules[index].createdAt;
      capsules[index] = capsule;
    }
  } else {
    // Add new capsule
    capsules.push(capsule);
  }

  localStorage.setItem("timeCapsules", JSON.stringify(capsules));

  // Show success message
  showToast("Your time capsule has been saved successfully!");

  // Reset form
  resetCapsuleForm();

  // Navigate back to list view
  showViewCapsulesPage();
}

function resetCapsuleForm() {
  document.getElementById("capsule-form").reset();
  document.getElementById("image-preview-container").innerHTML = "";
  document.getElementById("preview-images").innerHTML = "";
  selectedImages = [];
  currentCapsuleId = null;
  updatePreview();
}

function updateCapsulesList() {
  // Clear container
  capsulesContainer.innerHTML = "";

  if (capsules.length === 0) {
    noCapsuleMessage.classList.remove("hidden");
  } else {
    noCapsuleMessage.classList.add("hidden");

    // Sort capsules by date created (newest first)
    capsules.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Add each capsule card
    capsules.forEach((capsule) => {
      addCapsuleCard(capsule);
    });
  }
}

function addCapsuleCard(capsule) {
  const unlockDate = new Date(capsule.unlockDate);
  const now = new Date();
  const isUnlocked = now >= unlockDate;

  const cardElement = document.createElement("div");
  cardElement.className = "card bg-base-100 shadow-xl";

  // Calculate days remaining or days since unlocked
  let timeMessage;
  const timeDiff = Math.abs(unlockDate - now);
  const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  if (isUnlocked) {
    timeMessage = `Unlocked ${daysRemaining} day${
      daysRemaining !== 1 ? "s" : ""
    } ago`;
  } else {
    timeMessage = `Unlocks in ${daysRemaining} day${
      daysRemaining !== 1 ? "s" : ""
    }`;
  }

  // Add a preview image if available
  let imageElement = "";
  if (capsule.images && capsule.images.length > 0) {
    imageElement = `
                    <figure class="h-40">
                        <img src="${
                          isUnlocked
                            ? capsule.images[0]
                            : "/api/placeholder/400/320"
                        }" 
                             alt="${
                               isUnlocked ? "Capsule image" : "Locked image"
                             }" 
                             class="w-full h-full object-cover ${
                               !isUnlocked ? "blur-sm" : ""
                             }">
                    </figure>
                `;
  }

  cardElement.innerHTML = `
                ${imageElement}
                <div class="card-body">
                    <h2 class="card-title">
                        ${isUnlocked ? capsule.title : "Locked Capsule"}
                        ${
                          isUnlocked
                            ? ""
                            : '<div class="badge badge-secondary">Locked</div>'
                        }
                    </h2>
                    <p>${
                      isUnlocked
                        ? capsule.message.substring(0, 100) +
                          (capsule.message.length > 100 ? "..." : "")
                        : "This capsule is still locked. It will be revealed on the unlock date."
                    }</p>
                    <div class="flex justify-between items-center mt-2">
                        <div class="badge badge-outline">${timeMessage}</div>
                        <div>Unlock date: ${new Date(
                          capsule.unlockDate
                        ).toLocaleDateString()}</div>
                    </div>
                    <div class="card-actions justify-end mt-4">
                        <button class="btn btn-primary view-capsule" data-id="${
                          capsule.id
                        }">
                            ${isUnlocked ? "View Capsule" : "View Details"}
                        </button>
                    </div>
                </div>
            `;

  // Add click event listener
  cardElement
    .querySelector(".view-capsule")
    .addEventListener("click", function () {
      showViewCapsulePage(this.getAttribute("data-id"));
    });

  capsulesContainer.appendChild(cardElement);
}

function displayCapsule(capsuleId) {
  const capsule = capsules.find((c) => c.id === capsuleId);
  if (!capsule) return;

  currentCapsuleId = capsuleId;

  const unlockDate = new Date(capsule.unlockDate);
  const now = new Date();
  const isUnlocked = now >= unlockDate;

  let imageGallery = "";
  if (isUnlocked && capsule.images && capsule.images.length > 0) {
    imageGallery = '<div class="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">';
    capsule.images.forEach((img) => {
      imageGallery += `
                        <div class="w-full overflow-hidden rounded-lg shadow-lg">
                            <img src="${img}" alt="Capsule image" class="w-full h-40 md:h-60 object-cover">
                        </div>
                    `;
    });
    imageGallery += "</div>";
  }

  let countdownDisplay = "";
  if (!isUnlocked) {
    const daysRemaining = Math.ceil((unlockDate - now) / (1000 * 60 * 60 * 24));
    countdownDisplay = `
                    <div class="flex flex-col items-center my-8">
                        <div class="stat-title text-lg">Time Until Unlock</div>
                        <div class="stat-value text-3xl text-primary">${daysRemaining} Days</div>
                        <div class="stat-desc text-base">Unlock Date: ${unlockDate.toLocaleDateString()}</div>
                    </div>
                    <div class="alert alert-info">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span>This capsule is locked. It will be revealed on ${unlockDate.toLocaleDateString()}.</span>
                    </div>
                `;
  }

  let content = "";
  if (isUnlocked) {
    content = `
                    <div class="prose max-w-none">
                        <h1 class="text-3xl font-bold mb-2">${
                          capsule.title
                        }</h1>
                        <p class="text-sm mb-6">Created: ${new Date(
                          capsule.createdAt
                        ).toLocaleDateString()} | Unlocked: ${unlockDate.toLocaleDateString()}</p>
                        <div class="divider"></div>
                        <div class="whitespace-pre-line">${
                          capsule.message
                        }</div>
                        ${imageGallery}
                        <div class="flex justify-end mt-6 space-x-2">
                            <button id="export-pdf" class="btn btn-outline">Export as PDF</button>
                            <button id="delete-capsule" class="btn btn-error">Delete Capsule</button>
                        </div>
                    </div>
                `;
  } else {
    content = `
                    <div class="flex flex-col items-center justify-center py-8">
                        <div class="mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h2 class="text-2xl font-bold mb-4">This Time Capsule is Locked</h2>
                        ${countdownDisplay}
                        <div class="flex justify-center mt-6 space-x-4">
                            <button id="edit-capsule" class="btn btn-outline">Edit Capsule</button>
                            <button id="delete-capsule" class="btn btn-error">Delete Capsule</button>
                        </div>
                    </div>
                `;
  }

  singleCapsuleContainer.innerHTML = content;

  // Add event listeners for buttons
  if (isUnlocked) {
    document
      .getElementById("export-pdf")
      .addEventListener("click", () => exportCapsuleToPdf(capsule));
  } else {
    document
      .getElementById("edit-capsule")
      .addEventListener("click", () => editCapsule(capsule));
  }

  document
    .getElementById("delete-capsule")
    .addEventListener("click", () => deleteCapsule(capsuleId));
}

function exportCapsuleToPdf(capsule) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Set up PDF
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(capsule.title, 20, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(
    `Created: ${new Date(capsule.createdAt).toLocaleDateString()}`,
    20,
    30
  );
  doc.text(
    `Unlocked: ${new Date(capsule.unlockDate).toLocaleDateString()}`,
    20,
    37
  );

  doc.setDrawColor(200);
  doc.line(20, 42, 190, 42);

  // Add message with line wrapping
  doc.setFontSize(12);
  const splitText = doc.splitTextToSize(capsule.message, 170);
  doc.text(splitText, 20, 50);

  // Save the PDF
  doc.save(`time-capsule-${capsule.id}.pdf`);
  showToast("PDF exported successfully!");
}

function editCapsule(capsule) {
  // Switch to create page
  showCreatePage();

  // Fill in form with capsule data
  document.getElementById("capsule-title").value = capsule.title;
  document.getElementById("capsule-message").value = capsule.message;
  document.getElementById("unlock-date").value = capsule.unlockDate;

  // Handle images
  selectedImages = [...capsule.images];

  // Update image previews
  document.getElementById("image-preview-container").innerHTML = "";
  document.getElementById("preview-images").innerHTML = "";

  selectedImages.forEach((imgData) => {
    addImagePreview(imgData);
    addImageToCardPreview(imgData);
  });

  // Set current capsule ID
  currentCapsuleId = capsule.id;

  // Update preview
  updatePreview();
}

function deleteCapsule(capsuleId) {
  // Show confirmation dialog
  if (
    confirm(
      "Are you sure you want to delete this time capsule? This action cannot be undone."
    )
  ) {
    // Remove capsule from array
    capsules = capsules.filter((c) => c.id !== capsuleId);

    // Update localStorage
    localStorage.setItem("timeCapsules", JSON.stringify(capsules));

    // Navigate back to list
    showViewCapsulesPage();

    // Show success message
    showToast("Time capsule deleted successfully.");
  }
}

function showToast(message, type = "success") {
  const toast = document.getElementById("toast-success");
  const toastMessage = document.getElementById("toast-message");

  toastMessage.textContent = message;

  if (type === "error") {
    toast.querySelector(".alert").classList.remove("alert-success");
    toast.querySelector(".alert").classList.add("alert-error");
  } else {
    toast.querySelector(".alert").classList.remove("alert-error");
    toast.querySelector(".alert").classList.add("alert-success");
  }

  // Show toast
  toast.classList.remove("hidden");

  // Hide after 3 seconds
  setTimeout(() => {
    toast.classList.add("hidden");
  }, 3000);
}
