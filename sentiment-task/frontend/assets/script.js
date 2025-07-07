document.addEventListener('DOMContentLoaded', () => {
  const taskForm = document.getElementById('task-form');
  const taskInput = document.getElementById('task-input');
  const tasksContainer = document.getElementById('tasks-container');

  // Carregar tarefas
  loadTasks();

  // Adicionar nova tarefa
  taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const text = taskInput.value.trim();
    if (!text) return;

    try {
      const response = await fetch('http://localhost:3001/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      if (response.ok) {
        taskInput.value = '';
        loadTasks();
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  });

  // Carregar tarefas do servidor
  async function loadTasks() {
    try {
      const response = await fetch('http://localhost:3001/tasks');
      const tasks = await response.json();
      renderTasks(tasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  }

  // Renderizar tarefas
  function renderTasks(tasks) {
    tasksContainer.innerHTML = '';
    
    tasks.forEach(task => {
      const taskEl = document.createElement('div');
      taskEl.className = 'task';
      taskEl.setAttribute('data-sentiment', task.sentiment);
      
      taskEl.innerHTML = `
        <div>
          <strong>${task.text}</strong>
          <div>Sentimento: ${translateSentiment(task.sentiment)}</div>
        </div>
        <button class="delete-btn" data-id="${task.id}">✕</button>
      `;
      
      tasksContainer.appendChild(taskEl);
    });

    // Adicionar event listeners para os botões de deletar
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', deleteTask);
    });
  }

  // Deletar tarefa
  async function deleteTask(e) {
    const taskId = e.target.getAttribute('data-id');
    
    try {
      const response = await fetch(`http://localhost:3001/tasks/${taskId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        loadTasks();
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }

  // Traduzir sentimento
  function translateSentiment(sentiment) {
    const translations = {
      'POSITIVE': 'Positivo 😊',
      'NEGATIVE': 'Negativo 😠',
      'NEUTRAL': 'Neutro 😐'
    };
    return translations[sentiment] || sentiment;
  }
});