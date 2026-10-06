import React from "react";

const Col = ({ sm,md, children }) => {
  const colClass = `${sm ? `col-${sm}` : "col"} ${md ? `lg:col-${md}` : ""}`;

  return <div className={colClass}>{children}</div>;
};

const Row = ({ children }) => {
  return <div className="grid flex ">{children}</div>;
};

export { Row, Col };
