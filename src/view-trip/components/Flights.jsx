const formatFlightPrice = (price) => {
    if (!price) return '$0';
    // Remove '$' if present, convert to number, and round to whole number
    const numericPrice = parseFloat(price.replace('$', ''));
    if (isNaN(numericPrice)) return '$0';
    return `$${Math.round(numericPrice)}`;
};

function Flights({trip}) {
    // Get the links from the correct path
    const bestLink = trip?.tripData?.flights?.options?.best?.outbound?.bookingLinks?.momondo;
    const cheapestLink = trip?.tripData?.flights?.options?.cheapest?.outbound?.bookingLinks?.momondo;
    const quickestLink = trip?.tripData?.flights?.options?.quickest?.outbound?.bookingLinks?.momondo;
  
    return (
      <div className="w-full max-w-[1400px] mx-auto">
          <div className='grid grid-cols-1 md:grid-cols-3 gap-5 mt-4'>
              {/* Best Flight Option */}
              <div 
                  className='bg-gray-800 rounded-xl p-4 cursor-pointer hover:bg-gray-700 transition-all'
                  onClick={() => window.open(bestLink, '_blank', 'noopener,noreferrer')}
              >
                  <div className='bg-green-500/10 text-green-500 px-3 py-1 rounded-full w-fit mb-3'>
                      Best Option
                  </div>
                  <div className='space-y-3'>
                      <div className='flex justify-between items-center'>
                          <span className='text-white font-medium'>
                              {trip?.tripData?.flights?.options?.best?.airline}
                          </span>
                          <span className='text-white font-bold'>
                          {trip?.tripData?.flights?.options?.best?.pricePerPerson}
                          </span>
                      </div>
                      <div className='text-gray-400 text-sm'>
                          <div>✈️ Total Duration: {trip?.tripData?.flights?.options?.best?.totalDuration}</div>
                          <div>🛑 Stops: {trip?.tripData?.flights?.options?.best?.outbound?.stops}</div>
                          <div>💺 Class: {trip?.tripData?.flights?.options?.best?.class}</div>
                      </div>
                  </div>
              </div>
  
              {/* Cheapest Flight Option */}
              <div 
                  className='bg-gray-800 rounded-xl p-4 cursor-pointer hover:bg-gray-700 transition-all'
                  onClick={() => window.open(cheapestLink, '_blank', 'noopener,noreferrer')}
              >
                  <div className='bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full w-fit mb-3'>
                      Cheapest Option
                  </div>
                  <div className='space-y-3'>
                      <div className='flex justify-between items-center'>
                          <span className='text-white font-medium'>
                              {trip?.tripData?.flights?.options?.cheapest?.airline}
                          </span>
                          <span className='text-white font-bold'>
                          {trip?.tripData?.flights?.options?.cheapest?.pricePerPerson}
                          </span>
                      </div>
                      <div className='text-gray-400 text-sm'>
                          <div>✈️ Total Duration: {trip?.tripData?.flights?.options?.cheapest?.totalDuration}</div>
                          <div>🛑 Stops: {trip?.tripData?.flights?.options?.cheapest?.outbound?.stops}</div>
                          <div>💺 Class: {trip?.tripData?.flights?.options?.cheapest?.class}</div>
                      </div>
                  </div>
              </div>
  
              {/* Quickest Flight Option */}
              <div 
                  className='bg-gray-800 rounded-xl p-4 cursor-pointer hover:bg-gray-700 transition-all'
                  onClick={() => window.open(quickestLink, '_blank', 'noopener,noreferrer')}
              >
                  <div className='bg-purple-500/10 text-purple-500 px-3 py-1 rounded-full w-fit mb-3'>
                      Quickest Option
                  </div>
                  <div className='space-y-3'>
                      <div className='flex justify-between items-center'>
                          <span className='text-white font-medium'>
                              {trip?.tripData?.flights?.options?.quickest?.airline}
                          </span>
                          <span className='text-white font-bold'>
                          {trip?.tripData?.flights?.options?.quickest?.pricePerPerson}                        </span>
                      </div>
                      <div className='text-gray-400 text-sm'>
                          <div>✈️ Total Duration: {trip?.tripData?.flights?.options?.quickest?.totalDuration}</div>
                          <div>🛑 Stops: {trip?.tripData?.flights?.options?.quickest?.outbound?.stops}</div>
                          <div>💺 Class: {trip?.tripData?.flights?.options?.quickest?.class}</div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    )
  }
  
  export default Flights;