document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    const form = document.getElementById('schedule-form');
    const resultContainer = document.getElementById('schedule-container');

    attachFormHandlers(form);
    attachChangeHandlers(['days', 'maxClasses', 'language']);
    loadSavedState(resultContainer);
}

function attachFormHandlers(form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        generateSchedule();
    });
}

function attachChangeHandlers(ids) {
    ids.forEach(id => {
        document.getElementById(id).addEventListener('change', saveParameters);
    });
}

function generateSchedule() {
    const { days, maxClasses, language } = getScheduleParameters();
    const daysSelected = getDaysSelected(language);
    const selectedDays = daysSelected.slice(0, days);

    const scheduleHtml = createScheduleHtml(selectedDays, maxClasses);
    updateScheduleContainer(scheduleHtml);
    addCellHandlers();

    loadTasks();
    saveParameters();
}

function getScheduleParameters() {
    return {
        days: parseInt(document.getElementById('days').value),
        maxClasses: parseInt(document.getElementById('maxClasses').value),
        language: document.getElementById('language').value,
    };
}

function getDaysSelected(language) {
    return language === 'en'
        ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        : ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
}

function createScheduleHtml(selectedDays, maxClasses) {
    let html = '<table class="schedule-table"><thead><tr><th>Class/Day</th>';
    html += selectedDays.map(day => `<th>${day}</th>`).join('');
    html += '</tr></thead><tbody>';

    for (let i = 1; i <= maxClasses; i++) {
        html += `<tr><td>Class ${i}</td>`;
        html += selectedDays.map((_, j) =>
            `<td class="schedule-cell" data-day="${j}" data-class="${i - 1}"></td>`
        ).join('');
        html += '</tr>';
    }
    html += '</tbody></table>';
    return html;
}

function updateScheduleContainer(html) {
    const resultContainer = document.getElementById('schedule-container');
    resultContainer.innerHTML = html;
}

function addCellHandlers() {
    document.querySelectorAll('.schedule-cell').forEach(cell => {
        cell.addEventListener('click', createTask);
    });
}

function createTask(e) {
    const cell = e.target.closest('.schedule-cell');
    if (!cell || cell.querySelector('.task')) return;

    const taskElement = createTaskElement();
    cell.appendChild(taskElement);
    attachTaskHandlers(taskElement, cell);
}

function createTaskElement() {
    const task = document.createElement('div');
    task.className = 'task';
    task.innerHTML = `
        <textarea maxlength="100" placeholder="Че делаем?"></textarea>
        <button class="check-btn">✓</button>
        <button class="delete-btn">×</button>
    `;
    return task;
}

function attachTaskHandlers(task, cell) {
    const textarea = task.querySelector('textarea');
    const checkBtn = task.querySelector('.check-btn');
    const deleteBtn = task.querySelector('.delete-btn');

    textarea.focus();
    textarea.addEventListener('input', saveTasks);

    checkBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        task.classList.toggle('completed');
        saveTasks();
    });

    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        cell.removeChild(task);
        saveTasks();
    });
}

function saveParameters() {
    const params = getScheduleParameters();
    localStorage.setItem('scheduleParams', JSON.stringify(params));
}

function saveTasks() {
    const tasks = {};
    document.querySelectorAll('.schedule-cell').forEach(cell => {
        const task = cell.querySelector('.task');
        if (task) {
            const { day, classNum } = cell.dataset;
            const taskText = task.querySelector('textarea').value;
            const isCompleted = task.classList.contains('completed');
            tasks[`${day}-${classNum}`] = { text: taskText, completed: isCompleted };
        }
    });
    localStorage.setItem('scheduleTasks', JSON.stringify(tasks));
}

function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('scheduleTasks')) || {};
    Object.entries(tasks).forEach(([key, { text, completed }]) => {
        const [day, classNum] = key.split('-');
        const cell = document.querySelector(`.schedule-cell[data-day="${day}"][data-class="${classNum}"]`);
        if (cell) {
            const taskElement = createTaskElement();
            const textarea = taskElement.querySelector('textarea');
            textarea.value = text;

            if (completed) {
                taskElement.classList.add('completed');
            }

            cell.appendChild(taskElement);
            attachTaskHandlers(taskElement, cell);
        }
    });
}

function loadSavedState(container) {
    const params = JSON.parse(localStorage.getItem('scheduleParams'));
    if (params) {
        document.getElementById('days').value = params.days;
        document.getElementById('maxClasses').value = params.maxClasses;
        document.getElementById('language').value = params.language;
    }
    generateSchedule(container);
}
