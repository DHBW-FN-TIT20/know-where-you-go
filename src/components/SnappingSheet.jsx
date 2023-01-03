import React from "react";

class SnappingSheet extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sheetOpened: true,
      sheetHeight: this.props.snapHeightStates[this.props.currentState || 0],
      sheetHeightTransitionStyle: "0.3s ease-out",
    };
    this.dragStartPositionY = 0;
    this.dragAreaRef = React.createRef();
    this.topBarRef = React.createRef();
    this.scrollAreaRef = React.createRef();
    this.isMoving = false;
    this.currentState = this.props.currentState || 0;
    this.scrollAreaScrollTop = 0;
  }

  /**
   * Adds touch and mouse listeners to the sheet
   */
  componentDidMount() {
    // add touch listeners to the top bar
    this.topBarRef.current.addEventListener("touchstart", this.dragStart, { passive: false });
    this.topBarRef.current.addEventListener("touchmove", this.dragMove, { passive: false });
    this.topBarRef.current.addEventListener("touchend", this.dragEnd, { passive: false });

    // add touch listeners to the scroll area
    this.scrollAreaRef.current.addEventListener("touchstart", this.dragOnScrollAreaStart, { passive: false });
    this.scrollAreaRef.current.addEventListener("touchmove", this.dragOnScrollAreaMove, { passive: false });
    this.scrollAreaRef.current.addEventListener("touchend", this.dragEnd, { passive: false });

    // add mouse listeners to the top bar
    this.topBarRef.current.addEventListener("mousedown", this.dragStart, { passive: false });
    window.addEventListener("mousemove", this.dragMove, { passive: false });
    window.addEventListener("mouseup", this.dragEnd, { passive: false });

    // add mouse listeners to the scroll area
    this.scrollAreaRef.current.addEventListener("mousedown", this.dragStart, { passive: false });
    window.addEventListener("mousemove", this.dragMove, { passive: false });
    window.addEventListener("mouseup", this.dragEnd, { passive: false });

    // let the parent know that the sheet is snapped to the current state (to clear the state)
    if (this.props.currentState !== undefined) this.props.snappedToHeight(this.props.currentState);
  }

  /**
   * Removes touch and mouse listeners from the sheet
   */
  componentWillUnmount() {
    // remove touch listeners from the top bar
    this.topBarRef.current.removeEventListener("touchstart", this.dragStart);
    this.topBarRef.current.removeEventListener("touchmove", this.dragMove);
    this.topBarRef.current.removeEventListener("touchend", this.dragEnd);

    // remove touch listeners from the scroll area
    this.scrollAreaRef.current.removeEventListener("touchstart", this.dragOnScrollAreaStart);
    this.scrollAreaRef.current.removeEventListener("touchmove", this.dragOnScrollAreaMove);
    this.scrollAreaRef.current.removeEventListener("touchend", this.dragEnd);

    // remove mouse listeners from the top bar
    this.topBarRef.current.removeEventListener("mousedown", this.dragStart);
    window.removeEventListener("mousemove", this.dragMove);
    window.removeEventListener("mouseup", this.dragEnd);

    // remove mouse listeners from the scroll area
    this.scrollAreaRef.current.removeEventListener("mousedown", this.dragStart);
    window.removeEventListener("mousemove", this.dragMove);
    window.removeEventListener("mouseup", this.dragEnd);
  }

  /**
   * Snaps the sheet to a given state if the state is defined
   */
  componentDidUpdate() {
    if (this.props.currentState !== undefined) {
      this.setState({
        sheetHeightTransitionStyle: "0.3s ease-in-out",
        sheetHeight: this.props.snapHeightStates[this.props.currentState],
      });
      this.props.snappedToHeight(this.props.snapHeightStates[this.props.currentState]);
    }
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
    this.props.snappedToHeight(closestSheetHeightState);
    this.currentState = this.props.snapHeightStates.indexOf(closestSheetHeightState);
  };

  /**
   * Starts the dragging process
   * @param {Event} event
   */
  dragOnScrollAreaStart = event => {
    // check if the scroll area is scrolled to the top only then start the dragging process
    if (this.currentState == this.props.snapHeightStates.length - 1 && this.scrollAreaScrollTop > 0) {
      return;
    }

    this.dragStartPositionY = event.touches ? event.touches[0].clientY : event.clientY;
    this.isMoving = true;
    this.setState({ sheetHeightTransitionStyle: "0s" });
  };

  /**
   * Moves the sheet (param is a touch event or a mouse event)
   * @param { Event } event
   */
  dragOnScrollAreaMove = event => {
    // if the sheet is not completely open, prevent the default scrolling action
    if (this.currentState !== this.props.snapHeightStates.length - 1) {
      event.preventDefault();
    }

    // if the user wants to scroll in the scroll area, prevent the dragging action
    if (this.currentState == this.props.snapHeightStates.length - 1 && this.scrollAreaScrollTop > 0) {
      return;
    }

    if (!this.isMoving) return;

    // check if it is a touch event or a mouse event and get the y position
    const dragStartPositionY = event.touches ? event.touches[0].clientY : event.clientY;

    // calculate the new sheet height
    const difference = this.dragStartPositionY - dragStartPositionY;
    const newSheetHeight = this.state.sheetHeight + difference;

    // prevent default if this.currentState !== this.props.snapHeightStates.length - 1
    // and the this.scrollAreaScrollTop == 0
    // and the scroll is upwards or there is nothing to scroll
    if (
      this.currentState == this.props.snapHeightStates.length - 1 &&
      this.scrollAreaScrollTop <= 0 &&
      // eslint-disable-next-line max-len
      (difference < 0 ||
        this.scrollAreaRef.current.scrollHeight - this.scrollAreaRef.current.scrollTop ==
          this.scrollAreaRef.current.clientHeight)
    ) {
      event.preventDefault();
    }

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

  render() {
    return (
      <div
        ref={this.dragAreaRef}
        style={{
          height: this.state.sheetHeight,
          transition: this.state.sheetHeightTransitionStyle,
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
        }}
      >
        <div ref={this.topBarRef}>{this.props.topBar}</div>
        <div
          ref={this.scrollAreaRef}
          style={{
            overflow: "scroll",
            height: `calc(100% - ${this.props.snapHeightStates[0]}px)`,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(10px)",
          }}
          onScroll={e => {
            this.scrollAreaScrollTop = e.target.scrollTop;
          }}
        >
          {this.props.scrollArea}
        </div>
      </div>
    );
  }
}

// define the types of the properties that are passed to the component
SnappingSheet.prototype.props = /** @type { { 
  topBar: React.ReactNode,
  scrollArea: React.ReactNode,
  snapHeightStates: number[],
  currentState: number | undefined,
  snappedToHeight: (height: number) => void
} } */ ({});

export default SnappingSheet;
