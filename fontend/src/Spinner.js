import React from "react";
import { connect } from "react-redux";
import "./spinner.css";

const Spinner = ({ progress }) => {
  // if (progress) {
    return (
      <div className="spinner-wrapper">
        <div className="spinner">
          <div className="dot1" />
          <div className="dot2" />
        </div>
      </div>
    );
  // }
  // return null;
};

const mapStateToProps = ({ progress }) => ({
  progress,
});

// export default connect(mapStateToProps)(Spinner);
export default Spinner;
