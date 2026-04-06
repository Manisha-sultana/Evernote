import React, { useEffect, useState } from "react";

// NotesApp - Single-file React component (moved into src)

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
  const [editingNote, setEditingNote] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  const categories = ["All Notes", ...Array.from(new Set(notes.map((n) => n.category)))];

  const filteredNotes = notes.filter((n) => filter === "All Notes" || n.category === filter)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

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

  function handleUpdate(id, updated) {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...updated } : n)));
    setEditingNote(null);
  }

  function handleDelete(id) {
    const note = notes.find((n) => n.id === id);
    if (!note) return;
    const ok = window.confirm(`Delete note "${note.title}"? This action cannot be undone.`);
    if (!ok) return;
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (editingNote && editingNote.id === id) setEditingNote(null);
  }

  return (
    <div style={ { minHeight: '100vh', background: 'linear-gradient(90deg, #ff6b6b 0%, #ffffff 15%, #ffffff 85%, #c441e2 100%)', color: '#111827' } }>
      <div style={ { maxWidth: 1100, margin: '0 auto', padding: 16 } }>
        <header style={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, background: 'rgba(255,255,255,0.95)', padding: '12px 16px', borderRadius: 12, backdropFilter: 'blur(10px)' } }>
          <div style={ { display: 'flex', alignItems: 'center', gap: 12 } }>
            <h1 style={ { fontSize: 22, fontWeight: 600 } }>Notes</h1>
            <p style={ { color: '#6b7280' } }>{ notes.length } total</p>
          </div>

          <div style={ { display: 'flex', alignItems: 'center', gap: 8 } }>
            <button onClick={ () => setCreateOpen(true) } style={ { padding: '8px 12px', background: '#4f46e5', color: '#fff', borderRadius: 6 } }>+ New Note</button>
            <select value={ filter } onChange={ (e) => setFilter(e.target.value) } style={ { display: 'none' } }>
              { categories.map((c) => <option key={ c } value={ c }>{ c }</option>) }
            </select>
          </div>
        </header>

        <div style={ { display: 'flex', gap: 16 } }>
          <aside style={ { background: 'rgba(255,255,255,0.98)', borderRadius: 12, padding: 16, width: 260, border: '3px solid #4f46e5', boxShadow: '0 8px 20px rgba(0,0,0,0.15)' } }>
            <h3 style={ { fontWeight: 700, marginBottom: 16, color: '#1f2937', fontSize: 18, paddingBottom: '8px', borderBottom: '2px solid #4f46e5' } }>📑 Categories</h3>
            <ul style={ { listStyle: 'none', padding: 0, margin: 0 } }>
              { categories.map((c) => (
                <li key={ c } style={ { marginBottom: 8 } }>
                  <button onClick={ () => { setFilter(c); } } style={ { width: '100%', textAlign: 'left', padding: '12px 14px', borderRadius: 10, background: filter === c ? '#4f46e5' : '#f3f4f6', color: filter === c ? '#fff' : '#1f2937', fontWeight: filter === c ? 700 : 600, fontSize: '15px', border: '2px solid ' + (filter === c ? '#4f46e5' : '#e5e7eb'), cursor: 'pointer', transition: 'all 0.2s', boxShadow: filter === c ? '0 4px 12px rgba(79,70,229,0.3)' : 'none' } }>{ c } { c !== 'All Notes' && <span style={ { float: 'right', fontSize: 13, fontWeight: 'bold', background: filter === c ? 'rgba(255,255,255,0.2)' : '#e5e7eb', padding: '2px 8px', borderRadius: 4 } }>{ notes.filter(n => n.category === c).length }</span> }</button>
                </li>
              )) }
            </ul>
          </aside>

          <main style={ { flex: 1 } }>
            { filteredNotes.length === 0 ? (
              <div style={ { background: 'rgba(255,255,255,0.95)', padding: 24, borderRadius: 12, textAlign: 'center', boxShadow: '0 8px 20px rgba(0,0,0,0.15)' } }>
                <h2 style={ { fontSize: 18, fontWeight: 600 } }>No notes found</h2>
                <p style={ { color: '#6b7280' } }>Try creating a note or change the category filter.</p>
              </div>
            ) : (
              <div style={ { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16 } }>
                { filteredNotes.map((note) => (
                  <article key={ note.id } style={ { background: 'rgba(255,255,255,0.97)', padding: 18, borderRadius: 14, boxShadow: '0 8px 20px rgba(0,0,0,0.15)', transition: 'all 0.3s', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.5)' } } onMouseEnter={ (e) => { e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.2)'; e.currentTarget.style.transform = 'translateY(-4px)'; } } onMouseLeave={ (e) => { e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)'; e.currentTarget.style.transform = 'translateY(0)'; } }>
                    <div style={ { display: 'flex', justifyContent: 'space-between', alignItems: 'start' } }>
                      <div>
                        <h3 style={ { fontWeight: 600 } }>{ note.title }</h3>
                        <p style={ { fontSize: 12, color: '#6b7280' } }>{ note.category } • { formatDate(note.createdAt) }</p>
                      </div>
                      <div style={ { display: 'flex', gap: 6 } }>
                        <button onClick={ () => setEditingNote(note) } title="Edit">✎</button>
                        <button onClick={ () => handleDelete(note.id) } title="Delete" style={ { color: '#dc2626' } }>🗑</button>
                      </div>
                    </div>

                    <p style={ { marginTop: 12, color: '#374151' } }>{ note.description || '(No description)' }</p>

                    <div style={ { marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#6b7280' } }>
                      <span>{ note.description?.length ? `${note.description.length} chars` : '' }</span>
                      <button onClick={ () => setEditingNote(note) } style={ { fontSize: 12, padding: '6px 8px', borderRadius: 6 } }>Open</button>
                    </div>
                  </article>
                )) }
              </div>
            ) }
          </main>
        </div>

        { isCreateOpen && (
          <NoteModal title="Create Note" onClose={ () => setCreateOpen(false) } onSubmit={ (data) => handleCreate(data) } />
        ) }

        { editingNote && (
          <NoteModal title="Edit Note" note={ editingNote } onClose={ () => setEditingNote(null) } onSubmit={ (data) => handleUpdate(editingNote.id, data) } onDelete={ () => handleDelete(editingNote.id) } />
        ) }
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
    <div style={ { position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 } }>
      <div style={ { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' } } onClick={ onClose } />
      <form onSubmit={ submit } style={ { position: 'relative', background: '#fff', borderRadius: 8, width: '100%', maxWidth: 720, padding: 18, zIndex: 60 } }>
        <div style={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 } }>
          <h2 style={ { fontSize: 18, fontWeight: 600 } }>{ title }</h2>
          <div style={ { display: 'flex', gap: 8 } }>
            { note && <button type="button" onClick={ () => { if (onDelete) onDelete(); } } style={ { padding: '6px 8px', borderRadius: 6, color: '#dc2626' } }>Delete</button> }
            <button type="button" onClick={ onClose } style={ { padding: '6px 8px', borderRadius: 6 } }>Close</button>
          </div>
        </div>

        <div style={ { display: 'grid', gap: 10 } }>
          <input name="title" value={ form.title } onChange={ handleChange } placeholder="Title" style={ { width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e5e7eb' } } />
          <textarea name="description" value={ form.description } onChange={ handleChange } rows={ 6 } placeholder="Write your note here..." style={ { width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e5e7eb' } } />
          <input name="category" value={ form.category } onChange={ handleChange } placeholder="Category (e.g. Work, Personal, Ideas)" style={ { width: '100%', padding: 8, borderRadius: 6, border: '1px solid #e5e7eb' } } />

          <div style={ { display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 6 } }>
            <button type="button" onClick={ onClose } style={ { padding: '8px 10px', borderRadius: 6 } }>Cancel</button>
            <button type="submit" style={ { padding: '8px 10px', borderRadius: 6, background: '#4f46e5', color: '#fff' } }>Save</button>
          </div>
        </div>
      </form>
    </div>
  );
}