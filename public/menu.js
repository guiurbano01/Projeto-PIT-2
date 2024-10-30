document.addEventListener('DOMContentLoaded', () => {

const elements = {
usuarioInfo: document.getElementById('usuario-info'),
welcomeMessage: document.getElementById('welcomeMessage'),
loginButton: document.getElementById('loginButton'),
cadastrarButton: document.getElementById('cadastrarButton'),
logoutButton: document.getElementById('logoutButton'),
minhaContaButton: document.getElementById('minhaContaButton'),
agendarConsultaButton: document.getElementById('agendarConsultaButton'),
minhasConsultasButton: document.getElementById('minhasConsultasButton'),
formAgendamento: document.getElementById('form-agendamento')
};


const atualizarInterface = (logado, nome) => {
const { welcomeMessage, loginButton, cadastrarButton, logoutButton, minhaContaButton, agendarConsultaButton, minhasConsultasButton } = elements;

if (welcomeMessage) {
welcomeMessage.style.display = logado ? 'block' : 'none';
welcomeMessage.innerText = logado ? `Bem-vindo, ${nome}` : '';
}

loginButton.style.display = logado ? 'none' : 'inline-block';
cadastrarButton.style.display = logado ? 'none' : 'inline-block';
logoutButton.style.display = logado ? 'inline-block' : 'none';
minhaContaButton.style.display = logado ? 'inline-block' : 'none';
agendarConsultaButton.style.display = logado ? 'inline-block' : 'none';
minhasConsultasButton.style.display = logado ? 'inline-block' : 'none';
};


fetch('/usuario-logado')
.then(response => response.json())
.then(data => {
atualizarInterface(data.logado, data.nome);
})
.catch(error => {
console.error('Erro ao verificar o login:', error);
});


const setupButton = (buttonId, redirectUrl) => {
const button = document.getElementById(buttonId);
if (button) {
button.addEventListener('click', (event) => {
event.preventDefault();
window.location.href = redirectUrl;
});
} else {
console.error(`Elemento "${buttonId}" não encontrado!`);
}
};


setupButton('loginButton', 'signup.html');
setupButton('cadastrarButton', 'cadastro_usuario.html');
setupButton('agendarConsultaButton', 'agendamento.html');
setupButton('minhaContaButton', 'minha-conta.html');


if (elements.logoutButton) {
elements.logoutButton.addEventListener('click', (event) => {
event.preventDefault();
fetch('/logout', {
method: 'GET',
credentials: 'same-origin'
})
.then(() => {
window.location.reload(); 
})
.catch(error => {
console.error('Erro ao fazer logout:', error);
});
});
} else {
console.error('Elemento "logoutButton" não encontrado!');
}


if (elements.formAgendamento) {
elements.formAgendamento.addEventListener('submit', function (event) {
event.preventDefault();


const formData = new FormData(elements.formAgendamento);
const data = Object.fromEntries(formData.entries());



delete data.paciente_id;

fetch('/agendar-consulta', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
},
body: JSON.stringify(data),
})
.then(response => {
if (!response.ok) {
    throw new Error('Erro na resposta da rede');
}
return response.text();
})
.then(data => {
alert(data);
elements.formAgendamento.reset(); 

})
.catch((error) => {
console.error('Erro:', error);
alert('Erro ao agendar consulta. Tente novamente.');
});
});
}
});
