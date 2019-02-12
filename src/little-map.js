import * as d3 from 'd3'
import MapRender from './mapRender'
import LineRender from './lineRender'
import store from './store'
import _ from './util'

const defaultConfig = {
  container: null,
  margin: 20,
  mode: 'canvas',
  type: 'china',
  width: 800,
  height: 500,
  southsea: true,
  style: {
    fill: 'rgba(0, 0, 0, 0.1)',
    stroke: '#007495',
  },
}

const CDNURL = {
  china: 'https://cdn.dtwave.com/wave-map/map/china.json',
  world: 'https://cdn.dtwave.com/wave-map/map/world.json', 
}
class LittleMap {
  constructor(config) {
    this.config = _.extend({}, defaultConfig, config)
    if (this.config.margin) {
      const margin = _.extendMargin(this.config.margin)
      this.config.container = d3.select(this.config.container)
        .append('div')
        .style('position', 'relative')
        .style('margin', `${margin[0]}px ${margin[1]}px ${margin[2]}px ${margin[3]}px`)
    }
    this.map = new MapRender(this.config, store)
    this.line = new LineRender(this.config, store)
  }

  renderMap() {
    const me = this
    store.getGeoJSON(CDNURL[this.config.type], me.config)
      .then(d => {
        me.map.drawMap(d)
      })
  }

  addLine(data) {
    store.addData(data)
    this.line.addLine()
  }

  setLines(data) {
    store.setData(data)
  }
}

export default LittleMap
