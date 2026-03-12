import { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/Button';
import { RotateCcw, Play, Pause, X, Coins, TrendingUp } from 'lucide-react';
import { submitGameScore, type GameScoreResponse } from '../../services/api';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

// Tetromino shapes
const TETROMINOS = {
    0: { shape: [[0]], color: 'bg-transparent' },
    I: { shape: [[0, 'I', 0, 0], [0, 'I', 0, 0], [0, 'I', 0, 0], [0, 'I', 0, 0]], color: 'bg-cyan-400 border-cyan-500' },
    J: { shape: [[0, 'J', 0], [0, 'J', 0], ['J', 'J', 0]], color: 'bg-blue-500 border-blue-600' },
    L: { shape: [[0, 'L', 0], [0, 'L', 0], [0, 'L', 'L']], color: 'bg-orange-500 border-orange-600' },
    O: { shape: [['O', 'O'], ['O', 'O']], color: 'bg-yellow-400 border-yellow-500' },
    S: { shape: [[0, 'S', 'S'], ['S', 'S', 0], [0, 0, 0]], color: 'bg-green-500 border-green-600' },
    T: { shape: [[0, 0, 0], ['T', 'T', 'T'], [0, 'T', 0]], color: 'bg-purple-500 border-purple-600' },
    Z: { shape: [['Z', 'Z', 0], [0, 'Z', 'Z'], [0, 0, 0]], color: 'bg-red-500 border-red-600' },
};

const randomTetromino = () => {
    const tetrominos = 'IJLOSTZ';
    const randTetromino = tetrominos[Math.floor(Math.random() * tetrominos.length)] as keyof typeof TETROMINOS;
    return TETROMINOS[randTetromino];
};

const createBoard = () =>
    Array.from(Array(BOARD_HEIGHT), () => new Array(BOARD_WIDTH).fill([0, 'clear']));

export default function TetrisFlow({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [board, setBoard] = useState(createBoard());
    const [player, setPlayer] = useState({
        pos: { x: 0, y: 0 },
        tetromino: TETROMINOS[0].shape as (string | number)[][],
        collided: false,
    });
    const [dropTime, setDropTime] = useState<number | null>(null);
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [rows, setRows] = useState(0);
    const [level, setLevel] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [reward, setReward] = useState<GameScoreResponse | null>(null);

    useEffect(() => {
        if (gameOver && score > 0) {
            submitGameScore('tetris', score).then(res => setReward(res));
        }
    }, [gameOver, score]);

    // Board Collision detection
    const checkCollision = (tempPlayer: any, board: any, { x: moveX, y: moveY }: { x: number; y: number }) => {
        for (let y = 0; y < tempPlayer.tetromino.length; y += 1) {
            for (let x = 0; x < tempPlayer.tetromino[y].length; x += 1) {
                if (tempPlayer.tetromino[y][x] !== 0) {
                    if (
                        !board[y + tempPlayer.pos.y + moveY] ||
                        !board[y + tempPlayer.pos.y + moveY][x + tempPlayer.pos.x + moveX] ||
                        board[y + tempPlayer.pos.y + moveY][x + tempPlayer.pos.x + moveX][1] !== 'clear'
                    ) {
                        return true;
                    }
                }
            }
        }
        return false;
    };

    // Update Player Pos
    const updatePlayerPos = ({ x, y, collided }: { x: number; y: number; collided: boolean }) => {
        setPlayer((prev) => ({
            ...prev,
            pos: { x: (prev.pos.x += x), y: (prev.pos.y += y) },
            collided,
        }));
    };

    // Rotate array matrix
    const rotate = (matrix: any[][], dir: number) => {
        const rotatedTetro = matrix.map((_, index) => matrix.map((col) => col[index]));
        if (dir > 0) return rotatedTetro.map((row) => row.reverse());
        return rotatedTetro.reverse();
    };

    const playerRotate = (board: any, dir: number) => {
        const clonedPlayer = JSON.parse(JSON.stringify(player));
        clonedPlayer.tetromino = rotate(clonedPlayer.tetromino, dir);

        // wall kick resolving
        const pos = clonedPlayer.pos.x;
        let offset = 1;
        while (checkCollision(clonedPlayer, board, { x: 0, y: 0 })) {
            clonedPlayer.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > clonedPlayer.tetromino[0].length) {
                rotate(clonedPlayer.tetromino, -dir);
                clonedPlayer.pos.x = pos;
                return;
            }
        }
        setPlayer(clonedPlayer);
    };

    const resetPlayer = useCallback(() => {
        setPlayer({
            pos: { x: BOARD_WIDTH / 2 - 2, y: 0 },
            tetromino: randomTetromino().shape,
            collided: false,
        });
    }, []);

    // Engine Hooks
    useEffect(() => {
        if (!isOpen) return;

        const sweepRows = (newBoard: any[]) => {
            let rowCount = 0;
            const swept = newBoard.reduce((ack, row) => {
                if (row.findIndex((cell: any) => cell[0] === 0) === -1) {
                    rowCount++;
                    ack.unshift(new Array(BOARD_WIDTH).fill([0, 'clear']));
                    return ack;
                }
                ack.push(row);
                return ack;
            }, []);

            if (rowCount > 0) {
                setScore((prev) => prev + rowCount * 10 * (level + 1));
                setRows((prev) => prev + rowCount);
            }
            return swept;
        };

        const updateBoard = (prevBoard: any[]) => {
            const newBoard = prevBoard.map((row) =>
                row.map((cell: any[]) => (cell[1] === 'clear' ? [0, 'clear'] : cell))
            );

            // Draw tetro
            player.tetromino.forEach((row: any, y: number) => {
                row.forEach((value: any, x: number) => {
                    if (value !== 0) {
                        newBoard[y + player.pos.y][x + player.pos.x] = [value, `${player.collided ? 'merged' : 'clear'}`];
                    }
                });
            });

            // Check if dropped
            if (player.collided) {
                resetPlayer();
                return sweepRows(newBoard);
            }
            return newBoard;
        };

        setBoard((prev) => updateBoard(prev));
    }, [player, resetPlayer, isOpen]);

    useEffect(() => {
        if (!isOpen) {
            setDropTime(null);
            return;
        }

        if (rows > (level + 1) * 10) {
            setLevel(l => l + 1);
            setDropTime(1000 / (level + 1) + 200);
        }

        if (!dropTime || isPaused) return;

        const interval = setInterval(() => {
            drop();
        }, dropTime);

        return () => {
            clearInterval(interval);
        };
    }, [dropTime, player, rows, level, isPaused, isOpen]);


    // Actions
    const drop = () => {
        if (!checkCollision(player, board, { x: 0, y: 1 })) {
            updatePlayerPos({ x: 0, y: 1, collided: false });
        } else {
            if (player.pos.y < 1) {
                setGameOver(true);
                setDropTime(null);
            } else {
                updatePlayerPos({ x: 0, y: 0, collided: true });
            }
        }
    };

    const movePlayer = (dir: number) => {
        if (!checkCollision(player, board, { x: dir, y: 0 })) {
            updatePlayerPos({ x: dir, y: 0, collided: false });
        }
    };

    const keyUp = ({ keyCode }: { keyCode: number }) => {
        if (!gameOver && !isPaused) {
            if (keyCode === 40) {
                // reset drop time after hard drag
                setDropTime(1000 / (level + 1) + 200);
            }
        }
    };

    const dropPlayer = () => {
        setDropTime(null);
        drop();
    };

    const move = (e: any) => {
        if (!gameOver && !isPaused) {
            if (e.keyCode === 37) movePlayer(-1);
            else if (e.keyCode === 39) movePlayer(1);
            else if (e.keyCode === 40) dropPlayer();
            else if (e.keyCode === 38) playerRotate(board, 1);
        }
    };

    const startGame = () => {
        setBoard(createBoard());
        setDropTime(1000);
        resetPlayer();
        setGameOver(false);
        setScore(0);
        setRows(0);
        setLevel(0);
        setIsPaused(false);
        setReward(null);
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 outline-none relative"
            onKeyDown={(e) => move(e)}
            onKeyUp={keyUp}
            tabIndex={0}
            autoFocus
        >
            <div className="bg-[#1a1b26] text-white p-6 rounded-3xl shadow-2xl max-w-4xl w-full flex flex-col md:flex-row gap-8 border border-white/10 relative">

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Left: Info & Controls */}
                <div className="w-full md:w-64 flex flex-col gap-6">
                    <div>
                        <h2 className="text-3xl font-black tracking-wider text-blue-400 mb-1">TETRIS</h2>
                        <h3 className="text-lg font-bold text-gray-400">Flow State</h3>
                    </div>

                    <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-4 font-mono">
                        <div>
                            <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Score</div>
                            <div className="text-2xl font-bold text-white">{score}</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Lines</div>
                            <div className="text-xl font-bold text-white">{rows}</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Level</div>
                            <div className="text-xl font-bold text-blue-400">{level + 1}</div>
                        </div>
                    </div>

                    <div className="mt-auto space-y-3">
                        {gameOver ? (
                            <div className="flex flex-col items-center mb-4">
                                <span className="text-red-400 font-bold text-xl uppercase tracking-widest mb-2">
                                    Game Over
                                </span>
                                {reward && (
                                    <div className="bg-white/10 px-4 py-2 rounded-xl flex flex-col items-center border border-white/5">
                                        <span className="text-yellow-400 font-bold flex items-center gap-2">
                                            <Coins size={16} /> +{reward.earnedCoins} Coins
                                        </span>
                                        {reward.leveledUp && (
                                            <span className="text-emerald-400 text-xs mt-1 font-bold flex items-center gap-1 animate-pulse">
                                                <TrendingUp size={12} /> Level Up! (Lvl {reward.level})
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : null}

                        <Button
                            onClick={startGame}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl py-6 font-bold tracking-widest uppercase transition-all"
                        >
                            <RotateCcw size={18} className="mr-2" />
                            {gameOver ? 'Play Again' : score > 0 ? 'Restart' : 'Start Grid'}
                        </Button>

                        <Button
                            onClick={() => {
                                if (!gameOver && score > 0) {
                                    if (isPaused) {
                                        setIsPaused(false);
                                        setDropTime(1000 / (level + 1) + 200);
                                    } else {
                                        setIsPaused(true);
                                        setDropTime(null);
                                    }
                                }
                            }}
                            disabled={gameOver || score === 0 && !dropTime}
                            variant="outline"
                            className="w-full border-white/20 text-white hover:bg-white/10 rounded-xl py-6"
                        >
                            {isPaused ? <Play size={18} className="mr-2" /> : <Pause size={18} className="mr-2" />}
                            {isPaused ? 'Resume' : 'Pause'}
                        </Button>
                    </div>
                </div>

                {/* Right: Board */}
                <div className="flex-1 flex justify-center items-center bg-black/40 rounded-2xl p-4 border border-white/5 relative">
                    {/* Render Grid */}
                    <div
                        className="grid bg-[#0a0a0f] border-2 border-white/10 p-1"
                        style={{
                            gridTemplateRows: `repeat(${BOARD_HEIGHT}, calc(450px / 20))`,
                            gridTemplateColumns: `repeat(${BOARD_WIDTH}, calc(450px / 20))`
                        }}
                    >
                        {board.map((row, y) =>
                            row.map((cell, x) => (
                                <div
                                    key={`${x}-${y}`}
                                    className={`
                                        w-[22px] h-[22px] border transition-colors duration-100
                                        ${cell[0] === 0 ? 'bg-transparent border-[#151520]' : TETROMINOS[cell[0] as keyof typeof TETROMINOS]?.color}
                                        ${cell[0] !== 0 ? 'border-t-white/30 border-l-white/30 border-b-black/50 border-r-black/50 shadow-sm' : ''}
                                    `}
                                />
                            ))
                        )}
                    </div>

                    {/* Mobile Controls Hint */}
                    <div className="absolute -bottom-10 text-xs text-gray-500 font-mono text-center w-full hidden md:block">
                        ↑ Rotate &nbsp; ← → Move &nbsp; ↓ Drop
                    </div>
                </div>

            </div>
        </div>
    );
}
