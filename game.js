(() => {
  const board = document.querySelector('#snake-board');
  if (!board) return;
  const context = board.getContext('2d');
  const scoreElement = document.querySelector('#score');
  const highScoreElement = document.querySelector('#high-score');
  const statusElement = document.querySelector('#game-status');
  const size = 18;
  const cell = board.width / size;
  let snake = [];
  let food = { x: 10, y: 10 };
  let direction = { x: 1, y: 0 };
  let queuedDirection = direction;
  let score = 0;
  let highScore = Number(localStorage.getItem('snake-high-score') || 0);
  let timer = null;
  let paused = false;
  let gameOver = false;
  highScoreElement.textContent = highScore;

  function reset() {
    snake = [{ x: 8, y: 9 }, { x: 7, y: 9 }, { x: 6, y: 9 }];
    direction = { x: 1, y: 0 };
    queuedDirection = direction;
    score = 0;
    paused = false;
    gameOver = false;
    scoreElement.textContent = score;
    statusElement.textContent = 'Start를 눌러 게임을 시작하세요.';
    placeFood();
    draw();
  }

  function placeFood() {
    do {
      food = { x: Math.floor(Math.random() * size), y: Math.floor(Math.random() * size) };
    } while (snake.some((part) => part.x === food.x && part.y === food.y));
  }

  function draw() {
    context.fillStyle = '#0a141d';
    context.fillRect(0, 0, board.width, board.height);
    context.fillStyle = '#ff705f';
    context.fillRect(food.x * cell + 2, food.y * cell + 2, cell - 4, cell - 4);
    snake.forEach((part, index) => {
      context.fillStyle = index === 0 ? '#f5f6f4' : '#8d9aa4';
      context.fillRect(part.x * cell + 2, part.y * cell + 2, cell - 4, cell - 4);
    });
  }

  function setDirection(next) {
    const opposite = next.x + direction.x === 0 && next.y + direction.y === 0;
    if (opposite) return;
    queuedDirection = next;
  }

  function tick() {
    if (paused || gameOver) return;
    direction = queuedDirection;
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    const hitWall = head.x < 0 || head.x >= size || head.y < 0 || head.y >= size;
    const hitSelf = snake.some((part) => part.x === head.x && part.y === head.y);
    if (hitWall || hitSelf) {
      gameOver = true;
      clearInterval(timer);
      timer = null;
      statusElement.textContent = 'Game over — Restart를 눌러 다시 시작하세요.';
      return;
    }
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score += 1;
      scoreElement.textContent = score;
      if (score > highScore) {
        highScore = score;
        localStorage.setItem('snake-high-score', highScore);
        highScoreElement.textContent = highScore;
      }
      placeFood();
    } else snake.pop();
    draw();
  }

  function start() {
    if (gameOver) reset();
    if (timer) return;
    paused = false;
    statusElement.textContent = 'Playing';
    timer = setInterval(tick, 130);
  }

  function pause() {
    if (!timer && !paused) return;
    paused = !paused;
    statusElement.textContent = paused ? 'Paused' : 'Playing';
  }

  document.querySelector('#start-game').addEventListener('click', start);
  document.querySelector('#pause-game').addEventListener('click', pause);
  document.querySelector('#restart-game').addEventListener('click', () => { clearInterval(timer); timer = null; reset(); });
  document.querySelectorAll('[data-action]').forEach((button) => button.addEventListener('click', () => {
    const moves = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
    setDirection(moves[button.dataset.action]);
  }));
  document.addEventListener('keydown', (event) => {
    const moves = { ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 }, ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 }, KeyW: { x: 0, y: -1 }, KeyS: { x: 0, y: 1 }, KeyA: { x: -1, y: 0 }, KeyD: { x: 1, y: 0 } };
    if (moves[event.code]) { event.preventDefault(); setDirection(moves[event.code]); }
  });
  board.addEventListener('touchstart', (event) => {
    const touch = event.changedTouches[0];
    board.dataset.touchX = touch.clientX;
    board.dataset.touchY = touch.clientY;
  }, { passive: true });
  board.addEventListener('touchend', (event) => {
    const touch = event.changedTouches[0];
    const dx = touch.clientX - Number(board.dataset.touchX);
    const dy = touch.clientY - Number(board.dataset.touchY);
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
    setDirection(Math.abs(dx) > Math.abs(dy) ? { x: Math.sign(dx), y: 0 } : { x: 0, y: Math.sign(dy) });
  }, { passive: true });
  reset();
})();
