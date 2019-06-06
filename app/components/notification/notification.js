import React, { Component } from 'react';
import { Position, Toast, Toaster, Intent } from "@blueprintjs/core";

export default class Notification extends Component {

  constructor (props) {
    super(props);
  }

  renderNotifications () {
    const { messages } = this.props;
    console.log(messages, 'test');
    return messages.map((item, i) => <Toast key={item + i} message={item} intent={Intent.SUCCESS}/>)
  }

  render() {
    return (
      <div>
        <Toaster position={Position.TOP_RIGHT}>
          {this.renderNotifications()}
        </Toaster>
      </div>
    );
  }
}
