const exportBtn = document.getElementById("export-btn");
const statusDiv = document.getElementById("status");

function setStatus(message: string): void {
  if (statusDiv) {
    statusDiv.textContent = message;
  }
}

exportBtn?.addEventListener("click", () => {
  setStatus("Export not yet implemented.");
});
