const socket = io();
const chess = new Chess()
const boardElement = document.querySelector('.chessboard')


let draggedPiece = null;
let sourceSquare = null;
let playerRole = null


const renderBoard = ()=>{
    boardElement.innerHTML= ''
    const board = chess.board()
    board.forEach((row,rowIndex)=>{
        row.forEach((square,columIndex)=>{
            const squareElement  = document.createElement('div')
            squareElement.classList.add("square",(rowIndex + columIndex)%2 === 0?'light':'dark')

            squareElement.dataset.row = rowIndex
            squareElement.dataset.col = columIndex

            if(square)
            {
                const pieceElement = document.createElement('div')
                pieceElement.classList.add("piece",square.color === 'w'?'white':'black')
                pieceElement.innerText = getPieceUnicode(square)
                pieceElement.draggable = playerRole === square.color
                pieceElement.addEventListener('dragstart',(e)=>{
                    if(pieceElement.draggable)
                    {
                        draggedPiece = pieceElement
                        sourceSquare = {row : rowIndex,col:columIndex}
                        e.dataTransfer.setData("text/plain","")
                    }
                })
                pieceElement.addEventListener('dragend',()=>{
                    draggedPiece = null
                    sourceSquare = null
                })
                squareElement.append(pieceElement)
            }

            squareElement.addEventListener('dragover',(e)=>{
                e.preventDefault()
            })
            squareElement.addEventListener('drop',(e)=>{
                e.preventDefault()
                if(draggedPiece)
                {
                    const targetSoure = {row :parseInt(squareElement.dataset.row),col:parseInt(squareElement.dataset.col)};
                    handleMove(sourceSquare,targetSoure)
                }
            })
            boardElement.appendChild(squareElement)

        })
    })

    if(playerRole === 'b')
    {
        boardElement.classList.add("flipped")
    }
    else
    {
        boardElement.classList.remove("flipped")
    }
}

const handleMove = (source,target)=>{
    const move = {
        from : `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
        to :`${String.fromCharCode(97 + target.col)}${8 - target.row}`,
        promotion : "q"
    }

        socket.emit("move",move)
}

const getPieceUnicode = (piece)=>{
    const unicodePieces = {
        k: '\u2654',  // white king
        q: '\u2655',  // white queen
        r: '\u2656',  // white rook
        b: '\u2657',  // white bishop
        n: '\u2658',  // white knight
        p: '\u2659',  // white pawn
        K: '\u265A',  // black king
        Q: '\u265B',  // black queen
        R: '\u265C',  // black rook
        B: '\u265D',  // black bishop
        N: '\u265E',  // black knight
        P: '\u265F'   // black pawn
    };
    return unicodePieces[piece.type] || "";
}



socket.on("playerRole",(role)=>{
    playerRole = role
    renderBoard()
})
socket.on("spectatorRole",()=>{
    playerRole = null
    renderBoard()
})
socket.on("boardState",(fen)=>{
    chess.load(fen)
    renderBoard()
})
socket.on('move',(move)=>{
    chess.move()
    renderBoard()
})

renderBoard()