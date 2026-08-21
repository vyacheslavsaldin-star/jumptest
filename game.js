const tg = window.Telegram.WebApp;
tg.expand();

const config = {
    type: Phaser.AUTO,
    width: 400,
    height: 650,
    parent: document.body,
    scale: {
        mode: Phaser.Scale.RESIZE,
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
    this.cameras.main.setBackgroundColor('#ffffff');

    platforms = this.physics.add.group({
        allowGravity: false,
        immovable: true
    });

    // Функция создания платформы с уменьшенным физическим коллайдером
    function createPlatform(scene, x, y) {
        let plat = platforms.create(x, y, 'platform');
        plat.setScale(0.4);
        plat.setBlendMode(Phaser.BlendModes.MULTIPLY);
        // Сужаем хитбокс по вертикали и горизонтали, чтобы не было «отскока от пустоты»
        plat.body.setSize(plat.width * 0.8, plat.height * 0.3);
        plat.body.setOffset(plat.width * 0.1, plat.height * 0.3);
        return plat;
    }

    // Стартовая платформа
    createPlatform(this, 200, 580);

    // Генерация верхних платформ
    for (let i = 1; i < 7; i++) {
        let x = Phaser.Math.Between(50, 350);
        let y = 580 - (i * 90);
        createPlatform(this, x, y);
    }

    // Игрок
    player = this.physics.add.sprite(200, 400, 'hero');
    player.setScale(0.22);
    player.setBlendMode(Phaser.BlendModes.MULTIPLY);
    player.setBounce(0);
    player.setVelocityY(-600);
    // Подгоняем хитбокс ниндзи под его тело
    player.body.setSize(player.width * 0.6, player.height * 0.8);

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

    // Проверяем столкновение: персонаж должен падать вниз и касаться верха платформы
    this.physics.add.overlap(player, platforms, (p, plat) => {
        if (p.body.velocity.y > 0 && p.y < plat.y) {
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
