"use client";
import React from "react";
import { Button } from "primereact/button";
import { useTheme } from "../../context/ThemeContext";

export default function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="fixed bottom-0 right-0 m-4 z-5">
      <Button
        rounded
        icon={theme === "light" ? "pi pi-moon" : "pi pi-sun"}
        severity={theme === "light" ? "help" : "warning"}
        onClick={toggleTheme}
        tooltip={theme === "light" ? "Dark" : "Light"}
        tooltipOptions={{ position: "right" }}
        aria-label="Toggle Theme"
        className="shadow-4"
        style={{ width: "3rem", height: "3rem" }}
      />
    </div>
  );
}
