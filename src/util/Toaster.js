import React from "react";
import {Toast, ToastBody, ToastHeader} from "reactstrap";

// for error management; "toasts" are the term for cute popups in bootstrap
class Toaster extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      toasts: []
    };
  }

  render = () => {
    const toasts = this.props.toasts.map((toast, index) => (
      <Toast key={toast.body}>
        <ToastHeader icon={toast.color}
                     toggle={() => this.props.onRemoveToast(index)}>{toast.header}</ToastHeader>
        <ToastBody>{toast.body}</ToastBody>
      </Toast>
    ));
    return (
      <div className={'position-absolute'} style={{top: 10, right: 10}}>
        {toasts}
      </div>
    );
  };

}

// helper class
class ToastChef {

  static getAddToastFunction = _this =>
    (header, body, color) =>
      _this.setState({
        toasts: _this.state.toasts.concat([{ header: header, body: body, color: color || 'primary' }])
      });

  static getRemoveToastFunction = _this =>
    index =>
      _this.setState({
        toasts: _this.state.toasts.filter((toast, i) => i!==index)
      });

}

export { Toaster, ToastChef };
