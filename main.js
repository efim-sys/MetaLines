let balls = ["🔴", "🟡", "🟢", "🔵", "🟣", "⚪"]

let placeholder = "ㅤ"

let cells = new Array(64)

let pair = undefined

let count = 0

let winCondition = 3

let fieldSize = 9

for (let i = 0; i < fieldSize*fieldSize; i++) {
    cells[i] = $("<div>", {
        class: "cell",
        html: $("<div>", {
            class: "ball",
            text: placeholder
        })
    }).appendTo("#table-container")
    cells[i].click( function() {
        doChange($(this).index())
    })
}

async function doChange(item) {
    
    if(pair == undefined) {
        pair = item
        cells[pair].children().first().css("transform", "scale(1.25, 1.25)")
    }
    else if(pair !== item && cells[pair].children().first().text()!==placeholder){
        if(await findPath(cells[pair], cells[item])) {
            if(checkLine()) spawnRandom3()
            
        }
        else alert("Ход Заблокирован!")
        cells[pair].children().first().css("transform", "")
        pair = undefined
    }
    else {
        cells[pair].children().first().css("transform", "")
        pair = undefined
    }
}

function setRandom(color) {
    let empty = cells.filter(e => e.children().first().text() === placeholder)
    if(empty.length === 1) alert("Game Over!")
    empty[Math.floor(Math.random()*empty.length)].children().first().text(balls[color])
}

let visited = new Array(64).fill(false)

let path = []

function checkEmpty(current) {
    if(current === undefined) return false
    if(visited[current.index()] === true || current.children().first().text() != placeholder) {
        visited[current.index()] = true
        return false
    }
    visited[current.index()] = true
    return true    
}

function goPath(from, to) {
    if(from === to) return true
    if(Math.abs((from.index() % fieldSize) - ((from.index()+1) % fieldSize)) != fieldSize-1 && checkEmpty(cells[from.index()+1])) {
        if(goPath(cells[from.index()+1], to)) {
            path.push(from.index())
            return true
        }
    }
    if(Math.abs((from.index() % fieldSize) - ((from.index()-1) % fieldSize)) != fieldSize-1 && checkEmpty(cells[from.index()-1])) {
        if(goPath(cells[from.index()-1], to)) {
            path.push(from.index())
            return true}
    }
    if(checkEmpty(cells[from.index()-fieldSize])) {
        if(goPath(cells[from.index()-fieldSize], to)) {
            path.push(from.index())
            return true}
    }
    if(checkEmpty(cells[from.index()+fieldSize])) {
        if(goPath(cells[from.index()+fieldSize], to)) {
            path.push(from.index())
            return true}
    }
    return false
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function animation() {
    let color = cells[path[0]].children().first().text()
    console.log(color)
    console.log(path)
    for(let i = 0; i < path.length-1; i ++) {
        cells[path[i+1]].children().first().text(cells[path[i]].children().first().text())
        cells[path[i]].children().first().text(placeholder)
        await sleep(30)
    }
}

async function findPath(from, to) {
    path = []
    visited.fill(false)
    let res = goPath(from, to)
    path.reverse()
    path.push(to.index())
    if(res) {
        await animation()        
    }
    return res
}

async function spawnRandom3() {
    for(let i = 0; i < 3; i++) {
        setRandom(Math.floor(Math.random()*balls.length))
        // setRandom(2)
    }
}

async function checkLine() {
    let found = 0
    let streak = {
        color: 0,
        amount: 0
    }
    for(let i = 0; i < fieldSize; i++) {
        streak.amount = 0
        streak.color = cells[i*fieldSize].children().first().text()
        for(let j = 0; j < fieldSize; j++) {
            if(streak.color === cells[i*fieldSize+j].children().first().text()) streak.amount ++
            else {
                if(streak.amount >= winCondition && streak.color != placeholder){
                    console.log(i*fieldSize+j, streak)
                    found ++
                    for(let n = j-1; n >= j - streak.amount; n --) cells[i*fieldSize+n].children().first().text(placeholder)
                }
                streak.amount = 1
                streak.color = cells[i*fieldSize+j].children().first().text()
            }
        }
        if(streak.amount >= winCondition && streak.color != placeholder) for(let n = fieldSize-1; n >= fieldSize - streak.amount; n --) cells[i*fieldSize+n].children().first().text(placeholder)
    }

    for(let i = 0; i < fieldSize; i++) {
        streak.amount = 0
        streak.color = cells[i].children().first().text()
        for(let j = 0; j < fieldSize; j++) {
            if(streak.color === cells[j*fieldSize+i].children().first().text()) streak.amount ++
            else {
                if(streak.amount >= winCondition && streak.color != placeholder){
                    console.log(j*fieldSize+i, streak)
                    found ++
                    for(let n = j-1; n >= j - streak.amount; n --) {
                        cells[n*fieldSize+i].children().first().text(placeholder)
                        console.log(n*fieldSize+i)
                    }
                }
                streak.amount = 1
                streak.color = cells[j*fieldSize+i].children().first().text()
            }
        }
        if(streak.amount >= winCondition && streak.color != placeholder) for(let n = fieldSize-1; n >= fieldSize - streak.amount; n --) cells[n*fieldSize+i].children().first().text(placeholder)
    }
    return found
}

spawnRandom3()
