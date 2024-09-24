import React, { useEffect, useState } from "react";
import DealRow from "../DealRow/DealRow";
import "./DealTable.css";
import { fetchDealsFromApi } from "../../services/api";

const DealTable = () => {
    const [deals, setDeals] = useState([]);
    const [expandedDealId, setExpandedDealId] = useState(null);

    useEffect(() => {
        const fetchDeals = async () => {
            let allDeals = [];
            let page = 1;
            const limit = 3;

            while (true) {
                const dealsBatch = await fetchDealsFromApi(limit, page);
                allDeals = [...allDeals, ...dealsBatch];
                if (dealsBatch.length < limit) break;
                page++;
                await new Promise((res) => setTimeout(res, 1000));
            }

            setDeals(allDeals);
        };

        fetchDeals();
    }, []);

    return (
        <table className="deal-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Название</th>
                    <th>Бюджет</th>
                </tr>
            </thead>
            <tbody>
                {deals.map((deal) => (
                    <DealRow
                        key={deal.id}
                        deal={deal}
                        expandedDealId={expandedDealId}
                        setExpandedDealId={setExpandedDealId}
                    />
                ))}
            </tbody>
        </table>
    );
};

export default DealTable;
