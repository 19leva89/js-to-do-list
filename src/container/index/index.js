export class Todo {
	static #block = null;
	static #template = null;
	static #input = null;
	static #button = null;
	static taskCounter = 0; // Додана змінна для підрахунку завдань
	static #list = []; // Масив для зберігання завдань

	static generateUniqueId() {
		return Math.floor(1000 + Math.random() * 9000);
	}

	static init = () => {
		this.#block = document.querySelector('.task__list');
		this.#template = document.getElementById('task').content.firstElementChild;
		this.#input = document.querySelector('.form__input');
		this.#button = document.querySelector('.form__button');

		this.#button.addEventListener('click', this.addTask);

		this.#input.addEventListener('keyup', (event) => {
			if (event.key === 'Enter') {
				this.addTask();
			}
		});

		// Отримуємо завдання з локального сховища та відображаємо їх
		this.loadTasksFromLocalStorage();

		// Оновлюємо стилі на основі LocalStorage
		this.updateTaskStylesFromLocalStorage();

		// Додайте код для створення empty-list-message та додавання його до DOM
		this.createEmptyListMessage();

		// Викликаємо метод для перевірки, чи список порожній
		this.toggleEmptyListMessage(true);
	}

	static createEmptyListMessage() {
		const emptyListMessage = document.createElement('div');
		emptyListMessage.className = 'empty-list-message';
		emptyListMessage.textContent = 'Список задач пустий';

		// Отримуємо батьківський елемент <main class="task__list">
		const taskList = document.querySelector('.task__list');

		// Додаємо emptyListMessage до батьківського елемента taskList
		taskList.appendChild(emptyListMessage);
	}

	static addTask = () => {
		const taskText = this.#input.value;

		if (taskText) {
			const uniqueId = this.generateUniqueId();
			const newTask = { id: uniqueId, text: taskText, completed: false };

			// Додамо завдання до масиву
			this.#list.push(newTask);

			// Зберігаємо оновлений масив в локальному сховищі
			this.saveTasksToLocalStorage();

			const clone = document.importNode(this.#template, true);
			this.taskCounter++;
			clone.querySelector('.task__number').textContent = this.taskCounter + '.';
			clone.querySelector('.task__text').textContent = taskText;
			clone.querySelector('.task__button--do').addEventListener('click', this.completeTask);
			clone.querySelector('.task__button--cancel').addEventListener('click', this.deleteTask);
			clone.dataset.id = uniqueId; // Зберігаємо ID у власності 'data-id'

			this.#block.appendChild(clone);
			this.#input.value = '';

			this.toggleEmptyListMessage(); // Оновлюємо відображення фрази "Список задач пустий"
		}
	}

	static completeTask = (event) => {
		const task = event.target.closest('.task');
		const taskId = task.dataset.id;
		const taskToUpdate = this.#list.find(task => task.id === parseInt(taskId));

		if (taskToUpdate) {
			const doButton = task.querySelector('.task__button--do');
			const doneButton = task.querySelector('.task__button--done');
			const taskNumber = task.querySelector('.task__number');
			const taskTextElement = task.querySelector('.task__text');

			if (task.classList.contains('done')) {
				task.classList.remove('done');
				taskNumber.classList.remove('task__number--done');
				taskTextElement.classList.remove('task__text--done');
				if (doneButton) {
					doneButton.classList.remove('task__button--done');
					doneButton.classList.add('task__button--do');
				}

				// Оновлюємо статус завдання в LocalStorage
				taskToUpdate.completed = false;
			} else {
				task.classList.add('done');
				taskNumber.classList.add('task__number--done');
				taskTextElement.classList.add('task__text--done');
				if (doButton) {
					doButton.classList.remove('task__button--do');
					doButton.classList.add('task__button--done');
				}

				// Оновлюємо статус завдання в LocalStorage
				taskToUpdate.completed = true;
			}

			// Викликаємо метод для оновлення LocalStorage
			this.updateLocalStorage();
		}
	}

	static deleteTask = (event) => {
		const task = event.target.closest('.task');
		const taskId = task.dataset.id;
		const taskText = task.querySelector('.task__text').textContent;

		if (confirm(`Видалити задачу "${taskText}"?`)) {
			const taskIndex = this.#list.findIndex(task => task.id === parseInt(taskId));

			if (taskIndex !== -1) {
				this.#list.splice(taskIndex, 1);
				this.updateLocalStorage();
				task.remove();
				this.updateTaskNumbers();
				this.toggleEmptyListMessage();
			}
		}
	}

	static saveTasksToLocalStorage() {
		localStorage.setItem('tasks', JSON.stringify(this.#list));
	}

	static loadTasksFromLocalStorage() {
		const tasks = JSON.parse(localStorage.getItem('tasks')) || [];

		// Очищаємо список завдань перед завантаженням нових
		this.#block.innerHTML = '';

		// Встановлюємо taskCounter на відповідне значення
		this.taskCounter = tasks.length;

		// Відображаємо завдання з локального сховища
		tasks.forEach((task, index) => {
			const clone = document.importNode(this.#template, true);
			clone.querySelector('.task__number').textContent = (index + 1) + '.';
			clone.querySelector('.task__text').textContent = task.text;
			clone.querySelector('.task__button--do').addEventListener('click', this.completeTask);
			clone.querySelector('.task__button--cancel').addEventListener('click', this.deleteTask);
			clone.dataset.id = task.id; // Завантажуємо ID із локального сховища

			if (task.completed) {
				clone.classList.add('done');
				clone.querySelector('.task__number').classList.add('task__number--done');
				clone.querySelector('.task__text').classList.add('task__text--done');
				const doButton = clone.querySelector('.task__button');
				if (doButton) {
					doButton.classList.remove('task__button--do');
					doButton.classList.add('task__button--done');
				}
			}

			this.#block.appendChild(clone);

			this.#list.push({ id: task.id, text: task.text, completed: task.completed });
		});

		// Після завантаження завдань перевіряємо, чи список порожній та відображаємо відповідне повідомлення
		this.toggleEmptyListMessage();
	}

	static updateTaskNumbers() {
		const tasks = this.#block.querySelectorAll('.task');
		this.taskCounter = 0;
		tasks.forEach((task, index) => {
			this.taskCounter++;
			task.querySelector('.task__number').textContent = this.taskCounter + '.';
		});
	}

	static updateLocalStorage() {
		localStorage.setItem('tasks', JSON.stringify(this.#list));
	}

	static updateTaskStylesFromLocalStorage() {
		// Отримати завдання з LocalStorage
		const savedTasks = JSON.parse(localStorage.getItem('tasks'));

		if (savedTasks) {
			savedTasks.forEach((taskData) => {
				this.#block.querySelectorAll('.task__text').forEach((taskTextElement) => {
					if (taskTextElement.textContent === taskData.text) {
						const task = taskTextElement.closest('.task');
						const taskNumber = task.querySelector('.task__number');
						const doneButton = task.querySelector('.task__button--done');

						if (taskData.completed) {
							task.classList.add('done');
							taskNumber.classList.add('task__number--done');
							taskTextElement.classList.add('task__text--done');

							if (doneButton) {
								doneButton.classList.add('task__button--done');
							}
						} else {
							task.classList.remove('done');
							taskNumber.classList.remove('task__number--done');
							taskTextElement.classList.remove('task__text--done');

							if (doneButton) {
								doneButton.classList.remove('task__button--done');
							}
						}
					}
				});
			});
		}
	}

	static toggleEmptyListMessage() {
		const emptyListMessage = document.querySelector('.empty-list-message');

		// Перевіряємо, чи список порожній за допомогою перевірки на унікальні ідентифікатори
		if (emptyListMessage) {
			const isListEmpty = this.#list.every(task => !task.id);
			emptyListMessage.style.display = isListEmpty ? 'block' : 'none';
		}
	}

	static renderTasks = () => {
		// В цьому методі можна додати код для відображення завдань, які можуть бути збережені в пам'яті або отримані з сервера.
	}
}

Todo.init();
