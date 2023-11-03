export class Todo {
	static #block = null;
	static #template = null;
	static #input = null;
	static #button = null;
	static taskCounter = 0; // Додана змінна для підрахунку завдань
	static #list = []; // Масив для зберігання завдань

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

		this.toggleEmptyListMessage(true); // Відображаємо фразу про порожній список при ініціалізації
	}

	static addTask = () => {
		const taskText = this.#input.value;
		if (taskText) {
			// Додамо завдання до масиву
			this.#list.push({ text: taskText, completed: false });

			// Зберігаємо оновлений масив в локальному сховищі
			this.saveTasksToLocalStorage();

			const clone = document.importNode(this.#template, true);
			this.taskCounter++;
			clone.querySelector('.task__number').textContent = this.taskCounter + '.';
			clone.querySelector('.task__text').textContent = taskText;
			clone.querySelector('.task__button--do').addEventListener('click', this.completeTask);
			clone.querySelector('.task__button--cancel').addEventListener('click', this.deleteTask);
			this.#block.appendChild(clone);
			this.#input.value = '';

			this.toggleEmptyListMessage(); // Оновлюємо відображення фрази "Список задач пустий"
		}
	}

	static saveTasksToLocalStorage() {
		localStorage.setItem('tasks', JSON.stringify(this.#list));
	}

	static updateLocalStorage() {
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

			this.#list.push({ text: task.text, completed: task.completed });
		});
	}


	static toggleEmptyListMessage() {
		const emptyListMessage = document.querySelector('.empty-list-message');

		// Використовуємо this.#list.length === 0, щоб перевірити, чи список порожній
		if (emptyListMessage) {
			emptyListMessage.style.display = this.#list.length === 0 ? 'block' : 'none';
		}
	}

	static completeTask = (event) => {
		const task = event.target.closest('.task');
		const taskText = task.querySelector('.task__text').textContent;

		// Знайдемо завдання у масиві #list за текстом
		const taskToUpdate = this.#list.find(task => task.text === taskText);

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
		const taskText = task.querySelector('.task__text').textContent;

		// Використовуємо confirm для підтвердження видалення
		if (confirm(`Видалити задачу "${taskText}"?`)) {
			task.remove();

			// Знаходимо індекс видаленої задачі в масиві
			const index = this.#list.findIndex(item => item.text === taskText);

			if (index !== -1) {
				// Видаляємо задачу з масиву
				this.#list.splice(index, 1);

				// Оновлюємо дані в LocalStorage, видаливши видалену задачу
				this.updateLocalStorage();
			}

			this.updateTaskNumbers();

			// Перевіряємо, чи список порожній і відображаємо фразу "Список задач пустий"
			this.toggleEmptyListMessage();
		}
	}

	static updateTaskNumbers() {
		const tasks = this.#block.querySelectorAll('.task');
		this.taskCounter = 0;
		tasks.forEach((task, index) => {
			this.taskCounter++;
			task.querySelector('.task__number').textContent = this.taskCounter + '.';
		});
	}

	static renderTasks = () => {
		// В цьому методі можна додати код для відображення завдань, які можуть бути збережені в пам'яті або отримані з сервера.
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





}

Todo.init();
