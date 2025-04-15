import React, { useEffect, useState } from "react";
import { db } from '@/service/firebaseConfig';
import { doc, getDoc } from "firebase/firestore";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import InfoSection from "../components/InfoSection";
import Hotels from "../components/Hotels";
import Flights from "../components/Flights";

function Viewtrip() {
    // Get tripId directly from useParams
    const { tripId } = useParams();
    const [trip, setTrip] = useState(null);

    useEffect(() => {
        if (tripId) {
            GetTripData();
        }
    }, [tripId]);

    const GetTripData = async () => {
        try {
            const docRef = doc(db, 'AITrips', tripId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                console.log("Document: ", docSnap.data());
                setTrip(docSnap.data());
            } else {
                console.log("No Such Document");
                toast.error('No trip Found!');
            }
        } catch (error) {
            console.error("Error fetching trip:", error);
            toast.error('Error loading trip data');
        }
    };

    if (!trip) {
        return <div className="p-10 text-center">Loading...</div>;
    }

    return (
        <div className='pt-[72px] p-10 md:px-20 lg:px-44 xl:px-56'>

            {/* info*/}
            <InfoSection trip={trip} />

            {/* flights */}
            <Flights trip={trip} />

            {/* Rest of your components */}
            <Hotels trip={trip} />


        </div>
    );
}

export default Viewtrip;