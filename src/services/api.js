import axios from "axios";

const API_BASE_URL = "/api/v4";
const ACCESS_TOKEN =
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjVkMmI1NTBiZjNlNzM5MmI0MzFmNjlmNzFlYTZmMzEwYmY3NTRjMDk2OWY5MmQ2MzJiYTJiMDZhNmI5OGY1Mjk5NWRmNzdiOTVjMDA3N2ZiIn0.eyJhdWQiOiI5NTM0MGFkOS1mYWFkLTRkZTItYTdiNS1hZjMzM2VhMDNmZjciLCJqdGkiOiI1ZDJiNTUwYmYzZTczOTJiNDMxZjY5ZjcxZWE2ZjMxMGJmNzU0YzA5NjlmOTJkNjMyYmEyYjA2YTZiOThmNTI5OTVkZjc3Yjk1YzAwNzdmYiIsImlhdCI6MTcyNzA5OTcxNywibmJmIjoxNzI3MDk5NzE3LCJleHAiOjE3MjcxODYxMTcsInN1YiI6IjExNTU1ODcwIiwiZ3JhbnRfdHlwZSI6IiIsImFjY291bnRfaWQiOjMxOTY3MDM0LCJiYXNlX2RvbWFpbiI6ImFtb2NybS5ydSIsInZlcnNpb24iOjIsInNjb3BlcyI6WyJwdXNoX25vdGlmaWNhdGlvbnMiLCJmaWxlcyIsImNybSIsImZpbGVzX2RlbGV0ZSIsIm5vdGlmaWNhdGlvbnMiXSwiaGFzaF91dWlkIjoiNjc2NjRiOWEtNzY0NS00MzIzLWI3NGYtN2U5MWMxNmMwMDRjIiwiYXBpX2RvbWFpbiI6ImFwaS1iLmFtb2NybS5ydSJ9.eBkdaGAKHEulCYzlRD6ZHxviQdmyoeNMIap97nNz0f3XNrJfWYvczvsMP2E95-x5WEntYLmufzp8n_1uhdjrEBA5GtXs_eYv7OIdVQk_RTmnY-qk4GvT0GndMFgvmOCNs-j89zfUyE688vDRd09tp6TtemsoTQ9Gzy_sX8QDT64UE2F3peF4_QapeC47cX1QJIgU7_Qepd0inAO2RTCwEOZcO7SsYKyGh75ASSo0ooh_rcIwvmd2ZwX9iZ7R0W7PBXi-6wlWzSK7aIDyuCcs2mKOqLTBpT01EPxCZ17hyM5yGviFgKKJ_HgTdhe49zBgqex7QD1IiBKEl_HZAvGn0g";

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
