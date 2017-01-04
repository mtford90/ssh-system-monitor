/* @flow */

import React, {Component, PropTypes} from 'react';
import type {LogDefinition} from '../../../../types/index'
import DropDownMenu from 'material-ui/DropDownMenu'
import MenuItem from 'material-ui/MenuItem'

type LoggerDropdownProps = {
  logs: LogDefinition[],
  selected?: LogDefinition | null,
  onSelect?: (LogDefinition) => void,
}

export default class LoggerDropdown extends Component {
  props: LoggerDropdownProps

  constructor (props: LoggerDropdownProps) {
    super(props)
  }

  handleChange = (event: any, index: number) => {
    if (this.props.onSelect) {
      this.props.onSelect(this.props.logs[index])
    }
  }

  render () {
    const logs: LogDefinition[]            = this.props.logs
    const selected: ? LogDefinition | null = this.props.selected
    const idx                              = selected ? this.props.logs.indexOf(selected) : null

    return (
      <DropDownMenu
        value={idx}
        onChange={this.handleChange}
        floatingLabelText="Logger"
      >
        {logs.map((logDef: LogDefinition, idx: number) => {
          const logName = logDef.name

          return (
            <MenuItem
              key={idx}
              value={idx}
              primaryText={logName}
            />
          )
        })}
      </DropDownMenu>
    )
  }
}