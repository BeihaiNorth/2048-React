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
        this.won = false; //get the first 2048
        this.hasLost = false; // cannot move anymore
        this.score = 0;
    }

    hasWon() {
        return this.won;
    }

    addTile() {
        let t = new Tile();
        Tile.apply(t, arguments); //?????????
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


    moveLeft(newTiles) {
        let rowIndex = 0;
        for (let row of newTiles) { 
            //remove all tiles without value
            row = row.filter(tile => tile.value !== 0);
            let l = row.length;
            //if l===0, move on
            if (l === 0) {
                row = [this.addTile(), this.addTile(), this.addTile(), this.addTile()];
                newTiles[rowIndex] = row;
                rowIndex++;
            } else if (l === 1) { // if l===1, move on
                row[0].column = 1;
                row.push(this.addTile());
                row.push(this.addTile());
                row.push(this.addTile());
                newTiles[rowIndex] = row;
                rowIndex++;
            } else { // if l>1
                let deleteCount = 0;
                for (let i = 0; i < l - 1; i++) {
                    if ((row[i].value === row[i + 1].value) && row[i].toBeDeleted === false) {
                        //if this tile equals next tile, then
                        row[i].value = row[i].value * 2; 
                        this.score += row[i].value;
                        if (row[i].value === 2048) {
                            this.won = true;
                        }
                        row[i + 1].toBeDeleted = true;
                        row[i + 1].value = 0;
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
                newTiles[rowIndex] = row;
                rowIndex++;
            }
        }
        return newTiles;
    }

    updatePosition() {
        for (let row of this.cells) {
            for (let tile of row) {
                if (tile.value !== 0) {
                    tile.row = this.cells.indexOf(row) + 1;
                    tile.column = row.indexOf(tile) + 1;
                }
            }
        }
    }

    move(direction) {
        //direction: 0left 1up 2right 3down
        let newTiles = this.cells;
        this.hasLost = true;
        for (let rotateTimes = 0; rotateTimes < direction; rotateTimes++) {
            newTiles = this.rotateLeft(newTiles);
            if (this.canMove(newTiles)) {
                this.hasLost = false;
            }
        }
        let cm = this.canMove(newTiles);
        if (cm) {
            newTiles = this.moveLeft(newTiles);
        }
        for (let rotateTimes2 = 0; rotateTimes2 < 4 - direction; rotateTimes2++) {
            newTiles = this.rotateLeft(newTiles);
            if (this.canMove(newTiles)) {
                this.hasLost = false;
            }
        }
        this.cells = newTiles;
        if (cm) {
            this.addNewRandomTile();
            this.updatePosition();
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
    }
}

export default Board;