import React, {Component} from 'react'
import {observer} from 'mobx-react'
import {observable, action} from 'mobx'
import {Button} from 'antd'

import './little-map.styl'

@observer
export default class LittleMap extends Component {
  @observable value = 0

  constructor(props) {
    super(props)
  }

  @action handleClick(e) {
    this.value = +(e.target.value) + 1
  }

  render() {
    return (
      <div className="little-map">
        <p style={{marginBottom: '10px'}}>demo</p>
        <Button
          value={this.value}
          onClick={e => this.handleClick(e)}
        >按钮: {this.value}</Button>
      </div>
    )
  }
}
