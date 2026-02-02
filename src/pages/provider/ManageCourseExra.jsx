import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axio";
import ProviderDashboardLayout from "./layouts/ProviderDashboardLayout";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../App.css";

export default function ManageCourseExtras() {
  const { courseId } = useParams();

  const [noteTitle, setNoteTitle] = useState("");
  const [noteFiles, setNoteFiles] = useState([]);
  const [isDraggingNote, setIsDraggingNote] = useState(false);
  const [notes, setNotes] = useState([]);

  const [announcement, setAnnouncement] = useState({
    title: "",
    body: "",
    files: [],
  });
  const [isDraggingAnn, setIsDraggingAnn] = useState(false);
  const [announcements, setAnnouncements] = useState([]);

  const [tool, setTool] = useState({ name: "", description: "", link: "" });
  const [tools, setTools] = useState([]);

  const loadExtras = async () => {
    try {
      const [noteRes, annRes, toolRes] = await Promise.all([
        api.get(`/courses/${courseId}/notes`),
        api.get(`/courses/${courseId}/announcements`),
        api.get(`/courses/${courseId}/tools`),
      ]);
      setNotes(noteRes.data);
      setAnnouncements(annRes.data);
      setTools(toolRes.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load course extras!");
    }
  };

  useEffect(() => {
    loadExtras();
  }, []);

  // --- SINGLE SUBMIT ALL ---
  const submitAll = async () => {
    // Validate inputs
    if (!noteTitle || noteFiles.length === 0)
      return toast.warning("Jaza kichwa na uweke notes!");
    if (!announcement.title || !announcement.body)
      return toast.warning("Jaza kichwa na body ya announcement!");
    if (!tool.name || !tool.link)
      return toast.warning("Jaza Tool name na link!");

    const form = new FormData();
    // Notes
    form.append("note_title", noteTitle);
    noteFiles.forEach((file) => form.append("note_files[]", file));
    // Announcement
    form.append("announcement_title", announcement.title);
    form.append("announcement_body", announcement.body);
    announcement.files.forEach((file) =>
      form.append("announcement_files[]", file),
    );
    // Tool
    form.append("tool_name", tool.name);
    form.append("tool_link", tool.link);
    form.append("tool_description", tool.description);

    try {
      await api.post(`/courses/${courseId}/submit-all`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Reset all states
      setNoteTitle("");
      setNoteFiles([]);
      setAnnouncement({ title: "", body: "", files: [] });
      setTool({ name: "", description: "", link: "" });
      loadExtras();
      toast.success("All items submitted successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit all items!");
    }
  };

  return (
    <ProviderDashboardLayout title="Manage Course Materials">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="container mt-4">
        {/* NOTES */}
        <h3 className="h5 mb-3">📚 Upload Notes</h3>
        <div className="card p-3 mb-4 shadow-sm border-0 bg-light">
          <input
            type="text"
            className="form-control form-control-sm mb-2"
            placeholder="Note title"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
          />
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingNote(true);
            }}
            onDragLeave={() => setIsDraggingNote(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDraggingNote(false);
              setNoteFiles(Array.from(e.dataTransfer.files));
            }}
            onClick={() => document.getElementById("noteInput").click()}
            className={`p-2 mb-2 border rounded text-center small ${isDraggingNote ? "bg-white border-primary" : "border-secondary"}`}
            style={{ borderStyle: "dashed", cursor: "pointer" }}
          >
            {noteFiles.length > 0
              ? `✅ ${noteFiles.length} notes selected`
              : "Drag notes or click"}
            <input
              id="noteInput"
              type="file"
              hidden
              multiple
              onChange={(e) => setNoteFiles(Array.from(e.target.files))}
            />
          </div>
        </div>

        {/* ANNOUNCEMENTS */}
        <h3 className="h5 mb-3">📢 Add Announcement</h3>
        <div className="card p-3 mb-4 shadow-sm border-0 bg-light">
          <input
            className="form-control form-control-sm mb-2"
            placeholder="Announcement Title"
            value={announcement.title}
            onChange={(e) =>
              setAnnouncement({ ...announcement, title: e.target.value })
            }
          />
          <textarea
            className="form-control form-control-sm mb-2"
            placeholder="Message body..."
            value={announcement.body}
            onChange={(e) =>
              setAnnouncement({ ...announcement, body: e.target.value })
            }
          />
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingAnn(true);
            }}
            onDragLeave={() => setIsDraggingAnn(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDraggingAnn(false);
              setAnnouncement({
                ...announcement,
                files: Array.from(e.dataTransfer.files),
              });
            }}
            onClick={() => document.getElementById("annInput").click()}
            className={`p-2 mb-2 border rounded text-center small ${isDraggingAnn ? "bg-white border-primary" : "border-secondary"}`}
            style={{ borderStyle: "dashed", cursor: "pointer" }}
          >
            {announcement.files.length > 0
              ? `📎 ${announcement.files.length} attachment(s)`
              : "Attach files to announcement"}
            <input
              id="annInput"
              type="file"
              hidden
              multiple
              onChange={(e) =>
                setAnnouncement({
                  ...announcement,
                  files: Array.from(e.target.files),
                })
              }
            />
          </div>
        </div>

        {/* TOOLS */}
        <h3 className="h5 mb-3">🧰 Tools</h3>
        <div className="d-flex gap-2 mb-3">
          <input
            className="form-control form-control-sm"
            placeholder="Tool Name"
            value={tool.name}
            onChange={(e) => setTool({ ...tool, name: e.target.value })}
          />
          <input
            className="form-control form-control-sm"
            placeholder="Link"
            value={tool.link}
            onChange={(e) => setTool({ ...tool, link: e.target.value })}
          />
          <input
            className="form-control form-control-sm"
            placeholder="Description"
            value={tool.description}
            onChange={(e) => setTool({ ...tool, description: e.target.value })}
          />
        </div>

        {/* SINGLE SUBMIT BUTTON */}
        <button
          className="btn btn-primary btn-sm mb-4"
          style={{ width: "fit-content" }}
          onClick={submitAll}
        >
          Submit All
        </button>

        {/* LIST NOTES & ANNOUNCEMENTS */}
        <div className="row">
          <div className="col-md-6">
            <h6 className="fw-bold">Current Notes</h6>
            <ul className="list-group mb-4 small">
              {notes.map((n) => (
                <li
                  key={n.id}
                  className="list-group-item d-flex justify-content-between p-2"
                >
                  {n.title}
                </li>
              ))}
            </ul>
          </div>
          <div className="col-md-6">
            <h6 className="fw-bold">Recent Announcements</h6>
            <ul className="list-group mb-4 small">
              {announcements.map((a) => (
                <li
                  key={a.id}
                  className="list-group-item d-flex justify-content-between p-2"
                >
                  <strong>{a.title}</strong>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </ProviderDashboardLayout>
  );
}
