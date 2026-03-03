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
            printTable(todos);
            break;
        case 'important':
            printTable(todos.filter(t => t.importance > 0));
            break;
        case 'user':
            if (!arg) break;
            printTable(todos.filter(t => t.user === arg.toLowerCase()));
            break;
        case 'sort':
            printTable(sortTodos(todos, arg));
            break;
        case 'date':
            const filterDate = new Date(arg);
            // Показываем только те, у которых дата валидна и больше заданной
            printTable(todos.filter(t => t.date && t.date >= filterDate));
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


function formatDate(date) {
    if (!date || isNaN(date.getTime())) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function truncate(str, max) {
    if (str.length <= max) return str.padEnd(max);
    return str.slice(0, max - 3) + '...';
}

function printTable(todos) {
    const config = [
        { key: 'importance', max: 1, title: '!' },
        { key: 'user', max: 10, title: 'user' },
        { key: 'date', max: 10, title: 'date' },
        { key: 'comment', max: 50, title: 'comment' }
    ];

    // Вспомогательная функция для получения строкового значения из TODO
    const getVal = (t, key) => {
        switch(key) {
            case 'importance': return t.importance > 0 ? '!' : '';
            case 'user': return t.user || '';
            case 'date': return formatDate(t.date);
            case 'comment': return t.comment || '';
            default: return '';
        }
    };

    // Вычисляем динамическую ширину колонок (по самому длинному значению, но не более max)
    const widths = config.map(col => {
        const lengths = [col.title.length, ...todos.map(t => getVal(t, col.key).length)];
        return Math.min(Math.max(...lengths), col.max);
    });

    // Формируем строку
    const createRow = (dataArray) => {
        return '  ' + dataArray.map((val, i) => truncate(val, widths[i])).join('  |  ') + '  ';
    };

    // Печать заголовка
    const header = createRow(config.map(c => c.title));
    console.log(header);
    console.log('-'.repeat(header.length));

    // Печать строк данных
    todos.forEach(t => {
        const rowData = config.map(col => getVal(t, col.key));
        console.log(createRow(rowData));
    });

    // Печать подвала (опционально, для красоты)
    if (todos.length > 0) console.log('-'.repeat(header.length));
}