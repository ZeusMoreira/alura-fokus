const btnAdicionarNovaTarefa = document.querySelector('.app__button--add-task')
const formAdicionarTarefa = document.querySelector('.app__form-add-task')
const btnCancelar = document.querySelector('.app__form-footer__button--cancel')
const campoTarefa = document.querySelector('.app__form-textarea')
const listaTarefas = document.querySelector('.app__section-task-list')
const paragrafoTarefaEmAndamento = document.querySelector('.app__section-active-task-description')
const btnRemoverTarefasConcluidas = document.getElementById('btn-remover-concluidas')
const btnRemoverTodasTarefas = document.getElementById('btn-remover-todas')

let tarefas = []
let tarefaSelecionada = null
let liTarefaSelecionada = null

carregarTarefas()

btnAdicionarNovaTarefa.addEventListener('click', () => {
    formAdicionarTarefa.classList.toggle('hidden')
})

btnCancelar.addEventListener('click', () => limparFormulario())

formAdicionarTarefa.addEventListener('submit', (e) => {
    e.preventDefault()
    
    if(!campoTarefa.value.trim()) {
        return
    }

    if(ehTarefaComDescricaoJaExistente()) {
        alert('Não foi possível adicionar essa tarefa! Já existe uma tarefa com essa descrição!')
        return
    }

    const tarefa = {
        descricao: campoTarefa.value,
        finalizada: false,
    }

    tarefas.push(tarefa)

    atualizarTarefasLocalStorage()
    atualizarListaTarefasEmTela()
    limparFormulario()
})

document.addEventListener('FocoFinalizado', () => {
    if(tarefaSelecionada && liTarefaSelecionada) {
        liTarefaSelecionada.classList.remove('app__section-task-list-item-active')
        liTarefaSelecionada.classList.add('app__section-task-list-item-complete')
        paragrafoTarefaEmAndamento.textContent = ''
        liTarefaSelecionada.querySelector('button').setAttribute('disabled', 'disabled')
        atualizarSituacaoTarefa()
    }
})

btnRemoverTarefasConcluidas.addEventListener('click', () => removerTarefas(true))

btnRemoverTodasTarefas.addEventListener('click', () => removerTarefas())

const removerTarefas = (somenteConcluidas = false) => {
    if(!tarefas.length) {
        alert('Não há tarefas!')
        return
    }

    if(!somenteConcluidas) {
        listaTarefas.innerHTML = ''
        tarefas = []
        atualizarTarefasLocalStorage()
        return
    } 

    const tarefasFinalizadas = tarefas.filter((tarefa) => tarefa.finalizada)
   
    if(!tarefasFinalizadas.length) {
        alert('Não há tarefas finalizadas!')
        return
    }

    const seletor = '.app__section-task-list-item-complete'
    document.querySelectorAll(seletor).forEach((elemento) => {
        elemento.remove()
    })

    tarefas = tarefas.filter((tarefa) => !tarefa.finalizada)
    atualizarTarefasLocalStorage()
}


function ehTarefaComDescricaoJaExistente() {
    let jaExiste = false
    tarefas.forEach((tarefa) => {
        if(tarefa.descricao === campoTarefa.value) {
            jaExiste = true
        }
    })
    return jaExiste
}

function carregarTarefas() {
    tarefas = buscarTarefasLocalStorage()
    atualizarListaTarefasEmTela()
}

function atualizarListaTarefasEmTela() {
    listaTarefas.innerHTML = ''
    tarefas.sort((a, b) => a.finalizada - b.finalizada)
    tarefas.forEach((tarefa) => {
        criarTarefaEmTela(tarefa)
    })
}

function atualizarTarefasLocalStorage() {
    localStorage.setItem('tarefas', JSON.stringify(tarefas))
}

function criarTarefaEmTela(tarefa) {
    const li = configurarElementoTarefa(tarefa)
    configurarBotaoEditar(li, tarefa)
    configurarCliqueSelecao(li, tarefa)
    configurarBotaoStatus(li, tarefa)

    listaTarefas.appendChild(li)
}

function configurarElementoTarefa(tarefa) {
    const li = document.createElement('li')
    li.classList.add('app__section-task-list-item')

    const iconeStatus = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    iconeStatus.classList.add('app__section-task-icon-status')
    iconeStatus.setAttribute("width", "24")
    iconeStatus.setAttribute("height", "24")
    iconeStatus.setAttribute("viewBox", "0 0 24 24")
    iconeStatus.innerHTML = `
        <circle cx="12" cy="12" r="12" fill="#FFF"></circle>
        <path d="M9 16.1719L19.5938 5.57812L21 6.98438L9 18.9844L3.42188 13.4062L4.82812 12L9 16.1719Z" fill="#01080E"></path>
    `

    const descricao = document.createElement('p')
    descricao.className = 'app__section-task-list-item-description'
    descricao.textContent = tarefa.descricao

    const botaoEditar = document.createElement('button')
    botaoEditar.className = 'app_button-edit'
    const imgEditar = document.createElement('img')
    imgEditar.src = '/imagens/edit.png'
    botaoEditar.appendChild(imgEditar)

    li.appendChild(iconeStatus)
    li.appendChild(descricao)
    li.appendChild(botaoEditar)

    if (tarefa.finalizada) {
        li.classList.add('app__section-task-list-item-complete')
        botaoEditar.disabled = true
    }

    return li
}

function configurarBotaoEditar(li, tarefa) {
    const descricao = li.querySelector('.app__section-task-list-item-description')
    const botaoEditar = li.querySelector('.app_button-edit')

    botaoEditar.onclick = (event) => {
        event.stopPropagation()
        const novaDescricao = prompt("Qual é o novo nome da tarefa?", descricao.textContent.trim())

        if (novaDescricao?.trim()) {
            descricao.textContent = novaDescricao.trim()
            tarefa.descricao = novaDescricao.trim()
            atualizarTarefasLocalStorage()
        }
    }
}

function configurarCliqueSelecao(li, tarefa) {
    li.addEventListener('click', () => {
        if (tarefa.finalizada) return

        document.querySelectorAll('.app__section-task-list-item').forEach((el) => {
            el.classList.remove('app__section-task-list-item-active')
        })

        if (tarefaSelecionada === tarefa) {
            paragrafoTarefaEmAndamento.textContent = ''
            tarefaSelecionada = null
            liTarefaSelecionada = null
        } else {
            tarefaSelecionada = tarefa
            liTarefaSelecionada = li
            paragrafoTarefaEmAndamento.textContent = tarefa.descricao
            li.classList.add('app__section-task-list-item-active')
        }
    })
}

function configurarBotaoStatus(li, tarefa) {
    const botaoStatus = li.querySelector('.app__section-task-icon-status')
    const botaoEditar = li.querySelector('button')

    botaoStatus.addEventListener('click', (event) => {
        event.stopPropagation()

        tarefaSelecionada = tarefa

        li.classList.toggle('app__section-task-list-item-complete')
        botaoEditar.disabled = !tarefa.finalizada

        paragrafoTarefaEmAndamento.textContent = ''
        li.classList.remove('app__section-task-list-item-active')

        atualizarSituacaoTarefa()
    })
}

function buscarTarefasLocalStorage() {
    return JSON.parse(localStorage.getItem('tarefas')) || []
}

function limparFormulario() {
    campoTarefa.value = '' 
    formAdicionarTarefa.classList.add('hidden')  
}

function atualizarSituacaoTarefa() {
    tarefas.forEach((tarefa) => {
        if(tarefa === tarefaSelecionada) {
            tarefa.finalizada = !tarefa.finalizada
            tarefaSelecionada = null
            liTarefaSelecionada = null
        }
    })
    atualizarTarefasLocalStorage()
    atualizarListaTarefasEmTela()
}