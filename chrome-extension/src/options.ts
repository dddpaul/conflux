import { ExtensionSettings } from "./types";
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from "./settings";

const headingStyleEl = document.getElementById("headingStyle") as HTMLSelectElement;
const bulletListMarkerEl = document.getElementById("bulletListMarker") as HTMLSelectElement;
const codeBlockStyleEl = document.getElementById("codeBlockStyle") as HTMLSelectElement;
const brHandlingEl = document.getElementById("brHandling") as HTMLSelectElement;
const macroPanelsEl = document.getElementById("macro-panels") as HTMLInputElement;
const macroExpandEl = document.getElementById("macro-expand") as HTMLInputElement;
const macroTocEl = document.getElementById("macro-toc") as HTMLInputElement;
const macroStatusEl = document.getElementById("macro-status") as HTMLInputElement;
const form = document.getElementById("options-form") as HTMLFormElement;
const resetBtn = document.getElementById("reset-btn") as HTMLButtonElement;
const saveStatus = document.getElementById("save-status") as HTMLElement;

function applyToForm(settings: ExtensionSettings): void {
  headingStyleEl.value = settings.headingStyle;
  bulletListMarkerEl.value = settings.bulletListMarker;
  codeBlockStyleEl.value = settings.codeBlockStyle;
  brHandlingEl.value = settings.brHandling;
  macroPanelsEl.checked = settings.macros.panels;
  macroExpandEl.checked = settings.macros.expand;
  macroTocEl.checked = settings.macros.toc;
  macroStatusEl.checked = settings.macros.status;
}

function readFromForm(): ExtensionSettings {
  return {
    headingStyle: headingStyleEl.value as ExtensionSettings["headingStyle"],
    bulletListMarker: bulletListMarkerEl.value as ExtensionSettings["bulletListMarker"],
    codeBlockStyle: codeBlockStyleEl.value as ExtensionSettings["codeBlockStyle"],
    brHandling: brHandlingEl.value as ExtensionSettings["brHandling"],
    macros: {
      panels: macroPanelsEl.checked,
      expand: macroExpandEl.checked,
      toc: macroTocEl.checked,
      status: macroStatusEl.checked,
    },
  };
}

function showSaved(): void {
  saveStatus.textContent = "Settings saved.";
  setTimeout(() => {
    saveStatus.textContent = "";
  }, 2000);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  await saveSettings(readFromForm());
  showSaved();
});

resetBtn.addEventListener("click", async () => {
  applyToForm(DEFAULT_SETTINGS);
  await saveSettings(DEFAULT_SETTINGS);
  showSaved();
});

loadSettings().then(applyToForm);
