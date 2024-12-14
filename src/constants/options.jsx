import SunnyImage from '../assets/sunny.jpeg';
import ColdImage from '../assets/snowy.jpg';
import ModerateImage from '../assets/modern.jpeg';
import AdventureImage from '/adventure.jpeg';
import RelaxationImage from '/relaxation.jpeg';
import CulturalImage from '/cultural.jpeg';
import NatureImage from '/nature.jpeg';





export const getTranslatedOptions = (translate) => {
  return {
    SelectTravelsList: translate("travelOptions").map((item, index) => ({
      id: index + 1,
      title: item.title,
      desc: item.desc,
      icon: ["🧍", "🍷", "🏡", "⛵"][index],
      people: item.people,
    })),
    SelectBudgetOptions: translate("budgetOptions").map((item, index) => ({
      id: index + 1,
      title: item.title,
      desc: item.desc,
      icon: ["💵", "💰", "💎"][index],
    })),
    WeatherOptions: translate("weatherOptions").map((item, index) => ({
      id: index + 1,
      title: item.title,
      desc: item.desc,
      image: [SunnyImage, ColdImage, ModerateImage][index],
    })),
    ActivityOptions: translate("activityOptions").map((item, index) => ({
      id: index + 1,
      title: item.title,
      desc: item.desc,
      image: [AdventureImage, RelaxationImage, CulturalImage, NatureImage][index],
    })),
    SightseeingOptions: translate("sightseeingOptions").map((item, index) => ({
      id: index + 1,
      title: item.title,
      desc: item.desc,
      icon: ["🏖️", "🏔️", "🏙️", "🌄"][index],
    })),
    AI_PROMPT: translate(
      "Generate Travel Plan for a user based on the following criteria: destination, budget, number of people, and preferences."
    ),
  };
};
