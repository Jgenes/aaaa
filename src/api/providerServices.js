// src/api/providerService.js
import api from "./axio";

export const onboardingProvider = async (data) => {
  return api.post("/provider/onboarding", data);
};
