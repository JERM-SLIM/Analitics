import React, { useEffect, useState } from "react";

function AnimatedNumber({ value = 0, format = (v) => v }) {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    setDisplay(value);
  }, [value]);

  return <span>{format(display)}</span>;
}

export default AnimatedNumber;