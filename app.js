
let userImages = [];
const imageLimit = 3;
let userCapsules = JSON.parse(localStorage.getItem("timeCapsules")) || [];
let editingCapsuleId = null;
let countdownInterval = null;

// Page elements
const homePage = document.getElementById("landing-page");
const newCapsulePage = document.getElementById("create-page");
const capsuleListPage = document.getElementById("view-capsules-page");
const capsuleViewPage = document.getElementById("view-capsule-page");
const capsuleGallery = document.getElementById("capsules-container");
const emptyCapsuleMessage = document.getElementById("no-capsules-message");
const capsuleViewer = document.getElementById("single-capsule-container");

// Theme handling
const darkModeToggle = document.getElementById("theme-toggle");
darkModeToggle.addEventListener("change", () => {
  const newTheme = darkModeToggle.checked ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
});

// Load user's theme preference
const userTheme = localStorage.getItem("theme") || "light";
document.documentElement.setAttribute("data-theme", userTheme);
darkModeToggle.checked = userTheme === "dark";

// Navigation setup
document.getElementById("create-new-btn").addEventListener("click", showNewCapsulePage);
document.getElementById("view-capsules-btn").addEventListener("click", showCapsulesList);
document.getElementById("back-to-landing").addEventListener("click", showHomePage);
document.getElementById("back-from-list").addEventListener("click", showHomePage);
document.getElementById("back-to-list").addEventListener("click", showCapsulesList);
document.getElementById("create-first-capsule").addEventListener("click", showNewCapsulePage);

// Form handling
const capsuleForm = document.getElementById("capsule-form");
capsuleForm.addEventListener("submit", saveUserCapsule);

// Preview updates
document.getElementById("capsule-title").addEventListener("input", refreshPreview);
document.getElementById("capsule-message").addEventListener("input", refreshPreview);
document.getElementById("unlock-date").addEventListener("change", refreshPreview);
document.getElementById("lock-duration-type").addEventListener("change", updateLockOptions);
document.getElementById("lock-duration").addEventListener("input", refreshPreview);

// Image handling
document.getElementById("image-upload").addEventListener("change", processImageUpload);

setupApp();

function setupApp() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  document.getElementById("unlock-date").min = tomorrow.toISOString().split("T")[0];

  addTimeLockingOptions();
  
  refreshCapsulesList();
}

function addTimeLockingOptions() {
  const dateControl = document.querySelector(".form-control:has(#unlock-date)");
  
  const timeLockHTML = `
    <div class="form-control mt-4">
      <label class="label">
        <span class="label-text">Lock Duration Type</span>
      </label>
      <select id="lock-duration-type" class="select select-bordered w-full">
        <option value="date">Specific Date</option>
        <option value="minutes">Minutes</option>
        <option value="hours">Hours</option>
        <option value="days">Days</option>
      </select>
    </div>
    
    <div class="form-control mt-4" id="duration-input-container" style="display:none">
      <label class="label">
        <span class="label-text">Duration</span>
      </label>
      <input type="number" id="lock-duration" class="input input-bordered" min="1" value="1">
    </div>
  `;
  

  dateControl.insertAdjacentHTML('afterend', timeLockHTML);
}

function updateLockOptions() {
  const lockType = document.getElementById("lock-duration-type").value;
  const dateInput = document.getElementById("unlock-date").parentElement;
  const durationInput = document.getElementById("duration-input-container");
  
  if (lockType === "date") {
    dateInput.style.display = "block";
    durationInput.style.display = "none";
  } else {
    dateInput.style.display = "none";
    durationInput.style.display = "block";
  }
  
  refreshPreview();
}

function showHomePage() {
  homePage.classList.remove("hidden");
  newCapsulePage.classList.add("hidden");
  capsuleListPage.classList.add("hidden");
  capsuleViewPage.classList.add("hidden");
  resetForm();
  clearCountdownTimer();
}

function showNewCapsulePage() {
  homePage.classList.add("hidden");
  newCapsulePage.classList.remove("hidden");
  capsuleListPage.classList.add("hidden");
  capsuleViewPage.classList.add("hidden");
  editingCapsuleId = null;
  clearCountdownTimer(); 
}

function showCapsulesList() {
  homePage.classList.add("hidden");
  newCapsulePage.classList.add("hidden");
  capsuleListPage.classList.remove("hidden");
  capsuleViewPage.classList.add("hidden");
  refreshCapsulesList();
  clearCountdownTimer(); 
}

function showCapsuleView(capsuleId) {
  homePage.classList.add("hidden");
  newCapsulePage.classList.add("hidden");
  capsuleListPage.classList.add("hidden");
  capsuleViewPage.classList.remove("hidden");
  displayCapsuleContent(capsuleId);
}


function clearCountdownTimer() {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
}

function refreshPreview() {
  const title = document.getElementById("capsule-title").value || "Your Capsule Title";
  const message = document.getElementById("capsule-message").value || "Your message will appear here...";
  
  let dateDisplay = "Select a date";
  
  const lockType = document.getElementById("lock-duration-type").value;
  if (lockType === "date" && document.getElementById("unlock-date").value) {
    dateDisplay = new Date(document.getElementById("unlock-date").value).toLocaleDateString();
  } else if (lockType !== "date") {
    const duration = document.getElementById("lock-duration").value || 1;
    const unit = lockType.charAt(0).toUpperCase() + lockType.slice(1);
    dateDisplay = `${duration} ${unit}`;
  }
}

function processImageUpload(e) {
  const files = e.target.files;
  if (files.length > imageLimit) {
    showNotification(`You can only upload up to ${imageLimit} images.`, "error");
    document.getElementById("image-upload").value = "";
    return;
  }

  userImages = [];
  document.getElementById("image-preview-container").innerHTML = "";

  Array.from(files).forEach((file) => {
    if (!file.type.match("image.*")) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      const imgData = e.target.result;
      userImages.push(imgData);

      addThumbnail(imgData);

      if (userImages.length > imageLimit) {
        userImages = userImages.slice(0, imageLimit);
      }
    };
    reader.readAsDataURL(file);
  });
}

function addThumbnail(imgData) {
  const previewBox = document.getElementById("image-preview-container");
  const imgElement = document.createElement("img");
  imgElement.src = imgData;
  imgElement.className = "w-full h-24 object-cover rounded";
  previewBox.appendChild(imgElement);
}

function saveUserCapsule(e) {
  e.preventDefault();

  const title = document.getElementById("capsule-title").value;
  const message = document.getElementById("capsule-message").value;
  
  const lockType = document.getElementById("lock-duration-type").value;
  let unlockDate;
  
  if (lockType === "date") {
    unlockDate = document.getElementById("unlock-date").value;
    if (!unlockDate) {
      showNotification("Please select an unlock date.", "error");
      return;
    }
  } else {
    const duration = parseInt(document.getElementById("lock-duration").value);
    if (!duration || duration < 1) {
      showNotification("Please enter a valid duration.", "error");
      return;
    }
    
    unlockDate = new Date();
    switch(lockType) {
      case "minutes":
        unlockDate.setMinutes(unlockDate.getMinutes() + duration);
        break;
      case "hours":
        unlockDate.setHours(unlockDate.getHours() + duration);
        break;
      case "days":
        unlockDate.setDate(unlockDate.getDate() + duration);
        break;
    }
    unlockDate = unlockDate.toISOString();
  }

  if (!title || !message) {
    showNotification("Please fill in all required fields.", "error");
    return;
  }

  const unlockDateTime = new Date(unlockDate).getTime();
  const now = new Date().getTime();

  if (unlockDateTime <= now) {
    showNotification("Unlock time must be in the future.", "error");
    return;
  }

  const capsule = {
    id: editingCapsuleId || Date.now().toString(),
    title: title,
    message: message,
    unlockDate: unlockDate,
    images: userImages,
    createdAt: editingCapsuleId ? null : new Date().toISOString(),
    lockType: lockType,
    lockDuration: lockType !== "date" ? document.getElementById("lock-duration").value : null
  };

  if (editingCapsuleId) {
    const index = userCapsules.findIndex((c) => c.id === editingCapsuleId);
    if (index !== -1) {
      capsule.createdAt = userCapsules[index].createdAt;
      userCapsules[index] = capsule;
    }
  } else {
    userCapsules.push(capsule);
  }

  localStorage.setItem("timeCapsules", JSON.stringify(userCapsules));
  showNotification("Your time capsule has been saved!");
  resetForm();
  showCapsulesList();
}

function resetForm() {
  document.getElementById("capsule-form").reset();
  document.getElementById("image-preview-container").innerHTML = "";
  userImages = [];
  editingCapsuleId = null;
  refreshPreview();
  
  document.getElementById("lock-duration-type").value = "date";
  updateLockOptions();
}

function refreshCapsulesList() {
  capsuleGallery.innerHTML = "";

  if (userCapsules.length === 0) {
    emptyCapsuleMessage.classList.remove("hidden");
  } else {
    emptyCapsuleMessage.classList.add("hidden");
    userCapsules.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    userCapsules.forEach((capsule) => {
      createCapsuleCard(capsule);
    });
  }
}

function createCapsuleCard(capsule) {
  const unlockDate = new Date(capsule.unlockDate);
  const now = new Date();
  const isUnlocked = now >= unlockDate;

  const card = document.createElement("div");
  card.className = "card bg-base-100 shadow-xl";

  let timeDisplay;
  const timeDiff = Math.abs(unlockDate - now);
  
  // More human-readable time display
  if (isUnlocked) {
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      timeDisplay = `Unlocked ${days} days ago`;
    } else if (hours > 0) {
      timeDisplay = `Unlocked ${hours} hours ago`;
    } else {
      timeDisplay = `Unlocked ${minutes} minutes ago`;
    }
  } else {
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      timeDisplay = `Unlocks in ${days} days`;
    } else if (hours > 0) {
      timeDisplay = `Unlocks in ${hours} hours`;
    } else {
      timeDisplay = `Unlocks in ${minutes} minutes`;
    }
  }

  let imageDisplay = "";
  if (capsule.images && capsule.images.length > 0) {
    imageDisplay = `
      <figure class="h-40">
        <img src="${isUnlocked ? capsule.images[0] : "/api/placeholder/400/320"}" 
             alt="${isUnlocked ? "Capsule image" : "Locked image"}" 
             class="w-full h-full object-cover ${!isUnlocked ? "blur-sm" : ""}">
      </figure>
    `;
  }

  card.innerHTML = `
    ${imageDisplay}
    <div class="card-body">
      <h2 class="text-3xl font-bold">
        ${isUnlocked ? capsule.title : "Locked Capsule"}
        ${isUnlocked ? "" : '<div class="badge badge-secondary">Locked</div>'}
      </h2>
      <p class="font-semibold">${isUnlocked 
          ? capsule.message.substring(0, 100) + (capsule.message.length > 100 ? "..." : "") 
          : "This capsule is still locked. It will be revealed on the unlock date."}
      </p>
      <div class="flex flex-col items-start mt-2 gap-2">
        <div class="badge badge-secondary badge-outline ">${timeDisplay}</div>
        <div>Unlock: ${new Date(capsule.unlockDate).toLocaleString()}</div>
      </div>
      <div class="card-actions justify-end mt-4">
        <button class="btn btn-primary view-capsule text-white" data-id="${capsule.id}">
          ${isUnlocked ? "View Capsule" : "View Details"}
        </button>
      </div>
    </div>
  `;

  card.querySelector(".view-capsule").addEventListener("click", function() {
    showCapsuleView(this.getAttribute("data-id"));
  });

  capsuleGallery.appendChild(card);
}

function displayCapsuleContent(capsuleId) {
  const capsule = userCapsules.find((c) => c.id === capsuleId);
  if (!capsule) return;

  editingCapsuleId = capsuleId;

  const unlockDate = new Date(capsule.unlockDate);
  const now = new Date();
  const isUnlocked = now >= unlockDate;

  clearCountdownTimer();

  let imageGallery = "";
  if (capsule.images && capsule.images.length > 0) {
    if (isUnlocked) {
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
  }

  let timeDisplay = "";
  if (!isUnlocked) {
    timeDisplay = `
      <div class="flex flex-col items-center my-8">
        <div class="stat-title text-lg">Time Until Unlock</div>
        <div class="stat-value text-3xl text-primary" id="countdown-timer">
          <span id="hours">00</span> : <span id="minutes">00</span> : <span id="seconds">00</span>
        </div>
        <div class="stat-desc text-base">Unlock: ${unlockDate.toLocaleString()}</div>
      </div>
      <div class="alert alert-info">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        <span>This capsule is locked. It will be revealed on ${unlockDate.toLocaleString()}.</span>
      </div>
    `;
  }

  let content = "";
  if (isUnlocked) {
    content = `
      <div class="prose max-w-none p-10"> 
        <h1 class="text-5xl font-bold mb-2 text-secondary">${capsule.title}</h1>
        <p class="text-sm mb-6">Created: ${new Date(capsule.createdAt).toLocaleString()} | Unlocked: ${unlockDate.toLocaleString()}</p>
        <div class="divider"></div>
        <div class="whitespace-pre-line">${capsule.message}</div>
        ${imageGallery}
        <div class="flex justify-end mt-6 space-x-2">
          <button id="delete-capsule" class="btn btn-error text-white">Delete Capsule</button>
        </div>
      </div>
    `;
  } else {
    content = `
      <div class="flex flex-col items-center justify-center py-8 px-5">
        <div class="mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold mb-4">This Time Capsule is Locked</h2>
        ${timeDisplay}
        <div class="flex justify-center mt-6 space-x-4">
          <button id="edit-capsule" class="btn btn-outline">Edit Capsule</button>
          <button id="delete-capsule" class="btn btn-error">Delete Capsule</button>
        </div>
      </div>
    `;
  }

  capsuleViewer.innerHTML = content;

  if (!isUnlocked) {
    document.getElementById("edit-capsule").addEventListener("click", () => editCapsule(capsule));
    
    startCountdownTimer(unlockDate);
  }

  document.getElementById("delete-capsule").addEventListener("click", () => removeCapsule(capsuleId));
}

// Function to start and update the countdown timer
function startCountdownTimer(unlockDate) {
  const hoursEl = document.getElementById("hours");
  const minutesEl = document.getElementById("minutes");
  const secondsEl = document.getElementById("seconds");
  
  updateCountdown();
  
  countdownInterval = setInterval(updateCountdown, 1000);
  
  function updateCountdown() {
    const now = new Date();
    const timeDiff = unlockDate - now;
    
    if (timeDiff <= 0) {
      clearInterval(countdownInterval);
      location.reload();
      return;
    }
    
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
    
    hoursEl.textContent = hours.toString().padStart(2, '0');
    minutesEl.textContent = minutes.toString().padStart(2, '0');
    secondsEl.textContent = seconds.toString().padStart(2, '0');
  }
}

function editCapsule(capsule) {
  showNewCapsulePage();

  document.getElementById("capsule-title").value = capsule.title;
  document.getElementById("capsule-message").value = capsule.message;
  

  if (capsule.lockType) {
    document.getElementById("lock-duration-type").value = capsule.lockType;
    if (capsule.lockType !== "date") {
      document.getElementById("lock-duration").value = capsule.lockDuration;
    } else {
      document.getElementById("unlock-date").value = capsule.unlockDate.split('T')[0];
    }
    updateLockOptions();
  } else {
    document.getElementById("lock-duration-type").value = "date";
    document.getElementById("unlock-date").value = capsule.unlockDate.split('T')[0];
    updateLockOptions();
  }

  userImages = [...capsule.images];

  document.getElementById("image-preview-container").innerHTML = "";

  userImages.forEach((imgData) => {
    addThumbnail(imgData);
  });

  editingCapsuleId = capsule.id;
  refreshPreview();
}

function removeCapsule(capsuleId) {
  if (confirm("Are you sure you want to delete this time capsule? This cannot be undone.")) {
    userCapsules = userCapsules.filter((c) => c.id !== capsuleId);
    localStorage.setItem("timeCapsules", JSON.stringify(userCapsules));
    showCapsulesList();
    showNotification("Time capsule deleted.");
  }
}

function showNotification(message, type = "success") {
  const toast = document.getElementById("toast-success");
  const toastMessage = document.getElementById("toast-message");

  toastMessage.textContent = message;

  const alert = toast.querySelector(".alert");
  if (type === "error") {
    alert.classList.remove("alert-success");
    alert.classList.add("alert-error");
  } else {
    alert.classList.remove("alert-error");
    alert.classList.add("alert-success");
  }

  toast.classList.remove("hidden");

  setTimeout(() => {
    toast.classList.add("hidden");
  }, 3000);
}