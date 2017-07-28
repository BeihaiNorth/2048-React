class Board {
    constructor() {
        this.tiles = [];
        this.cells = [];
        this.size = 4;
        this.fourProbability = 0.1;
        //build a 4*4 board
        for (let i = 0; i < this.size; ++i) {
            this.cells[i] = [this.addTile(), this.addTile(), this.addTile(), this.addTile()];
        }
        this.addNewRandomTile();
        this.hasLost = false; // true when cannot move anymore
        this.score = 0;
    }

    addTile() {
        let t = new Tile();
        Tile.apply(t, arguments); 
        this.tiles.push(t);
        return t;
    }

    addNewRandomTile() {
        let emptyCells = [];
        //get all the empty cells
        for (let r = 0; r < this.size; ++r) {
            for (let c = 0; c < this.size; ++c) {
                if (this.cells[r][c].value === 0) {
                    emptyCells.push({
                        r: r,
                        c: c
                    });
                }
            }
        }
        let randomIndex = ~~(emptyCells.length * Math.random()); 
        let cell = emptyCells[randomIndex];
        let value = Math.random() < this.fourProbability ? 4 : 2;
        this.cells[cell.r][cell.c] = this.addTile(value, cell.r + 1, cell.c + 1);
    }


    // |1|1|1|1|     |1|2|3|4|
    // |2|2|2|2|     |1|2|3|4|
    // |3|3|3|3| --> |1|2|3|4|
    // |4|4|4|4|     |1|2|3|4|
    rotateLeft(arr) {
        let rows = arr.length;
        let columns = arr[0].length;
        let newArr = [
            [],
            [],
            [],
            []
        ];
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < columns; c++) {
                newArr[3 - c][r] = arr[r][c];
            }
        }
        return newArr;
    }

    //Return a array of 2 
    //1st one is a 4*4 matrix, which is the moving outcome
    //2nd one is a 4*4 matrix showing where the tiles to be deleted are moving to
    moveLeft(matrix) {
        let rowIndex = 0;
        let newTiles = [[], [], [], []];
        let toBeDeletedTiles = [[], [], [], []];
        for (let row of matrix) { 
            //remove all tiles without value
            row = row.filter(tile => tile.value !== 0);
            let l = row.length;
            //if l===0, move on
            if (l === 0) {
                row = [this.addTile(), this.addTile(), this.addTile(), this.addTile()];
                newTiles[rowIndex] = row;
                rowIndex++;
            } else if (l === 1) { // if l===1, move on
                row[0].oldcolumn = row[0].column;
                row[0].oldrow = row[0].row;
                row[0].column = 1;
                row[0].isNew = false;
                row[0].justUpdated = false;
                row.push(this.addTile());
                row.push(this.addTile());
                row.push(this.addTile());
                newTiles[rowIndex] = row;
                rowIndex++;
            } else { // if l>1
                let deleteCount = 0;
                for (let i = 0; i < l - 1; i++) {
                    row[i].isNew = false;
                    row[i + 1].isNew = false;
                    if ((row[i].value === row[i + 1].value) && row[i].toBeDeleted === false) {
                        //if this tile equals next tile, then
                        row[i].oldcolumn = row[i].column;
                        row[i].oldrow = row[i].row;
                        row[i].value = row[i].value * 2; 
                        row[i].justUpdated = true;
                        this.score += row[i].value;
                        row[i + 1].toBeDeleted = true;
                        row[i + 1].oldcolumn = row[i + 1].column;
                        row[i + 1].oldrow = row[i + 1].row;
                        row[i + 1].justUpdated = false;
                        toBeDeletedTiles[rowIndex][i - deleteCount] = row[i+1];
                        deleteCount++;
                        i++;
                    } else {
                        continue;
                    }
                }
                row = row.filter(tile => tile.toBeDeleted === false);
                for (let j = 0; j < this.size - l + deleteCount; j++) {
                    row.push(this.addTile());
                }
                for (let j = 0; j < this.size; j++) {
                    toBeDeletedTiles[rowIndex][j] = toBeDeletedTiles[rowIndex][j] || this.addTile();
                }
                newTiles[rowIndex] = row;
                rowIndex++;
            }
        }
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++){
                toBeDeletedTiles[i][j] = toBeDeletedTiles[i][j] || this.addTile();    
            }
        }
        console.log(toBeDeletedTiles);
        return [newTiles, toBeDeletedTiles];
    }

    updatePosition(matrix) {
        for (let row of matrix) {
            for (let tile of row) {
                if (tile.value !== 0) {
                    tile.row = matrix.indexOf(row) + 1;
                    tile.column = row.indexOf(tile) + 1;
                }
            }
        }
    }

    clearOldTiles(tiles) {
        this.tiles = this.tiles.filter( tile => tile.toBeDeleted === false)
                               .filter( tile => tile.value !== 0);
    }

    move(direction) {
        //direction: 0left 1up 2right 3down
        this.clearOldTiles();
        this.hasLost = true;
        for (let rotateTimes = 0; rotateTimes < direction; rotateTimes++) {
            this.cells = this.rotateLeft(this.cells);
            if (this.canMove(this.cells)) {
                this.hasLost = false;
            }
        }
        let cm = this.canMove(this.cells);
        let toBeDeletedTiles; // this is to record tiles to be deleted. Record just for animation effect
        if (cm) {
            let moveOutcome = this.moveLeft(this.cells);
            this.cells = moveOutcome[0];
            toBeDeletedTiles = moveOutcome[1];
        }
        for (let rotateTimes2 = 0; rotateTimes2 < 4 - direction; rotateTimes2++) {
            this.cells = this.rotateLeft(this.cells);
            if (cm) {
                toBeDeletedTiles = this.rotateLeft(toBeDeletedTiles);
            }
            if (this.canMove(this.cells)) {
                this.hasLost = false;
            }
        }
        this.cells = this.cells;
        if (cm) {
            this.addNewRandomTile();
            this.updatePosition(this.cells);
            this.updatePosition(toBeDeletedTiles);
        }
        return this;
    }

    canMove(newTiles) {
        let canMove = false;
        for (let row of newTiles) {
            for (let i = 0; i < this.size - 1; i++) {
                if ((row[i].value === 0 && row[i + 1].value !== 0) ||
                    ((row[i].value !== 0 && row[i + 1].value !== 0) && (row[i].value === row[i + 1].value))) {
                    canMove = true;
                    break;
                }
            }
            if (canMove === true) {
                break;
            }
        }
        return canMove;
    }

}
let id = 0;
class Tile {
    constructor(value, row, column) {
        this.id = id++;
        this.value = value || 0;
        this.row = row || -1;
        this.column = column || -1;
        this.oldrow = row;
        this.oldcolumn = column;
        this.isNew = true;
        this.toBeDeleted = false;
        this.justUpdated = false;
    }
}

export default Board;