import React, {Component} from 'react';
import DatePicker from 'material-ui/DatePicker';
import Toggle from 'material-ui/Toggle';

const optionsStyle = {
  maxWidth:    255,
  marginRight: 'auto',
};

type DateRangeProps = {
  minDate?: Date,
  maxDate?: Date,
  label?: string,
}

export default class DateRange extends Component {
  props: DateRangeProps

  constructor (props: DateRangeProps) {
    super(props)

    let {minDate, maxDate} = props

    if (!minDate) {
      minDate = new Date();
      minDate.setFullYear(minDate.getFullYear() - 1);
      minDate.setHours(0, 0, 0, 0);
    }

    if (!maxDate) {
      maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() + 1);
      maxDate.setHours(0, 0, 0, 0);
    }

    this.state = {
      minDate,
      maxDate,
    };
  }

  render () {
    return (
      <div style={{display: 'inline-block'}}>
        <DatePicker
          floatingLabelText={this.props.label}
          autoOk={true}
          minDate={this.state.minDate}
          maxDate={this.state.maxDate}
        />
      </div>
    );
  }
}
