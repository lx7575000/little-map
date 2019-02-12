import * as d3 from 'd3'
import _ from './util'

const isLineData = d => {
  return d.start && d.end && _.isArray(d.start) && _.isArray(d.end)
}


class Store {
  loadGeoJSON = false

  geoJSON = null
  
  projection = d3.geoMercator()

  lines = []

  /**
  * 飞线数据
  * @param {Object | Array} data 
  */
  _prepareData(data) {
    if (this.loadGeoJSON) {
      return [{
        ...data,
        start: this.projection(data.start),
        end: this.projection(data.end),
      }]
    } 
    return []
  }

  /**
   * 增加飞线数据
   * @param {Object | Array} data 
   */
  addData(data) {
    if (_.isArray(data)) {
      this.lines = this.lines.concat(data.map(d => this._prepareData(d)))
    } else if (_.isObject(data) && isLineData(data)) {
      this.lines.push(this._prepareData(data))
    }
  }

  /**
   * 更新飞线数据
   * @param {Array} data 
   */
  setData(data) {
    this.lines = data.map(d => this._prepareData(d))
  }

  async getGeoJSON(url, options) {
    try {
      const {width, height, type} = options
      if (_.isString(url)) {
        this.geoJSON = await d3.json(url)
        
        this.projection
          .translate([width / 2, height / 1.5])
        if (type === 'world') {
          this.projection.rotate([-160, 0, 0])
        }
        
        this.projection.fitSize([width, height], this.geoJSON)
      } else if (_.isObject(url)) {
        this.geoJSON = url
      }      
      this.loadGeoJSON = true
      return this.geoJSON
    } catch (e) {
      console.log('地图数据加载失败！')
      return {}
    }
  }
}

export default new Store()
