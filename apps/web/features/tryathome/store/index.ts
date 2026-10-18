import tryAtHomeRequestsSlice, {
  setTotal,
  setSearchTerm,
  setSortBy,
  setPurposeId,
  setStartDate,
  setEndDate,
} from "./tryathome-requests.slice";
import tryathomePurposesSlice, {
  showModal,
  setPurposeToEdit,
  setPurposeToDelete,
} from "./purposes.slice";

export const tryathomeStore = {
  tryAtHomeRequests: tryAtHomeRequestsSlice,
  tryathomePurposes: tryathomePurposesSlice,
};

// Export all actions
export {
  setTotal,
  setSearchTerm,
  setSortBy,
  setPurposeId,
  setStartDate,
  setEndDate,
  showModal,
  setPurposeToEdit,
  setPurposeToDelete,
};
