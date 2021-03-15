/* 
   * Способы обратиться к локал сторидж:
console.log(localStorage.key(currentCategory)); // "todo" (имя ключа)
console.log(localStorage.getItem(localStorage.key(currentCategory))); // [{"task_text"} ... ] (его значение)
   
* 1. Категории дел (на разных вкладках)
* 2. Фильтр по типам заданий (done/undone)
* 3. Невозможность добавления одинаковых заданий
todo 4. Вёрстка:
*    селект
todo    появление скролла
todo    border у вкладок с категориями
todo    да и вообще, задания выглядят уродливо
todo    надпись, когда нет задач

* 5. Переименование категорий
* 6. Уведомление внизу о невозможности удалить категорию
* 7. Больше значений у категорий: дата создания, айди и проч. 
todo 8. Функцию showMessage доработать, чтобы она не выполнялась 
todo 9. Корзина!
todo 10. Лучше onclick или addEventListener?
todo 11. 
todo 12.
*/

const taskInput = document.querySelector('.task-input'),
    addTaskButton = document.querySelector('.add-task-button'),
    container = document.querySelector('.tasks-list'),
    categories = document.querySelector('#categories'),
    category = document.querySelector('.category'),
    todoFilter = document.querySelector('#todo-filter'),
    showAllOption = document.querySelector('#show-all-option'),
    showUncompletedOption = document.querySelector('#show-uncompleted-option'),
    showCompletedOption = document.querySelector('#show-completed-option'),
    niceNoTasks = '<p>Нет задач :(</p>',
    categoryTab = '<button class="category"></button>',
    task = '';

let currentFilter,
    currentCategory,
    localTaskList;
taskInput.value = '';


class Task {
    constructor(taskText, itsCategory, order, taskId = '') {
        this.taskText = taskText;
        this.urgent = false;
        this.done = false;
        this.taskId = taskId;
        this.order = order;
        this.itsCategory = itsCategory;
    }
}

class Category {
    constructor(name, id='', order) {
        this.name = name;
        this.order = order;
        this.id = id;
        this.tasks = [];
    }
}

function setLocalArray() {
    /* Условие При самом первом запуске */
    if (localStorage.length == 0) {
        currentFilter = 'all';
        currentCategory = 0;
        localTaskList = [new Category('Category', 'id', 0)];
        refreshLocalStorage();
        displayTasks(currentFilter, currentCategory);
        return
    }

    currentFilter = JSON.parse(localStorage.getItem('currentFilter'));
    currentCategory = JSON.parse(localStorage.getItem('currentCategory'));
    localTaskList = JSON.parse(localStorage.getItem('categories'));
    setCurrentFilter(currentFilter);
    displayTasks(currentFilter, currentCategory);
}

function refreshLocalStorage() {
    localStorage.setItem('categories', JSON.stringify(localTaskList));
    localStorage.setItem('currentCategory', JSON.stringify(currentCategory));
    localStorage.setItem('currentFilter', JSON.stringify(currentFilter));
}

function addTask() {
    if (taskInput.value === '') return;
    // Проверка на наличие одинаковых задач 
    for (let i = 0; i < localTaskList[currentCategory].tasks.length; i++) {
        if (taskInput.value == localTaskList[currentCategory].tasks[i].taskText) {
            showMessage('Такая задача уже есть!');
            return
        };
    };
    let newTask = new Task(taskInput.value, currentCategory, localTaskList[currentCategory].tasks.length, '');
    localTaskList[currentCategory].tasks.push(newTask);
    refreshLocalStorage();
    if (currentFilter == 'completed') {
        currentFilter = 'uncompleted';
    } 
    displayTasks(currentFilter, currentCategory);
    taskInput.value = '';
    taskInput.focus();
}

function renameCategory() {
    localTaskList[currentCategory].name = document.getElementById("rename-category-input").value;
    document.getElementById("rename-category-input").value = '';
    document.getElementById('rename-category-wrap').classList.add('hidden');
    refreshLocalStorage();
    displayTasks(currentFilter, currentCategory);
}
function test_renameCategory(i) {
    // document.querySelector(`category_${i}`).
}
function displayTasks(currentFilter, currentCategory) {
    // Отрисовка категорий
    let containerContent = '';
    for (i = 0; i < localTaskList.length; i++) {
        containerContent += `<button class="category ${i == currentCategory ? "active" : ""}" id="category_${i}" ${i == currentCategory ? `ondblclick=\"test_renameCategory(${i})\"` : `onclick="changeCategory(${i})"`}>${localTaskList[i].name}</button>
        `;
    }
    containerContent += '<button class="add-category" onclick="addCategory()"><i class="fas fa-plus-circle"></i></button>';
    categories.innerHTML = containerContent;
    // Отрисовка заданий 
    containerContent = '';
    if (localTaskList[currentCategory].tasks.length > 0) {
        if (currentFilter == 'all') {
            for (let i = 0; i < localTaskList[currentCategory].tasks.length; i++) {
               containerContent += `
<div class="task ${localTaskList[currentCategory].tasks[i].urgent ? 'urgent' : '' } ${localTaskList[currentCategory].tasks[i].done ? 'done' : '' }" id="task-${i}">
    <div class="task-text">${localTaskList[currentCategory].tasks[i].taskText}</div>
    <button class="urgent-btn" onclick="taskUrgent(${i})"><i class="fas fa-exclamation-triangle"></i></button>
    <button class="done-btn" onclick="taskDone(${i})"><i class="fas fa-check"></i></button>
    <button class="delete-btn" onclick="taskDelete(${i})"><i class="fas fa-trash-alt"></i></button>
</div>
               `;
            }
        }
        if (currentFilter == 'uncompleted') {
            for (let i = 0; i < localTaskList[currentCategory].tasks.length; i++) {
                if (localTaskList[currentCategory].tasks[i].done == false) {
                    containerContent += `
<div class="task ${localTaskList[currentCategory].tasks[i].urgent ? 'urgent' : '' } ${localTaskList[currentCategory].tasks[i].done ? 'done' : '' }" id="task-${i}">
    <div class="task-text">${localTaskList[currentCategory].tasks[i].taskText}</div>
    <button class="urgent-btn" onclick="taskUrgent(${i})"><i class="fas fa-exclamation-triangle"></i></button>
    <button class="done-btn" onclick="taskDone(${i})"><i class="fas fa-check"></i></button>
    <button class="delete-btn" onclick="taskDelete(${i})"><i class="fas fa-trash-alt"></i></button>
</div>
                    `;
                } else {
                    continue;
                }
            }
        }
    } else {
        containerContent = niceNoTasks;
    }
    container.innerHTML = containerContent;
}

function taskUrgent(i) {
    if (localTaskList[currentCategory].tasks[i].done) return; // если задача выполнена, то её важность поменять нельзя
    
    if (localTaskList[currentCategory].tasks[i].urgent) { // если уже urgent, то надо поменять это
        localTaskList[currentCategory].tasks[i].urgent = false;
        document.querySelector(`#task-${i}`).classList.remove('urgent');
    } else {
        localTaskList[currentCategory].tasks[i].urgent = true;
        document.querySelector(`#task-${i}`).classList.add('urgent');
    }
    refreshLocalStorage();
}

function taskDone(i) {
    if (localTaskList[currentCategory].tasks[i].done) { // если done = true
        localTaskList[currentCategory].tasks[i].done = false;
        document.querySelector(`#task-${i}`).classList.remove('done');
    } else {
        localTaskList[currentCategory].tasks[i].done = true;
        document.querySelector(`#task-${i}`).classList.add('done');
    }

    document.querySelector(`#task-${i}`).addEventListener('transitionend', function(){
        refreshLocalStorage();
        displayTasks(currentFilter, currentCategory);
    });
}

function clearAll() {
    localStorage.clear();
    location.reload();
}

function taskDelete(i) {
    localTaskList[currentCategory].tasks.splice(i, 1);
    refreshLocalStorage();
    document.querySelector(`#task-${i}`).classList.add('fall');
    document.querySelector(`#task-${i}`).addEventListener('transitionend', function(){
        displayTasks(currentFilter, currentCategory);
    });
}

function addSomeTasks() {
    let tempArr = [ "A", "B", "C", "D"];
    for (let i = 0; i < tempArr.length; i++) {
        localTaskList[currentCategory].tasks.push(new Task(`${tempArr[i]} (${currentCategory})`, currentCategory, localTaskList[currentCategory].tasks.length, ''));
    }
    refreshLocalStorage();
    displayTasks(currentFilter, currentCategory);
}

function addCategory() {
    if (localTaskList.length == 5) {
        showMessage('Не до хуя ли категорий?');
        return
    }
    currentCategory = localTaskList.length;
    localTaskList.push(new Category(`New category`, `айдишечка`, localTaskList.length));
    refreshCategoryOrders(localTaskList);
    refreshLocalStorage();
    displayTasks(currentFilter, currentCategory);
}

function removeCategory() {
    if (localTaskList.length == 1) {
        showMessage('Это единственная категория. Её нельзя удалить');
        return
    }
    localTaskList.splice(currentCategory, 1);
    if (currentCategory > 0) {
        currentCategory -= 1;
    }
    refreshCategoryOrders(localTaskList);
    refreshLocalStorage();
    displayTasks(currentFilter, currentCategory);
}

function refreshCategoryOrders(localTaskList) {
    for (i = 0; i < localTaskList.length; i++) {
        localTaskList[i].order = i;
    }
};

function changeCategory(i) {
    currentCategory = i;
    taskInput.focus();
    refreshLocalStorage();
    displayTasks(currentFilter, currentCategory);
}

function showRenameInterface() {
    document.getElementById('rename-category-wrap').classList.remove('hidden');
    document.getElementById("rename-category-input").focus();
}
function hideRenameInterface() {
    document.getElementById('rename-category-wrap').classList.add('hidden');
}

//? возможно тут недостаточно кавычек
function setCurrentFilter(filter) {
    currentFilter = filter;
    for (let item of document.getElementsByTagName("option")) {
        item.removeAttribute("selected");
    }
    document.querySelector(`option[value=${filter}]`).setAttribute('selected', 'selected');
}

function showMessage(messageText) {
    let message = document.querySelector('.message');
    message.innerHTML = messageText;
    // message.classList.remove("hidden");
    message.classList.add("appear");
    console.log('Начало');
    setTimeout(function() {
        console.log('Прошло время');
        message.classList.add("disappear");
            message.addEventListener('transitionend', function() {
            message.classList.remove("appear");
            message.classList.remove("disappear");
            message.classList.add("hidden");
        });
    }, 2000);


}

/* ========== EVENT LISTENERS ========== */

// Filter
todoFilter.addEventListener('change', (event) => {
    setCurrentFilter(event.target.value);
    refreshLocalStorage();
    displayTasks(currentFilter, currentCategory);
});

// Нажатие enter в input
taskInput.addEventListener('keydown', (event) => {
    if (event.code == 'Enter' || event.code == 'NumpadEnter') {
      addTask();
    }
    taskInput.focus();
});

document.getElementById('rename-category-input').addEventListener('keydown', (event) => {
    if (event.code == 'Enter' || event.code == 'NumpadEnter') {
        renameCategory();
    }
});

// При загрузке страницы:
setLocalArray();

// let bugTracker = document.querySelector('#bug-tracker');
// setInterval(function() {
//     bugTracker.innerHTML = `<pre style="white-space: pre-wrap;">
//     категория сейчас: ${currentCategory}
//     фильтр сейчас: ${currentFilter}
//     длина лок.листа: &nbsp;&nbsp;${localTaskList.length}
//     длина текущей категории: ${localTaskList[currentCategory].tasks.length}
    
//     </pre>`
// }, 1000);