class MenuScene extends Phaser.Scene {
    constructor() {
        super("MenuScene");
    }

    preload() {
        // Carrega todos os recursos necessários para o jogo
        this.load.image('startButton', 'assets/start.png');
        this.load.image('backgroundMenu', 'assets/background_menu.png');
        this.load.image('backgroundGame', 'assets/background_game.png');
        this.load.image('backgroundGame2', 'assets/background_game2.png');
        this.load.image('backgroundGameOver', 'assets/background_gameover.png');
        this.load.image('backgroundWin', 'assets/background_win.png');
        this.load.image('player', 'assets/player.png');
        this.load.image('key', 'assets/key.png');
        this.load.image('enemy', 'assets/enemy.png');
        this.load.image('door', 'assets/door.png');
        this.load.tilemapTiledJSON('map', 'assets/map.json');
        this.load.tilemapTiledJSON('map2', 'assets/map2.json');
        this.load.image('tiles', 'assets/tileset.png');
    }

    create() {
        // Adiciona o fundo do menu
        this.add.image(400, 300, 'backgroundMenu');
        this.add.text(250, 100, "Jogo do Labirinto", { fontSize: "48px", fill: "#fff" });
        
        // Cria o botão de início e define a interação
        let startButton = this.add.image(400, 400, 'startButton').setInteractive();
        startButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });
    }
}
class GameScene extends Phaser.Scene {
    constructor() {
        super("GameScene");
        this.score = 0; // Placar do jogador
        this.hasKey = false; // Indica se o jogador pegou a chave
    }

    create() {
        this.addBackground(); // Adiciona o fundo
        this.createMap(); // Cria o mapa e o chão
        this.createPlayer(); // Cria o jogador
        this.createKey(); // Cria a chave
        this.createDoor(); // Cria a porta
        this.createEnemy(); // Cria o inimigo
        this.createUI(); // Configura a interface
        this.setupCollisions(); // Define as colisões
        this.setupControls(); // Configura os controles do teclado
    }
    
    // Adiciona o fundo da fase
    addBackground() {
        this.add.image(400, 300, 'backgroundGame');
    }
    
    // Cria o mapa e o tileset
    createMap() {
        const map = this.make.tilemap({ key: "map" }); // Carrega o mapa
        const tileset = map.addTilesetImage("tileset", "tiles"); // Define o tileset
        this.groundLayer = map.createLayer("Ground", tileset, 0, 0); // Cria a camada do chão
    }
    
    // Cria o jogador e define suas propriedades físicas
    createPlayer() {
        this.player = this.physics.add.sprite(100, 100, 'player') // Adiciona o sprite do jogador
            .setCollideWorldBounds(true) // Evita que saia da tela
            .setBounce(0.2); // Dá um leve efeito de quicar
    }
    
    // Cria a chave
    createKey() {
        this.spawnKey(); // Chama a função que posiciona a chave
    }
    
    // Cria a porta
    createDoor() {
        this.door = this.physics.add.sprite(700, 500, 'door'); // Adiciona a porta no jogo
    }
    
    // Cria o inimigo e define suas propriedades físicas
    createEnemy() {
        this.enemy = this.physics.add.sprite(400, 200, 'enemy') // Adiciona o inimigo
            .setVelocity(100, 100) // Define velocidade inicial
            .setBounce(1, 1) // Faz com que ele quique ao colidir com obstáculos
            .setCollideWorldBounds(true); // Impede que saia da tela
    }
    
    // Cria os textos de pontuação e mensagens
    createUI() {
        this.scoreText = this.add.text(16, 16, 'Placar: 0', { fontSize: "32px", fill: "#fff" }); // Placar
        this.messageText = this.add.text(200, 550, '', { fontSize: "24px", fill: "#fff" }); // Mensagens
    }
    
    // Define as colisões e interações entre os objetos
    setupCollisions() {
        this.physics.add.overlap(this.player, this.keyItem, this.collectKey, null, this); // Pega a chave
        this.physics.add.overlap(this.player, this.door, this.enterDoor, null, this); // Entra na porta
        this.physics.add.collider(this.player, this.enemy, this.hitEnemy, null, this); // Colisão com inimigo
    }
    
    // Configura os controles do teclado
    setupControls() {
        this.cursors = this.input.keyboard.createCursorKeys(); // Habilita as setas do teclado
    }
    
    // Atualiza o jogo a cada frame
    update() {
        if (!this.cursors) return; // Previne erro caso os controles não estejam definidos
    
        this.handlePlayerMovement(); // Movimenta o jogador
    }
    
    // Controla a movimentação do jogador
    handlePlayerMovement() {
        const speed = 160; // Velocidade do jogador
        this.player.setVelocity(0); // Reseta a velocidade
    
        if (this.cursors.left.isDown) { // Movimento para a esquerda
            this.player.setVelocityX(-speed);
        } else if (this.cursors.right.isDown) { // Movimento para a direita
            this.player.setVelocityX(speed);
        }
    
        if (this.cursors.up.isDown) { // Movimento para cima
            this.player.setVelocityY(-speed);
        } else if (this.cursors.down.isDown) { // Movimento para baixo
            this.player.setVelocityY(speed);
        }
    }
    
    // Gera uma nova chave no cenário
    spawnKey() {
        this.destroyKey(); // Remove a chave anterior, se existir
        this.createKey(); // Cria uma nova chave em uma posição aleatória
    }


// Remove a chave existente
destroyKey() {
    if (this.keyItem) {
        this.keyItem.destroy();
        this.keyItem = null;
    }
}

// Cria a chave em uma posição aleatória
createKey() {
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    this.keyItem = this.physics.add.sprite(x, y, 'key');
    this.hasKey = false;
}

// Coleta a chave e atualiza o jogo
collectKey(player, key) {
    this.updateScore(10);
    this.hasKey = true;
    key.destroy();
    this.showMessage('Chave coletada! Vá para a porta.', 3000);
}

// Entra na porta se tiver a chave
enterDoor(player, door) {
    if (this.hasKey) {
        this.scene.start('GameScene2', { score: this.score });
    } else {
        this.showMessage('Você precisa da chave para abrir a porta!', 2000);
    }
}

// Lida com colisão com o inimigo (Game Over)
hitEnemy(player, enemy) {
    this.scene.start('GameOverScene', { score: this.score });
}

// Atualiza a pontuação
updateScore(points) {
    this.score += points;
    this.scoreText.setText(`Placar: ${this.score}`);
}

// Exibe uma mensagem temporária na tela
showMessage(text, duration) {
    this.messageText.setText(text);
    this.time.delayedCall(duration, () => {
        this.messageText.setText('');
    });
}

}

class GameScene2 extends Phaser.Scene {
    constructor() {
        super("GameScene2");
        this.score = 0;
        this.hasKey = false;
    }

    init(data) {
        // Recebe a pontuação da fase anterior
        this.score = data.score || 0;
    }

    create() {
        // Adiciona o fundo da fase 2
        this.add.image(400, 300, 'backgroundGame2');
        
        // Tenta carregar o mapa da fase 2
        try {
            const map = this.make.tilemap({ key: "map2" });
            const tileset = map.addTilesetImage("tileset", "tiles");
            map.createLayer("Ground", tileset, 0, 0);
        } catch (error) {
            console.error("Erro ao carregar o mapa:", error);
        }
        
        // Cria o jogador e define suas propriedades físicas
        this.player = this.physics.add.sprite(100, 100, 'player');
        this.player.setCollideWorldBounds(true);
        this.player.setBounce(0.2);
        
        // Spawn da chave
        this.spawnKey();
        
        // Cria a porta e define suas propriedades físicas
        this.door = this.physics.add.sprite(700, 500, 'door');
        this.door.setCollideWorldBounds(true); // Garante que a porta não saia da tela
        this.door.setBounce(1, 1); // Faz a porta quicar ao colidir com os limites
        
        // Cria dois inimigos
        this.enemies = this.physics.add.group({
            defaultKey: 'enemy',
            collideWorldBounds: true, // Garante que os inimigos colidam com os limites da tela
            bounceX: 1,
            bounceY: 1
        });

        const enemy1 = this.enemies.create(300, 200, 'enemy');
        const enemy2 = this.enemies.create(500, 400, 'enemy');

        // Define a velocidade inicial dos inimigos
        enemy1.setVelocity(Phaser.Math.Between(-200, 200), Phaser.Math.Between(-200, 200));
        enemy2.setVelocity(Phaser.Math.Between(-200, 200), Phaser.Math.Between(-200, 200));
        
        // Textos de pontuação e mensagens
        this.scoreText = this.add.text(16, 16, 'Placar: ' + this.score, { fontSize: "32px", fill: "#fff" });
        this.messageText = this.add.text(200, 550, '', { fontSize: "24px", fill: "#fff" });
        
        // Define as colisões
        this.physics.add.overlap(this.player, this.keyItem, this.collectKey, null, this);
        this.physics.add.overlap(this.player, this.door, this.enterDoor, null, this);
        this.physics.add.collider(this.player, this.enemies, this.hitEnemy, null, this); // Colisão com os inimigos
        
        // Controles do teclado
        this.cursors = this.input.keyboard.createCursorKeys();
        
        // Inicia a movimentação aleatória dos inimigos e da porta
        this.moveEnemyRandomly();
        this.moveDoorRandomly();
    }
    
    update() {
        // Reseta a velocidade do jogador a cada frame
        this.player.setVelocity(0);

        // Movimentação do jogador com as setas do teclado
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);
        }

        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-160);
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(160);
        }
    }
    
    spawnKey() {
        // Destrói a chave anterior, se existir
        if (this.keyItem) {
            this.keyItem.destroy();
        }
        // Spawna a chave em uma posição aleatória
        let x = Phaser.Math.Between(50, 750);
        let y = Phaser.Math.Between(50, 550);
        this.keyItem = this.physics.add.sprite(x, y, 'key');
        this.hasKey = false;
    }
    
    collectKey(player, key) {
        // Aumenta a pontuação e destrói a chave
        this.score += 20; // Mais pontos na fase 2
        this.scoreText.setText('Placar: ' + this.score);
        key.destroy();
        this.hasKey = true;
        this.messageText.setText('Chave coletada! Vá para a porta.');
        
        // Remove a mensagem após 3 segundos
        this.time.delayedCall(3000, () => {
            this.messageText.setText('');
        });
    }
    
    enterDoor(player, door) {
        // Verifica se o jogador tem a chave para abrir a porta
        if (this.hasKey) {
            this.scene.start('WinScene', { score: this.score });
        } else {
            this.messageText.setText('Você precisa da chave para abrir a porta!');
            
            // Remove a mensagem após 2 segundos
            this.time.delayedCall(2000, () => {
                this.messageText.setText('');
            });
        }
    }
    hitEnemy(player, enemy) {
        // Quando o jogador colide com um inimigo, o jogo termina e a cena "GameOverScene" é iniciada,
        // passando a pontuação atual como parâmetro.
        this.scene.start('GameOverScene', { score: this.score });
    }

    moveEnemyRandomly() {
        // Percorre todos os inimigos e atribui um movimento aleatório a cada um deles.
        this.enemies.getChildren().forEach(enemy => {
            this.setRandomVelocity(enemy, 200);
        });

        // Agenda a próxima chamada deste método após 2 segundos.
        this.scheduleNextMovement(this.moveEnemyRandomly, 2000);
    }

    moveDoorRandomly() {
        // Define um movimento aleatório para a porta.
        this.setRandomVelocity(this.door, 100);

        // Agenda a próxima movimentação da porta após 3 segundos.
        this.scheduleNextMovement(this.moveDoorRandomly, 3000);
    }

    setRandomVelocity(object, speed) {
        // Gera uma velocidade aleatória dentro do intervalo definido e aplica ao objeto.
        const velocityX = Phaser.Math.Between(-speed, speed);
        const velocityY = Phaser.Math.Between(-speed, speed);
        object.setVelocity(velocityX, velocityY);
    }

    scheduleNextMovement(callback, delay) {
        // Agenda a próxima execução da função fornecida após o tempo especificado (delay).
        this.time.delayedCall(delay, callback.bind(this));
    }

}

class GameOverScene extends Phaser.Scene {
    constructor() {
        super("GameOverScene");
    }
    
    init(data) {
        // Recebe a pontuação da fase anterior
        this.score = data.score || 0;
    }

    create() {
        // Adiciona o fundo de Game Over
        this.add.image(400, 300, 'backgroundGameOver');
        this.add.text(300, 100, "Game Over", { fontSize: "48px", fill: "#f00" });
        this.add.text(300, 200, "Pontuação: " + this.score, { fontSize: "32px", fill: "#fff" });
        this.add.text(240, 500, "Clique para voltar ao menu", { fontSize: "24px", fill: "#fff" });
        
        // Volta ao menu ao clicar na tela
        this.input.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
    }
}

class WinScene extends Phaser.Scene {
    constructor() {
        super("WinScene");
    }
    
    init(data) {
        // Recebe a pontuação da fase anterior
        this.score = data.score || 0;
    }

    create() {
        // Adiciona o fundo de vitória
        this.add.image(400, 300, 'backgroundWin');
        this.add.text(300, 100, "Você Ganhou!", { fontSize: "48px", fill: "#0f0" });
        this.add.text(280, 200, "Pontuação: " + this.score, { fontSize: "32px", fill: "#fff" });
        this.add.text(240, 500, "Clique para voltar ao menu", { fontSize: "24px", fill: "#fff" });
        
        // Volta ao menu ao clicar na tela
        this.input.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: { default: 'arcade', arcade: { gravity: { y: 0 }, debug: false } },
    scene: [MenuScene, GameScene, GameScene2, GameOverScene, WinScene]
};

const game = new Phaser.Game(config);