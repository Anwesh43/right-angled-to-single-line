const w : number = window.innerWidth
const h : number = window.innerHeight
const parts : number = 4
const scGap : number = 0.02 / parts
const strokeFactor : number = 90
const sizeFactor : number = 2.9
const backColor : string = "#bdbdbd"
const colors : Array<string> = ["#2196F3", "#4CAF50", "#F44336", "#3F51B5", "#FF9800"]
const delay : number = 90
const deg : number = Math.PI / 4
const rot : number = Math.PI / 2

class ScaleUtil {

    static maxScale(scale : number, i : number, n : number) : number {
        return Math.max(0, scale - i / n)
    }

    static divideScale(scale : number, i : number, n : number) : number {
        return Math.min(1 / n, ScaleUtil.maxScale(scale, i, n)) * n
    }

    static sinify(scale : number) : number {
        return Math.sin(scale * Math.PI)
    }
}

class DrawingUtil {

    static drawLine(context : CanvasRenderingContext2D, x1 : number, y1 : number, x2 : number, y2 : number) {
        context.beginPath()
        context.moveTo(x1, y1)
        context.lineTo(x2, y2)
        context.stroke()
    }

    static drawRightAngledToSingleLine(context : CanvasRenderingContext2D, scale : number) {
        const sf : number = ScaleUtil.sinify(scale)
        const sf1 : number = ScaleUtil.divideScale(scale, 0, parts)
        const sf2 : number = ScaleUtil.divideScale(scale, 1, parts)
        const sf3 : number = ScaleUtil.divideScale(scale, 2, parts)
        const sf4 : number = ScaleUtil.divideScale(scale, 3, parts)
        const size : number = Math.min(w, h) / sizeFactor
        context.save()
        context.translate(w / 2, h / 2)
        context.rotate(-deg * sf3)
        for (var j = 0; j < 2; j++) {
            context.save()
            context.rotate(-rot * (sf2 - sf4))
            DrawingUtil.drawLine(context, 0, 0, size * sf1, 0)
            context.restore()
        }
        context.restore()
    }

    static drawRASLNode(context : CanvasRenderingContext2D, i : number, scale : number) {
        context.lineCap = 'round'
        context.lineWidth = Math.min(w, h) / 2
        context.strokeStyle = colors[i]
        DrawingUtil.drawRightAngledToSingleLine(context, scale)
    }
}

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

class State {

    scale : number = 0
    dir : number = 0
    prevScale : number = 0

    update(cb : Function) {
        this.scale += scGap * this.dir
        if (Math.abs(this.scale - this.prevScale) >  1) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
            cb()
        }
    }

    startUpdating(cb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            cb()
        }
    }
}
