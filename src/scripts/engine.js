// Estado inicial do jogo, contendo referências aos elementos do DOM e a pontuação
const state = {
    score: {
        playerScore: 0,  // Pontuação do jogador
        computerScore: 0, // Pontuação do computador
        scoreBox: document.getElementById('score_points'), // Caixa onde a pontuação é exibida
    },
    cardSprites: {
        avatar: document.getElementById('card-image'), // Imagem da carta selecionada
        name: document.getElementById('card-name'), // Nome da carta selecionada
        type: document.getElementById('card-type'), // Tipo da carta selecionada
    },
    fieldCards: {
        player: document.getElementById('player-field-card'), // Carta do jogador no campo
        computer: document.getElementById('computer-field-card'), // Carta do computador no campo
    },
    playerSides: {
        player1: 'player-cards', // Lado do jogador 1
        player1BOX: document.querySelector('#player-cards'), // Caixa de cartas do jogador 1
        computer: 'computer-cards', // Lado do computador
        computerBOX: document.querySelector('#computer-cards'), // Caixa de cartas do computador
    },
    actions: {
        button: document.getElementById('next-duel'), // Botão para o próximo duelo
    },
    audioEnabled: true, // Controle do áudio, começa habilitado
};

// Caminho para os ícones das cartas
const patchImages = './src/assets/icons/';

// Definição dos dados das cartas
const cardData = [
    {
        id: 0,
        name: 'Blue Eyes White Dragon',
        type: 'Paper',
        img: `${patchImages}dragon.png`,
        winOf: [1],  // Ganha de Dark Magician
        loseOf: [2], // Perde de Exodia
    },
    {
        id: 1,
        name: 'Dark Magician',
        type: 'Rock',
        img: `${patchImages}magician.png`,
        winOf: [2],  // Ganha de Exodia
        loseOf: [0], // Perde de Blue Eyes White Dragon
    },
    {
        id: 2,
        name: 'Exodia',
        type: 'Scissors',
        img: `${patchImages}exodia.png`,
        winOf: [0],  // Ganha de Blue Eyes White Dragon
        loseOf: [1], // Perde de Dark Magician
    },
];

// Define as cartas no campo e atualiza a tela com base no duelo
async function setCardsField(cardId) {
    await removeAllCardsImages(); // Remove as imagens das cartas anteriores

    let computerCardId = await getRandomCardId(); // Escolhe aleatoriamente uma carta para o computador

    // Atualiza a exibição das cartas no campo
    state.fieldCards.player.style.display = 'block';
    state.fieldCards.computer.style.display = 'block';

    // Limpa os textos e imagens anteriores
    state.cardSprites.name.innerText = '';
    state.cardSprites.type.innerText = '';
    state.cardSprites.avatar.src = '';

    // Exibe as cartas selecionadas
    state.fieldCards.player.src = cardData[cardId].img;
    state.fieldCards.computer.src = cardData[computerCardId].img;

    // Verifica o resultado do duelo
    let duelResults = await checkDuelResults(cardId, computerCardId);

    await updateScore(); // Atualiza a pontuação
    await drawButton(duelResults); // Exibe o resultado do duelo no botão
}

// Verifica o resultado do duelo
async function checkDuelResults(playerCardId, computerCardId) {
    let duelResults = 'DRAW'; // Assume empate inicialmente
    let playerCard = cardData[playerCardId];

    // Verifica se o jogador ganhou
    if (playerCard.winOf.includes(computerCardId)) {
        duelResults = 'WIN';
        await playAudio(duelResults); // Reproduz áudio de vitória se habilitado
        state.score.playerScore++; // Incrementa a pontuação do jogador
    }
    // Verifica se o jogador perdeu
    if (playerCard.loseOf.includes(computerCardId)) {
        duelResults = 'LOSE';
        await playAudio(duelResults); // Reproduz áudio de derrota se habilitado
        state.score.computerScore++; // Incrementa a pontuação do computador
    }

    return duelResults;
}

// Atualiza a pontuação na tela
async function updateScore() {
    state.score.scoreBox.innerText = `Win: ${state.score.playerScore} | Lose: ${state.score.computerScore}`;
}

// Exibe o botão com o resultado do duelo
async function drawButton(text) {
    state.actions.button.innerText = text;
    state.actions.button.style.display = 'block';
}

// Gera um ID de carta aleatório
async function getRandomCardId() {
    const randomIndex = Math.floor(Math.random() * cardData.length);
    return cardData[randomIndex].id;
}

// Remove todas as imagens de cartas do campo
async function removeAllCardsImages() {
    let { computerBOX, player1BOX } = state.playerSides;
    let imgElements = computerBOX.querySelectorAll('img');
    imgElements.forEach((img) => img.remove());

    imgElements = player1BOX.querySelectorAll('img');
    imgElements.forEach((img) => img.remove());
}

// Exibe os detalhes da carta selecionada no menu
async function drawSelectCard(index) {
    state.cardSprites.avatar.src = cardData[index].img;
    state.cardSprites.name.innerText = cardData[index].name;
    state.cardSprites.type.innerText = 'Atribute: ' + cardData[index].type;
}

// Desenha as cartas disponíveis para o jogador e o computador
async function drawCards(cardNumber, fieldSide) {
    for (let i = 0; i < cardNumber; i++) {
        const randomIdCard = await getRandomCardId();
        const cardImage = await createCardImage(randomIdCard, fieldSide);
        document.getElementById(fieldSide).appendChild(cardImage);
    }
}

// Cria a imagem de uma carta no campo
async function createCardImage(IdCard, fieldSide) {
    const cardImage = document.createElement('img');
    cardImage.setAttribute('height', '100px');
    cardImage.setAttribute('src', './src/assets/icons/card-back.png');
    cardImage.setAttribute('data-id', IdCard);
    cardImage.classList.add('card');

    if (fieldSide === state.playerSides.player1) {
        // Ao passar o mouse, mostra os detalhes da carta
        cardImage.addEventListener('mouseover', () => {
            drawSelectCard(IdCard);
        });

        // Ao clicar, seleciona a carta para o duelo
        cardImage.addEventListener('click', () => {
            setCardsField(cardImage.getAttribute('data-id'));
        });
    }

    return cardImage;
}

// Reseta o duelo para uma nova rodada
async function resetDuel() {
    state.cardSprites.avatar.src = '';
    state.actions.button.style.display = 'none';

    state.fieldCards.player.style.display = 'none';
    state.fieldCards.computer.style.display = 'none';

    init();
}

// Reproduz o áudio correspondente ao status (vitória, derrota)
async function playAudio(status) {
    if (state.audioEnabled) { // Só toca se o áudio estiver habilitado
        const audio = new Audio(`./src/assets/audios/${status}.wav`);
        audio.play();
    }
}

// Função principal de inicialização do jogo
function init() {
    drawCards(5, state.playerSides.player1); // Desenha cartas para o jogador
    drawCards(5, state.playerSides.computer); // Desenha cartas para o computador

    const bgm = document.getElementById('bgm');
    if (state.audioEnabled) bgm.play(); // Toca a música de fundo se o áudio estiver habilitado
}

// Botão para jogar sem áudio
function toggleAudio() {
    state.audioEnabled = !state.audioEnabled; // Alterna entre habilitar e desabilitar o áudio
    const bgm = document.getElementById('bgm');
    if (state.audioEnabled) {
        bgm.play();
    } else {
        bgm.pause();
        bgm.currentTime = 0; // Reinicia a música
    }
}

// Inicia o jogo
init();

// Adiciona o botão para jogar sem áudio ao HTML
const audioToggleButton = document.getElementById('audio-toggle');
audioToggleButton.innerText = 'Jogar Sem Áudio';
audioToggleButton.classList.add('rpgui-button');
audioToggleButton.onclick = toggleAudio;
document.appendChild(audioToggleButton);
