document.addEventListener('DOMContentLoaded', () => {
    const sectionForm = document.getElementById('section-form');
    const sectionInput = document.getElementById('section-input');
    const sectionsContainer = document.getElementById('sections-container');
    const searchBar = document.getElementById('search-bar');
    const filterOptions = document.getElementById('filter-options');

    // Load sections and tasks from localStorage on page load
    loadSectionsFromStorage();

    // Event delegation for dynamically added tasks and sections
    sectionsContainer.addEventListener('click', handleTaskSectionEvents);

    // Add new section on form submission
    sectionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (sectionInput.value.trim() === '') {
            alert('Section name cannot be empty');
            return;
        }
        addSection(sectionInput.value);
        sectionInput.value = '';
        saveSectionsToStorage();
    });

    // Filtering tasks on input and dropdown change
    searchBar.addEventListener('input', filterTasks);
    filterOptions.addEventListener('change', filterTasks);

    function addSection(name, tasks = []) {
        const section = document.createElement('section');
        section.classList.add('section');
        section.innerHTML = `
            <h2>${name}</h2>
            <form class="task-form" aria-label="Add new task">
                <input type="text" class="task-input" placeholder="Add a new task" required>
                <input type="date" class="task-due-date" aria-label="Due date">
                <select class="task-priority" aria-label="Priority level">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </select>
                <button type="submit">Add Task</button>
            </form>
            <div class="tasks-container"></div>
            <button class="delete-section">Delete Section</button>
        `;
        sectionsContainer.appendChild(section);

        const tasksContainer = section.querySelector('.tasks-container');
        tasks.forEach(task => {
            addTaskToDOM(task.name, task.dueDate, task.priority, task.completed, tasksContainer);
        });

        saveSectionsToStorage();
    }

    function handleTaskSectionEvents(e) {
        const target = e.target;

        if (target.matches('.task-form button')) {
            e.preventDefault();
            const form = target.closest('.task-form');
            addTask(form);
            saveSectionsToStorage();
        }

        if (target.matches('.delete-section')) {
            const section = target.closest('.section');
            if (window.confirm('Are you sure you want to delete this section?')) {
                section.remove();
                saveSectionsToStorage();
            }
        }

        if (target.matches('.task-complete')) {
            const task = target.closest('.task');
            task.classList.toggle('completed');
            saveSectionsToStorage();
        }

        if (target.matches('.edit-task')) {
            const task = target.closest('.task');
            editTask(task);
            saveSectionsToStorage();
        }

        if (target.matches('.delete-task')) {
            target.closest('.task').remove();
            saveSectionsToStorage();
        }
    }

    function addTask(form) {
        const taskInput = form.querySelector('.task-input');
        const dueDateInput = form.querySelector('.task-due-date');
        const priorityInput = form.querySelector('.task-priority');
        const tasksContainer = form.nextElementSibling;

        if (taskInput.value.trim() === '') {
            alert('Task name cannot be empty');
            return;
        }

        addTaskToDOM(taskInput.value, dueDateInput.value, priorityInput.value, false, tasksContainer);

        // Reset form inputs
        taskInput.value = '';
        dueDateInput.value = '';
        priorityInput.value = 'low';
    }

    function addTaskToDOM(taskName, taskDueDate, taskPriority, completed, tasksContainer) {
        const task = document.createElement('div');
        task.classList.add('task');
        if (completed) task.classList.add('completed');
        task.innerHTML = `
            <input type="checkbox" class="task-complete" aria-label="Mark task complete" ${completed ? 'checked' : ''}>
            <span class="task-name">${taskName}</span>
            <span class="task-due-date">${taskDueDate}</span>
            <span class="task-priority">${taskPriority}</span>
            <button class="edit-task">Edit</button>
            <button class="delete-task">Delete</button>
        `;
        tasksContainer.appendChild(task);
    }

    function editTask(task) {
        const taskName = task.querySelector('.task-name');
        const newTaskName = prompt('Edit task name:', taskName.textContent);
        if (newTaskName) {
            taskName.textContent = newTaskName;
        }
    }

    function filterTasks() {
        const searchTerm = searchBar.value.toLowerCase();
        const filterOption = filterOptions.value;
        const tasks = document.querySelectorAll('.task');

        tasks.forEach(task => {
            const taskName = task.querySelector('.task-name').textContent.toLowerCase();
            const taskPriority = task.querySelector('.task-priority').textContent.toLowerCase();
            const isCompleted = task.classList.contains('completed');

            let matchesSearch = taskName.includes(searchTerm);
            let matchesFilter = (filterOption === 'all') ||
                                (filterOption === 'completed' && isCompleted) ||
                                (filterOption === `${taskPriority}-priority`);

            if (matchesSearch && matchesFilter) {
                task.style.display = '';
            } else {
                task.style.display = 'none';
            }
        });
    }

    // Save sections and tasks to localStorage
    function saveSectionsToStorage() {
        const sections = [];
        document.querySelectorAll('.section').forEach(section => {
            const sectionName = section.querySelector('h2').textContent;
            const tasks = [];
            section.querySelectorAll('.task').forEach(task => {
                tasks.push({
                    name: task.querySelector('.task-name').textContent,
                    dueDate: task.querySelector('.task-due-date').textContent,
                    priority: task.querySelector('.task-priority').textContent,
                    completed: task.classList.contains('completed')
                });
            });
            sections.push({ name: sectionName, tasks });
        });
        localStorage.setItem('sections', JSON.stringify(sections));
    }

    // Load sections and tasks from localStorage
    function loadSectionsFromStorage() {
        const savedSections = JSON.parse(localStorage.getItem('sections')) || [];
        savedSections.forEach(section => addSection(section.name, section.tasks));
    }
});
