import SunnyImage from '../assets/sunny.jpeg'
import ColdImage from '../assets/snowy.jpg'
import ModerateImage from '../assets/modern.jpeg'



export const SelectTravelsList = [
    {
      id: 1,
      title: 'Just Me',
      desc: 'A sole traveler in exploration',
      icon: '🧍',
      people: '1 Person',
    },
    {
      id: 2,
      title: 'A Couple',
      desc: 'Two travelers in tandem',
      icon: '🍷',
      people: '2 People',
    },
    {
      id: 3,
      title: 'Family',
      desc: 'A group of fun-loving adventurers',
      icon: '🏡',
      people: '3 to 5 People',
    },
    {
      id: 4,
      title: 'Friends',
      desc: 'A bunch of thrill-seekers',
      icon: '⛵',
      people: '5 to 10 People',
    },
  ];
  
  export const SelectBudgetOptions = [
    {
      id: 1,
      title: 'Cheap',
      desc: 'Stay conscious of costs',
      icon: '💵',
    },
    {
      id: 2,
      title: 'Moderate',
      desc: 'Keep costs on the average side',
      icon: '💰',
    },
    {
      id: 3,
      title: 'Luxury',
      desc: "Don't worry about cost",
      icon: '💎',
    },
  ];
  
  export const WeatherOptions = [
    {
      id: 1,
      title: 'Warm',
      desc: 'Sunny and pleasant temperatures',
      image: SunnyImage,
    },
    {
      id: 2,
      title: 'Cold',
      desc: 'Snowy or chilly climates',
      image: ColdImage,
    },
    {
      id: 3,
      title: 'Moderate',
      desc: 'Mild and comfortable weather',
      image: ModerateImage,
    },
  ];
  
  export const ActivityOptions = [
    {
      id: 1,
      title: 'Adventure',
      desc: 'Hiking, rafting, and more!',
      icon: '🏞️',
    },
    {
      id: 2,
      title: 'Relaxation',
      desc: 'Spa, beaches, and serenity',
      icon: '🛀',
    },
    {
      id: 3,
      title: 'Cultural',
      desc: 'Museums, art, and local traditions',
      icon: '🏛️',
    },
    {
      id: 4,
      title: 'Nature',
      desc: 'Forests, mountains, and lakes',
      icon: '🌲',
    },
  ];
  
  export const SightseeingOptions = [
    {
      id: 1,
      title: 'Beaches',
      desc: 'Relax by the sea',
      icon: '🏖️',
    },
    {
      id: 2,
      title: 'Mountains',
      desc: 'Explore high peaks',
      icon: '🏔️',
    },
    {
      id: 3,
      title: 'Cities',
      desc: 'Urban exploration',
      icon: '🏙️',
    },
    {
      id: 4,
      title: 'Countryside',
      desc: 'Peaceful rural getaways',
      icon: '🌄',
    },
  ];
  
  
  export const AI_PROMPT = `Generate Travel Plan for a user based on the following criteria: destination, budget, number of people, and preferences.`;
  