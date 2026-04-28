import { AppState } from "./types/appState";

export const fetchAppData = async (): Promise<AppState> => {
  const response = await fetch('/mock/data.json');
  
  if (!response.ok) {
    throw new Error(`Error HTTP: ${response.status}`);
  }
  
  const data = await response.json();
  return data as AppState;
};