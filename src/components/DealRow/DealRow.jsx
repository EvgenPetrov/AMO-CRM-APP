import React, { useState } from "react";
import Spinner from "../Spinner/Spinner";
import StatusCircle from "../StatusCircle/StatusCircle";
import { fetchDealDetails } from "../../services/api";
import "./DealRow.css";

const DealRow = ({ deal, expandedDealId, setExpandedDealId }) => {
    const isExpanded = expandedDealId === deal.id;
    const [loading, setLoading] = useState(false);
    const [details, setDetails] = useState(null);

    const handleClick = async () => {
        if (isExpanded) {
            setExpandedDealId(null);
            setDetails(null);
        } else {
            setLoading(true);
            const data = await fetchDealDetails(deal.id);
            setDetails(data);
            setLoading(false);
            setExpandedDealId(deal.id);
        }
    };

    return (
        <>
            <tr onClick={handleClick} className="deal-row">
                <td>{deal.id}</td>
                <td>{deal.name}</td>
                <td>{deal.price}</td>
            </tr>
            {isExpanded && (
                <tr className="deal-details-row">
                    <td colSpan="3">
                        {loading ? (
                            <Spinner />
                        ) : (
                            details && (
                                <div className="deal-details">
                                    <p>Название: {details.name}</p>
                                    <p>ID: {details.id}</p>
                                    <p>Дата: {details.date}</p>
                                    <div className="status">
                                        <span>Статус задачи:</span>
                                        <StatusCircle status={details.status} />
                                    </div>
                                </div>
                            )
                        )}
                    </td>
                </tr>
            )}
        </>
    );
};

export default DealRow;
