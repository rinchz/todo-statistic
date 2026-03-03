const {getAllFilePathsWithExtension, readFile} = require('./fileSystem');
const {readLine} = require('./console');

const files = getFiles();

console.log('Please, write your command!');
readLine(processCommand);

function getFiles() {
    const filePaths = getAllFilePathsWithExtension(process.cwd(), 'js');
    return filePaths.map(path => readFile(path));
}

function processCommand(command) {
    switch (command) {
        case 'exit':
            process.exit(0);
            break;
        case 'show':
            // Пункт 2: Получаем и выводим все TODO
            const todos = getAllTodos();
            todos.forEach(todo => console.log(todo));
            break;
        default:
            console.log('wrong command');
            break;
    }
}

// Функция для поиска всех TODO в файлах
function getAllTodos() {
    const todos = [];
    const todoRegex = /\/\/ TODO.*/g; // Регулярное выражение для поиска // TODO и всего текста после него

    for (const fileContent of files) {
        const matches = fileContent.match(todoRegex);
        if (matches) {
            todos.push(...matches);
        }
    }
    return todos;
}