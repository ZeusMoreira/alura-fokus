const html = document.querySelector('html')
const focoBtn = document.querySelector('.app__card-button--foco')
const curtoBtn = document.querySelector('.app__card-button--curto')
const longoBtn = document.querySelector('.app__card-button--longo')
const displayTempo = document.querySelector('#timer')
const banner = document.querySelector('.app__image')
const titulo = document.querySelector('.app__title')
const botaoComecar = document.querySelector('#start-pause')
const switchMusica = document.querySelector('#alternar-musica')
const timer = document.querySelector('#timer')
const textoBotaoComecarPause = document.querySelector('.app__card-primary-button_text')
const iconeBotaoComecarPause = document.querySelector('.app__card-primary-butto-icon')
const botoesContexto = [focoBtn, curtoBtn, longoBtn]
const titulos = {
    'foco': `Otimize sua produtividade,<br><strong class="app__title-strong">mergulhe no que importa</strong>`,
    'descanso-curto': `Que tal dar uma respirada?<br><strong class="app__title-strong">Faça uma pausa curta!</strong>`,
    'descanso-longo': `Hora de voltar à superfície.<br><strong class="app__title-strong">Faça uma pausa longa.</strong>`
}
const timers = {
    'foco': 1500,
    'descanso-curto': 300,
    'descanso-longo': 900,
}
const musica = new Audio('/alura-fokus/sons/luna-rise-part-one.mp3')
const playSom = new Audio('/alura-fokus/sons/play.wav')
const pauseSom = new Audio('/alura-fokus/sons/pause.mp3')
const tempoEsgotadoSom = new Audio('/alura-fokus/sons/beep.mp3')

let contexto = focoBtn.getAttribute('data-contexto')
let tempoDecorridoEmSegundos = timers[contexto]
let intervalo = null

musica.loop = true

botoesContexto.forEach((botaoContexto) => {
    botaoContexto.addEventListener('click', () => alterarContexto(botaoContexto))
})

botaoComecar.addEventListener('click', () => {
    gerenciarCronometro()
})

switchMusica.addEventListener('change', () => musica.paused ? musica.play() : musica.pause())

alterarTimerContexto(contexto)

function alterarContexto(botaoContexto) {
    contexto = botaoContexto.getAttribute('data-contexto')
    html.setAttribute('data-contexto', contexto)
    banner.setAttribute('src', `./imagens/${contexto}.png`)
    alterarFundoBotaoContexto(botaoContexto)
    alterarTituloContexto(contexto)
    alterarTimerContexto(contexto)
}

function alterarFundoBotaoContexto(btnContexto){
    botoesContexto.forEach((botaoContexto) => botaoContexto.classList.remove('active'))
    btnContexto.classList.add('active')
}

function alterarTituloContexto(contexto){
    titulo.innerHTML = titulos[contexto] || '';
}

function alterarTimerContexto(contexto) {
    pararContagem()
    tempoDecorridoEmSegundos = timers[contexto]
    formatarTempo(tempoDecorridoEmSegundos)
}

function formatarTempo(tempoDecorridoEmSegundos) {
    tempoFormatado = new Date(tempoDecorridoEmSegundos * 1000).toLocaleTimeString('pt-Br', {minute: '2-digit', second: '2-digit'})
    timer.innerHTML = `${tempoFormatado}`
}

function gerenciarCronometro(){
    resetarSonsCronometro()
    if(intervalo) {
        pararContagem(pauseSom)
        return
    } 
    iniciarContagem()
}

function resetarSonsCronometro() {
    if(isPlaying(pauseSom) || isPlaying(playSom) || isPlaying(tempoEsgotadoSom)){
        pauseSom.pause()
        playSom.pause()
        tempoEsgotadoSom.pause()
        pauseSom.currentTime = 0
        playSom.currentTime = 0
        tempoEsgotadoSom.currentTime = 0
    }
}

function isPlaying(audio) {
    return !audio.paused && audio.currentTime > 0;
}

function iniciarContagem() {
    iconeBotaoComecarPause.setAttribute('src', './imagens/pause.png')
    textoBotaoComecarPause.innerHTML = 'Parar'
    intervalo = setInterval(contar, 1000)
    playSom.play()
}

function pararContagem(som) {
    iconeBotaoComecarPause.setAttribute('src', './imagens/play_arrow.png')
    textoBotaoComecarPause.innerHTML = 'Começar'
    clearInterval(intervalo)
    intervalo = null
    if(som) {
        som.play()
    }
}

const contar = () => {
    tempoDecorridoEmSegundos -= 1
    formatarTempo(tempoDecorridoEmSegundos)
    if(tempoDecorridoEmSegundos == 0) {
        const focoAtivo = html.getAttribute('data-contexto') === 'foco'
        if(focoAtivo) {
            const evento = new CustomEvent('FocoFinalizado')
            document.dispatchEvent(evento)
        }
        resetarContagem()
    }
}

function resetarContagem() {
    tempoDecorridoEmSegundos = timers[contexto]
    formatarTempo(tempoDecorridoEmSegundos)
    pararContagem(tempoEsgotadoSom)
    setTimeout(() => {
        alert('Tempo esgotado!')
        tempoEsgotadoSom.pause()
        tempoEsgotadoSom.currentTime = 0
    }, 0);
}