import React from "react";
import "./video360.css";

const YouTube360 = () => {
  return (
    <div className="youtube360-container">
      <iframe
        width="100%"
        height="600"
        src="https://www.youtube.com/embed/gzRloIIZgaM?autoplay=1&mute=1&rel=0"
        title="Video 360° - YouTube"
        frameBorder="0"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; vr"
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default YouTube360;
