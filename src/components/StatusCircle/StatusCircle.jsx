import React from "react";
import "./StatusCircle.css";

const StatusCircle = ({ status }) => {
    return <div className={`status-circle ${status}`}></div>;
};

export default StatusCircle;
