/**
 * mapRender
 * 用于渲染地图
 * 参数：
 * 1. 
 * 2. mode: 渲染模式，可选svg或canvas。默认为canvas
 * 3. type: 渲染地图区域，可选china或world，默认渲染中国地图
 * 4. mapData: 地图数据，要求为GeoJSON。默认为null，如果有要求按照传入数据渲染地图会覆盖type的设置值
 * 5. style: 地图样式
 */

import * as d3 from 'd3'
import findIndex from 'lodash.findindex'

const southseaString = '<svg width="136px" height="184px" viewBox="0 0 136 230" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g id="southsea"><rect stroke="#000000" x="0.5" y="0.5" width="135" height="186"></rect><polygon fill="#000000" fill-rule="nonzero" points="0 24.5 9 32 24 41 39 45 57 45 74 31 95 0 14 0 0 17"></polygon><polygon fill="#000000" fill-rule="nonzero" points="107 0 117 25 128 0"></polygon><polygon fill="#000000" fill-rule="nonzero" points="40.5 59.5 55 53 54 66 47 73 32 77"></polygon><path d="M135.5,24.5 L126.5,39.5" stroke="#000000" fill="#000000" fill-rule="nonzero"></path><path d="M115.5,54.5 L109.5,69.5" stroke="#000000" fill="#000000" fill-rule="nonzero"></path><path d="M104.5,85.5 L104.5,104.5" stroke="#000000" fill="#000000" fill-rule="nonzero"></path><path d="M102.5,120.5 L95.5,140.5" stroke="#000000" fill="#000000" fill-rule="nonzero"></path><path d="M85.5,156.5 L72.5,170.5" stroke="#000000" fill="#000000" fill-rule="nonzero"></path><path d="M48.5,177.5 L33.5,181.5" stroke="#000000" fill="#000000" fill-rule="nonzero"></path><path d="M11.5,165.5 L5.5,151.5" stroke="#000000" fill="#000000" fill-rule="nonzero"></path><path d="M18.5,135.5 L33.5,125.5" stroke="#000000" fill="#000000" fill-rule="nonzero"></path><path d="M34.5,106.5 L31.5,91.5" stroke="#000000" fill="#000000" fill-rule="nonzero"></path></g></g></svg>'

function drawArea(...args) {
  const [ctx, path, d, options = {}] = args
  ctx.fillStyle = options.fill
  ctx.strokeStyle = options.strokeColor
  ctx.strokeWidth = options.strokeWidth || 0.5
  if (options.cb && typeof options.cb === 'function') {
    // callback时候可以在事件处理时，修改交互地图样式
    options.cb(ctx, path, d, options)
  } else {
    ctx.beginPath()
    path(d)
    ctx.fill()
    ctx.stroke()
    ctx.closePath()
    ctx.fill()
  }
}

class MapRender {
  constructor(config, store) {
    this.config = config
    this.store = store
    this.container = this.config.container
    this.init()
  }

  init() {
    const me = this
    const {width, height} = this.config
    me.canvas = me.container.append('canvas')
      .attr('id', 'map')
      .attr('width', width * 2)
      .attr('height', height * 2)
      .style('width', `${width}px`)
      .style('height', `${height}px`)
      

    me.ctx = me.canvas.node()
      .getContext('2d')

    me.ctx.scale(2, 2)
  }

  _addSouthsea() {
    const {ctx} = this
    const {width, height} = this.config
    const time = this.config.width / 960 
    const cWidth = 150 * time
    const cHeight = 100 * time
    const container = this.container.append('div')
      .style('display', 'none')
    
    container.html(southseaString)

    container.select('rect')
      .attr('stroke', 'rgba(0, 0, 0, 0)')
    container.selectAll('polygon')
      .attr('fill', 'rgba(0, 0, 0, 0.1)')
    container.selectAll('path')
      .attr('stroke', '#000')
    
    const DOMURL = window.URL || window.webkitURL || window
    
    const img = new Image()
    const svg = new Blob([container.html()], {type: 'image/svg+xml;charset=utf-8'})

    const url = DOMURL.createObjectURL(svg)
    
    img.onload = () => {
      ctx.drawImage(img, width - cWidth, height - cHeight, cHeight, cWidth)
      DOMURL.revokeObjectURL(url)
    }

    img.src = url
  }


  drawMap(geoJSON) {
    const {ctx, store} = this
    ctx.clearRect(0, 0, this.config.width, this.config.height)
    const data = []
    this.path = d3.geoPath()
      .projection(store.projection)
    const path = this.path
      .context(this.ctx)
    geoJSON.features.forEach((d, i) => {
      console.log(d.properties.name, path.centroid(d))
      const index = findIndex(data, dt => dt.name.toLowerCase() === d.properties.NAME.toLowerCase())
      drawArea(ctx, path, d, {
        fill: 'rgba(0, 0, 0, 0.1)',
        ...this.config,
      })
      if (index > -1 && data[index].showSymbol) {
        const c = path.centroid(d)
        ctx.beginPath()
        ctx.arc(c[0], c[1], data[index].symbolSize || 3, 0, Math.PI * 2)
        ctx.fillStyle = data[index].symbolColor || '#000'
        ctx.fill()
      }
    })
    if (this.config.type === 'china' && this.config.southsea) {
      this._addSouthsea()
    }
  }
}

export default MapRender
