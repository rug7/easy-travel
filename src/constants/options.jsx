import SunnyImage from '../assets/sunny.jpeg';
import ColdImage from '../assets/snowy.jpg';
import ModerateImage from '../assets/modern.jpeg';
import { useLanguage } from "@/context/LanguageContext";

// Define options using a function to dynamically translate
export const useTranslatedOptions = () => {
  const { translate } = useLanguage();

  // Dynamically translate options
  const SelectTravelsList = translate("travelOptions").map((item, index) => ({
    id: index + 1,
    title: item.title,
    desc: item.desc,
    icon: ["🧍", "🍷", "🏡", "⛵"][index], // Icons mapped manually
    people: item.people,
  }));

  const SelectBudgetOptions = translate("budgetOptions").map((item, index) => ({
    id: index + 1,
    title: item.title,
    desc: item.desc,
    icon: ["💵", "💰", "💎"][index], // Icons mapped manually
  }));

  const WeatherOptions = translate("weatherOptions").map((item, index) => ({
    id: index + 1,
    title: item.title,
    desc: item.desc,
    image: [SunnyImage, ColdImage, ModerateImage][index], // Images mapped manually
  }));

  const ActivityOptions = translate("activityOptions").map((item, index) => ({
    id: index + 1,
    title: item.title,
    desc: item.desc,
    icon: ["🏞️", "🛀", "🏛️", "🌲"][index], // Icons mapped manually
  }));

  const SightseeingOptions = translate("sightseeingOptions").map((item, index) => ({
    id: index + 1,
    title: item.title,
    desc: item.desc,
    icon: ["🏖️", "🏔️", "🏙️", "🌄"][index], // Icons mapped manually
  }));

  const AI_PROMPT = translate(
    `Generate Travel Plan for a user based on the following criteria: destination, budget, number of people, and preferences.`
  );

  return {
    SelectTravelsList,
    SelectBudgetOptions,
    WeatherOptions,
    ActivityOptions,
    SightseeingOptions,
    AI_PROMPT,
  };
};
