document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('schedule-form');
    const resultContainer = document.getElementById('schedule-result');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        generateSchedule();
    });

    loadSavedState();

    ['days', 'maxClasses', 'language'].forEach(id => {
        document.getElementById(id).addEventListener('change', saveParameters);
    });

    function generateSchedule() {
        const days = parseInt(document.getElementById('days').value);
        const maxClasses = parseInt(document.getElementById('maxClasses').value);
        const language = document.getElementById('language').value;

        const daysOfWeek = language === 'en'
            ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
            : ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];

        const selectedDays = daysOfWeek.slice(0, days);

        let scheduleHtml = '<table class="schedule-table"><thead><tr><th>Class/Day</th>';

        selectedDays.forEach(day => {
            scheduleHtml += `<th>${day}</th>`;
        });
        scheduleHtml += '</tr></thead><tbody>';

        for (let i = 1; i <= maxClasses; i++) {
            scheduleHtml += `<tr><td>Class ${i}</td>`;
            for (let j = 0; j < days; j++) {
                scheduleHtml += `<td class="schedule-cell" data-day="${j}" data-class="${i - 1}"></td>`;
            }
            scheduleHtml += '</tr>';
        }
        scheduleHtml += '</tbody></table>';

        resultContainer.innerHTML = scheduleHtml;

        document.querySelectorAll('.schedule-cell').forEach(cell => {
            cell.addEventListener('click', createTask);
        });

        loadTasks();

        saveParameters();
    }


    function createTask(e) {
        const cell = e.target.closest('.schedule-cell');
        if (cell.querySelector('.task')) return;

        const task = document.createElement('div');
        task.className = 'task';
        task.innerHTML = `
            <textarea maxlength="100" placeholder="Че делаем?"></textarea>
            <button class="check-btn">✓</button>
            <button class="delete-btn">×</button>
        `;

        cell.appendChild(task);

        const textarea = task.querySelector('textarea');
        textarea.focus();
        textarea.addEventListener('input', saveTasks);

        task.querySelector('.check-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            task.classList.toggle('completed');
            saveTasks();
        });

        task.querySelector('.delete-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            cell.removeChild(task);
            saveTasks();
        });
    }

    function saveParameters() {
        const params = {
            days: document.getElementById('days').value,
            maxClasses: document.getElementById('maxClasses').value,
            language: document.getElementById('language').value
        };
        localStorage.setItem('scheduleParams', JSON.stringify(params));
    }

    function saveTasks() {
        const tasks = {};
        document.querySelectorAll('.schedule-cell').forEach(cell => {
            const day = cell.dataset.day;
            const classNum = cell.dataset.class;
            const taskElement = cell.querySelector('.task');
            if (taskElement) {
                const taskText = taskElement.querySelector('textarea').value;
                const isCompleted = taskElement.classList.contains('completed');
                tasks[`${day}-${classNum}`] = { text: taskText, completed: isCompleted };
            }
        });
        localStorage.setItem('scheduleTasks', JSON.stringify(tasks));
    }

    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem('scheduleTasks'));
        if (tasks) {
            Object.entries(tasks).forEach(([key, task]) => {
                const [day, classNum] = key.split('-');
                const cell = document.querySelector(`.schedule-cell[data-day="${day}"][data-class="${classNum}"]`);
                if (cell) {
                    const taskElement = document.createElement('div');
                    taskElement.className = 'task';
                    if (task.completed) taskElement.classList.add('completed');
                    taskElement.innerHTML = `
                        <textarea maxlength="100">${task.text}</textarea>
                        <button class="check-btn">✓</button>
                        <button class="delete-btn">×</button>
                    `;
                    cell.appendChild(taskElement);

                    taskElement.querySelector('textarea').addEventListener('input', saveTasks);
                    taskElement.querySelector('.check-btn').addEventListener('click', (e) => {
                        e.stopPropagation();
                        taskElement.classList.toggle('completed');
                        saveTasks();
                    });
                    taskElement.querySelector('.delete-btn').addEventListener('click', (e) => {
                        e.stopPropagation();
                        cell.removeChild(taskElement);
                        saveTasks();
                    });
                }
            });
        }
    }

    function loadSavedState() {
        const params = JSON.parse(localStorage.getItem('scheduleParams'));
        if (params) {
            document.getElementById('days').value = params.days;
            document.getElementById('maxClasses').value = params.maxClasses;
            document.getElementById('language').value = params.language;
        }
        generateSchedule();
    }
});
