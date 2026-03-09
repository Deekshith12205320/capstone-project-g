import { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/Button';
import { RotateCcw, X, Target } from 'lucide-react';

const GRID_SIZE = 4;
const CELL_COUNT = GRID_SIZE * GRID_SIZE;

export default function Mindful2048({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [board, setBoard] = useState(new Array(CELL_COUNT).fill(0));
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [won, setWon] = useState(false);

    const initializeGame = useCallback(() => {
        let newBoard = new Array(CELL_COUNT).fill(0);
        addRandomTile(newBoard);
        addRandomTile(newBoard);
        setBoard(newBoard);
        setScore(0);
        setGameOver(false);
        setWon(false);
    }, []);

    useEffect(() => {
        if (isOpen) {
            initializeGame();
        }
    }, [isOpen, initializeGame]);

    const addRandomTile = (currentBoard: number[]) => {
        const emptyCells = currentBoard.reduce((acc, cell, index) => {
            if (cell === 0) acc.push(index);
            return acc;
        }, [] as number[]);

        if (emptyCells.length === 0) return;

        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        currentBoard[randomCell] = Math.random() < 0.9 ? 2 : 4;
    };

    const getColors = (value: number) => {
        const colors: Record<number, { bg: string, text: string }> = {
            0: { bg: 'bg-indigo-950/20', text: 'text-transparent' },
            2: { bg: 'bg-indigo-50/10', text: 'text-indigo-200' },
            4: { bg: 'bg-indigo-100/20', text: 'text-indigo-100' },
            8: { bg: 'bg-purple-400/30', text: 'text-purple-100' },
            16: { bg: 'bg-purple-500/40', text: 'text-white' },
            32: { bg: 'bg-fuchsia-500/50', text: 'text-white' },
            64: { bg: 'bg-rose-500/60', text: 'text-white' },
            128: { bg: 'bg-amber-400/70', text: 'text-white shadow-[0_0_15px_rgba(251,191,36,0.5)]' },
            256: { bg: 'bg-amber-500/80', text: 'text-white shadow-[0_0_20px_rgba(245,158,11,0.6)]' },
            512: { bg: 'bg-orange-500/90', text: 'text-white shadow-[0_0_25px_rgba(249,115,22,0.7)]' },
            1024: { bg: 'bg-red-500', text: 'text-white shadow-[0_0_30px_rgba(239,68,68,0.8)]' },
            2048: { bg: 'bg-cyan-400', text: 'text-white shadow-[0_0_40px_rgba(34,211,238,1)]' },
        };
        return colors[value] || { bg: 'bg-white', text: 'text-indigo-900 shadow-[0_0_50px_rgba(255,255,255,1)]' };
    };

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!isOpen || gameOver || won) return;

        const moveMap: Record<string, () => void> = {
            ArrowUp: () => move('up'),
            ArrowDown: () => move('down'),
            ArrowLeft: () => move('left'),
            ArrowRight: () => move('right'),
        };

        if (moveMap[e.key]) {
            e.preventDefault();
            moveMap[e.key]();
        }
    }, [isOpen, gameOver, won, board]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    const move = (direction: 'up' | 'down' | 'left' | 'right') => {
        let newBoard = [...board];
        let hasChanged = false;
        let gainedScore = 0;

        const getRow = (i: number) => {
            return [newBoard[i * 4], newBoard[i * 4 + 1], newBoard[i * 4 + 2], newBoard[i * 4 + 3]];
        };
        const getCol = (i: number) => {
            return [newBoard[i], newBoard[i + 4], newBoard[i + 8], newBoard[i + 12]];
        };
        const setRow = (i: number, row: number[]) => {
            for (let j = 0; j < 4; j++) newBoard[i * 4 + j] = row[j];
        };
        const setCol = (i: number, col: number[]) => {
            for (let j = 0; j < 4; j++) newBoard[i + j * 4] = col[j];
        };

        const slide = (line: number[]) => {
            let filtered = line.filter(val => val !== 0);
            for (let i = 0; i < filtered.length - 1; i++) {
                if (filtered[i] !== 0 && filtered[i] === filtered[i + 1]) {
                    filtered[i] *= 2;
                    gainedScore += filtered[i];
                    filtered[i + 1] = 0;
                }
            }
            filtered = filtered.filter(val => val !== 0);
            while (filtered.length < 4) {
                filtered.push(0);
            }
            return filtered;
        };

        for (let i = 0; i < 4; i++) {
            let originalData;
            let newData;

            if (direction === 'left') {
                originalData = getRow(i);
                newData = slide(originalData);
                setRow(i, newData);
            } else if (direction === 'right') {
                originalData = getRow(i);
                newData = slide(originalData.reverse()).reverse();
                setRow(i, newData);
            } else if (direction === 'up') {
                originalData = getCol(i);
                newData = slide(originalData);
                setCol(i, newData);
            } else if (direction === 'down') {
                originalData = getCol(i);
                newData = slide(originalData.reverse()).reverse();
                setCol(i, newData);
            }

            if (JSON.stringify(originalData) !== JSON.stringify(direction === 'right' || direction === 'down' ? [...(newData || [])].reverse() : newData)) {
                hasChanged = true;
            }
        }

        if (hasChanged) {
            addRandomTile(newBoard);
            setBoard(newBoard);
            setScore(prev => prev + gainedScore);

            if (newBoard.includes(2048) && !won) {
                setWon(true);
            }

            checkGameOver(newBoard);
        }
    };

    const checkGameOver = (currentBoard: number[]) => {
        if (currentBoard.includes(0)) return;

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const current = currentBoard[i * 4 + j];
                if (
                    (j < 3 && current === currentBoard[i * 4 + j + 1]) || // right
                    (i < 3 && current === currentBoard[(i + 1) * 4 + j])   // down
                ) {
                    return; // Still moves possible
                }
            }
        }
        setGameOver(true);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-[#0f0c29]/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#1a1640] p-8 rounded-3xl shadow-2xl max-w-md w-full border border-indigo-500/20 relative">

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-indigo-200 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
                            <Target className="text-cyan-400" />
                            2048
                        </h2>
                        <p className="text-indigo-200 text-sm font-medium">Merge matching tiles.</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/5 text-center shadow-inner">
                        <div className="text-[10px] text-indigo-300 uppercase font-black tracking-widest mb-1">Score</div>
                        <div className="text-2xl font-black text-white">{score}</div>
                    </div>
                </div>

                {/* Game Grid */}
                <div className="bg-indigo-950/50 p-3 rounded-2xl border border-white/5 relative aspect-square shadow-inner flex">

                    {/* States */}
                    {(gameOver || won) && (
                        <div className="absolute inset-0 z-10 bg-[#1a1640]/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center animate-in fade-in duration-500">
                            <h3 className="text-4xl font-black text-white mb-2">
                                {won ? 'You Win!' : 'Game Over'}
                            </h3>
                            <p className="text-indigo-200 mb-6 font-medium">Final Score: {score}</p>
                            <Button
                                onClick={initializeGame}
                                className="bg-indigo-500 hover:bg-indigo-400 text-white border-0 shadow-xl rounded-xl py-6 px-10 font-bold"
                            >
                                <RotateCcw size={18} className="mr-2" /> Try Again
                            </Button>
                        </div>
                    )}

                    <div className="grid grid-cols-4 gap-3 h-full w-full">
                        {board.map((value, index) => {
                            const colors = getColors(value);
                            return (
                                <div
                                    key={index}
                                    className={`
                                        flex items-center justify-center rounded-xl font-black 
                                        ${value > 100 ? 'text-2xl' : value > 1000 ? 'text-xl' : 'text-3xl'}
                                        ${colors.bg} ${colors.text}
                                        transition-all duration-150 ease-in-out
                                        ${value ? 'shadow-md scale-100' : 'scale-95 opacity-50'}
                                    `}
                                >
                                    {value !== 0 ? value : ''}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-8 flex justify-between items-center text-sm font-medium text-indigo-300">
                    <p>Use keyboard <span className="bg-white/10 px-2 py-1 rounded-md text-white font-mono shadow-sm">Arrows</span> to slide.</p>
                    <button
                        onClick={initializeGame}
                        className="flex items-center gap-1 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
                    >
                        <RotateCcw size={14} /> Restart
                    </button>
                </div>

            </div>
        </div>
    );
}
