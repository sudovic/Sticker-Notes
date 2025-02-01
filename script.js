document.addEventListener("DOMContentLoaded", () => {
  const notesContainer = document.getElementById("notes-container");
  const addNoteButton = document.getElementById("add-note");
  const searchInput = document.getElementById("search");

  // Função para criar uma nova nota
  function createNote(text = "", x = window.innerWidth / 2 - 125, y = window.innerHeight / 2 - 75) {
    const note = document.createElement("div");
    note.className = "note";
    note.style.left = x + "px";
    note.style.top = y + "px";
    note.style.backgroundColor = getRandomColor();

    // Animação ao criar nota
    note.style.opacity = 0;
    note.style.transform = "scale(0.9)";
    setTimeout(() => {
      note.style.opacity = 1;
      note.style.transform = "scale(1)";
    }, 10);

    const noteHeader = document.createElement("div");
    noteHeader.classList.add("note-header");

    // Container do color picker
    const colorPickerContainer = document.createElement("div");
    colorPickerContainer.classList.add("color-picker-container");

    // Ícone de cor
    const colorIcon = document.createElement("div");
    colorIcon.classList.add("color-icon");
    colorIcon.style.backgroundColor = note.style.backgroundColor;

    // Input de cor (hidden)
    const colorPicker = document.createElement("input");
    colorPicker.type = "color";
    colorPicker.classList.add("color-picker-hidden");
    colorPicker.value = note.style.backgroundColor;

    // Ao clicar no ícone, abrir o color picker
    colorIcon.addEventListener("click", () => colorPicker.click());

    // Atualizar a cor da nota e do ícone
    colorPicker.addEventListener("input", (e) => {
      note.style.backgroundColor = e.target.value;
      colorIcon.style.backgroundColor = e.target.value;
      saveAllNotes();
    });

    colorPickerContainer.appendChild(colorIcon);
    colorPickerContainer.appendChild(colorPicker);

    // Botão de deletar
    const deleteButton = document.createElement("button");
    deleteButton.innerHTML = "×";
    deleteButton.classList.add("delete-button");
    deleteButton.addEventListener("click", () => deleteNote(note));

    noteHeader.appendChild(colorPickerContainer);
    noteHeader.appendChild(deleteButton);

    // Conteúdo da nota
    const noteContent = document.createElement("div");
    noteContent.classList.add("note-content");
    noteContent.contentEditable = true;
    noteContent.innerHTML = text || "Clique para editar...";
    noteContent.addEventListener("input", () => saveAllNotes());

    // Tags da nota
    const noteTags = document.createElement("div");
    noteTags.classList.add("note-tags");
    noteTags.innerHTML = 'Tags: <input type="text" class="tag-input">';
    const tagInput = noteTags.querySelector(".tag-input");
    tagInput.addEventListener("input", () => saveAllNotes());

    note.appendChild(noteHeader);
    note.appendChild(noteContent);
    note.appendChild(noteTags);

    makeDraggable(note);
    notesContainer.appendChild(note);
    saveAllNotes();
  }

  // Função para gerar cores aleatórias
  function getRandomColor() {
    const colors = ["#ffdddd", "#ddffdd", "#ddddff", "#ffffcc", "#ffccff"];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // Função para tornar as notas arrastáveis
  function makeDraggable(element) {
    let isDragging = false;
    let offsetX, offsetY;
    const header = element.querySelector(".note-header");

    // Adicionar cursor move apenas ao header
    header.style.cursor = "move";

    header.addEventListener("mousedown", (e) => {
      if (e.target.tagName.toLowerCase() === "input" || e.target.classList.contains("delete-button")) return;
      isDragging = true;
      offsetX = e.clientX - element.getBoundingClientRect().left;
      offsetY = e.clientY - element.getBoundingClientRect().top;
    });

    document.addEventListener("mousemove", (e) => {
      if (isDragging) {
        let newX = e.clientX - offsetX;
        let newY = e.clientY - offsetY;

        // Limitar movimento dentro da tela
        newX = Math.max(0, Math.min(newX, window.innerWidth - element.offsetWidth));
        newY = Math.max(0, Math.min(newY, window.innerHeight - element.offsetHeight));

        element.style.left = `${newX}px`;
        element.style.top = `${newY}px`;
      }
    });

    document.addEventListener("mouseup", () => {
      if (isDragging) {
        isDragging = false;
        saveAllNotes();
      }
    });
  }

  // Função para excluir uma nota
  function deleteNote(noteElement) {
    const confirmDelete = confirm("Tem certeza que deseja excluir esta nota?");
    if (confirmDelete) {
      noteElement.style.opacity = 0;
      noteElement.style.transform = "scale(0.9)";
      setTimeout(() => noteElement.remove(), 300);
      saveAllNotes();
    }
  }

  // Função para salvar todas as notas no localStorage
  function saveAllNotes() {
    const allNotes = Array.from(document.querySelectorAll(".note")).map((noteEl) => ({
      text: noteEl.querySelector(".note-content").innerHTML,
      x: parseInt(noteEl.style.left),
      y: parseInt(noteEl.style.top),
      color: noteEl.style.backgroundColor,
      tags: noteEl.querySelector(".tag-input").value,
    }));

    localStorage.setItem("sticky-notes", JSON.stringify(allNotes));
  }

  // Função para carregar notas do localStorage
  function initializeNotes() {
    const savedNotes = JSON.parse(localStorage.getItem("sticky-notes") || "[]");
    savedNotes.forEach((noteData) => {
      createNote(noteData.text, noteData.x, noteData.y);
      const lastNote = document.querySelector(".note:last-child");
      if (noteData.color) lastNote.style.backgroundColor = noteData.color;
      if (noteData.tags) lastNote.querySelector(".tag-input").value = noteData.tags;
    });
  }

  // Evento para adicionar nova nota
  addNoteButton.addEventListener("click", () => createNote());

  // Evento para pesquisar notas
  searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value.toLowerCase();
    const notes = document.querySelectorAll(".note");

    notes.forEach((note) => {
      const tags = note.querySelector(".tag-input").value.toLowerCase();
      const content = note.querySelector(".note-content").textContent.toLowerCase();
      if (tags.includes(searchTerm) || content.includes(searchTerm)) {
        note.style.display = "block";
      } else {
        note.style.display = "none";
      }
    });
  });

  // Inicializar notas ao carregar a página
  initializeNotes();
});
