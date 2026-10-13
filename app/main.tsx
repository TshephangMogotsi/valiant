import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Home from "./page";
import { DigitalCards } from "./digital-cards";
import "./globals.css";

const cardPaths = ["/card", "/cards"];
const showDigitalCards = cardPaths.some(
  (path) => window.location.pathname === path || window.location.pathname.startsWith(`${path}/`),
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {showDigitalCards ? <DigitalCards /> : <Home />}
  </StrictMode>,
);
