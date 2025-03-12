// 随机关卡生成器

// 常量
const MIN_WIDTH = 8;
const MAX_WIDTH = 15;
const MIN_HEIGHT = 8;
const MAX_HEIGHT = 15;
const MIN_BOXES = 3;
const MAX_BOXES = 7;
const MIN_WALLS_PERCENT = 20;
const MAX_WALLS_PERCENT = 30;

// 生成随机关卡
function generateRandomLevel() {
    // 随机确定地图大小
    const width = getRandomInt(MIN_WIDTH, MAX_WIDTH);
    const height = getRandomInt(MIN_HEIGHT, MAX_HEIGHT);
    
    // 初始化空地图
    const map = Array(height).fill().map(() => Array(width).fill(' '));
    
    // 添加边界墙
    for (let x = 0; x < width; x++) {
        map[0][x] = '#';
        map[height - 1][x] = '#';
    }
    for (let y = 0; y < height; y++) {
        map[y][0] = '#';
        map[y][width - 1] = '#';
    }
    
    // 添加随机内部墙
    const totalCells = (width - 2) * (height - 2);
    const wallsCount = Math.floor(totalCells * (getRandomInt(MIN_WALLS_PERCENT, MAX_WALLS_PERCENT) / 100));
    
    for (let i = 0; i < wallsCount; i++) {
        const x = getRandomInt(1, width - 2);
        const y = getRandomInt(1, height - 2);
        map[y][x] = '#';
    }
    
    // 确定箱子数量
    const boxesCount = getRandomInt(MIN_BOXES, MAX_BOXES);
    
    // 放置玩家
    let playerX, playerY;
    do {
        playerX = getRandomInt(1, width - 2);
        playerY = getRandomInt(1, height - 2);
    } while (map[playerY][playerX] !== ' ');
    
    map[playerY][playerX] = '@';
    
    // 放置箱子和目标点
    const boxes = [];
    const goals = [];
    
    for (let i = 0; i < boxesCount; i++) {
        // 放置箱子
        let boxX, boxY;
        do {
            boxX = getRandomInt(1, width - 2);
            boxY = getRandomInt(1, height - 2);
        } while (map[boxY][boxX] !== ' ' || !isValidBoxPosition(map, boxX, boxY));
        
        map[boxY][boxX] = '$';
        boxes.push({ x: boxX, y: boxY });
        
        // 放置目标点
        let goalX, goalY;
        do {
            goalX = getRandomInt(1, width - 2);
            goalY = getRandomInt(1, height - 2);
        } while (map[goalY][goalX] !== ' ');
        
        map[goalY][goalX] = '.';
        goals.push({ x: goalX, y: goalY });
    }
    
    // 验证关卡是否可解
    if (!isLevelSolvable(map, { x: playerX, y: playerY }, boxes, goals)) {
        // 如果不可解，重新生成
        return generateRandomLevel();
    }
    
    // 将地图转换为字符串
    return map.map(row => row.join('')).join('\n');
}

// 批量生成关卡
function generateMultipleLevels(count, startingDifficulty = 1, maxDifficulty = 10) {
    const generatedLevels = [];
    
    for (let i = 0; i < count; i++) {
        // 根据进度增加难度
        const progress = i / count;
        const currentDifficulty = Math.floor(startingDifficulty + progress * (maxDifficulty - startingDifficulty));
        
        // 根据难度调整参数
        adjustDifficultyParameters(currentDifficulty);
        
        // 生成关卡
        const level = generateRandomLevel();
        generatedLevels.push(level);
    }
    
    return generatedLevels;
}

// 根据难度调整参数
function adjustDifficultyParameters(difficulty) {
    // 难度从1到10
    const normalizedDifficulty = Math.min(Math.max(difficulty, 1), 10);
    
    // 根据难度调整箱子数量
    MIN_BOXES = Math.min(3 + Math.floor(normalizedDifficulty / 2), 7);
    MAX_BOXES = Math.min(4 + Math.floor(normalizedDifficulty / 2), 12);
    
    // 根据难度调整墙壁百分比
    MIN_WALLS_PERCENT = Math.min(15 + normalizedDifficulty, 30);
    MAX_WALLS_PERCENT = Math.min(20 + normalizedDifficulty, 40);
    
    // 根据难度调整地图大小
    MIN_WIDTH = Math.min(8 + Math.floor(normalizedDifficulty / 3), 12);
    MAX_WIDTH = Math.min(10 + Math.floor(normalizedDifficulty / 2), 20);
    MIN_HEIGHT = Math.min(8 + Math.floor(normalizedDifficulty / 3), 12);
    MAX_HEIGHT = Math.min(10 + Math.floor(normalizedDifficulty / 2), 20);
}

// 生成具有特定模式的关卡
function generatePatternLevel(pattern) {
    let width, height, boxesCount;
    let map;
    
    switch (pattern) {
        case 'spiral':
            // 螺旋形墙壁的关卡
            width = getRandomInt(11, 15);
            height = getRandomInt(11, 15);
            map = generateSpiralMap(width, height);
            boxesCount = getRandomInt(3, 6);
            break;
            
        case 'maze':
            // 迷宫形关卡
            width = getRandomInt(11, 17);
            height = getRandomInt(11, 17);
            map = generateMazeMap(width, height);
            boxesCount = getRandomInt(3, 5);
            break;
            
        case 'symmetrical':
            // 对称形关卡
            width = getRandomInt(9, 15);
            height = getRandomInt(9, 15);
            map = generateSymmetricalMap(width, height);
            boxesCount = getRandomInt(4, 8);
            break;
            
        case 'rooms':
            // 房间形关卡
            width = getRandomInt(11, 17);
            height = getRandomInt(11, 17);
            map = generateRoomsMap(width, height);
            boxesCount = getRandomInt(4, 7);
            break;
            
        default:
            // 默认随机关卡
            return generateRandomLevel();
    }
    
    // 放置玩家
    let playerX, playerY;
    do {
        playerX = getRandomInt(1, width - 2);
        playerY = getRandomInt(1, height - 2);
    } while (map[playerY][playerX] !== ' ');
    
    map[playerY][playerX] = '@';
    
    // 放置箱子和目标点
    const boxes = [];
    const goals = [];
    
    for (let i = 0; i < boxesCount; i++) {
        // 放置箱子
        let boxX, boxY;
        do {
            boxX = getRandomInt(1, width - 2);
            boxY = getRandomInt(1, height - 2);
        } while (map[boxY][boxX] !== ' ' || !isValidBoxPosition(map, boxX, boxY));
        
        map[boxY][boxX] = '$';
        boxes.push({ x: boxX, y: boxY });
        
        // 放置目标点
        let goalX, goalY;
        do {
            goalX = getRandomInt(1, width - 2);
            goalY = getRandomInt(1, height - 2);
        } while (map[goalY][goalX] !== ' ');
        
        map[goalY][goalX] = '.';
        goals.push({ x: goalX, y: goalY });
    }
    
    // 验证关卡是否可解
    if (!isLevelSolvable(map, { x: playerX, y: playerY }, boxes, goals)) {
        // 如果不可解，重新生成
        return generatePatternLevel(pattern);
    }
    
    // 将地图转换为字符串
    return map.map(row => row.join('')).join('\n');
}

// 生成螺旋形地图
function generateSpiralMap(width, height) {
    const map = Array(height).fill().map(() => Array(width).fill(' '));
    
    // 添加边界墙
    for (let x = 0; x < width; x++) {
        map[0][x] = '#';
        map[height - 1][x] = '#';
    }
    for (let y = 0; y < height; y++) {
        map[y][0] = '#';
        map[y][width - 1] = '#';
    }
    
    // 添加螺旋形墙壁
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    const maxRadius = Math.min(centerX, centerY) - 1;
    
    for (let radius = 2; radius <= maxRadius; radius += 2) {
        // 绘制螺旋的一部分
        for (let i = -radius; i <= radius; i++) {
            if (centerY + radius < height - 1) map[centerY + radius][centerX + i] = '#';
            if (centerX + radius < width - 1) map[centerY + i][centerX + radius] = '#';
            if (centerY - radius > 0) map[centerY - radius][centerX + i] = '#';
            if (centerX - radius > 0) map[centerY + i][centerX - radius] = '#';
        }
        
        // 在螺旋中添加开口
        const side = getRandomInt(0, 3);
        const pos = getRandomInt(-radius + 1, radius - 1);
        
        switch (side) {
            case 0: // 上
                if (centerY - radius > 0) map[centerY - radius][centerX + pos] = ' ';
                break;
            case 1: // 右
                if (centerX + radius < width - 1) map[centerY + pos][centerX + radius] = ' ';
                break;
            case 2: // 下
                if (centerY + radius < height - 1) map[centerY + radius][centerX + pos] = ' ';
                break;
            case 3: // 左
                if (centerX - radius > 0) map[centerY + pos][centerX - radius] = ' ';
                break;
        }
    }
    
    return map;
}

// 生成迷宫形地图
function generateMazeMap(width, height) {
    const map = Array(height).fill().map(() => Array(width).fill('#'));
    
    // 使用深度优先搜索生成迷宫
    const stack = [];
    const startX = 1;
    const startY = 1;
    
    map[startY][startX] = ' ';
    stack.push({ x: startX, y: startY });
    
    while (stack.length > 0) {
        const current = stack[stack.length - 1];
        const { x, y } = current;
        
        // 获取未访问的相邻单元格
        const neighbors = [];
        
        if (y - 2 > 0 && map[y - 2][x] === '#') neighbors.push({ x, y: y - 2, dirX: 0, dirY: -1 });
        if (x + 2 < width - 1 && map[y][x + 2] === '#') neighbors.push({ x: x + 2, y, dirX: 1, dirY: 0 });
        if (y + 2 < height - 1 && map[y + 2][x] === '#') neighbors.push({ x, y: y + 2, dirX: 0, dirY: 1 });
        if (x - 2 > 0 && map[y][x - 2] === '#') neighbors.push({ x: x - 2, y, dirX: -1, dirY: 0 });
        
        if (neighbors.length > 0) {
            // 随机选择一个未访问的相邻单元格
            const next = neighbors[Math.floor(Math.random() * neighbors.length)];
            
            // 打通墙壁
            map[y + next.dirY][x + next.dirX] = ' ';
            map[next.y][next.x] = ' ';
            
            // 将下一个单元格加入栈
            stack.push({ x: next.x, y: next.y });
        } else {
            // 如果没有未访问的相邻单元格，回溯
            stack.pop();
        }
    }
    
    // 添加一些随机开口，使迷宫不那么复杂
    const openings = Math.floor((width * height) * 0.05);
    for (let i = 0; i < openings; i++) {
        const x = getRandomInt(1, width - 2);
        const y = getRandomInt(1, height - 2);
        if (map[y][x] === '#') {
            // 确保不会创建2x2的空地
            let canOpen = true;
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if (dx === 0 && dy === 0) continue;
                    if (y + dy < 0 || y + dy >= height || x + dx < 0 || x + dx >= width) continue;
                    
                    let emptyNeighbors = 0;
                    for (let ny = -1; ny <= 1; ny++) {
                        for (let nx = -1; nx <= 1; nx++) {
                            if (nx === 0 && ny === 0) continue;
                            if (y + dy + ny < 0 || y + dy + ny >= height || x + dx + nx < 0 || x + dx + nx >= width) continue;
                            if (map[y + dy + ny][x + dx + nx] === ' ') emptyNeighbors++;
                        }
                    }
                    
                    if (emptyNeighbors > 2) canOpen = false;
                }
            }
            
            if (canOpen) map[y][x] = ' ';
        }
    }
    
    return map;
}

// 生成对称形地图
function generateSymmetricalMap(width, height) {
    const map = Array(height).fill().map(() => Array(width).fill(' '));
    
    // 添加边界墙
    for (let x = 0; x < width; x++) {
        map[0][x] = '#';
        map[height - 1][x] = '#';
    }
    for (let y = 0; y < height; y++) {
        map[y][0] = '#';
        map[y][width - 1] = '#';
    }
    
    // 添加对称的内部墙
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    
    // 水平对称
    for (let y = 1; y < centerY; y++) {
        for (let x = 1; x < width - 1; x++) {
            if (Math.random() < 0.2) {
                map[y][x] = '#';
                map[height - 1 - y][x] = '#';
            }
        }
    }
    
    // 垂直对称
    for (let x = 1; x < centerX; x++) {
        for (let y = 1; y < height - 1; y++) {
            if (Math.random() < 0.2) {
                map[y][x] = '#';
                map[y][width - 1 - x] = '#';
            }
        }
    }
    
    return map;
}

// 生成房间形地图
function generateRoomsMap(width, height) {
    const map = Array(height).fill().map(() => Array(width).fill('#'));
    
    // 添加边界墙
    for (let x = 0; x < width; x++) {
        map[0][x] = '#';
        map[height - 1][x] = '#';
    }
    for (let y = 0; y < height; y++) {
        map[y][0] = '#';
        map[y][width - 1] = '#';
    }
    
    // 创建房间
    const roomCount = getRandomInt(3, 6);
    const rooms = [];
    
    for (let i = 0; i < roomCount; i++) {
        const roomWidth = getRandomInt(3, 6);
        const roomHeight = getRandomInt(3, 6);
        const roomX = getRandomInt(1, width - roomWidth - 1);
        const roomY = getRandomInt(1, height - roomHeight - 1);
        
        rooms.push({ x: roomX, y: roomY, width: roomWidth, height: roomHeight });
        
        // 填充房间
        for (let y = roomY; y < roomY + roomHeight; y++) {
            for (let x = roomX; x < roomX + roomWidth; x++) {
                map[y][x] = ' ';
            }
        }
    }
    
    // 连接房间
    for (let i = 0; i < rooms.length - 1; i++) {
        const room1 = rooms[i];
        const room2 = rooms[i + 1];
        
        // 找到两个房间的中心点
        const x1 = Math.floor(room1.x + room1.width / 2);
        const y1 = Math.floor(room1.y + room1.height / 2);
        const x2 = Math.floor(room2.x + room2.width / 2);
        const y2 = Math.floor(room2.y + room2.height / 2);
        
        // 创建连接走廊
        if (Math.random() < 0.5) {
            // 先水平后垂直
            for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
                map[y1][x] = ' ';
            }
            for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
                map[y][x2] = ' ';
            }
        } else {
            // 先垂直后水平
            for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
                map[y][x1] = ' ';
            }
            for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
                map[y2][x] = ' ';
            }
        }
    }
    
    return map;
}

// 检查箱子位置是否有效（不在死角）
function isValidBoxPosition(map, x, y) {
    // 检查是否在角落
    const isWallUp = map[y - 1][x] === '#';
    const isWallDown = map[y + 1][x] === '#';
    const isWallLeft = map[y][x - 1] === '#';
    const isWallRight = map[y][x + 1] === '#';
    
    // 如果箱子在两面墙的角落，则位置无效
    if ((isWallUp && isWallLeft) || 
        (isWallUp && isWallRight) || 
        (isWallDown && isWallLeft) || 
        (isWallDown && isWallRight)) {
        return false;
    }
    
    return true;
}

// 简化的关卡可解性检查
// 注意：这是一个简化版本，不能保证100%准确，但可以过滤掉明显不可解的关卡
function isLevelSolvable(map, player, boxes, goals) {
    // 检查每个箱子是否可以到达至少一个目标点
    for (const box of boxes) {
        let canReachAnyGoal = false;
        
        for (const goal of goals) {
            // 简单检查：箱子和目标之间是否有直接路径
            // 这是非常简化的检查，实际上需要更复杂的路径查找算法
            if (hasSimplePath(map, box, goal)) {
                canReachAnyGoal = true;
                break;
            }
        }
        
        if (!canReachAnyGoal) {
            return false;
        }
    }
    
    // 检查玩家是否可以到达每个箱子
    for (const box of boxes) {
        if (!hasSimplePath(map, player, box)) {
            return false;
        }
    }
    
    return true;
}

// 简单路径检查
function hasSimplePath(map, start, end) {
    // 这是一个非常简化的检查，只考虑直线路径
    // 实际上需要使用BFS或A*算法进行完整的路径查找
    
    // 检查水平路径
    if (start.y === end.y) {
        const y = start.y;
        const startX = Math.min(start.x, end.x);
        const endX = Math.max(start.x, end.x);
        
        for (let x = startX + 1; x < endX; x++) {
            if (map[y][x] === '#') {
                return false;
            }
        }
        return true;
    }
    
    // 检查垂直路径
    if (start.x === end.x) {
        const x = start.x;
        const startY = Math.min(start.y, end.y);
        const endY = Math.max(start.y, end.y);
        
        for (let y = startY + 1; y < endY; y++) {
            if (map[y][x] === '#') {
                return false;
            }
        }
        return true;
    }
    
    // 如果不在同一行或同一列，假设有路径
    // 这是一个简化，实际上需要更复杂的路径查找
    return true;
}

// 获取指定范围内的随机整数
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 生成1000个关卡
function generateThousandLevels() {
    console.log('开始生成1000个关卡');
    const patterns = ['spiral', 'maze', 'symmetrical', 'rooms'];
    const generatedLevels = [];
    
    // 确保levels变量存在
    const existingLevels = window.levels || [];
    console.log('现有关卡数量:', existingLevels.length);
    
    // 保留现有的关卡（最多100个）
    const existingCount = Math.min(existingLevels.length, 100);
    for (let i = 0; i < existingCount; i++) {
        generatedLevels.push(existingLevels[i]);
    }
    console.log('保留现有关卡后数量:', generatedLevels.length);
    
    // 如果没有足够的现有关卡，生成一些基本关卡
    if (existingCount === 0) {
        // 添加一个简单的起始关卡
        generatedLevels.push(`
#####
#@  #
# $ #
# . #
#####`);
        console.log('添加基本关卡后数量:', generatedLevels.length);
    }
    
    // 强制生成1000个关卡
    const targetCount = 1000;
    const remainingCount = targetCount - generatedLevels.length;
    
    console.log('开始生成剩余关卡，目标数量:', remainingCount);
    
    // 生成剩余的新关卡
    for (let i = 0; i < remainingCount; i++) {
        if (i % 100 === 0) {
            console.log(`已生成 ${i}/${remainingCount} 个关卡`);
        }
        
        // 每100个关卡循环使用一种模式
        const patternIndex = Math.floor(i / 100) % patterns.length;
        const pattern = patterns[patternIndex];
        
        // 根据进度增加难度
        const progress = i / remainingCount;
        const currentDifficulty = Math.floor(1 + progress * 9);
        
        // 根据难度调整参数
        adjustDifficultyParameters(currentDifficulty);
        
        try {
            // 生成关卡
            let level;
            if (i < 100) {
                // 对于前100个关卡，尝试使用模式生成
                level = generatePatternLevel(pattern);
            } else {
                // 对于其余关卡，使用简单的随机生成以加快速度
                level = generateSimpleLevel(3 + Math.floor(currentDifficulty / 2));
            }
            generatedLevels.push(level);
        } catch (error) {
            console.error(`生成第${generatedLevels.length + 1}关时出错:`, error);
            // 添加一个简单的备用关卡
            generatedLevels.push(`
######
#    #
# @$ #
# .  #
#    #
######`);
        }
    }
    
    console.log('关卡生成完成，最终数量:', generatedLevels.length);
    return generatedLevels;
}

// 生成简单关卡（用于快速生成大量关卡）
function generateSimpleLevel(boxCount) {
    // 创建一个简单的矩形地图
    const width = 8 + Math.floor(Math.random() * 5);
    const height = 8 + Math.floor(Math.random() * 5);
    
    // 初始化空地图
    const map = Array(height).fill().map(() => Array(width).fill(' '));
    
    // 添加边界墙
    for (let x = 0; x < width; x++) {
        map[0][x] = '#';
        map[height - 1][x] = '#';
    }
    for (let y = 0; y < height; y++) {
        map[y][0] = '#';
        map[y][width - 1] = '#';
    }
    
    // 添加一些随机内部墙
    const wallCount = Math.floor((width * height) * 0.1);
    for (let i = 0; i < wallCount; i++) {
        const x = 1 + Math.floor(Math.random() * (width - 2));
        const y = 1 + Math.floor(Math.random() * (height - 2));
        map[y][x] = '#';
    }
    
    // 放置玩家
    let playerX, playerY;
    do {
        playerX = 1 + Math.floor(Math.random() * (width - 2));
        playerY = 1 + Math.floor(Math.random() * (height - 2));
    } while (map[playerY][playerX] !== ' ');
    map[playerY][playerX] = '@';
    
    // 放置箱子和目标
    for (let i = 0; i < boxCount; i++) {
        // 放置箱子
        let boxX, boxY;
        do {
            boxX = 1 + Math.floor(Math.random() * (width - 2));
            boxY = 1 + Math.floor(Math.random() * (height - 2));
        } while (map[boxY][boxX] !== ' ');
        map[boxY][boxX] = '$';
        
        // 放置目标
        let goalX, goalY;
        do {
            goalX = 1 + Math.floor(Math.random() * (width - 2));
            goalY = 1 + Math.floor(Math.random() * (height - 2));
        } while (map[goalY][goalX] !== ' ');
        map[goalY][goalX] = '.';
    }
    
    // 将地图转换为字符串
    return map.map(row => row.join('')).join('\n');
}
