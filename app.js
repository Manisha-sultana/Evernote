import React, { useEffect, useState } from "react";

// NotesApp - Single-file React component using Tailwind CSS
// Default export a React component so it can be dropped into a CRA/Vite project.

// Sample initial notes JSON (this stands in for the static JSON file requirement)
const INITIAL_NOTES_JSON = [
  {
    id: "n1",
    title: "Welcome to Notes",
    description: "This is a sample note. You can edit, delete, or create new notes.",
    category: "Personal",
    createdAt: "2025-11-01T10:00:00.000Z"
  },
  {
    id: "n2",
    title: "Project Ideas",
    description: "Build a notes app with React + Tailwind. Add localStorage.",
    category: "Ideas",
    createdAt: "2025-10-28T14:30:00.000Z"
  },
  {
    id: "n3",
    title: "Shopping",
    description: "Eggs, Milk, Coffee",
    category: "Personal",
    createdAt: "2025-11-05T18:20:00.000Z"
  },
  {
    id: "n4",
    title: "Sprint Planning",
    description: "Prepare backlog and tasks for next sprint.",
    category: "Work",
    createdAt: "2025-11-07T09:00:00.000Z"
  }
];

const LOCAL_STORAGE_KEY = "notes_app_v1_notes";

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString();
}

export default function NotesApp() {
  const [notes, setNotes] = useState([]);
  const [filter, setFilter] = useState("All Notes");
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null); // note object or null
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Load initial notes from static JSON if localStorage empty
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        setNotes(JSON.parse(stored));
      } catch (e) {
        setNotes(INITIAL_NOTES_JSON);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_NOTES_JSON));
      }
    } else {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_NOTES_JSON));
      setNotes(INITIAL_NOTES_JSON);
    }
  }, []);

  // Persist to localStorage whenever notes change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  const categories = ["All Notes", ...Array.from(new Set(notes.map((n) => n.category)))];

  const filteredNotes = notes.filter((n) => filter === "All Notes" || n.category === filter)
    .sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt));

  // Create new note
  function handleCreate(noteData) {
    const newNote = {
      id: uid("n"),
      title: noteData.title || "Untitled",
      description: noteData.description || "",
      category: noteData.category || "Uncategorized",
      createdAt: new Date().toISOString()
    };
    setNotes((prev) => [newNote, ...prev]);
    setCreateOpen(false);
  }

  // Update existing note
  function handleUpdate(id, updated) {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...updated } : n)));
    setEditingNote(null);
  }

  // Delete note
  function handleDelete(id) {
    const note = notes.find((n) => n.id === id);
    if (!note) return;
    const ok = window.confirm(`Delete note "${note.title}"? This action cannot be undone.`);
    if (!ok) return;
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (editingNote && editingNote.id === id) setEditingNote(null);
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-7xl mx-auto p-4">
        <header className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 rounded-md hover:bg-gray-200"
              onClick={() => setSidebarOpen((s) => !s)}
              aria-label="Toggle sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-2xl font-semibold">Notes</h1>
            <p className="text-sm text-gray-500">({notes.length} total)</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="px-3 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700"
              onClick={() => setCreateOpen(true)}
            >
              + New Note
            </button>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="hidden md:block border rounded-md px-2 py-1"
            >
              {categories.map((c) => (
                <option value={c} key={c}>{c}</option>
              ))}
            </select>
          </div>
        </header>

        <div className="flex gap-4">
          {/* Sidebar */}
          <aside className={`bg-white rounded-lg p-3 w-64 md:block ${sidebarOpen ? 'block' : 'hidden md:block'}`}>
            <nav>
              <h3 className="font-medium mb-2">Categories</h3>
              <ul className="flex flex-col gap-1">
                {categories.map((c) => (
                  <li key={c}>
                    <button
                      className={`w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 ${filter === c ? 'bg-indigo-50 border border-indigo-100' : ''}`}
                      onClick={() => { setFilter(c); setSidebarOpen(false); }}
                    >
                      <div className="flex justify-between">
                        <span>{c}</span>
                        {c !== 'All Notes' && <span className="text-sm text-gray-400">{notes.filter(n=>n.category===c).length}</span>}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>

              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-600">Quick actions</h4>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => { localStorage.removeItem(LOCAL_STORAGE_KEY); localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_NOTES_JSON)); setNotes(INITIAL_NOTES_JSON); setFilter('All Notes'); }}
                    className="px-2 py-1 border rounded-md text-sm"
                  >Reset</button>
                  <button
                    onClick={() => { navigator.clipboard?.writeText(JSON.stringify(notes, null, 2)); alert('Notes copied to clipboard'); }}
                    className="px-2 py-1 border rounded-md text-sm"
                  >Export</button>
                </div>
              </div>
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1">
            {filteredNotes.length === 0 ? (
              <div className="bg-white rounded-lg p-6 text-center">
                <h2 className="text-lg font-medium mb-2">No notes found</h2>
                <p className="text-sm text-gray-500">Try creating a note or change the category filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredNotes.map((note) => (
                  <article key={note.id} className="bg-white rounded-lg p-4 shadow hover:shadow-md transition cursor-pointer flex flex-col">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h3 className="font-semibold text-lg">{note.title}</h3>
                        <p className="text-xs text-gray-500">{note.category} • {formatDate(note.createdAt)}</p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          title="Edit"
                          onClick={(e) => { e.stopPropagation(); setEditingNote(note); }}
                          className="p-1 rounded hover:bg-gray-100"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M17.414 2.586a2 2 0 010 2.828L7.828 15H4v-3.828L14.586 2.586a2 2 0 012.828 0z" />
                          </svg>
                        </button>
                        <button
                          title="Delete"
                          onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }}
                          className="p-1 rounded hover:bg-red-50 text-red-600"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H2.5A1.5 1.5 0 001 5.5V6a1 1 0 001 1h12a1 1 0 001-1v-.5A1.5 1.5 0 0016.5 4H15V3a1 1 0 00-1-1H6zM4 7v8.5A1.5 1.5 0 005.5 17h9a1.5 1.5 0 001.5-1.5V7H4z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <p className="mt-3 text-gray-700 flex-1">{note.description || <span className="text-gray-400">(No description)</span>}</p>

                    <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                      <span>{note.description?.length ? `${note.description.length} chars` : ''}</span>
                      <button
                        onClick={() => setEditingNote(note)}
                        className="text-xs px-2 py-1 border rounded"
                      >Open</button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </main>
        </div>

        {/* Create Modal */}
        {isCreateOpen && (
          <NoteModal
            title="Create Note"
            onClose={() => setCreateOpen(false)}
            onSubmit={(data) => handleCreate(data)}
          />
        )}

        {/* Edit Modal */}
        {editingNote && (
          <NoteModal
            title="Edit Note"
            note={editingNote}
            onClose={() => setEditingNote(null)}
            onSubmit={(data) => handleUpdate(editingNote.id, data)}
            onDelete={() => handleDelete(editingNote.id)}
          />
        )}

        {/* Floating Create button for mobile */}
        <button
          className="fixed bottom-6 right-6 md:hidden bg-indigo-600 text-white p-3 rounded-full shadow-lg"
          onClick={() => setCreateOpen(true)}
          aria-label="Create note"
        >
          +
        </button>
      </div>
    </div>
  );
}

function NoteModal({ title, note = null, onClose, onSubmit, onDelete }) {
  const [form, setForm] = useState({
    title: note?.title || "",
    description: note?.description || "",
    category: note?.category || "Uncategorized"
  });

  useEffect(() => {
    setForm({
      title: note?.title || "",
      description: note?.description || "",
      category: note?.category || "Uncategorized"
    });
  }, [note]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function submit(e) {
    e.preventDefault();
    onSubmit({ ...form });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onClose} />
      <form className="relative bg-white rounded-lg w-full max-w-2xl p-6 shadow-lg z-10" onSubmit={submit}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <div className="flex gap-2 items-center">
            {note && (
              <button type="button" onClick={() => { if (onDelete) onDelete(); }} className="px-2 py-1 rounded text-red-600 border">Delete</button>
            )}
            <button type="button" onClick={onClose} className="px-2 py-1 rounded border">Close</button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Title"
            className="w-full border rounded px-3 py-2"
          />

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={6}
            placeholder="Write your note here..."
            className="w-full border rounded px-3 py-2"
          />

          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="Category (e.g. Work, Personal, Ideas)"
            className="w-full border rounded px-3 py-2"
          />

          <div className="flex items-center justify-end gap-2 mt-2">
            <button type="button" onClick={onClose} className="px-3 py-2 rounded border">Cancel</button>
            <button type="submit" className="px-3 py-2 rounded bg-indigo-600 text-white">Save</button>
          </div>
        </div>
      </form>
    </div>
  );
}


