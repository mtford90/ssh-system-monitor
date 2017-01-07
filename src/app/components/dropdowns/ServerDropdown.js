/* @flow */

import React, {Component, PropTypes} from 'react';
import type {ServerDefinition} from 'lib/typedefs/data'
import DropDownMenu from 'material-ui/DropDownMenu'
import MenuItem from 'material-ui/MenuItem'

type ServerDropdownProps = {
  servers: ServerDefinition[],
  selected?: ServerDefinition | null,
  onSelect?: (ServerDefinition) => void,
}

export default class ServerDropdown extends Component {
  props: ServerDropdownProps

  constructor (props: ServerDropdownProps) {
    super(props)
  }

  handleChange = (event: *, index: number) => {
    if (this.props.onSelect) {
      this.props.onSelect(this.props.servers[index])
    }
  }

  render () {
    const servers: ServerDefinition[]         = this.props.servers
    const selected: ? ServerDefinition | null = this.props.selected

    const idx = selected ? this.props.servers.indexOf(selected) : null

    return (
      <DropDownMenu
        value={idx}
        onChange={this.handleChange}
      >
        {servers.map((serverDef: ServerDefinition, idx: number) => {
          const name = serverDef.name

          return (
            <MenuItem
              key={idx}
              value={idx}
              primaryText={name}
            />
          )
        })}
      </DropDownMenu>
    )
  }
}