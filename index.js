const { getAllFilePathsWithExtension, readFile } = require('./fileSystem');
const { readLine } = require('./console');

const files = getFiles();

console.log('Please, write your command!');
readLine(processCommand);

function getFiles() {
    const filePaths = getAllFilePathsWithExtension(process.cwd(), 'js');
    return filePaths.map(path => readFile(path));
}

function processCommand(command) {
    const [action, ...args] = command.split(' ');
    const arg = args.join(' ');
    const todos = getAllTodos().map(parseTodo);

    switch (action) {
        case 'exit':
            process.exit(0);
            break;
        case 'show':
            todos.forEach(t => console.log(t.raw));
            break;
        case 'important':
            todos
                .filter(t => t.importance > 0)
                .forEach(t => console.log(t.raw));
            break;
        case 'user':
            if (!arg) break;
            todos
                .filter(t => t.user === arg.toLowerCase())
                .forEach(t => console.log(t.raw));
            break;
        case 'sort':
            sortTodos(todos, arg).forEach(t => console.log(t.raw));
            break;
        default:
            console.log('wrong command');
            break;
    }
}

function getAllTodos() {
    const todos = [];
    const todoRegex = /\/\/ TODO.*/g;

    for (const fileContent of files) {
        const matches = fileContent.match(todoRegex);
        if (matches) {
            todos.push(...matches);
        }
    }
    return todos;
}

function parseTodo(rawStr) {
    const content = rawStr.replace('// TODO ', '');
    const parts = content.split(';').map(p => p.trim());
    const isFullFormat = parts.length === 3;

    return {
        raw: rawStr,
        user: isFullFormat ? parts[0].toLowerCase() : null,
        date: isFullFormat ? new Date(parts[1]) : null,
        importance: (rawStr.match(/!/g) || []).length,
        comment: isFullFormat ? parts[2] : content
    };
}

function sortTodos(todos, type) {
    const result = [...todos];
    switch (type) {
        case 'importance':
            return result.sort((a, b) => b.importance - a.importance);
        case 'user':
            return result.sort((a, b) => {
                const nameA = a.user || '{'; 
                const nameB = b.user || '{';
                return nameA.localeCompare(nameB);
            });
        case 'date':
            return result.sort((a, b) => {
                const dateA = a.date || 0;
                const dateB = b.date || 0;
                return dateB - dateA;
            });
        default:
            return result;
    }
}
