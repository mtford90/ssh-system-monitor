import * as React from 'react';
import {ServerDefinition} from 'lib/typedefs/data'
import DropDownMenu from 'material-ui/DropDownMenu'
import MenuItem from 'material-ui/MenuItem'

interface Props {
  servers: ServerDefinition[],
  selected?: ServerDefinition | null,
  onSelect?: (ServerDefinition) => void,
}

export default class ServerDropdown extends React.Component<Props, {}> {
  props: Props

  handleChange(_event, key: number) {
    if (this.props.onSelect) {
      this.props.onSelect(this.props.servers[key])
    }
  }

  render() {
    const servers: ServerDefinition[] = this.props.servers
    const selected = this.props.selected

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