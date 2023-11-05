// src/errorHandling/errorHandling.js
import { dom } from '../dom/dom.js';

export function showError(messageKey) {
    dom.errorMessage.textContent = lang[currentLanguage][messageKey];
}

export function clearError() {
    dom.errorMessage.textContent = "";
}
