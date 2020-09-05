const w : number = window.innerWidth
const h : number = window.innerHeight
const parts : number = 4
const scGap : number = 0.02 / parts
const strokeFactor : number = 90
const sizeFactor : number = 2.9
const backColor : string = "#bdbdbd"
const colors : Array<string> = ["#2196F3", "#4CAF50", "#F44336", "#3F51B5", "#FF9800"]
const delay : number = 90

class Stage {

    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = backColor
        this.context.fillRect(0, 0, w, h)
    }

    handleTap() {
        this.canvas.onmousedown = () => {

        }
    }

    static init() {
        const stage : Stage = new Stage()
        stage.initCanvas()
        stage.render()
        stage.handleTap()
    }
}
