const tg = window.Telegram.WebApp;
tg.expand();

// Принудительно делаем фон страницы белым, чтобы убрать черные полосы по краям
document.body.style.backgroundColor = '#ffffff';
document.body.style.margin = '0';
document.body.style.overflow = 'hidden';

const config = {
    type: Phaser.AUTO,
    width: 400,
    height: 650,
    parent: document.body,
    scale: {
        mode: Phaser.Scale.FIT, // Игра будет вписываться в экран
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 900 },
            // ВКЛЮЧАЕМ РЕЖИМ ОТЛАДКИ (Debug):
            // Теперь вы увидите невидимые границы столкновений (фиолетовые и зеленые рамки)
            debug: true 
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let player;
let platforms;
let cursors;
let score = 0;
let scoreText;

function preload() {
    this.load.image('hero', 'assets/hero.jpg');
    this.load.image('platform', 'assets/platform.jpg');
}

function create() {
    this.cameras.main.setBackgroundColor('#ffffff');

    platforms = this.physics.add.group({
        allowGravity: false,
        immovable: true
    });

    function createPlatform(scene, x, y) {
        let plat = platforms.create(x, y, 'platform');
        plat.setScale(0.4);
        plat.setBlendMode(Phaser.BlendModes.MULTIPLY);
        
        // Настраиваем физическую рамку платформы (хитбокс)
        // Делаем её меньше самой картинки и сдвигаем в центр
        plat.body.setSize(plat.width * 0.7, plat.height * 0.2);
        plat.body.setOffset(plat.width * 0.15, plat.height * 0.1);
        return plat;
    }

    createPlatform(this, 200, 580);

    for (let i = 1; i < 7; i++) {
        let x = Phaser.Math.Between(50, 350);
        let y = 580 - (i * 90);
        createPlatform(this, x, y);
    }

    player = this.physics.add.sprite(200, 400, 'hero');
    player.setScale(0.22);
    player.setBlendMode(Phaser.BlendModes.MULTIPLY);
    player.setBounce(0);
    player.setVelocityY(-600);
    
    // Настраиваем физическую рамку ниндзи, чтобы она облегала только его тело, а не "шашечки"
    player.body.setSize(player.width * 0.5, player.height * 0.6);
    player.body.setOffset(player.width * 0.25, player.height * 0.2);

    this.cameras.main.startFollow(player, true, 0.05, 0.05);
    this.cameras.main.setFollowOffset(0, 150);

    cursors = this.input.keyboard.createCursorKeys();
    this.input.on('pointermove', (pointer) => {
        player.x = pointer.x;
    });

    scoreText = this.add.text(20, 20, 'Очки: 0', {
        fontSize: '24px',
        fill: '#000000',
        fontStyle: 'bold'
    }).setScrollFactor(0);
}

function update() {
    if (cursors.left.isDown) {
        player.setVelocityX(-350);
    } else if (cursors.right.isDown) {
        player.setVelocityX(350);
    }

    if (player.x < 0) {
        player.x = 400;
    } else if (player.x > 400) {
        player.x = 0;
    }

    this.physics.add.overlap(player, platforms, (p, plat) => {
        // Проверяем, чтобы нижняя часть игрока была выше платформы
        if (p.body.velocity.y > 0 && p.body.bottom <= plat.body.y + 15) {
            p.setVelocityY(-650);
            if (tg.HapticFeedback) {
                tg.HapticFeedback.impactOccurred('light');
            }
        }
    });

    platforms.children.iterate((plat) => {
        if (plat) {
            if (plat.y > player.y + 400) {
                plat.y = player.y - Phaser.Math.Between(600, 700);
                plat.x = Phaser.Math.Between(50, 350);
                score += 10;
                scoreText.setText('Очки: ' + score);
            }
        }
    });

    if (player.y > this.cameras.main.scrollY + 700) {
        score = 0;
        player.setPosition(200, 300);
        player.setVelocityY(-600);
    }
}
