//export const ARASAAC_API_URL = "https://api.arasaac.org/api";
export const ARASAAC_API_URL = "https://api.arasaac.org/v1";
export const getPictograms = async (searchText: string, locale: string = 'es') => {
  try {
    const response = await fetch(`${ARASAAC_API_URL}/pictograms/${locale}/search/${searchText}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching pictograms from ARASAAC:", error);
    return [];
  }
};

export const getPictogramById = async (id: number) => {
  try {
    const response = await fetch(`${ARASAAC_API_URL}/pictograms/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching pictogram with ID ${id} from ARASAAC:`, error);
    return null;
  }
};

export const getMaterials = async (searchText: string, locale: string = 'es') => {
  try {
    const response = await fetch(`${ARASAAC_API_URL}/materials/${locale}/search/${searchText}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching materials from ARASAAC:", error);
    return [];
  }
};

export const getCatalog = async (locale: string = 'es') => {
  try {
    const response = await fetch(`${ARASAAC_API_URL}/catalog/${locale}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching catalog from ARASAAC:", error);
    return [];
  }
};

export const getNews = async (locale: string = 'es') => {
  try {
    const response = await fetch(`${ARASAAC_API_URL}/news/${locale}`);
    if