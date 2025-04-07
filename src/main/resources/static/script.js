const form = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const API_URL = "http://localhost:8080/api/tasks"; // URL do back-end

// Carregar tarefas ao iniciar
document.addEventListener("DOMContentLoaded", fetchTasks);

// Evento de envio do formulário principal (criar tarefa)
form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();

  if (!title) {
    alert("O título da tarefa é obrigatório.");
    return;
  }

  const task = {
    title,
    description,
    completed: false,
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
    });

    if (!response.ok) {
      throw new Error("Erro ao criar tarefa");
    }

    const createdTask = await response.json();
    addTaskToUI(createdTask);
    form.reset();
  } catch (error) {
    console.error("Erro:", error);
    alert("Falha ao adicionar tarefa. Verifique o console para mais detalhes.");
  }
});

// Buscar todas as tarefas do back-end
async function fetchTasks() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("Erro ao buscar tarefas");
    }
    const tasks = await response.json();
    tasks.forEach((task) => addTaskToUI(task));
  } catch (error) {
    console.error("Erro:", error);
    alert("Falha ao carregar tarefas. Verifique o console.");
  }
}

// Adicionar tarefa à interface
function addTaskToUI(task) {
  const li = document.createElement("li");
  li.className =
    "flex justify-between items-start bg-gray-50 border border-gray-200 rounded-lg p-4 shadow transition hover:shadow-md";
  li.dataset.id = task.id;

  const taskContent = document.createElement("div");
  taskContent.className = "flex-1";
  taskContent.innerHTML = `
    <h2 class="text-lg font-semibold ${task.completed ? "line-through text-gray-400" : ""}">${task.title}</h2>
    ${task.description ? `<p class="text-sm text-gray-500">${task.description}</p>` : ""}
  `;

  const actions = document.createElement("div");
  actions.className = "flex flex-col gap-2 ml-4";

  const completeBtn = document.createElement("button");
  completeBtn.innerHTML = "✅";
  completeBtn.title = "Concluir";
  completeBtn.className = "text-green-600 hover:text-green-800 text-xl";
  completeBtn.onclick = () => toggleTaskCompletion(task, taskContent);

  const editBtn = document.createElement("button");
  editBtn.innerHTML = "✏️";
  editBtn.title = "Editar";
  editBtn.className = "text-blue-600 hover:text-blue-800 text-xl";
  editBtn.onclick = () => editTask(task, li, taskContent);

  const deleteBtn = document.createElement("button");
  deleteBtn.innerHTML = "🗑️";
  deleteBtn.title = "Remover";
  deleteBtn.className = "text-red-600 hover:text-red-800 text-xl";
  deleteBtn.onclick = () => deleteTask(task.id, li);

  actions.appendChild(completeBtn);
  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);

  li.appendChild(taskContent);
  li.appendChild(actions);
  taskList.appendChild(li);
}

// Alternar status de conclusão da tarefa
async function toggleTaskCompletion(task, taskContent) {
  task.completed = !task.completed;

  try {
    const response = await fetch(`${API_URL}/${task.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
    });

    if (!response.ok) {
      throw new Error("Erro ao atualizar tarefa");
    }

    taskContent.querySelector("h2").classList.toggle("line-through");
    taskContent.querySelector("h2").classList.toggle("text-gray-400");
  } catch (error) {
    console.error("Erro:", error);
    alert("Falha ao atualizar tarefa.");
    task.completed = !task.completed; // Reverter em caso de erro
  }
}

// Editar tarefa
function editTask(task, li, taskContent) {
  // Substituir o conteúdo atual por um formulário de edição
  const editForm = document.createElement("form");
  editForm.className = "flex flex-col gap-2 w-full";

  const titleInput = document.createElement("input");
  titleInput.type = "text";
  titleInput.value = task.title;
  titleInput.className =
    "px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400";
  titleInput.required = true;

  const descInput = document.createElement("input");
  descInput.type = "text";
  descInput.value = task.description || "";
  descInput.className =
    "px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400";

  const saveBtn = document.createElement("button");
  saveBtn.type = "submit";
  saveBtn.innerHTML = "Salvar";
  saveBtn.className =
    "bg-blue-600 text-white px-2 py-1 rounded-md hover:bg-blue-700 transition";

  editForm.appendChild(titleInput);
  editForm.appendChild(descInput);
  editForm.appendChild(saveBtn);

  // Substituir o conteúdo da tarefa pelo formulário
  li.replaceChild(editForm, taskContent);

  // Evento de envio do formulário de edição
  editForm.onsubmit = async (e) => {
    e.preventDefault();

    const updatedTask = {
      ...task,
      title: titleInput.value.trim(),
      description: descInput.value.trim(),
    };

    try {
      const response = await fetch(`${API_URL}/${task.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTask),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar tarefa");
      }

      const returnedTask = await response.json();
      task.title = returnedTask.title;
      task.description = returnedTask.description;

      // Atualizar a UI
      taskContent.innerHTML = `
        <h2 class="text-lg font-semibold ${task.completed ? "line-through text-gray-400" : ""}">${task.title}</h2>
        ${task.description ? `<p class="text-sm text-gray-500">${task.description}</p>` : ""}
      `;
      li.replaceChild(taskContent, editForm);
    } catch (error) {
      console.error("Erro:", error);
      alert("Falha ao salvar alterações.");
      li.replaceChild(taskContent, editForm); // Reverter em caso de erro
    }
  };
}

// Deletar tarefa
async function deleteTask(taskId, li) {
  try {
    const response = await fetch(`${API_URL}/${taskId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Erro ao deletar tarefa");
    }

    li.remove();
  } catch (error) {
    console.error("Erro:", error);
    alert("Falha ao deletar tarefa.");
  }
}