import React from 'react'
import ReactDOM from 'react-dom'
import LittleMap from '../src'

class Demo extends React.Component {
  componentDidMount() {
    const map = new LittleMap({
      container: this._container,
    })
    map.renderMap()
  }
  render() {
    return (<div ref={c => this._container = c}>
    </div>)
  }
}

ReactDOM.render(<Demo />, document.getElementById('root'))
