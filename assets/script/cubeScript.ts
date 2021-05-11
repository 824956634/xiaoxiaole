
const { ccclass, property } = cc._decorator;

@ccclass
export default class cubeScript extends cc.Component {

    // color: cc.Color[] = null
    RED: cc.Color = cc.Color.RED
    BULE: cc.Color = cc.Color.BLUE
    GREEN: cc.Color = cc.Color.GREEN
    YELLOW: cc.Color = cc.Color.YELLOW
    BLACK: cc.Color = cc.Color.BLACK

    anim:cc.Animation = null

    onLoad() {
        //    this.color = [this.RED , this.BULE , this.GREEN , this.YELLOW , this.BLACK]
        this.anim = this.node.getComponent(cc.Animation)
    }

    playAnim(){
        this.anim.play()
    }

    stopAnim(){
        this.anim.stop()
        this.node.opacity = 255
    }
    move(time ,x, y) {
        cc.tween(this.node)
            .to(time, { position: cc.v3(x, y , 0) })
            .start()
    }

    setColor(iconType: number) {
        // this.node.color = this.color[iconType]

        switch (iconType) {
            case 0:
                this.node.color = this.RED
                break;
            case 1:
                this.node.color = this.BULE
                break;
            case 2:
                this.node.color = this.GREEN
                break;
            case 3:
                this.node.color = this.YELLOW
                break;
            case 4:
                this.node.color = this.BLACK
                break;
        }
    }
    start() {

    }

    // update (dt) {}
}
