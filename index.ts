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