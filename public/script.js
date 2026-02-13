const socket = io();

const cpuMetric = document.getElementById('cpuMetric');
const ramMetric = document.getElementById('ramMetric');
const uptimeMetric = document.getElementById('uptimeMetric');
const cpuFill = document.getElementById('cpuFill');
const ramFill = document.getElementById('ramFill');
const terminalBody = document.getElementById('terminalBody');
const statusBadge = document.getElementById('statusBadge');

socket.on('stats', (data) => {
    cpuMetric.innerText = `${data.cpu}%`;
    ramMetric.innerText = `${data.ram}%`;
    uptimeMetric.innerText = data.uptime;

    cpuFill.style.width = `${data.cpu}%`;
    ramFill.style.width = `${data.ram}%`;

    updateStatusUI(data.status);
});

socket.on('log', (message) => {
    const div = document.createElement('div');
    div.innerText = message;
    terminalBody.appendChild(div);
    terminalBody.scrollTop = terminalBody.scrollHeight;
});

function sendCommand(cmd) {
    socket.emit('command', cmd);
}

function updateStatusUI(status) {
    if (status === 'ACTIVE') {
        statusBadge.innerText = 'ОНЛАЙН';
        statusBadge.style.background = '#9ece6a'; // Green
    } else if (status === 'STOPPED') {
        statusBadge.innerText = 'ОСТАНОВЛЕН';
        statusBadge.style.background = '#f7768e'; // Red
    } else if (status === 'REBOOTING') {
        statusBadge.innerText = 'ПЕРЕЗАГРУЗКА';
        statusBadge.style.background = '#e0af68'; // Yellow
    }
}