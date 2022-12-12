import React from "react";
import { Sheet } from "framework7-react";

class SnappingSheet extends React.Component {
  dragStartPositionY = 0;
  sheetScrollAreaRef = React.createRef();
  isMoving = false;

  constructor(props) {
    super(props);
    this.state = {
      sheetOpened: true,
      sheetHeight: props.snapHeightStates[0],
      sheetHeightTransitionStyle: "0.3s ease-in-out",
      currentLocation: {
        lat: 47,
        lng: 9,
      },
    };
  }

  /**
   * Adds touch and mouse listeners to the sheet
   */
  componentDidMount() {
    // add touch listeners to the sheet
    this.sheetScrollAreaRef.current.addEventListener("touchstart", this.dragStart, { passive: false });
    this.sheetScrollAreaRef.current.addEventListener("touchmove", this.dragMove, { passive: false });
    this.sheetScrollAreaRef.current.addEventListener("touchend", this.dragEnd, { passive: false });

    // add mouse listeners to the sheet
    this.sheetScrollAreaRef.current.addEventListener("mousedown", this.dragStart, { passive: false });
    window.addEventListener("mousemove", this.dragMove, { passive: false });
    window.addEventListener("mouseup", this.dragEnd, { passive: false });
  }

  /**
   * Removes touch and mouse listeners from the sheet
   */
  componentWillUnmount() {
    // remove touch listeners from the sheet
    this.sheetScrollAreaRef.current.removeEventListener("touchstart", this.dragStart);
    this.sheetScrollAreaRef.current.removeEventListener("touchmove", this.dragMove);
    this.sheetScrollAreaRef.current.removeEventListener("touchend", this.dragEnd);

    // remove mouse listeners from the sheet
    this.sheetScrollAreaRef.current.removeEventListener("mousedown", this.dragStart);
    window.removeEventListener("mousemove", this.dragMove);
    window.removeEventListener("mouseup", this.dragEnd);
  }

  /**
   * Starts the dragging process
   * @param {Event} event
   */
  dragStart = event => {
    this.dragStartPositionY = event.touches ? event.touches[0].clientY : event.clientY;
    this.isMoving = true;
    this.setState({ sheetHeightTransitionStyle: "0s" });
  };

  /**
   * Moves the sheet (param is a touch event or a mouse event)
   * @param { Event } event
   */
  dragMove = event => {
    event.preventDefault();

    if (!this.isMoving) return;

    // check if it is a touch event or a mouse event and get the y position
    const dragStartPositionY = event.touches ? event.touches[0].clientY : event.clientY;

    // calculate the new sheet height
    const difference = this.dragStartPositionY - dragStartPositionY;
    const newSheetHeight = this.state.sheetHeight + difference;

    // check if the new sheet height is in the allowed range
    if (newSheetHeight < this.props.snapHeightStates[0]) {
      this.setState({ sheetHeight: this.props.snapHeightStates[0] });
      return;
    }
    if (newSheetHeight > this.props.snapHeightStates[this.props.snapHeightStates.length - 1]) {
      this.setState({ sheetHeight: this.props.snapHeightStates[this.props.snapHeightStates.length - 1] });
      return;
    }

    // set the new sheet height and update the touch start position
    this.setState({ sheetHeight: newSheetHeight });
    this.dragStartPositionY = dragStartPositionY;
  };

  /**
   * Ends the dragging process
   */
  dragEnd = () => {
    this.isMoving = false;

    // snap the sheet to the nearest height state
    const closestSheetHeightState = this.props.snapHeightStates.reduce((prev, curr) => {
      return Math.abs(curr - this.state.sheetHeight) < Math.abs(prev - this.state.sheetHeight) ? curr : prev;
    });

    // transition to the new sheet height
    this.setState({ sheetHeightTransitionStyle: "0.3s ease-out", sheetHeight: closestSheetHeightState });
  };

  render() {
    return (
      <div ref={this.sheetScrollAreaRef}>
        <Sheet
          style={{
            height: this.state.sheetHeight,
            transition: this.state.sheetHeightTransitionStyle,
          }}
          opened={true}
        >
          {this.props.children}
        </Sheet>
      </div>
    );
  }
}

// define the types of the properties that are passed to the component
SnappingSheet.prototype.props = /** @type { { 
  children: React.ReactNode 
  snapHeightStates: number[], 
} } */ ({});

export default SnappingSheet;
