const tg = window.Telegram.WebApp;
tg.expand();

// Настройки игры
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
let cameraY = 0;

function preload() {
    // Загружаем картинки из папки assets (названия файлов подставьте под ваши)
    this.load.image('hero', 'assets/hero.png');
    this.load.image('platform', 'assets/platform.png');
    // Если фона нет, можно закомментировать следующую строку
    // this.load.image('background', 'assets/background.png');
}

function create() {
    // Фоновое изображение (растягиваем по центру, если есть)
    // this.add.image(200, 325, 'background');

    // Группа платформ с физикой
    platforms = this.physics.add.group({
        allowGravity: false,
        immovable: true
    });

    // Создаем стартовую платформу под игроком
    let basePlatform = platforms.create(200, 580, 'platform');
    basePlatform.setScale(0.8);

    // Создаем несколько платформ выше
    for (let i = 1; i < 7; i++) {
        let x = Phaser.Math.Between(50, 350);
        let y = 580 - (i * 90);
        let plat = platforms.create(x, y, 'platform');
        plat.setScale(0.8);
    }

    // Создаем игрока (ниндзю)
    player = this.physics.add.sprite(200, 500, 'hero');
    player.setScale(0.3); // Подгоните масштаб под вашу картинку если она большая
    player.setBounce(0);
    player.setCollideWorldBounds(false);

    // Первоначальный прыжок вверх
    player.setVelocityY(-600);

    // Настройка камеры (следит за игроком по вертикали)
    this.cameras.main.startFollow(player, true, 0.05, 0.05);
    this.cameras.main.setFollowOffset(0, 150);

    // Управление с клавиатуры (для тестов на ПК)
    cursors = this.input.keyboard.createCursorKeys();

    // Управление касаниями для телефонов (свайпы / тапы влево-вправо)
    this.input.on('pointermove', (pointer) => {
        if (pointer.isDown) {
            if (pointer.x < 200) {
                player.setVelocityX(-250);
            } else {
                player.setVelocityX(250);
            }
        }
    });

    this.input.on('pointerup', () => {
        player.setVelocityX(0);
    });

    // Текст с очками на экране
    scoreText = this.add.text(20, 20, 'Очки: 0', {
        fontSize: '24px',
        fill: '#ffffff',
        fontStyle: 'bold'
    }).setScrollFactor(0); // Текст не движется вместе с камерой
}

function update() {
    // Обработка клавиатуры (стрелки влево/вправо)
    if (cursors.left.isDown) {
        player.setVelocityX(-250);
    } else if (cursors.right.isDown) {
        player.setVelocityX(250);
    } else if (!this.input.activePointer.isDown) {
        player.setVelocityX(0);
    }

    // Телепортация через левый/правый край экрана (фишка Doodle Jump)
    if (player.x < 0) {
        player.x = 400;
    } else if (player.x > 400) {
        player.x = 0;
    }

    // Проверка столкновения игрока с платформами (отскок только когда падаем вниз)
    this.physics.add.overlap(player, platforms, (p, plat) => {
        if (p.body.velocity.y > 0 && p.y < plat.y - 10) {
            p.setVelocityY(-650); // Сила прыжка от платформы
            
            // Тактильный отклик в Telegram при прыжке
            if (tg.HapticFeedback) {
                tg.HapticFeedback.impactOccurred('light');
            }
        }
    });

    // Бесконечная генерация платформ сверху и удаление старых снизу
    platforms.children.iterate((plat) => {
        if (plat) {
            // Если платформа ушла далеко вниз за экран — переносим её наверх
            if (plat.y > player.y + 400) {
                plat.y = player.y - Phaser.Math.Between(600, 700);
                plat.x = Phaser.Math.Between(50, 350);
                
                // Увеличиваем счет за преодоление высоты
                score += 10;
                scoreText.setText('Очки: ' + score);
            }
        }
    });

    // Условие проигрыша: если игрок упал ниже экрана
    if (player.y > this.cameras.main.scrollY + 700) {
        // Сброс игры при падении
        score = 0;
        player.setPosition(200, 300);
        player.setVelocityY(-600);
    }
}
