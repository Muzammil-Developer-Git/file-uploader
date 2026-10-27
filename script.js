
const dropArea = document.getElementById("drop-area");
const fileInput = document.getElementById("file-input");
const message = document.getElementById("message");
const previewSection = document.getElementById("preview-section");
const preview = document.getElementById("preview");
const fileName = document.getElementById("file-name");
const progressBar = document.getElementById("progress-bar");
const progressText = document.getElementById("progress-text");
const uploadBtn = document.getElementById("upload-btn");
const removeBtn = document.getElementById("remove-btn");
const savedSection = document.getElementById("saved-section");
const savedImages = document.getElementById("saved-images");

let selectedFile = null;
let imageData = "";
let uploading = false;

const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
const allowedExtensions = /\.(jpe?g|png|gif)$/i;
const maxFileSize = 5 * 1024 * 1024;

function showMessage(text, type = "") {
  message.textContent = text;
  message.className = type;
}

function selectFile(file) {
  if (!file) return;

  if (
    !allowedTypes.includes(file.type) ||
    !allowedExtensions.test(file.name)
  ) {
    showMessage("Invalid file! Please choose a JPG, PNG, or GIF image.", "error");
    return;
  }

  if (file.size > maxFileSize) {
    showMessage("Image must be 5 MB or smaller.", "error");
    return;
  }

  selectedFile = file;
  uploading = false;
  uploadBtn.disabled = false;
  uploadBtn.textContent = "Upload Image";
  progressBar.style.width = "0%";
  progressText.textContent = "0%";

  const reader = new FileReader();

  reader.onload = function (event) {
    imageData = event.target.result;
    preview.src = imageData;
    fileName.textContent = file.name;
    previewSection.hidden = false;
    showMessage("Image selected successfully!", "success");
  };

  reader.onerror = function () {
    showMessage("Could not read this image. Please try another.", "error");
  };

  reader.readAsDataURL(file);
}

fileInput.addEventListener("change", function () {
  selectFile(fileInput.files[0]);
});

dropArea.addEventListener("dragover", function (event) {
  event.preventDefault();
  dropArea.classList.add("dragging");
});

dropArea.addEventListener("dragleave", function () {
  dropArea.classList.remove("dragging");
});

dropArea.addEventListener("drop", function (event) {
  event.preventDefault();
  dropArea.classList.remove("dragging");
  selectFile(event.dataTransfer.files[0]);
});

uploadBtn.addEventListener("click", function () {
  if (!selectedFile || !imageData || uploading) return;

  uploading = true;
  uploadBtn.disabled = true;
  showMessage("Uploading image...", "");
  let progress = 0;

  function updateProgress() {
    progress += 10;
    progressBar.style.width = progress + "%";
    progressText.textContent = progress + "%";

    if (progress < 100) {
      setTimeout(updateProgress, 150);
    } else {
      saveImage(imageData, selectedFile.name);
      uploading = false;
      uploadBtn.disabled = false;
      showMessage("Upload complete! Progress is simulated.", "success");
    }
  }

  setTimeout(updateProgress, 150);
});

function saveImage(data, name) {
  try {
    const images = JSON.parse(localStorage.getItem("uploadedImages") || "[]");

    images.push({
      name: name,
      data: data
    });

    localStorage.setItem("uploadedImages", JSON.stringify(images));
    renderSavedImages();
  } catch (error) {
    showMessage(
      "Upload finished, but browser storage is full. Try a smaller image or clear saved images.",
      "error"
    );
  }
}

function renderSavedImages() {
  savedImages.replaceChildren();

  let images;

  try {
    images = JSON.parse(localStorage.getItem("uploadedImages") || "[]");
  } catch {
    images = [];
  }

  savedSection.hidden = images.length === 0;

  images.forEach(function (item) {
    const img = document.createElement("img");
    img.src = item.data;
    img.alt = item.name;
    img.title = item.name;
    savedImages.appendChild(img);
  });
}

removeBtn.addEventListener("click", function () {
  selectedFile = null;
  imageData = "";
  uploading = false;
  fileInput.value = "";
  preview.removeAttribute("src");
  previewSection.hidden = true;
  progressBar.style.width = "0%";
  progressText.textContent = "0%";
  uploadBtn.disabled = false;
  showMessage("Selected image removed.", "");
});

renderSavedImages();
