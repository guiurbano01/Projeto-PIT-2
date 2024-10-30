document.addEventListener('DOMContentLoaded', () => {
fetch('/usuario-logado')
.then(response => response.json())
.then(data => {
if (data.logado) {
const usuarioInfoDiv = document.getElementById('usuario-info');
usuarioInfoDiv.innerHTML = `
<p><strong>Nome:</strong> ${data.nome}</p>
<p><strong>Email:</strong> ${data.email}</p>
<p><strong>Telefone:</strong> ${data.telefone}</p>
<p><strong>CPF:</strong> ${data.cpf}</p>
`;
} else {
window.location.href = '/';
}
});
});
