import axiosClient from "./axiosClient";

export const getAllReports = () => {
  return axiosClient.get("/reports");
};

export const getReportsByDate = (date) => {
  return axiosClient.get(`/reports/by-date?date=${date}`);
};

export const getReportsByGameMode = (gameModeType) => {
  return axiosClient.get(`/reports/by-game-mode?gameModeType=${gameModeType}`);
};

export const createReport = (data) => {
  return axiosClient.post("/reports", data);
};

export const getGameModesDetails = () => {
  return axiosClient.get("/game-modes");
};

export const getReportsByDateAndMode = (date, gameModeType) => {
  return axiosClient.get(`/reports/advanced-filter?date=${date}&gameModeType=${gameModeType}`);
};

export const deleteReport = (reportId) => {
  return axiosClient.delete(`/reports?id=${reportId}`);
}