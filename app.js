document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#profile-form");
  const nameInput = document.querySelector("#display-name");
  const styleInput = document.querySelector("#style");
  const bioInput = document.querySelector("#bio");
  const logoInput = document.querySelector("#logo");
  const logoPreview = document.querySelector("#logo-preview");
  const clearBtn = document.querySelector("#clear-profile");
  const message = document.querySelector("#form-message");

  const previewName = document.querySelector("#preview-name");
  const previewStyle = document.querySelector("#preview-style");
  const previewBio = document.querySelector("#preview-bio");
  const styleCards = document.querySelectorAll(".style-card");

  let currentLogoBase64 = null;
  const STORAGE_KEY = "gateway_profile_data";

  // Map option text to visual themes
  const themeMap = {
    "Equilibrium": "equilibrium",
    "Nocturnal Torch": "nocturnal-torch",
    "Make it your own": "make-it-your-own"
  };

  function updateTheme(styleValue) {
    const themeKey = themeMap[styleValue] || "equilibrium";
    document.body.setAttribute("data-theme", themeKey);
  }

  function updatePreview() {
    const nameVal = nameInput.value.trim();
    const bioVal = bioInput.value.trim();
    const styleVal = styleInput.value;

    previewName.textContent = nameVal || "Your display name";
    previewStyle.textContent = styleVal;
    previewBio.textContent = bioVal || "Your biography will appear here.";

    updateTheme(styleVal);
  }

  // Live input synchronization
  nameInput.addEventListener("input", updatePreview);
  bioInput.addEventListener("input", updatePreview);
  styleInput.addEventListener("change", updatePreview);

  // Style card quick selection
  styleCards.forEach((card) => {
    card.addEventListener("click", () => {
      const selectedStyle = card.getAttribute("data-style-select");
      if (selectedStyle) {
        styleInput.value = selectedStyle;
        updatePreview();
      }
    });
  });

  // Handle Logo Upload & Base64 conversion
  logoInput.addEventListener("change", () => {
    const file = logoInput.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      message.textContent = "Please select a valid image file.";
      logoInput.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      currentLogoBase64 = e.target.result;
      renderLogo(currentLogoBase64);
    };
    reader.readAsDataURL(file);
  });

  function renderLogo(src) {
    if (!src) {
      logoPreview.textContent = "Your logo";
      return;
    }
    const img = document.createElement("img");
    img.src = src;
    img.alt = "Profile logo preview";
    logoPreview.replaceChildren(img);
  }

  // Form Submission -> Save LocalStorage
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const profileData = {
      displayName: nameInput.value.trim(),
      style: styleInput.value,
      bio: bioInput.value.trim(),
      logoBase64: currentLogoBase64
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profileData));
      message.textContent = "Profile saved locally to your browser!";
    } catch (err) {
      message.textContent = "Storage limit exceeded. Try a smaller image.";
    }
  });

  // Clear Local Profile
  clearBtn.addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    form.reset();
    currentLogoBase64 = null;
    renderLogo(null);
    updatePreview();
    message.textContent = "Local profile data cleared.";
  });

  // Load Saved Profile on Startup
  function loadSavedProfile() {
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (!rawData) return;

    try {
      const data = JSON.parse(rawData);
      if (data.displayName) nameInput.value = data.displayName;
      if (data.style) styleInput.value = data.style;
      if (data.bio) bioInput.value = data.bio;
      if (data.logoBase64) {
        currentLogoBase64 = data.logoBase64;
        renderLogo(data.logoBase64);
      }
      updatePreview();
      message.textContent = "Loaded saved local profile.";
    } catch (e) {
      console.error("Failed to load local profile", e);
    }
  }

  loadSavedProfile();
});
