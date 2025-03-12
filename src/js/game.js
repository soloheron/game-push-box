// 游戏常量
const TILE_SIZE = 40; // 每个瓦片的大小（像素）
const PLAYER = '@';   // 玩家
const PLAYER_ON_GOAL = '+'; // 玩家站在目标点上
const WALL = '#';     // 墙
const BOX = '$';      // 箱子
const BOX_ON_GOAL = '*'; // 箱子在目标点上
const GOAL = '.';     // 目标点
const FLOOR = ' ';    // 地板
const LEVELS_PER_PAGE = 10; // 每页显示的关卡数量

// 游戏状态
let currentLevel = 0;
let moves = 0;
let gameMap = [];
let playerPosition = { x: 0, y: 0 };
let gameWidth = 0;
let gameHeight = 0;
let moveHistory = [];
let isGameComplete = false;
let currentPage = 0; // 当前页码

// DOM元素
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const levelInfoElement = document.getElementById('level-info');
const movesElement = document.getElementById('moves');
const prevLevelButton = document.getElementById('prev-level');
const nextLevelButton = document.getElementById('next-level');
const restartButton = document.getElementById('restart');
const randomLevelButton = document.getElementById('random-level');

// 图像资源
const images = {
    player: new Image(),
    playerOnGoal: new Image(),
    wall: new Image(),
    box: new Image(),
    boxOnGoal: new Image(),
    goal: new Image(),
    floor: new Image()
};

// 初始化图像资源（使用简单的颜色块代替图片）
function initImages() {
    // 创建临时canvas来生成图像
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = TILE_SIZE;
    tempCanvas.height = TILE_SIZE;
    const tempCtx = tempCanvas.getContext('2d');
    
    // 玩家
    tempCtx.fillStyle = '#3498db';
    tempCtx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
    tempCtx.fillStyle = '#2980b9';
    tempCtx.fillRect(5, 5, TILE_SIZE - 10, TILE_SIZE - 10);
    images.player.src = tempCanvas.toDataURL();
    
    // 玩家在目标点上
    tempCtx.clearRect(0, 0, TILE_SIZE, TILE_SIZE);
    tempCtx.fillStyle = '#9b59b6';
    tempCtx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
    tempCtx.fillStyle = '#8e44ad';
    tempCtx.fillRect(5, 5, TILE_SIZE - 10, TILE_SIZE - 10);
    images.playerOnGoal.src = tempCanvas.toDataURL();
    
    // 墙
    tempCtx.clearRect(0, 0, TILE_SIZE, TILE_SIZE);
    tempCtx.fillStyle = '#34495e';
    tempCtx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
    tempCtx.fillStyle = '#2c3e50';
    tempCtx.fillRect(2, 2, TILE_SIZE - 4, TILE_SIZE - 4);
    images.wall.src = tempCanvas.toDataURL();
    
    // 箱子
    tempCtx.clearRect(0, 0, TILE_SIZE, TILE_SIZE);
    tempCtx.fillStyle = '#e67e22';
    tempCtx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
    tempCtx.fillStyle = '#d35400';
    tempCtx.fillRect(5, 5, TILE_SIZE - 10, TILE_SIZE - 10);
    images.box.src = tempCanvas.toDataURL();
    
    // 箱子在目标点上
    tempCtx.clearRect(0, 0, TILE_SIZE, TILE_SIZE);
    tempCtx.fillStyle = '#27ae60';
    tempCtx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
    tempCtx.fillStyle = '#2ecc71';
    tempCtx.fillRect(5, 5, TILE_SIZE - 10, TILE_SIZE - 10);
    images.boxOnGoal.src = tempCanvas.toDataURL();
    
    // 目标点
    tempCtx.clearRect(0, 0, TILE_SIZE, TILE_SIZE);
    tempCtx.fillStyle = '#f1c40f';
    tempCtx.beginPath();
    tempCtx.arc(TILE_SIZE / 2, TILE_SIZE / 2, TILE_SIZE / 4, 0, Math.PI * 2);
    tempCtx.fill();
    images.goal.src = tempCanvas.toDataURL();
    
    // 地板
    tempCtx.clearRect(0, 0, TILE_SIZE, TILE_SIZE);
    tempCtx.fillStyle = '#ecf0f1';
    tempCtx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
    tempCtx.strokeStyle = '#bdc3c7';
    tempCtx.strokeRect(0, 0, TILE_SIZE, TILE_SIZE);
    images.floor.src = tempCanvas.toDataURL();
}

// 初始化游戏
function initGame() {
    initImages();
    
    // 生成1000个关卡
    if (!window.levels || window.levels.length < 1000) {
        try {
            // 确保levels变量已定义
            if (typeof window.levels === 'undefined') {
                console.error('levels变量未定义，使用空数组初始化');
                window.levels = [];
            }
            
            console.log('开始生成关卡，当前关卡数量:', window.levels.length);
            
            // 使用现有关卡或生成新关卡
            const allLevels = generateThousandLevels();
            console.log('生成关卡完成，新关卡数量:', allLevels.length);
            
            window.levels = allLevels; // 使用window.levels确保全局访问
            console.log('最终关卡数量:', window.levels.length);
            
            // 更新页码信息
            document.getElementById('level-info').textContent = `关卡: 1 (共${window.levels.length}关)`;
        } catch (error) {
            console.error('生成关卡时出错:', error);
            // 如果生成失败，至少确保levels是一个数组
            if (!Array.isArray(window.levels)) {
                window.levels = [];
            }
        }
    }
    
    // 创建关卡选择界面
    createLevelSelector();
    
    loadLevel(currentLevel);
    
    // 添加事件监听器
    window.addEventListener('keydown', handleKeyDown);
    prevLevelButton.addEventListener('click', () => {
        if (currentLevel > 0) {
            loadLevel(currentLevel - 1);
        }
    });
    
    nextLevelButton.addEventListener('click', () => {
        if (currentLevel < window.levels.length - 1) {
            loadLevel(currentLevel + 1);
        }
    });
    
    restartButton.addEventListener('click', () => {
        loadLevel(currentLevel);
    });
    
    randomLevelButton.addEventListener('click', () => {
        loadRandomLevel();
    });
}

// 创建关卡选择界面
function createLevelSelector() {
    // 创建关卡选择容器
    const levelSelectorContainer = document.createElement('div');
    levelSelectorContainer.className = 'level-selector-container';
    document.querySelector('.game-container').appendChild(levelSelectorContainer);
    
    // 创建关卡选择器
    const levelSelector = document.createElement('div');
    levelSelector.className = 'level-selector';
    levelSelectorContainer.appendChild(levelSelector);
    
    // 创建分页控制
    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'pagination-container';
    levelSelectorContainer.appendChild(paginationContainer);
    
    // 上一页按钮
    const prevPageButton = document.createElement('button');
    prevPageButton.textContent = '上一页';
    prevPageButton.addEventListener('click', () => {
        if (currentPage > 0) {
            currentPage--;
            updateLevelSelector();
        }
    });
    paginationContainer.appendChild(prevPageButton);
    
    // 页码显示
    const pageInfo = document.createElement('span');
    pageInfo.id = 'page-info';
    pageInfo.textContent = `页码: ${currentPage + 1} / ${Math.ceil(window.levels.length / LEVELS_PER_PAGE)}`;
    paginationContainer.appendChild(pageInfo);
    
    // 下一页按钮
    const nextPageButton = document.createElement('button');
    nextPageButton.textContent = '下一页';
    nextPageButton.addEventListener('click', () => {
        if (currentPage < Math.ceil(window.levels.length / LEVELS_PER_PAGE) - 1) {
            currentPage++;
            updateLevelSelector();
        }
    });
    paginationContainer.appendChild(nextPageButton);
    
    // 更新关卡选择器
    updateLevelSelector();
    
    // 添加CSS样式
    const style = document.createElement('style');
    style.textContent = `
        .level-selector-container {
            margin-top: 20px;
            padding: 10px;
            background-color: #f8f8f8;
            border-top: 1px solid #eaeaea;
        }
        
        .level-selector {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
            margin-bottom: 10px;
            justify-content: center;
        }
        
        .level-selector button {
            width: 40px;
            height: 40px;
            background-color: #2c3e50;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
        }
        
        .level-selector button.active {
            background-color: #e74c3c;
        }
        
        .pagination-container {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 10px;
        }
        
        .pagination-container button {
            background-color: #2c3e50;
            color: white;
            border: none;
            padding: 5px 10px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
        }
        
        #page-info {
            font-size: 14px;
            color: #333;
        }
    `;
    document.head.appendChild(style);
}

// 更新关卡选择器
function updateLevelSelector() {
    const levelSelector = document.querySelector('.level-selector');
    levelSelector.innerHTML = '';
    
    const startLevel = currentPage * LEVELS_PER_PAGE;
    const endLevel = Math.min(startLevel + LEVELS_PER_PAGE, window.levels ? window.levels.length : 0);
    
    for (let i = startLevel; i < endLevel; i++) {
        const levelButton = document.createElement('button');
        levelButton.textContent = i + 1;
        if (i === currentLevel) {
            levelButton.className = 'active';
        }
        levelButton.addEventListener('click', () => {
            loadLevel(i);
        });
        levelSelector.appendChild(levelButton);
    }
    
    // 更新页码信息
    const pageInfo = document.getElementById('page-info');
    const totalPages = Math.ceil((window.levels ? window.levels.length : 0) / LEVELS_PER_PAGE);
    pageInfo.textContent = `页码: ${currentPage + 1} / ${totalPages}`;
}

// 加载关卡
function loadLevel(levelIndex) {
    currentLevel = levelIndex;
    moves = 0;
    moveHistory = [];
    isGameComplete = false;
    
    // 更新当前页码
    const newPage = Math.floor(levelIndex / LEVELS_PER_PAGE);
    if (newPage !== currentPage) {
        currentPage = newPage;
        updateLevelSelector();
    } else {
        // 更新关卡按钮的活动状态
        const levelButtons = document.querySelectorAll('.level-selector button');
        levelButtons.forEach((button, index) => {
            const buttonLevel = currentPage * LEVELS_PER_PAGE + index;
            if (buttonLevel === currentLevel) {
                button.className = 'active';
            } else {
                button.className = '';
            }
        });
    }
    
    // 确保levels存在
    if (!window.levels || !Array.isArray(window.levels) || window.levels.length === 0) {
        console.error('关卡数据不存在或为空');
        return;
    }
    
    // 确保关卡索引有效
    if (levelIndex < 0 || levelIndex >= window.levels.length) {
        console.error('无效的关卡索引:', levelIndex);
        return;
    }
    
    // 解析关卡数据
    const levelData = window.levels[levelIndex].trim().split('\n');
    gameHeight = levelData.length;
    gameWidth = Math.max(...levelData.map(line => line.length));
    
    // 初始化游戏地图
    gameMap = [];
    for (let y = 0; y < gameHeight; y++) {
        const row = [];
        const levelRow = levelData[y] || '';
        for (let x = 0; x < gameWidth; x++) {
            const cell = x < levelRow.length ? levelRow[x] : ' ';
            row.push(cell);
            
            // 记录玩家位置
            if (cell === PLAYER || cell === PLAYER_ON_GOAL) {
                playerPosition = { x, y };
            }
        }
        gameMap.push(row);
    }
    
    // 调整画布大小
    canvas.width = gameWidth * TILE_SIZE;
    canvas.height = gameHeight * TILE_SIZE;
    
    // 更新UI
    updateUI();
    
    // 绘制游戏
    drawGame();
}

// 加载随机生成的关卡
function loadRandomLevel() {
    const randomLevel = generateRandomLevel();
    window.levels.push(randomLevel);
    loadLevel(window.levels.length - 1);
    
    // 更新关卡选择器
    updateLevelSelector();
}

// 更新UI
function updateUI() {
    levelInfoElement.textContent = `关卡: ${currentLevel + 1} (共${window.levels.length}关)`;
    movesElement.textContent = `移动次数: ${moves}`;
}

// 绘制游戏
function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制地图
    for (let y = 0; y < gameHeight; y++) {
        for (let x = 0; x < gameWidth; x++) {
            const tile = gameMap[y][x];
            const posX = x * TILE_SIZE;
            const posY = y * TILE_SIZE;
            
            // 先绘制地板
            ctx.drawImage(images.floor, posX, posY, TILE_SIZE, TILE_SIZE);
            
            // 根据瓦片类型绘制
            switch (tile) {
                case WALL:
                    ctx.drawImage(images.wall, posX, posY, TILE_SIZE, TILE_SIZE);
                    break;
                case PLAYER:
                    ctx.drawImage(images.player, posX, posY, TILE_SIZE, TILE_SIZE);
                    break;
                case PLAYER_ON_GOAL:
                    ctx.drawImage(images.playerOnGoal, posX, posY, TILE_SIZE, TILE_SIZE);
                    break;
                case BOX:
                    ctx.drawImage(images.box, posX, posY, TILE_SIZE, TILE_SIZE);
                    break;
                case BOX_ON_GOAL:
                    ctx.drawImage(images.boxOnGoal, posX, posY, TILE_SIZE, TILE_SIZE);
                    break;
                case GOAL:
                    ctx.drawImage(images.goal, posX, posY, TILE_SIZE, TILE_SIZE);
                    break;
            }
        }
    }
    
    // 如果游戏完成，显示胜利信息
    if (isGameComplete) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = '30px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText('恭喜通关!', canvas.width / 2, canvas.height / 2 - 20);
        
        ctx.font = '20px Arial';
        ctx.fillText(`总移动次数: ${moves}`, canvas.width / 2, canvas.height / 2 + 20);
        
        if (currentLevel < window.levels.length - 1) {
            ctx.fillText('点击"下一关"继续', canvas.width / 2, canvas.height / 2 + 60);
        }
    }
}

// 处理键盘输入
function handleKeyDown(e) {
    if (isGameComplete) return;
    
    let dx = 0;
    let dy = 0;
    
    // 确定移动方向
    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            dy = -1;
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            dy = 1;
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            dx = -1;
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            dx = 1;
            break;
        case 'r':
        case 'R':
            loadLevel(currentLevel);
            return;
        case 'z':
        case 'Z':
            undoMove();
            return;
        default:
            return;
    }
    
    // 尝试移动
    movePlayer(dx, dy);
}

// 移动玩家
function movePlayer(dx, dy) {
    const newX = playerPosition.x + dx;
    const newY = playerPosition.y + dy;
    
    // 检查是否超出边界
    if (newX < 0 || newX >= gameWidth || newY < 0 || newY >= gameHeight) {
        return;
    }
    
    const currentTile = gameMap[playerPosition.y][playerPosition.x];
    const targetTile = gameMap[newY][newX];
    
    // 如果目标是墙，不能移动
    if (targetTile === WALL) {
        return;
    }
    
    // 如果目标是箱子，检查是否可以推动
    if (targetTile === BOX || targetTile === BOX_ON_GOAL) {
        const boxNewX = newX + dx;
        const boxNewY = newY + dy;
        
        // 检查箱子新位置是否超出边界
        if (boxNewX < 0 || boxNewX >= gameWidth || boxNewY < 0 || boxNewY >= gameHeight) {
            return;
        }
        
        const boxTargetTile = gameMap[boxNewY][boxNewX];
        
        // 如果箱子新位置是墙或另一个箱子，不能移动
        if (boxTargetTile === WALL || boxTargetTile === BOX || boxTargetTile === BOX_ON_GOAL) {
            return;
        }
        
        // 保存移动历史
        saveMove();
        
        // 移动箱子
        if (boxTargetTile === GOAL) {
            gameMap[boxNewY][boxNewX] = BOX_ON_GOAL;
        } else {
            gameMap[boxNewY][boxNewX] = BOX;
        }
    } else {
        // 保存移动历史
        saveMove();
    }
    
    // 移动玩家
    if (targetTile === GOAL || targetTile === BOX_ON_GOAL) {
        gameMap[newY][newX] = PLAYER_ON_GOAL;
    } else {
        gameMap[newY][newX] = PLAYER;
    }
    
    // 更新原位置
    if (currentTile === PLAYER_ON_GOAL) {
        gameMap[playerPosition.y][playerPosition.x] = GOAL;
    } else {
        gameMap[playerPosition.y][playerPosition.x] = FLOOR;
    }
    
    // 更新玩家位置
    playerPosition = { x: newX, y: newY };
    
    // 增加移动次数
    moves++;
    
    // 检查游戏是否完成
    checkGameComplete();
    
    // 更新UI和重绘游戏
    updateUI();
    drawGame();
}

// 保存移动历史
function saveMove() {
    const mapCopy = gameMap.map(row => [...row]);
    moveHistory.push({
        map: mapCopy,
        playerPosition: { ...playerPosition },
        moves
    });
}

// 撤销移动
function undoMove() {
    if (moveHistory.length === 0) return;
    
    const lastState = moveHistory.pop();
    gameMap = lastState.map;
    playerPosition = lastState.playerPosition;
    moves = lastState.moves;
    
    updateUI();
    drawGame();
}

// 检查游戏是否完成
function checkGameComplete() {
    for (let y = 0; y < gameHeight; y++) {
        for (let x = 0; x < gameWidth; x++) {
            if (gameMap[y][x] === BOX) {
                return; // 还有箱子不在目标点上
            }
        }
    }
    
    // 所有箱子都在目标点上，游戏完成
    isGameComplete = true;
}

// 当页面加载完成后初始化游戏
window.addEventListener('load', initGame); 