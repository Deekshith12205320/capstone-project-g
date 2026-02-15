import { useState } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { RefreshCw, Check } from 'lucide-react';

// Simple Sudoku generator/solver is complex, using a pre-filled board for demo
// In a real app, use a library or proper algorithm
const INITIAL_BOARD = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9]
];

const SOLUTION = [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9]
];

export default function Sudoku() {
    const [board, setBoard] = useState<number[][]>(JSON.parse(JSON.stringify(INITIAL_BOARD)));
    const [selectedCell, setSelectedCell] = useState<{ r: number, c: number } | null>(null);
    const [message, setMessage] = useState('');

    const handleCellClick = (r: number, c: number) => {
        if (INITIAL_BOARD[r][c] === 0) {
            setSelectedCell({ r, c });
        }
    };

    const handleNumberInput = (num: number) => {
        if (!selectedCell) return;
        const newBoard = [...board];
        newBoard[selectedCell.r] = [...newBoard[selectedCell.r]]; // Copy row
        newBoard[selectedCell.r][selectedCell.c] = num;
        setBoard(newBoard);
    };

    // Reset
    const resetGame = () => {
        setBoard(JSON.parse(JSON.stringify(INITIAL_BOARD)));
        setMessage('');
        setSelectedCell(null);
    }

    const checkSolution = () => {
        // Simple check against hardcoded solution
        let isCorrect = true;
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (board[r][c] !== SOLUTION[r][c]) {
                    isCorrect = false;
                    break;
                }
            }
        }

        if (isCorrect) setMessage("Perfect! Well done.");
        else setMessage("Not quite right yet. Keep trying!");
    };

    return (
        <div className="flex flex-col items-center gap-6">
            <div className="flex justify-between w-full max-w-md items-center">
                <h3 className="text-xl font-bold text-gray-700">Sudoku</h3>
                <Button variant="ghost" size="sm" onClick={resetGame}><RefreshCw size={16} /></Button>
            </div>

            <Card className="p-1 bg-gray-800 rounded-lg shadow-xl">
                <div className="grid grid-cols-9 gap-[1px] bg-gray-800 border-2 border-gray-800">
                    {board.map((row, rIndex) => (
                        row.map((cell, cIndex) => {
                            const isInitial = INITIAL_BOARD[rIndex][cIndex] !== 0;
                            const isSelected = selectedCell?.r === rIndex && selectedCell?.c === cIndex;

                            // Borders for 3x3 grids
                            const extraClasses = `
                                ${(cIndex + 1) % 3 === 0 && cIndex !== 8 ? 'border-r-2 border-gray-800' : ''} 
                                ${(rIndex + 1) % 3 === 0 && rIndex !== 8 ? 'border-b-2 border-gray-800' : ''}
                            `;

                            return (
                                <div
                                    key={`${rIndex}-${cIndex}`}
                                    onClick={() => handleCellClick(rIndex, cIndex)}
                                    className={`
                                        w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-lg font-medium cursor-pointer transition-colors
                                        ${isInitial ? 'bg-gray-200 text-gray-800 font-bold' : 'bg-white text-blue-600'}
                                        ${isSelected ? 'bg-blue-100 ring-2 ring-blue-400 z-10' : ''}
                                        ${extraClasses}
                                        hover:bg-blue-50
                                    `}
                                >
                                    {cell !== 0 ? cell : ''}
                                </div>
                            );
                        })
                    ))}
                </div>
            </Card>

            <div className="flex gap-2 flex-wrap justify-center max-w-md">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <button
                        key={num}
                        onClick={() => handleNumberInput(num)}
                        className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-primary hover:text-white transition-all font-bold text-lg"
                    >
                        {num}
                    </button>
                ))}
            </div>

            <div className="flex gap-4 items-center">
                <Button onClick={checkSolution} className="gap-2">
                    Check <Check size={16} />
                </Button>
                {message && <span className={message.includes("Perfect") ? "text-green-600 font-bold" : "text-amber-600"}>{message}</span>}
            </div>
        </div>
    );
}
