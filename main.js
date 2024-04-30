let balls = ["🔴", "🟡", "🟢", "🔵", "🟣", "⚪"]

let placeholder = " "

const fieldSize = 9

let area = Array(fieldSize).fill().map(() => Array(fieldSize))

let activeBall = undefined

const winCondition = 5

for (let y = 0; y < fieldSize; y++) {
    for (let x = 0; x < fieldSize; x++) {
        area[x][y] = $("<div>", {
            class: "cell",
            html: $("<div>", {
                class: "ball",
                text: placeholder
            })
        }).appendTo("#table-container")
        area[x][y].click( function() {
            console.log(`X=${x}; Y=${y}`)
            thisBall = {x: x, y: y} 
if (isCellFree(thisBall) && activeBall == undefined) return
            if (activeBall == undefined ) {
                activeBall = thisBall
                area[activeBall.x][activeBall.y].children().first().css("transform", "scale(1.25, 1.25)")
            }
            else {
                if((activeBall.x != thisBall.x) || (activeBall.y != thisBall.y)) {
                    let result = move(activeBall, thisBall)
                    if(result == false) alert("Ход невозможен!")
                    else {
                        animate(result)
                        setTimeout(() => {
                            if(!checkLine()) spawnRandomBalls(3)
                        }, 50*(result.length+1))
                    }
                }
                area[activeBall.x][activeBall.y].children().first().css("transform", "")
                activeBall = undefined
            }
        })
    }
}

let currentStep = 0
let globalPath  = []

let start = null

function animationFrame(timestamp) {
    if(!start) start = timestamp
    if(timestamp-start > 50) {
        switchCells(globalPath[currentStep], globalPath[currentStep+1])
        start = timestamp
        currentStep+=1
        console.log(globalPath[currentStep])
    }
    if(currentStep<globalPath.length-1) window.requestAnimationFrame(animationFrame)
}

function animate(path) {
    console.log(path)
    globalPath  = path
    currentStep = 0
    window.requestAnimationFrame(animationFrame)
} 

function switchCells(a, b) {
    setText(b, getText(a))
    setText(a, placeholder)
}

function getText(coordinates) {
    return area[coordinates.x][coordinates.y].children().first().text()
}

function setText(coordinates, value) {
    return area[coordinates.x][coordinates.y].children().first().text(value)
}

function isCellFree(x, y) {
    return getText({x: x, y: y}) == placeholder
}

function getFreeCells() {
    let freeCells = []
    for (let x = 0; x < fieldSize; x++) {
        for (let y = 0; y < fieldSize; y++) {
            if(isCellFree(x, y)) freeCells.push({x: x, y: y})
        }
    }
    return freeCells
}

function move(start, to) {
    from = new Array(fieldSize).fill().map(() => new Array(fieldSize).fill(-1))
    distances = new Array(fieldSize).fill().map(() => new Array(fieldSize).fill(Infinity))
    
    queue = []
    queue.push(start)
    distances[start.x][start.y] = 0
    
    while (queue.length > 0) {
        let pos = queue.shift()
        
        let deltas = [{dx: 0, dy: 1}, {dx: 0, dy: -1}, {dx: -1, dy: 0}, {dx: 1, dy: 0}]
        deltas.forEach(delta => {            // Смещения
            let cell = {x: pos.x+delta.dx, y: pos.y+delta.dy}
            if(cell.x>=0 && cell.x<=8 && cell.y>=0 && cell.y<=8 && distances[cell.x][cell.y]==Infinity && isCellFree(cell.x, cell.y)) {  // Полученная клетка в границах поля
                distances[cell.x][cell.y] = distances[pos.x][pos.y]+1
                queue.push(cell)
                from[cell.x][cell.y] = pos
            }
        })
    }

    if (distances[to.x][to.y] == Infinity) return false

    path = []
    for (let pos = to; pos != -1; pos = from[pos.x][pos.y]) {
        path.unshift(pos)
    }
    return path
}

function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min) + min)
}

function randomBall() {
    return balls[randomNumber(0, balls.length)]
}

function spawnRandomBalls(amount) {
    let available = getFreeCells().sort(()=>Math.random()-0.5).slice(-amount)
    if(available.length == 0) return false
    available.forEach(e => {setText(e, randomBall())})
    return true
}

function checkLine() {
    hStrings = new Array(fieldSize).fill("")
    vStrings = new Array(fieldSize).fill("")
    for (let y = 0; y < fieldSize; y++) {
        for (let x = 0; x < fieldSize; x++) {
            hStrings[y]+=getText({x:x,y:y})
            vStrings[x]+=getText({x:x,y:y})
    }}
    for(let row = 0; row < fieldSize; row++) {
        balls.forEach(color => {
            for(let len = fieldSize; len >= winCondition; len --) {
                hStrings[row] = hStrings[row].replace(color.repeat(len), "*".repeat(len))
                vStrings[row] = vStrings[row].replace(color.repeat(len), "*".repeat(len))
            }
        })
    }
    for(let row = 0; row < fieldSize; row++) {
        hStrings[row] = [...hStrings[row]]
        vStrings[row] = [...vStrings[row]]
    }
    for (let y = 0; y < fieldSize; y++) {
        for (let x = 0; x < fieldSize; x++) {
            if(hStrings[y][x]=="*") setText({x:x,y:y}, placeholder)
            if(vStrings[y][x]=="*") setText({x:y,y:x}, placeholder)
    }}
    return hStrings.concat(vStrings).flat(Infinity).indexOf("*")>0
}

spawnRandomBalls(3)