import { useState } from "react";
import "./Tabs.css";

export default function ProgramTabs() {
  const [activeTab, setActiveTab] = useState("about");

  return (
    <div className="tabs-container">
      {/* Tabs Header */}
      <div className="tabs-header">
        <button
          className={activeTab === "about" ? "tab active" : "tab"}
          onClick={() => setActiveTab("about")}
        >
          About
        </button>
        <button
          className={activeTab === "outcomes" ? "tab active" : "tab"}
          onClick={() => setActiveTab("outcomes")}
        >
          Outcomes
        </button>
        <button
          className={activeTab === "courses" ? "tab active" : "tab"}
          onClick={() => setActiveTab("courses")}
        >
          Courses
        </button>
      </div>

      <hr />

      {/* Tabs Content */}
      <div className="tabs-content">
        {activeTab === "about" && <AboutTab />}
        {activeTab === "outcomes" && <OutcomesTab />}
        {activeTab === "courses" && <CoursesTab />}
      </div>
    </div>
  );
}
