document.addEventListener('DOMContentLoaded', () => {
fetch('./minhas-consultas')
.then(response => response.json())
.then(data => {
if (data.logado && Array.isArray(data.consultas)) {
const consultaInfoDiv = document.getElementById('consultaInfo');

consultaInfoDiv.innerHTML = data.consultas.map(consulta => `
<p><strong>Paciente:</strong> ${consulta.paciente_id}</p>
<p><strong>Data:</strong> ${consulta.data_consulta}</p>
<p><strong>Hora:</strong> ${consulta.horario_consulta}</p>
<p><strong>Especialidade:</strong> ${consulta.especialidade_id}</p>
<p><strong>Médico:</strong> ${consulta.medico_id}</p>
`).join('');
} else {
window.location.href = '/';
}
})
.catch(error => {
console.error('Erro ao carregar as consultas do usuário:', error);
});
});
