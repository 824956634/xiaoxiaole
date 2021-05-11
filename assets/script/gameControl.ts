import { Game, STATE } from './Global';

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    @property(cc.Prefab)
    cubePrefab: cc.Prefab = null

    @property(cc.Node)
    board: cc.Node = null

    @property(cc.Node)
    boardMask: cc.Node = null

    @property(cc.Node)
    score: cc.Node = null //分数

    scoreNumber: number = null //分数
    scoreLabel: cc.Label = null //分数

    row: number = null //row行数8 
    col: number = null //col列数0
    typeNum: number = null //方块种类



    moveNum: number = null

    cubeTable //方块容器
    cubesDataTable //方便数据容器
    cubesTable //方块
    cubesPosTable //方块位置列表

    move: boolean = null  //方块是否在移动
    cubeWidth: number = null
    cubeHeight: number = null
    interval: number = null //间隔
    firstTouchCube //第一个点击方块
    firstPos //第一个点击方块的位置
    lastTouchCube //第二个点击方块
    lastPos //第二个点击方块的位置
    touchNum //点击次数

    readyClearCube //准备消除的方块
    onLoad() {
        //初始化数据
        this.row = 8
        this.col = 12
        this.typeNum = 5
        this.interval = 5
        this.move = false


        this.firstPos = cc.v2()
        this.lastPos = cc.v2()
        this.touchNum = 0

        this.scoreLabel = this.score.getComponent(cc.Label)
        this.scoreNumber = 0
        this.scoreLabel.string = this.scoreNumber + ''

        this.cubeWidth = this.board.width / this.row - this.interval
        this.cubeHeight = this.board.height / this.col - this.interval


        this.initGameData()
        this.initGameBoard()
        this.node.on('touchstart', this.onTouchStart, this)
    }

    initGameBoard() {
        this.cubesTable = []
        this.cubesPosTable = []
        for (let i = 0; i < this.row; i++) {
            this.cubesTable[i] = []
            this.cubesPosTable[i] = []
            for (let j = 0; j < this.col; j++) {
                let item: cc.Node = cc.instantiate(this.cubePrefab)
                item.width = this.cubeWidth
                item.height = this.cubeHeight
                this.cubesTable[i][j] = item
                let cubeScript = item.getComponent('cubeScript')
                cubeScript.setColor(this.cubesDataTable[i][j].cubeType)
                this.boardMask.addChild(item)
                let x = i * (this.cubeWidth + this.interval)
                let y = j * (this.cubeHeight + this.interval)
                let y2 = j * (this.cubeHeight + this.interval + this.board.height)
                item.setPosition(x, y2)
                cubeScript.move(0.3 * j, x, y) //初始化动画
                this.cubesPosTable[i][j] = cc.v2(x, y)
                // item.setPosition(x, y)
            }
        }
    }

    initGameData() {
        this.cubesDataTable = []
        for (let i = 0; i < this.row; i++) {  //row行数 8 竖排
            this.cubesDataTable[i] = []
            for (let j = 0; j < this.col; j++) { //col列数 8 横排 
                // let idt = this.cubesDataTable[i][j] 
                this.cubesDataTable[i][j] = { 'state': STATE.NORMAL, 'cubeType': 1 }
                this.cubesDataTable[i][j].cubeType = this.getNewType(i, j)
                // cc.log(this.cubesDataTable[i][j].cubeType)
            }
        }
    }

    getNewType(i, j) {
        let oldTypeTable = []
        oldTypeTable[0] = i > 0 ? this.cubesDataTable[i - 1][j].cubeType : -1
        oldTypeTable[1] = j > 0 ? this.cubesDataTable[i][j - 1].cubeType : -1
        let typeTable = []
        let max = 0
        for (let i = 0; i < this.typeNum; i++) {
            if (i != oldTypeTable[0] && i != oldTypeTable[1]) { //不与旁边的方块的type重复，重复则跳过
                max = max + 1
                typeTable[max] = i //获得的不和旁边的重合的几个数
            }
        }
        // cc.log(oldTypeTable)
        return typeTable[Game.getRandonInt(1, max)] //在数组中随机返回一个数
    }

    onTouchStart(event: cc.Event.EventTouch) {
        if (this.move) return
        let touchLoc = event.getLocation()
        // cc.log(touchLoc.x,  touchLoc.y)
        for (let i = 0; i < this.row; i++) {
            for (let j = 0; j < this.col; j++) {
                /**
                 * node.getBoundingBoxToWorld() 获取节点的对齐轴线的矩形包围盒(rect)
                 * rect.contains(cc.vce2) 判断一个点在不在这个矩形内
                 */
                if (this.cubesTable[i][j].getBoundingBoxToWorld().contains(touchLoc)) {
                    if (this.touchNum === 0) {
                        this.firstPos.x = i
                        this.firstPos.y = j
                        this.setCubeState(i, j, STATE.PRECHECK)
                        this.cubesTable[i][j].getComponent('cubeScript').playAnim()
                        this.touchNum++
                        break
                    }
                    if (this.touchNum === 1) {
                        this.lastPos.x = i
                        this.lastPos.y = j
                        this.setCubeState(i, j, STATE.PRECHECK)
                        this.cubesTable[this.firstPos.x][this.firstPos.y].getComponent('cubeScript').stopAnim()
                        this.touchCheck()
                        break
                    }

                }
            }
        }

    }


    touchCheck() {
        //检查两个方块是否相邻
        if (Math.abs(this.firstPos.x - this.lastPos.x) !== 1 &&
            Math.abs(this.firstPos.y - this.lastPos.y) !== 1) {
            // cc.log('不在旁边')
            this.setCubeState(this.firstPos.x, this.firstPos.y, STATE.NORMAL)
            this.setCubeState(this.lastPos.x, this.lastPos.y, STATE.NORMAL)
        } else if (Math.abs(this.firstPos.x - this.lastPos.x) == 1 &&
            Math.abs(this.firstPos.y - this.lastPos.y) == 1) {
            // cc.log('在斜边')
            this.setCubeState(this.firstPos.x, this.firstPos.y, STATE.NORMAL)
            this.setCubeState(this.lastPos.x, this.lastPos.y, STATE.NORMAL)
        } else if (Math.abs(this.firstPos.x - this.lastPos.x) <= 1 &&
            Math.abs(this.firstPos.y - this.lastPos.y) <= 1) {
            // cc.log('在旁边')
            this.switchCube()
            this.move = true
        }
        this.touchNum = 0
    }

    switchCube() {
        let direction: string = null
        if (this.firstPos.x > this.lastPos.x) {
            direction = '左'
        } else if (this.firstPos.x < this.lastPos.x) {
            direction = '右'
        } else if (this.firstPos.y > this.lastPos.y) {
            direction = '下'
        } else if (this.firstPos.y < this.lastPos.y) {
            direction = '上'
        }
        // cc.log(direction)
        let firstCube: cc.Node = this.cubesTable[this.firstPos.x][this.firstPos.y] //取出两个方块
        let lastCube: cc.Node = this.cubesTable[this.lastPos.x][this.lastPos.y]
        firstCube.zIndex = 1
        lastCube.zIndex = 0

        let firstCubeData = this.cubesDataTable[this.firstPos.x][this.firstPos.y] //取出两个方块数据
        let lastCubeData = this.cubesDataTable[this.lastPos.x][this.lastPos.y]

        let firstCubePos = this.cubesPosTable[this.firstPos.x][this.firstPos.y] //取出两个方块位置数据
        let lastCubePos = this.cubesPosTable[this.lastPos.x][this.lastPos.y]

        let firstanimEnd = false
        let lastanimEnd = false

        let resetCube = () => {
            let resetAnimEnd1 = false
            let resetAnimEnd2 = false
            this.move = true
            cc.tween(firstCube)
                .to(0.3, { position: firstCubePos })
                .call(() => {
                    resetAnimEnd1 = true
                })
                .start()

            cc.tween(lastCube)
                .to(0.3, { position: lastCubePos })
                .call(() => {
                    this.cubesTable[this.firstPos.x][this.firstPos.y] = firstCube
                    this.cubesTable[this.lastPos.x][this.lastPos.y] = lastCube

                    this.cubesDataTable[this.firstPos.x][this.firstPos.y] = firstCubeData
                    this.cubesDataTable[this.lastPos.x][this.lastPos.y] = lastCubeData
                    resetAnimEnd2 = true
                    this.scheduleOnce(() => {
                        if (resetAnimEnd1 && resetAnimEnd2) {
                            this.move = false
                        }
                    })
                })
                .start()
        }

        cc.tween(firstCube)
            .to(0.3, { position: lastCubePos })
            .call(() => {
                firstanimEnd = true
            })
            .start()

        cc.tween(lastCube)
            .to(0.3, { position: firstCubePos })
            .call(() => {
                this.cubesTable[this.firstPos.x][this.firstPos.y] = lastCube
                this.cubesTable[this.lastPos.x][this.lastPos.y] = firstCube

                this.cubesDataTable[this.firstPos.x][this.firstPos.y] = lastCubeData
                this.cubesDataTable[this.lastPos.x][this.lastPos.y] = firstCubeData

                lastanimEnd = true
                this.scheduleOnce(() => {
                    if (firstanimEnd && lastanimEnd) {
                        this.move = false
                        // cc.log('动画播放完毕')
                        if (this.checkClear(direction)) {
                            this.clearCube()
                        } else {
                            resetCube()
                        }
                    }
                }, 0.1)
            })
            .start()
    }


    checkClear(direction) {
        //检查消除
        this.readyClearCube = []
        let isCancel = [false, false, false]
        if (direction == '左' || direction == '右') {
            isCancel[0] = this.checkClearH(this.firstPos.y)//水平
            this.readyClear()
            isCancel[1] = this.checkClearV(this.firstPos.x)//垂直
            this.readyClear()
            isCancel[2] = this.checkClearV(this.lastPos.x)
            this.readyClear()
        } else if (direction == '上' || direction == '下') {
            isCancel[0] = this.checkClearH(this.firstPos.y)
            this.readyClear()
            isCancel[1] = this.checkClearH(this.lastPos.y)
            this.readyClear()
            isCancel[2] = this.checkClearV(this.firstPos.x)
            this.readyClear()
        }

        return (isCancel[0] || isCancel[1] || isCancel[2])
    }


    readyClear() {
        //消除方块
        for (let i = 0; i < this.row; i++) {
            for (let j = 0; j < this.col; j++) {
                if (this.cubesDataTable[i][j].state == STATE.PRECANCEL) {

                    let ready = [i, j]
                    this.readyClearCube.push(ready)
                    // cc.log(i , j )
                }

            }

        }
        // cc.log(cube.length)
    }

    clearCube() {
        // let cube = []
        for (let i = 0; i < this.readyClearCube.length; i++) {
            this.setCubeState(this.readyClearCube[i][0], this.readyClearCube[i][1], STATE.PRECLEAR)
        }

        for (let i = 0; i < this.row; i++) {
            for (let j = 0; j < this.col; j++) {
                if (this.cubesDataTable[i][j].state == STATE.PRECLEAR) {
                    // this.cubesTable[i][j].opacity = 0
                    this.moveNum = this.moveNum + 1
                    this.setCubeState(i, j, STATE.MOVE)
                    this.cubesDataTable[i][j].moveNum = 0
                    let isFind = false
                    if (j != this.col) {
                        for (let k = (j + 1); k < this.col; k++) {
                            this.cubesDataTable[i][j].moveNum = this.cubesDataTable[i][j].moveNum + 1
                            if (this.cubesDataTable[i][k].state != STATE.PRECLEAR) {
                                this.cubesDataTable[i][k].state = STATE.PRECLEAR
                                isFind = true
                                this.cubesDataTable[i][j].cubeType = this.cubesDataTable[i][k].cubeType
                                break
                            }
                        }
                    }
                    if (!isFind) {
                        this.cubesDataTable[i][j].cubeType = this.getNewType(i, j)
                    }

                }

            }

        }
        this.scheduleOnce(() => {
            this.cubeMove()
            this.setColor()
        }, 0.3)

    }



    setColor() {
        for (var i = 0; i < this.row; i++) {
            for (var j = 0; j < this.col; j++) {
                // this.setCubeState(i, j, STATE.NORMAL)
                this.cubesDataTable[i][j].state = STATE.NORMAL
                this.cubesTable[i][j].getComponent('cubeScript').setColor(this.cubesDataTable[i][j].cubeType)
            }
        }
    }

    showScore() {
        this.scoreLabel.string = this.scoreNumber + ''
    }
    cubeMove() {
        // cc.log('开始播放')
        this.showScore()
        for (let i = 0; i < this.row; i++) {
            for (let j = 0; j < this.col; j++) {
                if (this.cubesDataTable[i][j].state == STATE.MOVE) {
                    // cc.log('正在播放')
                    let pos = this.cubesTable[i][j].getPosition()
                    let num = this.cubesDataTable[i][j].moveNum
                    this.cubesTable[i][j].setPosition(this.cubesTable[i][j + num].getPosition())
                    // this.cubesTable[i][j].runAction(cc.sequence(cc.moveTo(0.1 * num, pos.x, pos.y), finished))
                    cc.tween(this.cubesTable[i][j])
                        .to(0.2, { position: cc.v3(pos.x, pos.y, 0) })
                        .call((target) => {
                            this.moveNum = this.moveNum - 1
                            if (this.moveNum == 0) {
                                // this.handlerMessage('check')
                                // cc.log('动画播放完毕')
                                this.reCheck()
                            }
                        })
                        .start()
                }
            }
        }
    }

    reCheck() {
        let isCancelV = false
        let isCancelH = false
        for (let i = 0; i < this.row; i++) {
            let isCancel = this.checkClearV(i)
            this.readyClear()
            if (isCancel) isCancelV = true
        }
        // if (isCancelV) this.readyClear()
        for (let j = 0; j < this.col; j++) {
            let isCancel = this.checkClearH(j)
            this.readyClear()
            if (isCancel) isCancelH = true
        }
        // if (isCancelH) this.reCheck()
        if (isCancelH || isCancelV) {
            this.scheduleOnce(() => {
                this.clearCube()
            }, 0.3)
        }
    }



    setCubeState(row, col, Global) {
        this.cubesDataTable[row][col].state = Global
    }




    //水平方向检查
    checkClearH(col) {
        let isCancel = false
        let cancelNum = 1 //检查数量
        let cubeType = this.cubesDataTable[0][col].cubeType
        this.setCubeState(0, col, STATE.PRECANCEL)
        for (let i = 1; i < this.row; i++) {
            if (cubeType == this.cubesDataTable[i][col].cubeType) {
                cancelNum += 1
                this.setCubeState(i, col, STATE.PRECANCEL)
                if (cancelNum == 3) {
                    isCancel = true
                    if (cancelNum = 3) {
                        this.scoreNumber += 50
                    } else if (cancelNum = 4) {
                        this.scoreNumber += 100
                    } else if (cancelNum >= 5) {
                        this.scoreNumber += 200
                    }
                }
            } else {
                if (cancelNum < 3) {
                    for (var k = (i - 1); k >= 0; k--) {
                        if (cubeType == this.cubesDataTable[k][col].cubeType) {
                            this.setCubeState(k, col, STATE.NORMAL)
                        } else {
                            break
                        }
                    }
                }
                if (i < (this.row - 2)) { //因为这个是不和前面相同才会进来的判断，所以就算后面两个一样，也不会三连
                    cancelNum = 1
                    cubeType = this.cubesDataTable[i][col].cubeType //如果是倒数第2行之前的就该变对比的cubeType
                    this.setCubeState(i, col, STATE.PRECANCEL)
                } else {
                    break //倒数2行没必要判断
                }
            }

        }
        // cc.log(isCancel)
        return isCancel
    }

    //垂直方向检查
    checkClearV(row) {
        let isCancel = false
        let cancelNum = 1 //检查数量
        let cubeType = this.cubesDataTable[row][0].cubeType
        this.setCubeState(row, 0, STATE.PRECANCEL)
        for (let i = 1; i < this.col; i++) {
            if (cubeType == this.cubesDataTable[row][i].cubeType) {
                cancelNum += 1
                this.setCubeState(row, i, STATE.PRECANCEL)
                if (cancelNum == 3) {
                    isCancel = true
                    if (cancelNum = 3) {
                        this.scoreNumber += 50
                    } else if (cancelNum = 4) {
                        this.scoreNumber += 100
                    } else if (cancelNum >= 5) {
                        this.scoreNumber += 200
                    }
                }
            } else {
                if (cancelNum < 3) {
                    for (var k = (i - 1); k >= 0; k--) {
                        if (cubeType == this.cubesDataTable[row][k].cubeType) {
                            this.setCubeState(row, k, STATE.NORMAL)
                        } else {
                            break
                        }
                    }
                }
                if (i < (this.row - 2)) { //因为这个是不和前面相同才会进来的判断，所以就算后面两个一样，也不会三连
                    cancelNum = 1
                    cubeType = this.cubesDataTable[row][i].cubeType //如果是倒数第2行之前的就该变对比的cubeType
                    this.setCubeState(row, i, STATE.PRECANCEL)
                } else {
                    break //倒数2行没必要判断
                }
            }

        }
        return isCancel
    }

    start() {

    }

    // update (dt) {
    // }

    onDestroy() {
        this.node.off('touchstart', this.onTouchStart, this)
    }
}
