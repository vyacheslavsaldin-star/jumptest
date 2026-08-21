const tg = window.Telegram.WebApp;
tg.expand();

const config = {
    type: Phaser.AUTO,
    width: 400,
    height: 650,
    parent: document.body,
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
    // Загружаем ваши файлы (фон и платформу пока уберем, оставим только ниндзю)
    // Пути должны быть точными: 'assets/hero.jpg'
    this.load.image('hero', 'assets/hero.jpg');
    // Если есть платформа, раскомментируйте:
    // this.load.image('platform', 'assets/platform.jpg');
}

function create() {
    // 1. ЗАЛИВКА ФОНА
    // Вместо черного делаем светло-серый (как в оригинале Doodle Jump)
    // Это уберет черноту, и квадрат ниндзи станет почти незаметен.
    this.cameras.main.setBackgroundColor('#f0f0f0'); // Светло-серый цвет

    // 2. СОЗДАНИЕ ИГРОКА
    player = this.physics.add.sprite(200, 400, 'hero');
    player.setScale(0.3); // Подгоните масштаб, если нужно
    player.setBounce(0);
    player.setVelocityY(-600);

    // 3. ПЛАТФОРМЫ (Временные, если нет своей картинки)
    platforms = this.physics.add.group({
        allowGravity: false,
        immovable: true
    });
    
    // Стартовая платформа (коричневый прямоугольник)
    let graphics = this.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(0x8b4513, 1); // Коричневый цвет
    graphics.fillRect(0, 0, 100, 20);
    graphics.generateTexture('tempPlatform', 100, 20);
    graphics.destroy();

    let basePlatform = platforms.create(200, 580, 'tempPlatform');
    basePlatform.setScale(1.2);

    for (let i = 1; i < 7; i++) {
        let x = Phaser.Math.Between(50, 350);
        let y = 580 - (i * 90);
        let plat = platforms.create(x, y, 'tempPlatform');
        plat.setScale(1);
    }

    // 4. КАМЕРА И УПРАВЛЕНИЕ
    this.cameras.main.startFollow(player, true, 0.05, 0.05);
    this.cameras.main.setFollowOffset(0, 150);
    cursors = this.input.keyboard.createCursorKeys();
    this.input.on('pointermove', (pointer) => {
        player.x = pointer.x;
    });

    // 5. ТЕКСТ СЧЕТА (меняем цвет на черный, так как фон стал светлым)
    scoreText = this.add.text(20, 20, 'Очки: 0', {
        fontSize: '24px',
        fill: '#000000', // Черный текст
        fontStyle: 'bold',
        stroke: '#ffffff', // Белая обводка для читаемости
        strokeThickness: 3
    }).setScrollFactor(0);
}

function update() {
    // Управление и логика остаются без изменений
    if (cursors.left.isDown) { player.setVelocityX(-350); } 
    else if (cursors.right.isDown) { player.setVelocityX(350); }

    if (player.x < 0) { player.x = 400; } 
    else if (player.x > 400) { player.x = 0; }

    this.physics.add.overlap(player, platforms, (p, plat) => {
        if (p.body.velocity.y > 0 && p.y < plat.y - 10) {
            p.setVelocityY(-650);
            if (tg.HapticFeedback) { tg.HapticFeedback.impactOccurred('light'); }
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
