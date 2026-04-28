import { AppData } from "./types/appData";
export const fetchAppData = async (): Promise<AppData> => {
  const response = await fetch('/mock/data.json');
  
  if (!response.ok) {
    throw new Error(`Error HTTP: ${response.status}`);
  }
  
  const data = await response.json();
  return data as AppData;
};