import _ from './util'

const defaultConfig = {
  // marker点半径
  markerRadius: 3,
  // marker点颜色,为空或null则默认取线条颜色
  markerColor: '#fff',
  // 线条类型 solid、dashed、dotted
  lineType: 'solid',
  // 线条宽度
  lineWidth: 1,
  // 移动点半径
  moveRadius: 1,
  // 飞线路径颜色
  lineColor: '#d41',
  // 移动点颜色
  fillColor: '#f00',
  // 移动点阴影颜色
  shadowColor: '#f10',
  // 移动点阴影大小
  shadowBlur: 5,
  // 飞线轨迹飞行时间，单位是秒
  peroid: 4,
  // 飞线形状
  symbol: 'circle', // 默认circle
  // 是否显示轨迹效果
  showTrajectory: true,
}

const {atan2} = Math

const calAngle = (a, b) => {
  const x = b.x - a.x
  const y = b.y - a.y
  const res = atan2(y, x)
  return res
}

const calCount = time => 16 / (time * 1000)

const render = (context, lines, width, height) => {
  const animationCtx = context
  if (!animationCtx) {
    return
  }

  animationCtx.fillStyle = 'rgba(0,0,0, 0.1)'
  const prev = animationCtx.globalCompositeOperation
  animationCtx.globalCompositeOperation = 'destination-in'
  animationCtx.fillRect(0, 0, width, height)
  animationCtx.globalCompositeOperation = prev

  lines.forEach(line => {
    if (!Array.isArray(line)) {
      line.drawMoveCircle(animationCtx)
    }
  })
}

export default class LineRender {
  constructor(config) {
    const {width, height} = config
    this.config = config
    this.container = config.container
    this.ctx = this.container.append('canvas')
      .style('position', 'absolute')
      .style('left', '0px')
      .style('width', `${width}px`)
      .style('height', `${height}px`)
      .style('z-index', 2)
      .attr('id', 'path-line')
      .attr('width', width * 2)
      .attr('height', height * 2)
      .node()
      .getContext('2d')
    this.ctx.scale(2, 2)

    this.animateCtx = this.container.append('canvas')
      .style('position', 'absolute')
      .style('left', '0px')
      .style('width', `${width}px`)
      .style('height', `${height}px`)
      .style('z-index', 3)
      .attr('id', 'animate-ctx')
      .attr('width', width * 2)
      .attr('height', height * 2)
      .node()
      .getContext('2d')
    this.animateCtx.scale(2, 2)
  }

  lines = []

  renderFlyLine() {
    const {width, height, lines} = this
    render(this.animateCtx, lines, width, height)  
    const id = requestAnimationFrame(this.renderFlyLine.bind(this, this.animateCtx, lines, width, height))
    
    if (lines.length === 0) {
      cancelAnimationFrame(id)
    }
  }

  renderAll(data) {
    data.forEach(d => {
      this.lines.push(new Line(d.start, d.end, this.config))
    })
    this.lines.forEach(l => l.drawLine())
    this.renderFlyLine()
  }
}

class Line {
  constructor(start, end, options = {}) {
    this.options = _.extend(defaultConfig, options)
    if (typeof start === 'string') {
      this.isPath = true
      this.d = start
      this.id = start
    } else if (_.isArray(start) && _.isArray(end)) {
      this.start = start
      this.end = end
      this.id = `${start}-${end}`
    }
    if (this.options.symbol !== 'circle') {
      this.symbol.src = this.options.symbol
    }
    this.init()
  }
  
  symbol = new Image()
  
  step = 0
  
  d = ''
  
  isPath = false
  
  start = []
  
  end = []
  
  points = []

  // 保存动画飞线各点值
  cache = {}

  cacheComplete = false

  init = () => {
    this.addend = calCount(this.options.peroid)
    this.calControlPoint()
    this.createPath()
  }

  calControlPoint = () => {
    const from = this.start
    const to = this.end
    const x = (from[0] + to[0]) / 2
    const y = (from[1] + to[1]) / 2
    let len
    if (from[0] < to[0]) {
      len = -0.5 * sqrt(pow((to[1] - from[1]), 2), pow((to[0] - from[0]), 2))
    } else {
      len = 0.5 * sqrt(pow((to[1] - from[1]), 2), pow((to[0] - from[0]), 2))
    }
    const a = atan2(to[1] - from[1], to[0] - from[0])
    this.cx = x - (len * sin(a))
    this.cy = y + (len * cos(a))
  }

  createPath = () => {
    this.pathLine = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    this.pathLine.setAttribute('d', this.isPath ? this.d : `M ${this.start[0]} ${this.start[1]} Q ${this.cx} ${this.cy} ${this.end[0]} ${this.end[1]}`)
  }

  drawLine = ctx => {
    const {options} = this
    const len = this.pathLine.getTotalLength()
    const start = this.pathLine.getPointAtLength(0)
    let step = 0

    ctx.beginPath()
    ctx.fillStyle = 'rgba(0, 0, 0, 1)'
    ctx.arc(this.end[0], this.end[1], 2, 0, Math.PI * 2, true)
    ctx.fill()
    ctx.beginPath()
    ctx.strokeStyle = options.lineColor
    ctx.moveTo(start.x, start.y)
    if (options.lineType === 'dash') {
      for (let i = 0; i < len; i += 1) {
        const pos = this.pathLine.getPointAtLength(i)
        if (step < 5) {
          ctx.lineTo(pos.x, pos.y)
          step += 1
        } else if (step >= 5 && step <= 10) {
          ctx.moveTo(pos.x, pos.y)
          step += 1
        } else if (step > 10) {
          step = 0
        } 
      }
    } else if (options.lineType === 'solid') {
      for (let i = 0; i < len; i += 1) {
        const pos = this.pathLine.getPointAtLength(i)
        ctx.lineTo(pos.x, pos.y)  
      }
    }
    ctx.stroke()
  }

  renderRipples = ctx => {
    if (this.rippleProgress >= 1) {
      this.rippleProgress = 0
    }
    const {options} = this
    const len = this.pathLine.getTotalLength()
    const end = this.pathLine.getPointAtLength(len)
    const pgs = this.rippleProgress * 12
    ctx.save()
    ctx.beginPath()
    ctx.strokeStyle = `rgba(255, 0, 0, ${2 - this.step})`
    ctx.arc(end.x, end.y, options.moveRadius * pgs, 0, Math.PI * 2, true)
    ctx.stroke()
    ctx.restore()
    this.rippleProgress += 0.04
  }

  drawMoveCircle = context => {
    const {options, cache, step} = this

    if (this.step <= 1) {
      if (!cache[step]) {
        const len = this.pathLine.getTotalLength()
        const pos = this.pathLine.getPointAtLength(len * this.step)
        let npos = null
        let ppos = null
        let a = 0
        if (this.step === 1) {
          ppos = this.pathLine.getPointAtLength(len * (this.step - 0.002))
          a = calAngle(ppos, pos)
        } else {
          npos = this.pathLine.getPointAtLength(len * (this.step + 0.002))
          a = calAngle(pos, npos)
        }
        context.save()
        context.beginPath()
        const rad = a + (Math.PI / 2)
        context.transform(Math.cos(rad), Math.sin(rad), -Math.sin(rad), Math.cos(rad), pos.x, pos.y)
        context.drawImage(this.symbol, -5, -5, 10, 10)
        
        context.restore()
        cache[step] = {
          c: Math.cos(rad),
          s: Math.sin(rad),
          x: pos.x,
          y: pos.y,
        }
      } else {
        const c = cache[step]
        context.save()
        context.beginPath()
        context.transform(c.c, c.s, -c.s, c.c, c.x, c.y)
        context.drawImage(this.symbol, -5, -5, 10, 10)
        context.restore()
      }
    
      this.step += this.addend
    } else if (this.step < 2) {
      const len = this.pathLine.getTotalLength()
      const end = this.pathLine.getPointAtLength(len)
      const pgs = (this.step - 1) * 12
      context.save()
      context.beginPath()
      context.strokeStyle = `rgba(255, 0, 0, ${2 - this.step})`
      context.arc(end.x, end.y, options.moveRadius * pgs, 0, Math.PI * 2, true)
      context.stroke()
      context.restore()
      this.step += this.addend * 20
    }
  }
}
