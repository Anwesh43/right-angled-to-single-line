const w : number = window.innerWidth
const h : number = window.innerHeight
const parts : number = 4
const scGap : number = 0.02 / (parts * 2)
const strokeFactor : number = 90
const sizeFactor : number = 2.9
const backColor : string = "#bdbdbd"
const colors : Array<string> = ["#2196F3", "#4CAF50", "#F44336", "#3F51B5", "#FF9800"]
const delay : number = 20
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
        if (x1 == x2 && y1 == y2) {
            return
        }
        context.beginPath()
        context.moveTo(x1, y1)
        context.lineTo(x2, y2)
        context.stroke()
    }

    static drawRightAngledToSingleLine(context : CanvasRenderingContext2D, scale : number) {
        const sf : number = ScaleUtil.sinify(scale)
        const sf1 : number = ScaleUtil.divideScale(sf, 0, parts * 2)
        const sf2 : number = ScaleUtil.divideScale(sf, 2, parts * 2)
        const sf3 : number = ScaleUtil.divideScale(sf, 4, parts * 2)
        const sf4 : number = ScaleUtil.divideScale(sf, 6, parts * 2)
        const size : number = Math.min(w, h) / sizeFactor
        context.save()
        context.translate(w / 2, h / 2)
        context.rotate(-deg * (sf3 + sf4))
        for (var j = 0; j < 2; j++) {
            context.save()
            context.rotate(-rot * (sf2 - sf4) * j)
            DrawingUtil.drawLine(context, 0, 0, size * sf1, 0)
            context.restore()
        }
        context.restore()
    }

    static drawRASLNode(context : CanvasRenderingContext2D, i : number, scale : number) {
        context.lineCap = 'round'
        context.lineWidth = Math.min(w, h) / strokeFactor
        context.strokeStyle = colors[i]
        DrawingUtil.drawRightAngledToSingleLine(context, scale)
    }
}

class Stage {

    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D
    renderer : Renderer = new Renderer()

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = backColor
        this.context.fillRect(0, 0, w, h)
        this.renderer.render(this.context)
    }

    handleTap() {
        this.canvas.onmousedown = () => {
            this.renderer.handleTap(() => {
                this.render()
            })
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

class Animator {

    animated : boolean = false
    interval : number

    start(cb : Function) {
        if (!this.animated) {
            this.animated = true
            this.interval = setInterval(cb, delay)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false
            clearInterval(this.interval)
        }
    }
}

class RASLNode {

    prev : RASLNode
    next : RASLNode
    state : State = new State()

    constructor(private i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < colors.length - 1) {
            this.next = new RASLNode(this.i + 1)
            this.next.prev = this
        }
    }

    draw(context : CanvasRenderingContext2D) {
        DrawingUtil.drawRASLNode(context, this.i, this.state.scale)
    }

    update(cb : Function) {
        this.state.update(cb)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }

    getNext(dir : number, cb : Function) : RASLNode {
        var curr : RASLNode = this.prev
        if (dir == 1) {
            curr = this.next
        }
        if (curr) {
            return curr
        }
        cb()
        return this
    }
}

class RightAngledToSingleLine {

    curr : RASLNode = new RASLNode(0)
    dir : number = 1

    draw(context : CanvasRenderingContext2D) {
        this.curr.draw(context)
    }

    update(cb : Function) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            cb()
        })
    }

    startUpdating(cb : Function) {
        this.curr.startUpdating(cb)
    }
}

class Renderer {

    animator : Animator = new Animator()
    rasl : RightAngledToSingleLine = new RightAngledToSingleLine()

    render(context : CanvasRenderingContext2D) {
        this.rasl.draw(context)
    }

    handleTap(cb : Function) {
        this.rasl.startUpdating(() => {
            this.animator.start(() => {
                cb()
                this.rasl.update(() => {
                    this.animator.stop()
                    cb()
                })
            })
        })
    }
}
