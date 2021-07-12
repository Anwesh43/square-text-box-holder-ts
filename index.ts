const w : number = window.innerWidth 
const h : number = window.innerHeight 
const parts : number = 4 
const lines : number = 4 
const scGap : number = 0.12 / (parts * lines) 
const strokeFactor : number = 90 
const sizeFactor : number = 4.5 
const delay : number = 20 
const backColor : string = "#bdbdbd"
const colors : Array<string> = [
    "#E53935",
    "#311B92",
    "#00C853",
    "#4A148C",
    "#FFD600"
]
const deg : number = Math.PI / 2
const textFactor : number = 0.75 
const textSizeFactor : number = 0.8 

class ScaleUtil {

    static maxScale(scale : number, i : number, n : number) : number {
        return Math.max(0, scale - i / n)
    }
    
    static divideScale(scale : number, i : number, n : number) : number {
        return Math.min(1 / n, ScaleUtil.maxScale(scale, i, n)) * n 
    }
}

class DrawingUtil {

    static drawLine(context : CanvasRenderingContext2D, x1 : number, y1 : number, x2 : number, y2 : number) {
        context.beginPath()
        context.moveTo(x1, y1)
        context.lineTo(x2, y2)
        context.stroke()
    }

    static drawSquare(context : CanvasRenderingContext2D, size : number, sc1 : number, sc2 : number) {
        for (var j = 0; j < lines; j++) {
            context.save()
            context.rotate(deg * j)
            DrawingUtil.drawLine(
                context,
                size,
                -size + 2 * size * ScaleUtil.divideScale(sc2, j, lines),
                size, 
                -size + 2 * size * ScaleUtil.divideScale(sc1, j, lines)
            )
            context.restore()
        }
    }
    
    static drawTextInsideSquare(context : CanvasRenderingContext2D, size : number, sc1 : number, sc2 : number) {
        const totalY : number = textSizeFactor * size * 2 
        const startY : number = -size + (size - totalY / 2)
        const gap : number = totalY / lines 
        const x : number = (totalY / 2)
        for (var j = 0; j < 4; j++) {
            const sc1j : number = ScaleUtil.divideScale(sc1, j, lines)
            context.save()
            context.translate(
                (w / 2 + x) * ScaleUtil.divideScale(sc2, j, lines),
                startY + gap * j
            )
            DrawingUtil.drawLine(
                context, 
                -x * sc1j, 
                 0, 
                 x * sc1j, 
                 0              
            )
            context.restore()
        }
    }

    static drawSquareTextBoxHolder(context : CanvasRenderingContext2D, scale : number) {
        const size : number = Math.min(w, h) / sizeFactor 
        const sc1 : number = ScaleUtil.divideScale(scale, 0, parts)
        const sc2 : number = ScaleUtil.divideScale(scale, 1, parts)
        const sc3 : number = ScaleUtil.divideScale(scale, 2, parts)
        const sc4 : number = ScaleUtil.divideScale(scale, 3, parts)
        context.save()
        context.translate(w / 2, h / 2)
        DrawingUtil.drawSquare(context, size, sc1, sc3)
        DrawingUtil.drawTextInsideSquare(context, size, sc2, sc4)
        context.restore()
    }

    static drawSTBHNode(context : CanvasRenderingContext2D, i : number, scale : number) {
        context.lineCap = 'round'
        context.lineWidth = Math.min(w, h) / strokeFactor 
        context.strokeStyle = colors[i]
        DrawingUtil.drawSquareTextBoxHolder(context, scale)
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
        if (Math.abs(this.scale - this.prevScale) > 1) {
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

class STBHNode {

    prev : STBHNode 
    next : STBHNode 
    state : State = new State()

    constructor(private i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < colors.length - 1) {
            this.next = new STBHNode(this.i + 1)
            this.next.prev = this 
        }
    }

    draw(context : CanvasRenderingContext2D) {
        DrawingUtil.drawSTBHNode(context, this.i, this.state.scale)
    }

    update(cb : Function) {
        this.state.update(cb)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }

    getNext(dir : number, cb : Function) : STBHNode {
        var curr : STBHNode = this.prev 
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

class SquareTextBoxHolder {

    curr : STBHNode = new STBHNode(0)
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

    sbth : SquareTextBoxHolder = new SquareTextBoxHolder()
    animator : Animator = new Animator()

    render(context : CanvasRenderingContext2D) {
        this.sbth.draw(context)
    }

    handleTap(cb : Function) {
        this.sbth.startUpdating(() => {
            this.animator.start(() => {
                cb()
                this.sbth.update(() => {
                    this.animator.stop()
                    cb()
                })
            })
        })
    }
}