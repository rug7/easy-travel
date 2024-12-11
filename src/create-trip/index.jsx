import React, { useState } from 'react';
import GooglePlacesAutocomplete from 'react-google-places-autocomplete';

function CreateTrip() {
  const [place,setPlace]=useState();
  return (
    <div
      className="sm:px-10 md:px-32 lg:px-56 xl:px-10 px-5 mt-20 " 
      style={{ marginTop: '80px' }} 
    >
      <h2 className="font-bold text-3xl text-white">Tell us your travel preference</h2>
      <p className="mt-3 text-gray-300 text-xl items-center ">
        Just provide some basic information, and our trip planner will generate
        a customized itinerary based on your preferences
      </p>

      <div className='mt-20'>
        <div>
          <h2 className='text-xl my-3 font-bold text-white'> What's your destination of choice?</h2>
          <GooglePlacesAutocomplete
          apiKey={import.meta.env.VITE_GOOGLE_PLACE_API_KEY}
          selectProps={{
            place,
            onChange:(v)=>{setPlace(v);console.log(v)}
          }}
          />
        </div>
      </div>
    </div>
  );
}

export default CreateTrip;
