import { createDotsApp } from "./dots/app.js";

document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("field");
    const strategyButtons = Array.from(document.querySelectorAll(".strategy-button"));
    const rightPanel = document.querySelector("[data-dots-right-panel]");

    if (!canvas || !rightPanel || strategyButtons.length === 0) {
        return;
    }

    const app = createDotsApp({
        canvas,
        strategyButtons,
        rightPanel,
    });

    app.start();
});