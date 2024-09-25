import axios from "axios";

const API_BASE_URL = "/api/v4";
const ACCESS_TOKEN =
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImJmNDU5MTU3YzA4YmM2YjM3N2U5OWE0ZGI3YjNiMWU5ZTkxYTI2Mzg0NzYzN2VlNGMwNzMzNTY4MGVmNDM3ZWUwZmYyOGI4MjFlZmU2YTgyIn0.eyJhdWQiOiJjZDk1ZTJhMC0yMTRmLTQ5YzktOTJkMC02YmUwYTgwZDMxNjAiLCJqdGkiOiJiZjQ1OTE1N2MwOGJjNmIzNzdlOTlhNGRiN2IzYjFlOWU5MWEyNjM4NDc2MzdlZTRjMDczMzU2ODBlZjQzN2VlMGZmMjhiODIxZWZlNmE4MiIsImlhdCI6MTcyNzI3MjkzNCwibmJmIjoxNzI3MjcyOTM0LCJleHAiOjE3MjczNTkzMzQsInN1YiI6IjExNTU1ODcwIiwiZ3JhbnRfdHlwZSI6IiIsImFjY291bnRfaWQiOjMxOTY3MDM0LCJiYXNlX2RvbWFpbiI6ImFtb2NybS5ydSIsInZlcnNpb24iOjIsInNjb3BlcyI6WyJwdXNoX25vdGlmaWNhdGlvbnMiLCJmaWxlcyIsImNybSIsImZpbGVzX2RlbGV0ZSIsIm5vdGlmaWNhdGlvbnMiXSwiaGFzaF91dWlkIjoiYzJhYTUyOWItYjAyOC00ZTZhLThlMTItMDJiYmExZTFlMTY4IiwiYXBpX2RvbWFpbiI6ImFwaS1iLmFtb2NybS5ydSJ9.Yd4UJ-FRZFZsz8i7OY_WFjjtSOF4SAdcpV31PR0j9AnHL5Cm82af2qS7wPj0amYO0Dhlq1eX4831l_BaZdQtGkbnSfTNNd_dB923j2M7ff3EfVKeNNs8qCu00g695bP_UfuFnPhfpFJ4jMzitlCavojuBLuyziGRGlZvOR-Sl6cx1d0wXIuibd0a8OZl4JFCvqSbiuEAfyEIyD5DjSUhOcytaKEanN8gtUBfSsEPxDL4ELWGp_ErCkq-d07Ww4W3p64qaV_Kb_jhf70cCOmuCF2GRtId7BfHLlRBbN36mSlGn6PwLFofrxu11jOUv6t7eWxSTxl_bzonvs3Hp1cF9g";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
    },
});

export const fetchDealsFromApi = async (limit, page) => {
    try {
        const response = await api.get("/leads", {
            params: {
                limit,
                page,
            },
        });
        return response.data._embedded.leads;
    } catch (error) {
        console.error("Ошибка при получении списка сделок:", error.response || error);
        return [];
    }
};

export const fetchDealDetails = async (dealId) => {
    try {
        // Получаем детали сделки
        const dealResponse = await api.get(`/leads/${dealId}`);

        const deal = dealResponse.data;

        // Инициализируем переменные
        let status = "none";
        let date = "";

        // Получаем задачи, связанные с этой сделкой
        const tasksResponse = await api.get("/tasks", {
            params: {
                filter: {
                    entity_id: dealId,
                    entity_type: "leads",
                },
            },
        });

        const tasks = tasksResponse.data._embedded.tasks;

        console.log("Задачи сделки:", tasks);

        if (tasks && tasks.length > 0) {
            // Предположим, что первая задача является ближайшей
            const nearestTask = tasks[0];

            console.log("Ближайшая задача:", nearestTask);

            // Получаем дату завершения задачи
            let taskDate;
            if (nearestTask.complete_till_at) {
                taskDate = new Date(nearestTask.complete_till_at);
            } else if (nearestTask.complete_till) {
                taskDate = new Date(nearestTask.complete_till * 1000);
            } else {
                console.error("Дата задачи отсутствует.");
                taskDate = null;
            }

            console.log("Преобразованная дата задачи (taskDate):", taskDate);

            if (taskDate && !isNaN(taskDate)) {
                // Форматирование даты в DD.MM.YYYY
                date = taskDate.toLocaleDateString("ru-RU", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                });

                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const diffTime = taskDate - today;
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays < 0) {
                    status = "overdue"; // Просрочена
                } else if (diffDays === 0) {
                    status = "today"; // Сегодня
                } else {
                    status = "future"; // Будущая
                }
            } else {
                status = "overdue";
                date = "Неизвестно";
            }
        } else {
            status = "overdue"; // Нет задач или они просрочены
            date = "Нет задач";
        }

        return {
            id: deal.id,
            name: deal.name,
            date,
            status,
        };
    } catch (error) {
        console.error(
            `Ошибка при получении деталей сделки с ID ${dealId}:`,
            error.response || error
        );
        return null;
    }
};
