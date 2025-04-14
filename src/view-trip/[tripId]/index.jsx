import React, { useEffect, useState } from "react";
import {db} from '@/service/firebaseConfig';
import { doc,getDoc } from "firebase/firestore";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

function Viewtrip(){

    const [tripId]=useParams();
    const [trip,setTrip]=useState([]);

    useEffect(()=>{
        tripId&&GetTripData();
    },[tripId])

    const GetTripData=async()=>{
        const docRef = doc(db,'AITrips',tripId);
        const docSnap=await getDoc(docRef);

        if(docSnap.exists()){
            console.log("Document: ",docSnap.data());
            setTrip(docSnap.data());
        }
        else{
            console.log("No Such Document");
            toast('No trip Found!');
        }
    }
    return(
        <div>
            {/* Information section */}



            {/* Flights */}
            



            {/* Hotels */}



            {/* activities (daily planner) */}


            
            {/* footer */}
        
        
        
        
        </div>

        
    )
}

export default Viewtrip