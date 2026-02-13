const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const os = require('os');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Настройка статических файлов
app.use(express.static(path.join(__dirname, 'public')));

let serverStatus = 'ACTIVE'; // ACTIVE, STOPPED, REBOOTING
let uptime = 0;

// Имитация работы сервера
setInterval(() => {
    if (serverStatus === 'ACTIVE') {
        uptime++;
    }
}, 1000);

io.on('connection', (socket) => {
    console.log('Клиент подключен к панели управления');

    // Отправка статистики каждые 2 секунды
    const statsInterval = setInterval(() => {
        if (serverStatus === 'ACTIVE') {
            const cpuUsage = (Math.random() * 30 + 10).toFixed(1); // Эмуляция нагрузки
            const ramUsage = (100 - (os.freemem() / os.totalmem()) * 100).toFixed(1);
            
            socket.emit('stats', {
                cpu: cpuUsage,
                ram: ramUsage,
                uptime: formatUptime(uptime),
                status: serverStatus
            });
        } else {
            socket.emit('stats', {
                cpu: 0,
                ram: 0,
                uptime: formatUptime(uptime),
                status: serverStatus
            });
        }
    }, 2000);

    // Логи
    const logInterval = setInterval(() => {
        if (serverStatus === 'ACTIVE') {
            const logs = [
                '[INFO] Служба мониторинга работает исправно...',
                '[NET] Входящее соединение: 192.168.1.105',
                '[SYS] Проверка целостности диска завершена',
                '[CRON] Выполнение плановой задачи #442'
            ];
            const randomLog = logs[Math.floor(Math.random() * logs.length)];
            socket.emit('log', `[${new Date().toLocaleTimeString()}] ${randomLog}`);
        }
    }, 3500);

    // Управление сервером
    socket.on('command', (cmd) => {
        switch(cmd) {
            case 'stop':
                serverStatus = 'STOPPED';
                socket.emit('log', `[WARN] СЕРВЕР ОСТАНОВЛЕН ПОЛЬЗОВАТЕЛЕМ`);
                break;
            case 'start':
                serverStatus = 'ACTIVE';
                socket.emit('log', `[INFO] Процесс загрузки инициирован... Сервер запущен.`);
                break;
            case 'reboot':
                serverStatus = 'REBOOTING';
                socket.emit('log', `[WARN] Перезагрузка системы...`);
                uptime = 0;
                setTimeout(() => {
                    serverStatus = 'ACTIVE';
                    socket.emit('log', `[INFO] Система успешно перезагружена.`);
                }, 3000);
                break;
        }
        io.emit('statusChange', serverStatus);
    });

    socket.on('disconnect', () => {
        clearInterval(statsInterval);
        clearInterval(logInterval);
    });
});

function formatUptime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}ч ${m}м ${s}с`;
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Панель управления запущена на порту ${PORT}`);
});