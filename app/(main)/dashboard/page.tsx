"use client";
import React, { useState, useEffect } from "react";
import { Chart } from "primereact/chart";
import { Menu } from "primereact/menu";
import { Button } from "primereact/button";

export default function Dashboard() {
  const [lineOptions, setLineOptions] = useState({});
  const [lineData, setLineData] = useState({});
  const [pieOptions, setPieOptions] = useState({});
  const [pieData, setPieData] = useState({});
  const menuRef = React.useRef<Menu>(null);

  useEffect(() => {
    initCharts();
  }, []);

  const initCharts = () => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue("--text-color");
    const textColorSecondary = documentStyle.getPropertyValue(
      "--text-color-secondary"
    );
    const surfaceBorder = documentStyle.getPropertyValue("--surface-border");

    // 1. Traffic Overview (Line Chart)
    setLineData({
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [
        {
          label: "Total Traffic",
          data: [650, 590, 800, 810, 960, 1100, 1200],
          fill: false,
          borderColor: documentStyle.getPropertyValue("--blue-500"),
          tension: 0.0,
        },
        {
          label: "Conversions",
          data: [28, 48, 40, 79, 86, 100, 140],
          fill: false,
          borderColor: documentStyle.getPropertyValue("--green-500"),
          tension: 0.0,
        },
      ],
    });

    setLineOptions({
      maintainAspectRatio: false,
      aspectRatio: 0.0,
      plugins: {
        legend: { labels: { color: textColor } },
      },
      scales: {
        x: {
          ticks: { color: textColorSecondary },
          grid: { color: surfaceBorder },
        },
        y: {
          ticks: { color: textColorSecondary },
          grid: { color: surfaceBorder },
        },
      },
    });

    // 2. Experiment Status (Pie Chart)
    setPieData({
      labels: ["Active", "Draft", "Paused"],
      datasets: [
        {
          data: [2, 1, 1],
          backgroundColor: [
            documentStyle.getPropertyValue("--green-400"),
            documentStyle.getPropertyValue("--yellow-400"),
            documentStyle.getPropertyValue("--gray-400"),
          ],
          hoverBackgroundColor: [
            documentStyle.getPropertyValue("--green-500"),
            documentStyle.getPropertyValue("--yellow-500"),
            documentStyle.getPropertyValue("--gray-500"),
          ],
        },
      ],
    });

    setPieOptions({
      plugins: {
        legend: {
          labels: {
            usePointStyle: true,
            color: textColor,
          },
        },
      },
    });
  };

  // Mock Menu Items
  const menuItems = [
    { label: "Refresh Data", icon: "pi pi-refresh" },
    { label: "Export Report", icon: "pi pi-file-export" },
  ];

  return (
    // Wrapper with overflow-x-hidden prevents horizontal scrollbars caused by grid negative margins
    <div className="w-full p-3 overflow-x-hidden">
      <div className="grid p-fluid">
        {/* ----------------- TOP STATS CARDS ----------------- */}
        <div className="col-12 md:col-6 lg:col-3 border-round-lg">
          <div className="surface-card shadow-2 p-3 border-1 border-50 border-round-lg h-full">
            <div className="flex justify-content-between mb-3">
              <div>
                <span className="block text-500 font-medium mb-3">
                  Active Experiments
                </span>
                <div className="text-900 font-medium text-xl">0</div>
              </div>
              <div
                className="flex align-items-center justify-content-center bg-blue-100 border-round-lg"
                style={{ width: "2.5rem", height: "2.5rem" }}
              >
                <i className="pi pi-chart-line text-blue-500 text-xl" />
              </div>
            </div>
            <span className="text-green-500 font-medium">0</span>
            <span className="text-500">since last week</span>
          </div>
        </div>

        <div className="col-12 md:col-6 lg:col-3">
          <div className="surface-card shadow-2 p-3 border-1 border-50 border-round-lg h-full">
            <div className="flex justify-content-between mb-3">
              <div>
                <span className="block text-500 font-medium mb-3">
                  Total Users
                </span>
                <div className="text-900 font-medium text-xl">0</div>
              </div>
              <div
                className="flex align-items-center justify-content-center bg-orange-100 border-round-lg"
                style={{ width: "2.5rem", height: "2.5rem" }}
              >
                <i className="pi pi-users text-orange-500 text-xl" />
              </div>
            </div>
            <span className="text-green-500 font-medium">%0.0 </span>
            <span className="text-500">increase</span>
          </div>
        </div>

        <div className="col-12 md:col-6 lg:col-3">
          <div className="surface-card shadow-2 p-3 border-1 border-50 border-round-lg h-full">
            <div className="flex justify-content-between mb-3">
              <div>
                <span className="block text-500 font-medium mb-3">
                  Conversion Rate
                </span>
                <div className="text-900 font-medium text-xl">0.0%</div>
              </div>
              <div
                className="flex align-items-center justify-content-center bg-cyan-100 border-round-lg"
                style={{ width: "2.5rem", height: "2.5rem" }}
              >
                <i className="pi pi-percentage text-cyan-500 text-xl" />
              </div>
            </div>
            <span className="text-green-500 font-medium">0.0% </span>
            <span className="text-500">uplift today</span>
          </div>
        </div>

        <div className="col-12 md:col-6 lg:col-3">
          <div className="surface-card shadow-2 p-3 border-1 border-50 border-round-lg h-full">
            <div className="flex justify-content-between mb-3">
              <div>
                <span className="block text-500 font-medium mb-3">
                  Pending Drafts
                </span>
                <div className="text-900 font-medium text-xl">0</div>
              </div>
              <div
                className="flex align-items-center justify-content-center bg-purple-100 border-round-lg"
                style={{ width: "2.5rem", height: "2.5rem" }}
              >
                <i className="pi pi-file-edit text-purple-500 text-xl" />
              </div>
            </div>
            <span className="text-500">Waiting for approval</span>
          </div>
        </div>

        {/* ----------------- CHARTS ROW ----------------- */}
        <div className="col-12 xl:col-6">
          <div className="surface-card shadow-2 border-round-lg p-4 h-full">
            <div className="flex justify-content-between align-items-center mb-5">
              <h5>Traffic vs Conversions</h5>
              <div>
                <Menu model={menuItems} popup ref={menuRef} id="popup_menu" />
                <Button
                  icon="pi pi-ellipsis-v"
                  className="p-button-text p-button-plain p-button-rounded"
                  onClick={(event) => menuRef.current?.toggle(event)}
                  aria-controls="popup_menu"
                  aria-haspopup
                />
              </div>
            </div>
            <Chart type="line" data={lineData} options={lineOptions} />
          </div>
        </div>

        <div className="col-12 xl:col-6">
          <div className="surface-card shadow-2 border-round-lg p-4 h-full">
            <div className="flex align-items-center justify-content-between mb-5">
              <h5>Experiment Status</h5>
            </div>
            <div className="flex justify-content-center">
              <Chart
                type="doughnut"
                data={pieData}
                options={pieOptions}
                style={{ position: "relative", width: "0%" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
