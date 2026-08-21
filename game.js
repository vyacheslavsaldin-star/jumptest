const tg = window.Telegram.WebApp;
tg.expand();

const config = {
    type: Phaser.AUTO,
    width: 400,
    height: 650,
    parent: document.body,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 900 },
            debug: false
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
    // Делаем фон игры чисто белым (под цвет ваших картинок)
    this.cameras.main.setBackgroundColor('#ffffff');

    // Группа платформ
    platforms = this.physics.add.group({
        allowGravity: false,
        immovable: true
    });

    // Создаем стартовую платформу
    let basePlatform = platforms.create(200, 580, 'platform');
    basePlatform.setScale(0.5);
    basePlatform.setBlendMode(Phaser.BlendModes.MULTIPLY); // Убирает белый фон у JPG

    // Генерация верхних платформ
    for (let i = 1; i < 7; i++) {
        let x = Phaser.Math.Between(50, 350);
        let y = 580 - (i * 90);
        let plat = platforms.create(x, y, 'platform');
        plat.setScale(0.5);
        plat.setBlendMode(Phaser.BlendModes.MULTIPLY); // Убирает белый фон у платформ
    }

    // Игрок
    player = this.physics.add.sprite(200, 400, 'hero');
    player.setScale(0.25);
    player.setBlendMode(Phaser.BlendModes.MULTIPLY); // Убирает белый фон у ниндзи
    player.setBounce(0);
    player.setVelocityY(-600);

    // Камера следит за игроком
    this.cameras.main.startFollow(player, true, 0.05, 0.05);
    this.cameras.main.setFollowOffset(0, 150);

    // Управление
    cursors = this.input.keyboard.createCursorKeys();
    this.input.on('pointermove', (pointer) => {
        player.x = pointer.x;
    });

    // Текст с очками
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
        if (p.body.velocity.y > 0 && p.y < plat.y - 10) {
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
