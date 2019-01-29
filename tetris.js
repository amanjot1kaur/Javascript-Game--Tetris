
const canvas= document.getElementById('tetris');
const context= canvas.getContext("2d");
context.scale(20,20);           //scale a box as 20*20px

// structure of matrix for z tertomoni
/*
const matrix=[
    [0, 0, 0],
    [1, 1, 1],
    [0, 1, 0],
];
*/

function arenaSweep() {
    let rowCount = 1;
    outer: for (let y = arena.length -1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }

        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;

        player.score += rowCount * 10;
        rowCount *= 2;
    }
}

/*collision detection b/t arena&player:after this check playerdrop and merge*/
function collide(arena, player) {
    const[m, o] = [player.matrix, player.pos]; //drupal assigner:assigned user with specific authority
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !==0 &&     //tetromino matrix exist
                (arena[y + o.y] &&    //row exist in arena
                    arena[y + o.y][x + o.x])!==0) {     //col exist in arena
                     return true;           //if one of above or more happens, theres collision
             }
        }
    }
    return false;       //no collision
}

/*save the stuck pieces in a matrix, call this in arena*/
function createMatrix(w, h) {
    const matrix=[];
    while(h--){ //if h!=0 decrease by 1 thn push new empty w lenght array
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

/*create all the 7 tertrimonies*/
function createPiece(type)
{
    if (type === 'I') {
        return [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
        ];
    } else if (type === 'L') {
        return [
            [0, 2, 0],
            [0, 2, 0],
            [0, 2, 2],
        ];
    } else if (type === 'J') {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [3, 3, 0],
        ];
    } else if (type === 'O') {
        return [
            [4, 4],
            [4, 4],
        ];
    } else if (type === 'Z') {
        return [
            [5, 5, 0],
            [0, 5, 5],
            [0, 0, 0],
        ];
    } else if (type === 'S') {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    } else if (type === 'T') {
        return [
            [0, 7, 0],
            [7, 7, 7],
            [0, 0, 0],
        ];
    }
}

function draw(){        //general function
/*cut context from top and pasting here clears the previous
 offset location tetromino. bcoz drawing bg black here
 and it covers the previous location offset underneath*/
    context.fillStyle= "#000000";
    context.fillRect(0, 0, canvas.width, canvas.height);


    drawMatrix(arena, {x:0, y:0});  //draws arena after merging with landed player to make all tetromonies visible on screen
    drawMatrix(player.matrix, player.pos );        //call drawMatrix
}

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {        // draw z-tetromino
    row.forEach((value, x)=> {
        if (value!==0){
            context.fillStyle=colors[value];
            context.fillRect(x + offset.x,     // offset added
            y +offset.y, 1, 1);      //1 means one scale~20px
            }
        });
    });
}

/*merge arena and player; copy all available
tetromino positions in arena*/
function merge(arena, player){
    player.matrix.forEach((row, y) => {
        row.forEach((value,x) =>{
            /*if value!=0 then copy all the values in arena*/
            if (value!==0) {
                arena[y+player.pos.y] [x+player.pos.x]=value;
            }
        });
    });
}


function playerDrop(){
    /*manual drop pART*/
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();      //start droping ramdom pieces
        arenaSweep();
        updateScore();
    }
    dropCounter=0;      //adding delay of a sec so as not too fast
}

/*to fix the tetromino going outa arena on left and right extremes*/
function playerMove(dir){
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    }
}

/*randomly start droping pieces*/
function playerReset() {
    const pieces = 'TJLOSZI';
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) -
                   (player.matrix[0].length / 2 | 0);
               if (collide(arena, player)) {    //check collision
        arena.forEach(row => row.fill(0));      //clear arena
        player.score = 0;           //update score
        updateScore();
    }
}

/*calling rotate to actually rotate a tetromino*/
function playerRotate(dir){
    const pos = player.pos.x;       //reset offset
    let offset = 1;     //initialize offset
    rotate(player.matrix, dir);  //rotate tetromino
    while (collide(arena, player)) {    //for collision do this
        player.pos.x += offset;     //add offset to col
        offset = -(offset + (offset > 0 ? 1 : -1)); //test with adding 1 to left 2 to right,3to lft,4to rt untill collision clea
        // give 1 if offset is greater tn 1 else -1
        if (offset > player.matrix[0].length) {     //move so much now doent make sense so
            rotate(player.matrix, -dir);        //rotate back and
            player.pos.x = pos; //reset position
            return;
        }
    }
}


/*to rotate any matrix*/
function rotate(matrix, dir){
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
            matrix[x][y],
            matrix[y][x]
            ]=[
            matrix[y][x],
            matrix[x][y]
            ]
        }
    }
    if (dir>0) {
        matrix.forEach(row => row.reverse());       //transpose
    }
        else {matrix.reverse();          //reverse the rows
    }
}

    /*AUTOMATIC DROP PART*/
let dropCounter=0;
let dropInterval=1000;
let lastTime=0; //last time when you saw the piece
function update(time=0){      //to draw game continously
    const deltaTime= time- lastTime;
    lastTime= time;
//    console.log(deltaTime);


/*droping the piece downwards with each sec~1000milisec*/
    dropCounter+=deltaTime;
    if (dropCounter>dropInterval) {
        player.pos.y++;

/*if collion happens decrement tetrimino y offset by one and merge player in arena*/
    if (collide(arena, player)){
        player.pos.y--;
        merge(arena, player);
        player.pos.y = 0; //set plaer pos back to the top i.e. new palyer appers
    }

        dropCounter=0;      //initial value of dropCounter
    }



    //playerDrop();
    arenaSweep();

    draw();

    /*request browser to call a specific function to
    update an animation*/
    requestAnimationFrame(update);  //supplies itself
}

const arena= createMatrix(12, 20);
//console.log(arena); console.table(arena);
/*inserting the merge function*/

const colors = [
    null,
    '#FF0D72',
    '#0DC2FF',
    '#0DFF72',
    '#F538FF',
    '#FF8E0D',
    '#FFE138',
    '#3877FF',
];

const player= {
    pos:{x:0,y:0},          //offset at 5
    matrix: null,
    score: 0,
}

function updateScore() {
    document.getElementById('score').innerText = player.score;
}

document.addEventListener('keydown', event =>{
   // console.log(event);
   if(event.keyCode===37){              //left keycode
        playerMove(-1);
     //   player.pos.x--;       //consolidated with above function
   } else if (event.keyCode===39) {     //right key
        playerMove(+1);
    //    player.pos.x++;         //consolidated with above function
   } else if (event.keyCode===40) {

/* to consolidated on a function because droping piece at 2 places in code

        player.pos.y++;
        dropCounter=0;      //adding delay of a sec so as not too fast
   */
   playerDrop();

   } else if (event.keyCode===81){      //keycode for'q'
    playerRotate(-1);
   } else if (event.keyCode===87){
    playerRotate(+1);
   }
});

playerReset();
updateScore();
update();       //initializing game





