import SunnyImage from '../assets/sunny.jpeg';
import ColdImage from '../assets/snowy.jpg';
import ModerateImage from '/moderate1.jpg';
import AdventureImage from '/adventure.jpeg';
import RelaxationImage from '/relaxation.jpeg';
import CulturalImage from '/cultural.jpeg';
import NatureImage from '/nature.jpeg';
import BeachImage from '/beach.jpeg';
import MountainImage from '/mountain.jpeg';
import CitiesImage from '/city.jpeg';
import CountrySideImage from '/country.jpeg';
import ModerateBudgetImage from '/moderate2.jpg';
import CheapBudgetImage from '/cheap2.jpg';
import LuxuryBudgetImage from '/luxury1.jpg';
import SoloImage from '/solo.jpg';
import CoupleImage from '/couple.jpg';
import FamilyImage from '/family.jpg' 







export const getTranslatedOptions = (translate) => {
  return {
    SelectTravelsList: translate("travelOptions").map((item, index) => ({
      id: index + 1,
      title: item.title,
      desc: item.desc,
      image: [SoloImage, CoupleImage, FamilyImage, "⛵"][index],
      people: item.people,
    })),
    SelectBudgetOptions: translate("budgetOptions").map((item, index) => ({
      id: index + 1,
      title: item.title,
      desc: item.desc,
      image: [CheapBudgetImage, ModerateBudgetImage, LuxuryBudgetImage][index],
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
      image: [BeachImage, MountainImage, CitiesImage, CountrySideImage][index],
    })),
    AI_PROMPT: translate(
      "Generate Travel Plan for a user based on the following criteria: destination, budget, number of people, and preferences."
    ),
  };
};
