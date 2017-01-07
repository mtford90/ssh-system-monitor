import * as React from 'react';
import {LogDefinition} from 'lib/typedefs/data'
import DropDownMenu from 'material-ui/DropDownMenu'
import MenuItem from 'material-ui/MenuItem'

type Props = {
  logs: LogDefinition[],
  selected?: LogDefinition | null,
  onSelect?: (LogDefinition) => void,
}

export default class LoggerDropdown extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props)
  }

  handleChange = (event: any, index: number) => {
    if (this.props.onSelect) {
      this.props.onSelect(this.props.logs[index])
    }
  }

  render() {
    const logs: LogDefinition[] = this.props.logs
    const selected = this.props.selected
    const idx = selected ? this.props.logs.indexOf(selected) : null

    return (
      <DropDownMenu
        value={idx}
        onChange={this.handleChange}
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